package com.shop.domain.inquiry.dto;

import com.shop.domain.inquiry.entity.InquiryCategory;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateInquiryRequest {

    @NotBlank(message = "제목은 필수입니다.")
    private String title;

    @NotBlank(message = "내용은 필수입니다.")
    private String content;

    private InquiryCategory category;

    private Long orderId;
}
