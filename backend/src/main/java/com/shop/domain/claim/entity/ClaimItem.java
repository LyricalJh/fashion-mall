package com.shop.domain.claim.entity;

import com.shop.domain.order.entity.OrderItem;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "claim_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ClaimItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private String productName;

    @Builder
    public ClaimItem(Claim claim, OrderItem orderItem, int quantity, String productName) {
        this.claim = claim;
        this.orderItem = orderItem;
        this.quantity = quantity;
        this.productName = productName;
    }
}
