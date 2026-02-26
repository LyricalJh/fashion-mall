package com.shop.domain.claim.entity;

import com.shop.domain.common.BaseEntity;
import com.shop.domain.order.entity.Order;
import com.shop.domain.user.entity.User;
import com.shop.global.exception.BusinessException;
import com.shop.global.exception.ErrorCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "claims")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Claim extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimType claimType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStatus status = ClaimStatus.RECEIVED;

    @Column(nullable = false)
    private String reason;

    private String note;

    @Column(precision = 14, scale = 2)
    private BigDecimal refundAmount;

    private String refundMethod;

    private String bankName;

    private String accountNumber;

    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClaimItem> items = new ArrayList<>();

    @Builder
    public Claim(Order order, User user, ClaimType claimType, String reason,
                 BigDecimal refundAmount, String refundMethod,
                 String bankName, String accountNumber) {
        this.order = order;
        this.user = user;
        this.claimType = claimType;
        this.reason = reason;
        this.refundAmount = refundAmount;
        this.refundMethod = refundMethod;
        this.bankName = bankName;
        this.accountNumber = accountNumber;
        this.status = ClaimStatus.RECEIVED;
    }

    public void addItem(ClaimItem item) {
        this.items.add(item);
    }

    /**
     * 클레임 철회 — RECEIVED 상태에서만 가능
     */
    public void withdraw() {
        if (this.status != ClaimStatus.RECEIVED) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "접수 상태에서만 철회할 수 있습니다.");
        }
    }

    /**
     * 클레임 완료 처리
     */
    public void complete() {
        this.status = ClaimStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }
}
