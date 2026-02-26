package com.shop.domain.inquiry.entity;

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

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "inquiries")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Inquiry extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InquiryCategory category = InquiryCategory.OTHER;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InquiryStatus status = InquiryStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String answer;

    private LocalDateTime answeredAt;

    @Builder
    public Inquiry(User user, Order order, InquiryCategory category, String title, String content) {
        this.user = user;
        this.order = order;
        this.category = category != null ? category : InquiryCategory.OTHER;
        this.title = title;
        this.content = content;
        this.status = InquiryStatus.PENDING;
    }

    public void answer(String answer) {
        if (this.status == InquiryStatus.CLOSED) {
            throw new BusinessException(ErrorCode.INQUIRY_ALREADY_CLOSED);
        }
        this.answer = answer;
        this.answeredAt = LocalDateTime.now();
        this.status = InquiryStatus.ANSWERED;
    }

    public void close() {
        this.status = InquiryStatus.CLOSED;
    }
}
