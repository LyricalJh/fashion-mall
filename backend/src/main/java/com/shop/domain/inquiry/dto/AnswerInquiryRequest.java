package com.shop.domain.inquiry.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AnswerInquiryRequest {

    @NotBlank(message = "답변 내용은 필수입니다.")
    private String answer;
}
