package com.shop.domain.inquiry.dto;

import com.shop.domain.inquiry.entity.Inquiry;
import com.shop.domain.inquiry.entity.InquiryCategory;
import com.shop.domain.inquiry.entity.InquiryStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class InquiryResponse {

    private Long id;
    private String title;
    private String content;
    private InquiryCategory category;
    private InquiryStatus status;
    private String answer;
    private LocalDateTime answeredAt;
    private Long orderId;
    private String orderProductName;
    private LocalDateTime createdAt;

    public static InquiryResponse from(Inquiry inquiry) {
        String productName = null;
        if (inquiry.getOrder() != null && !inquiry.getOrder().getItems().isEmpty()) {
            productName = inquiry.getOrder().getItems().get(0).getProductName();
        }

        return InquiryResponse.builder()
                .id(inquiry.getId())
                .title(inquiry.getTitle())
                .content(inquiry.getContent())
                .category(inquiry.getCategory())
                .status(inquiry.getStatus())
                .answer(inquiry.getAnswer())
                .answeredAt(inquiry.getAnsweredAt())
                .orderId(inquiry.getOrder() != null ? inquiry.getOrder().getId() : null)
                .orderProductName(productName)
                .createdAt(inquiry.getCreatedAt())
                .build();
    }
}
