package com.shop.domain.user.entity;

import com.shop.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER;

    @Column(unique = true)
    private Long kakaoId;

    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LoginType loginType = LoginType.LOCAL;

    private String phone;

    private String postcode;

    private String address;

    private String addressDetail;

    @Column(length = 512)
    private String kakaoAccessToken;

    @Column(length = 512)
    private String kakaoRefreshToken;

    public void updateKakaoTokens(String kakaoAccessToken, String kakaoRefreshToken) {
        this.kakaoAccessToken = kakaoAccessToken;
        this.kakaoRefreshToken = kakaoRefreshToken;
    }

    public void updateAddress(String phone, String postcode, String address, String addressDetail) {
        this.phone = phone;
        this.postcode = postcode;
        this.address = address;
        this.addressDetail = addressDetail;
    }

    public enum Role {
        ADMIN, USER
    }
}
