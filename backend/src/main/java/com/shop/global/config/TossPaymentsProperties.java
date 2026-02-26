package com.shop.global.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "toss.payments")
@Getter
@Setter
public class TossPaymentsProperties {
    private String secretKey;
    private String clientKey;
}
