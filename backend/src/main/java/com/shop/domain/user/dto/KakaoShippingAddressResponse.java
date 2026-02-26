package com.shop.domain.user.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Getter @Setter @NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class KakaoShippingAddressResponse {
    private List<ShippingAddress> shippingAddresses;

    @Getter @Setter @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class ShippingAddress {
        private Long id;
        private String name;
        private Boolean isDefault;
        private String baseAddress;
        private String detailAddress;
        private String receiverName;
        private String receiverPhoneNumber1;
        private String zoneNumber;
    }
}
