package com.shop.domain.claim.dto;

import com.shop.domain.claim.entity.ClaimType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.util.List;

@Getter
public class CreateClaimRequest {

    @NotNull(message = "주문 ID는 필수입니다.")
    private Long orderId;

    @NotNull(message = "클레임 유형은 필수입니다.")
    private ClaimType claimType;

    @NotBlank(message = "사유는 필수입니다.")
    private String reason;

    private String bankName;

    private String accountNumber;

    @NotEmpty(message = "클레임 상품은 1개 이상 필요합니다.")
    @Valid
    private List<ClaimItemRequest> items;

    @Getter
    public static class ClaimItemRequest {
        @NotNull(message = "주문 상품 ID는 필수입니다.")
        private Long orderItemId;

        @Min(value = 1, message = "수량은 1개 이상이어야 합니다.")
        private int quantity;
    }
}
