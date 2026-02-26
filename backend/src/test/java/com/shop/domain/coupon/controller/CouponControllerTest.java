package com.shop.domain.coupon.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Coupon API 테스트")
class CouponControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    private String accessToken;

    @BeforeEach
    void setUp() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "email", "coupon@test.com",
                        "password", "password1234",
                        "name", "쿠폰유저"
                ))))
                .andExpect(status().isCreated())
                .andReturn();

        accessToken = objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();
    }

    // ─── 쿠폰 발급 ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("쿠폰 발급 - 인증 없이 401")
    void createCoupon_unauthorized() throws Exception {
        mockMvc.perform(post("/api/coupons")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buildCouponRequest())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("쿠폰 발급 - 성공 201")
    void createCoupon_success() throws Exception {
        mockMvc.perform(post("/api/coupons")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buildCouponRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andExpect(jsonPath("$.data.couponName").value("10% 할인 쿠폰"))
                .andExpect(jsonPath("$.data.discountType").value("PERCENTAGE"))
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"));
    }

    // ─── 쿠폰 목록 조회 ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("내 쿠폰 전체 조회 - 인증 없이 401")
    void getCoupons_unauthorized() throws Exception {
        mockMvc.perform(get("/api/coupons"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("내 쿠폰 전체 조회 - 성공 200")
    void getCoupons_success() throws Exception {
        // 쿠폰 2개 발급
        createCoupon();
        createCoupon();

        mockMvc.perform(get("/api/coupons")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    // ─── 사용 가능한 쿠폰 조회 ────────────────────────────────────────────────────

    @Test
    @DisplayName("사용 가능한 쿠폰 조회 - 성공 200")
    void getAvailableCoupons_success() throws Exception {
        Long couponId = createCoupon();

        mockMvc.perform(get("/api/coupons/available")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].status").value("AVAILABLE"));
    }

    // ─── 쿠폰 사용 ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("쿠폰 사용 - 성공 200")
    void useCoupon_success() throws Exception {
        Long couponId = createCoupon();

        mockMvc.perform(post("/api/coupons/" + couponId + "/use")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("USED"))
                .andExpect(jsonPath("$.data.usedAt").isNotEmpty());
    }

    @Test
    @DisplayName("쿠폰 사용 - 이미 사용한 쿠폰 400")
    void useCoupon_alreadyUsed() throws Exception {
        Long couponId = createCoupon();

        // 첫 번째 사용
        mockMvc.perform(post("/api/coupons/" + couponId + "/use")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());

        // 두 번째 사용 시도
        mockMvc.perform(post("/api/coupons/" + couponId + "/use")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("COUPON_NOT_AVAILABLE"));
    }

    @Test
    @DisplayName("쿠폰 사용 - 존재하지 않는 쿠폰 404")
    void useCoupon_notFound() throws Exception {
        mockMvc.perform(post("/api/coupons/999999/use")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("COUPON_NOT_FOUND"));
    }

    // ─── 헬퍼 ─────────────────────────────────────────────────────────────────────

    private Long createCoupon() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/coupons")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buildCouponRequest())))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("id").asLong();
    }

    private Map<String, Object> buildCouponRequest() {
        return Map.of(
                "couponName", "10% 할인 쿠폰",
                "discountType", "PERCENTAGE",
                "discountValue", 10,
                "minOrderAmount", 10000,
                "expiryDate", "2027-12-31T23:59:59"
        );
    }
}
