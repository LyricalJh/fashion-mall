package com.shop.domain.address.controller;

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

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Address API 테스트")
class AddressControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    private String accessToken;

    @BeforeEach
    void setUp() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "email", "address@test.com",
                        "password", "password1234",
                        "name", "배송지유저"
                ))))
                .andExpect(status().isCreated())
                .andReturn();

        accessToken = objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();
    }

    // ─── 배송지 등록 ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("배송지 등록 - 인증 없이 401")
    void createAddress_unauthorized() throws Exception {
        mockMvc.perform(post("/api/addresses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buildAddressRequest(false))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("배송지 등록 - 성공 201")
    void createAddress_success() throws Exception {
        mockMvc.perform(post("/api/addresses")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buildAddressRequest(false))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andExpect(jsonPath("$.data.receiverName").value("홍길동"))
                .andExpect(jsonPath("$.data.zipCode").value("06234"))
                .andExpect(jsonPath("$.data.address").value("서울시 강남구 테헤란로 1"));
    }

    @Test
    @DisplayName("배송지 등록 - 기본 배송지로 등록")
    void createAddress_asDefault() throws Exception {
        mockMvc.perform(post("/api/addresses")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buildAddressRequest(true))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.default").value(true));
    }

    @Test
    @DisplayName("배송지 등록 - 필수 필드 누락 시 400")
    void createAddress_missingField() throws Exception {
        mockMvc.perform(post("/api/addresses")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("receiverName", "홍길동"))))
                .andExpect(status().isBadRequest());
    }

    // ─── 배송지 목록 조회 ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("내 배송지 목록 조회 - 인증 없이 401")
    void getAddresses_unauthorized() throws Exception {
        mockMvc.perform(get("/api/addresses"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("내 배송지 목록 조회 - 성공 200")
    void getAddresses_success() throws Exception {
        createAddress(false);
        createAddress(false);

        mockMvc.perform(get("/api/addresses")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    // ─── 배송지 수정 ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("배송지 수정 - 성공 200")
    void updateAddress_success() throws Exception {
        Long addressId = createAddress(false);

        Map<String, Object> updateRequest = Map.of(
                "receiverName", "김철수",
                "receiverPhone", "010-9999-8888",
                "zipCode", "12345",
                "address", "부산시 해운대구"
        );

        mockMvc.perform(put("/api/addresses/" + addressId)
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.receiverName").value("김철수"))
                .andExpect(jsonPath("$.data.address").value("부산시 해운대구"));
    }

    @Test
    @DisplayName("배송지 수정 - 존재하지 않는 배송지 404")
    void updateAddress_notFound() throws Exception {
        Map<String, Object> updateRequest = Map.of(
                "receiverName", "김철수",
                "receiverPhone", "010-9999-8888",
                "zipCode", "12345",
                "address", "부산시 해운대구"
        );

        mockMvc.perform(put("/api/addresses/999999")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("ADDRESS_NOT_FOUND"));
    }

    // ─── 배송지 삭제 ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("배송지 삭제 - 성공 200")
    void deleteAddress_success() throws Exception {
        Long addressId = createAddress(false);

        mockMvc.perform(delete("/api/addresses/" + addressId)
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 삭제 후 목록에서 사라졌는지 확인
        mockMvc.perform(get("/api/addresses")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(0));
    }

    @Test
    @DisplayName("배송지 삭제 - 존재하지 않는 배송지 404")
    void deleteAddress_notFound() throws Exception {
        mockMvc.perform(delete("/api/addresses/999999")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("ADDRESS_NOT_FOUND"));
    }

    // ─── 기본 배송지 설정 ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("기본 배송지 설정 - 성공 200, 기존 기본배송지 해제")
    void setDefaultAddress_success() throws Exception {
        Long address1 = createAddress(true);
        Long address2 = createAddress(false);

        // address2를 기본 배송지로 설정
        mockMvc.perform(patch("/api/addresses/" + address2 + "/default")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.default").value(true));

        // 목록 조회 시 address2가 기본, address1은 해제
        mockMvc.perform(get("/api/addresses")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].default").value(true))
                .andExpect(jsonPath("$.data[0].id").value(address2));
    }

    // ─── 헬퍼 ─────────────────────────────────────────────────────────────────────

    private Long createAddress(boolean isDefault) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/addresses")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buildAddressRequest(isDefault))))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("id").asLong();
    }

    private Map<String, Object> buildAddressRequest(boolean isDefault) {
        Map<String, Object> map = new HashMap<>();
        map.put("receiverName", "홍길동");
        map.put("receiverPhone", "010-1234-5678");
        map.put("zipCode", "06234");
        map.put("address", "서울시 강남구 테헤란로 1");
        map.put("addressDetail", "101호");
        map.put("isDefault", isDefault);
        return map;
    }
}
