package com.shop.global.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "kakao")
@Getter
@Setter
public class KakaoProperties {
    private String restApiKey;
    private String clientSecret;
    private String redirectUri;
}
