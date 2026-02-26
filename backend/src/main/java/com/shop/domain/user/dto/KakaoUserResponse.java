package com.shop.domain.user.dto;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class KakaoUserResponse {
    private Long id;

    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    @Getter
    @Setter
    @NoArgsConstructor
    public static class KakaoAccount {
        private Profile profile;
        private String email;

        @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
        @Getter
        @Setter
        @NoArgsConstructor
        public static class Profile {
            private String nickname;
            private String profileImageUrl;
            private String thumbnailImageUrl;
        }
    }

    @com.fasterxml.jackson.annotation.JsonProperty("kakao_account")
    private KakaoAccount kakaoAccount;
}
