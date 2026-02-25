package com.shop.domain.order.service;

import com.shop.domain.cart.service.CartService;
import com.shop.domain.order.dto.CreateOrderRequest;
import com.shop.domain.order.dto.OrderResponse;
import com.shop.domain.order.dto.OrderSummaryResponse;
import com.shop.domain.order.entity.Order;
import com.shop.domain.order.entity.OrderItem;
import com.shop.domain.order.repository.OrderRepository;
import com.shop.domain.product.entity.Product;
import com.shop.domain.product.repository.ProductRepository;
import com.shop.domain.user.entity.User;
import com.shop.domain.user.repository.UserRepository;
import com.shop.global.exception.BusinessException;
import com.shop.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;

    /**
     * 주문 생성 - 재고 감소, 가격 스냅샷, 장바구니 정리를 @Transactional 내에서 원자적으로 처리
     */
    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        List<CreateOrderRequest.OrderItemRequest> itemRequests = request.getItems();

        // 1. 각 상품 조회 및 사전 재고 확인 (OUT_OF_STOCK 예외)
        List<Product> products = new ArrayList<>();
        for (CreateOrderRequest.OrderItemRequest itemRequest : itemRequests) {
            Product product = productRepository.findByIdAndDeletedFalse(itemRequest.getProductId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

            if (product.getStock() < itemRequest.getQuantity()) {
                throw new BusinessException(ErrorCode.OUT_OF_STOCK);
            }
            products.add(product);
        }

        // 2. Order 엔티티 생성
        User user = userRepository.getReferenceById(userId);
        Order order = Order.builder()
                .user(user)
                .totalPrice(BigDecimal.ZERO)
                .shippingAddress(request.getShippingAddress())
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .build();

        // 3. 재고 감소 및 OrderItem 생성
        BigDecimal totalPrice = BigDecimal.ZERO;

        for (int i = 0; i < itemRequests.size(); i++) {
            CreateOrderRequest.OrderItemRequest itemRequest = itemRequests.get(i);
            Product product = products.get(i);

            // 재고 감소 (재고 부족 시 BusinessException(OUT_OF_STOCK) → 트랜잭션 롤백)
            product.decreaseStock(itemRequest.getQuantity());

            // 4. OrderItem 생성 - DB에서 조회한 실제 price 사용 (가격 변조 방지, 요청 price 무시)
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .priceAtOrder(product.getPrice())
                    .build();

            order.addItem(orderItem);

            // 5. 총 금액 누적 계산
            totalPrice = totalPrice.add(
                    product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()))
            );
        }

        // 총 금액 설정
        order.updateTotalPrice(totalPrice);

        // 6. Order 저장 (CascadeType.ALL로 OrderItem도 함께 저장)
        orderRepository.save(order);

        // 7. 주문 완료 후 해당 사용자의 장바구니 전체 비우기
        cartService.clearCart(userId);

        return OrderResponse.from(order);
    }

    /**
     * 주문 상세 조회 - Fetch Join으로 N+1 방지, 소유자 검증
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long userId, Long orderId) {
        // 소유자 검증 (본인 주문인지 확인)
        orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        // items, items.product Fetch Join으로 N+1 방지
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        return OrderResponse.from(order);
    }

    /**
     * 주문 목록 조회 - 최신순 페이징
     */
    @Transactional(readOnly = true)
    public Page<OrderSummaryResponse> getOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(OrderSummaryResponse::from);
    }

    /**
     * 주문 취소 - 소유자 검증, 상태 검증, 재고 복구를 @Transactional 내에서 원자적으로 처리
     */
    public OrderResponse cancelOrder(Long userId, Long orderId) {
        // 소유자 검증
        orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        // items, items.product Fetch Join으로 재고 복구 시 N+1 방지
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        // 취소 가능 여부 검증 및 상태 변경 (SHIPPING, DELIVERED 상태에서 예외 발생)
        order.cancel();

        // 각 OrderItem의 재고 복구
        for (OrderItem item : order.getItems()) {
            item.getProduct().increaseStock(item.getQuantity());
        }

        return OrderResponse.from(order);
    }
}
