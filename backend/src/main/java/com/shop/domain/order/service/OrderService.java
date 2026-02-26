package com.shop.domain.order.service;

import com.shop.domain.cart.service.CartService;
import com.shop.domain.order.dto.CreateOrderRequest;
import com.shop.domain.order.dto.OrderResponse;
import com.shop.domain.order.dto.OrderSummaryResponse;
import com.shop.domain.order.entity.Order;
import com.shop.domain.order.entity.OrderItem;
import com.shop.domain.order.repository.OrderRepository;
import com.shop.domain.payment.entity.Payment;
import com.shop.domain.payment.entity.PaymentMethod;
import com.shop.domain.payment.repository.PaymentRepository;
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
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final PaymentRepository paymentRepository;

    /**
     * 주문 생성 - 재고 감소, 가격 스냅샷, 장바구니 정리를 @Transactional 내에서 원자적으로 처리
     */
    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        List<CreateOrderRequest.OrderItemRequest> itemRequests = request.getItems();

        // Order 엔티티 생성
        User user = userRepository.getReferenceById(userId);
        String orderNumber = generateOrderNumber();
        Order order = Order.builder()
                .user(user)
                .totalPrice(BigDecimal.ZERO)
                .shippingAddress(request.getShippingAddress())
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .orderNumber(orderNumber)
                .shippingMemo(request.getShippingMemo())
                .build();

        BigDecimal totalPrice = BigDecimal.ZERO;

        for (CreateOrderRequest.OrderItemRequest itemRequest : itemRequests) {
            Product product = productRepository.findByIdForUpdate(itemRequest.getProductId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

            product.decreaseStock(itemRequest.getQuantity());

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .priceAtOrder(product.getPrice())
                    .productName(product.getName())
                    .build();

            order.addItem(orderItem);
            totalPrice = totalPrice.add(
                    product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()))
            );
        }

        // 총 금액 설정
        order.updateTotalPrice(totalPrice);

        // Order 저장 (CascadeType.ALL로 OrderItem도 함께 저장)
        orderRepository.save(order);

        // PENDING 상태의 Payment 레코드 자동 생성
        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(PaymentMethod.CARD)
                .paymentAmount(totalPrice)
                .build();
        paymentRepository.save(payment);

        // 주문 완료 후 해당 사용자의 장바구니 전체 비우기
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

    private String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = String.format("%04d", new Random().nextInt(10000));
        return "ORD" + datePart + randomPart;
    }
}
