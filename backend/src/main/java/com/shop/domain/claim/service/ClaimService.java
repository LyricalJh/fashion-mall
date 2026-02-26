package com.shop.domain.claim.service;

import com.shop.domain.claim.dto.*;
import com.shop.domain.claim.entity.*;
import com.shop.domain.claim.repository.ClaimRepository;
import com.shop.domain.order.entity.Order;
import com.shop.domain.order.entity.OrderItem;
import com.shop.domain.order.entity.OrderStatus;
import com.shop.domain.order.repository.OrderRepository;
import com.shop.domain.payment.entity.Payment;
import com.shop.domain.payment.repository.PaymentRepository;
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
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    /**
     * 클레임 접수 (취소/반품)
     */
    public ClaimResponse createClaim(Long userId, CreateClaimRequest request) {
        // 주문 소유자 검증
        Order order = orderRepository.findByIdAndUserId(request.getOrderId(), userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        // Fetch join으로 items + product 로드
        order = orderRepository.findByIdWithItems(order.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        // 클레임 타입별 주문 상태 검증
        validateOrderStatusForClaim(order, request.getClaimType());

        // OrderItem 맵 생성
        Map<Long, OrderItem> orderItemMap = order.getItems().stream()
                .collect(Collectors.toMap(OrderItem::getId, Function.identity()));

        // 환불 금액 계산 + 중복 수량 검증
        BigDecimal refundAmount = BigDecimal.ZERO;
        for (CreateClaimRequest.ClaimItemRequest itemReq : request.getItems()) {
            OrderItem orderItem = orderItemMap.get(itemReq.getOrderItemId());
            if (orderItem == null) {
                throw new BusinessException(ErrorCode.INVALID_INPUT, "해당 주문에 포함되지 않은 상품입니다.");
            }

            // 이미 클레임된 수량 확인
            int alreadyClaimed = claimRepository.sumClaimedQuantityByOrderItemId(orderItem.getId());
            int available = orderItem.getQuantity() - alreadyClaimed;
            if (itemReq.getQuantity() > available) {
                throw new BusinessException(ErrorCode.INVALID_INPUT,
                        String.format("'%s'의 클레임 가능 수량은 %d개입니다.", orderItem.getProductName(), available));
            }

            refundAmount = refundAmount.add(
                    orderItem.getPriceAtOrder().multiply(BigDecimal.valueOf(itemReq.getQuantity()))
            );
        }

        // 결제 수단 조회
        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND));

        User user = userRepository.getReferenceById(userId);

        // Claim 엔티티 생성
        Claim claim = Claim.builder()
                .order(order)
                .user(user)
                .claimType(request.getClaimType())
                .reason(request.getReason())
                .refundAmount(refundAmount)
                .refundMethod(payment.getPaymentMethod().name())
                .bankName(request.getBankName())
                .accountNumber(request.getAccountNumber())
                .build();

        // ClaimItem 생성
        for (CreateClaimRequest.ClaimItemRequest itemReq : request.getItems()) {
            OrderItem orderItem = orderItemMap.get(itemReq.getOrderItemId());
            ClaimItem claimItem = ClaimItem.builder()
                    .claim(claim)
                    .orderItem(orderItem)
                    .quantity(itemReq.getQuantity())
                    .productName(orderItem.getProductName())
                    .build();
            claim.addItem(claimItem);
        }

        claimRepository.save(claim);

        // 취소의 경우 즉시 완료 처리 (배송 전이므로)
        if (request.getClaimType() == ClaimType.CANCEL) {
            completeClaim(claim, payment);
        }

        return ClaimResponse.from(claim);
    }

    /**
     * 내 클레임 목록 조회
     */
    @Transactional(readOnly = true)
    public Page<ClaimSummaryResponse> getClaims(Long userId, Pageable pageable) {
        Page<Claim> page = claimRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<Long> claimIds = page.getContent().stream()
                .map(Claim::getId)
                .toList();

        if (claimIds.isEmpty()) {
            return page.map(ClaimSummaryResponse::from);
        }

        Map<Long, Claim> claimsWithItems = claimRepository.findAllWithItemsByIdIn(claimIds).stream()
                .collect(Collectors.toMap(Claim::getId, Function.identity()));

        return page.map(claim -> ClaimSummaryResponse.from(
                claimsWithItems.getOrDefault(claim.getId(), claim)
        ));
    }

    /**
     * 클레임 상세 조회
     */
    @Transactional(readOnly = true)
    public ClaimResponse getClaim(Long userId, Long claimId) {
        claimRepository.findByIdAndUserId(claimId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CLAIM_NOT_FOUND));

        Claim claim = claimRepository.findByIdWithItems(claimId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CLAIM_NOT_FOUND));

        return ClaimResponse.from(claim);
    }

    /**
     * 클레임 철회 (RECEIVED 상태만)
     */
    public void withdrawClaim(Long userId, Long claimId) {
        Claim claim = claimRepository.findByIdAndUserId(claimId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CLAIM_NOT_FOUND));

        claim.withdraw();
        claimRepository.delete(claim);
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private void validateOrderStatusForClaim(Order order, ClaimType claimType) {
        if (claimType == ClaimType.CANCEL) {
            if (order.getStatus() != OrderStatus.CONFIRMED && order.getStatus() != OrderStatus.PAID) {
                throw new BusinessException(ErrorCode.INVALID_INPUT,
                        "취소는 주문확인 또는 결제완료 상태에서만 가능합니다.");
            }
        } else if (claimType == ClaimType.RETURN) {
            if (order.getStatus() != OrderStatus.DELIVERED) {
                throw new BusinessException(ErrorCode.INVALID_INPUT,
                        "반품은 배송완료 상태에서만 가능합니다.");
            }
        }
    }

    /**
     * 클레임 완료 처리: 환불 + 재고 복원
     */
    private void completeClaim(Claim claim, Payment payment) {
        claim.complete();

        // 환불 처리
        payment.refund();

        // 주문 상태를 CANCELLED로 변경 (전체 취소인 경우)
        claim.getOrder().cancel();

        // 재고 복원
        for (ClaimItem item : claim.getItems()) {
            item.getOrderItem().getProduct().increaseStock(item.getQuantity());
        }
    }
}
