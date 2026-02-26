package com.shop.domain.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateAddressRequest {
    private String phone;
    private String postcode;
    private String address;
    private String addressDetail;
}
