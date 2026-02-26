package com.shop.domain.order.entity;

import com.shop.domain.common.BaseEntity;
import com.shop.domain.user.entity.User;
import com.shop.global.exception.BusinessException;
import com.shop.global.exception.ErrorCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(nullable = false, unique = true)
    private String orderNumber;

    private String shippingMemo;

    // 배송 정보
    private String shippingAddress;
    private String receiverName;
    private String receiverPhone;

    @Builder
    public Order(User user, BigDecimal totalPrice, String shippingAddress,
                 String receiverName, String receiverPhone, String orderNumber, String shippingMemo) {
        this.user = user;
        this.totalPrice = totalPrice;
        this.shippingAddress = shippingAddress;
        this.receiverName = receiverName;
        this.receiverPhone = receiverPhone;
        this.orderNumber = orderNumber;
        this.shippingMemo = shippingMemo;
        this.status = OrderStatus.PENDING;
    }

    /**
     * 주문 취소 - PENDING, PAID 상태만 취소 가능
     * SHIPPING, DELIVERED 상태에서는 취소 불가
     */
    public void cancel() {
        if (this.status == OrderStatus.SHIPPING || this.status == OrderStatus.DELIVERED) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "배송 중이거나 배송 완료된 주문은 취소할 수 없습니다.");
        }
        this.status = OrderStatus.CANCELLED;
    }

    public void addItem(OrderItem item) {
        this.items.add(item);
    }

    public void updateTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public void markPaid() {
        this.status = OrderStatus.PAID;
    }
}
