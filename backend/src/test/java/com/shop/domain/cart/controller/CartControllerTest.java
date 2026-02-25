package com.shop.domain.cart.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
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
@DisplayName("Cart API 테스트")
class CartControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired JdbcTemplate jdbcTemplate;

    private Long categoryId;
    private Long productId;
    private String accessToken;

    private String toJson(Object obj) throws Exception {
        return objectMapper.writeValueAsString(obj);
    }

    @BeforeEach
    void setUp() throws Exception {
        // 카테고리, 상품 데이터 삽입
        jdbcTemplate.update(
                "INSERT INTO categories (name, description, display_order, created_at, updated_at) " +
                "VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                "여성", "여성 카테고리", 1
        );
        categoryId = jdbcTemplate.queryForObject(
                "SELECT id FROM categories WHERE name = ?", Long.class, "여성"
        );

        jdbcTemplate.update(
                "INSERT INTO products (name, description, price, stock, category_id, deleted, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                "테스트 상품", "테스트 상품 설명", 50000, 10, categoryId
        );
        productId = jdbcTemplate.queryForObject(
                "SELECT id FROM products WHERE name = ?", Long.class, "테스트 상품"
        );

        // 회원가입 후 토큰 획득
        MvcResult result = mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of(
                        "email", "cart@test.com",
                        "password", "password1234",
                        "name", "장바구니유저"
                ))))
                .andExpect(status().isCreated())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        accessToken = objectMapper.readTree(body).path("data").path("accessToken").asText();
    }

    // ─── GET /api/cart ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("장바구니 조회 - 인증 없이 401")
    void getCart_unauthorized() throws Exception {
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("장바구니 조회 - 빈 장바구니 200")
    void getCart_empty() throws Exception {
        mockMvc.perform(get("/api/cart")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items").isArray())
                .andExpect(jsonPath("$.data.items.length()").value(0))
                .andExpect(jsonPath("$.data.totalCount").value(0));
    }

    // ─── POST /api/cart ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("장바구니 담기 - 성공 200")
    void addToCart_success() throws Exception {
        mockMvc.perform(post("/api/cart")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of("productId", productId, "quantity", 2))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.productId").value(productId))
                .andExpect(jsonPath("$.data.quantity").value(2));
    }

    @Test
    @DisplayName("장바구니 담기 - 동일 상품 재추가 시 수량 누적")
    void addToCart_sameProduct_quantityAccumulates() throws Exception {
        // 처음 1개
        mockMvc.perform(post("/api/cart")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of("productId", productId, "quantity", 1))))
                .andExpect(status().isOk());

        // 추가 2개 → 총 3개
        mockMvc.perform(post("/api/cart")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of("productId", productId, "quantity", 2))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.quantity").value(3));
    }

    @Test
    @DisplayName("장바구니 담기 - 재고 초과 시 400")
    void addToCart_exceedsStock_badRequest() throws Exception {
        mockMvc.perform(post("/api/cart")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of("productId", productId, "quantity", 999))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("OUT_OF_STOCK"));
    }

    @Test
    @DisplayName("장바구니 담기 - 존재하지 않는 상품 404")
    void addToCart_productNotFound() throws Exception {
        mockMvc.perform(post("/api/cart")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of("productId", 999999L, "quantity", 1))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("PRODUCT_NOT_FOUND"));
    }

    // ─── PUT /api/cart/{cartItemId} ─────────────────────────────────────────────

    @Test
    @DisplayName("장바구니 수량 변경 - 성공 200")
    void updateCartItem_success() throws Exception {
        // 먼저 담기
        MvcResult addResult = mockMvc.perform(post("/api/cart")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of("productId", productId, "quantity", 1))))
                .andExpect(status().isOk())
                .andReturn();

        Long cartItemId = objectMapper.readTree(addResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 수량 변경 (1 → 5)
        mockMvc.perform(put("/api/cart/" + cartItemId)
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of("quantity", 5))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.quantity").value(5));
    }

    @Test
    @DisplayName("장바구니 수량 변경 - 다른 사용자 아이템 404")
    void updateCartItem_otherUserItem_notFound() throws Exception {
        // 두 번째 사용자 가입
        MvcResult result2 = mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of(
                        "email", "other@test.com",
                        "password", "password1234",
                        "name", "다른유저"
                ))))
                .andExpect(status().isCreated())
                .andReturn();
        String token2 = objectMapper.readTree(result2.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        // 두 번째 사용자 장바구니에 담기
        MvcResult addResult = mockMvc.perform(post("/api/cart")
                .header("Authorization", "Bearer " + token2)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of("productId", productId, "quantity", 1))))
                .andExpect(status().isOk())
                .andReturn();

        Long cartItemId = objectMapper.readTree(addResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 첫 번째 사용자가 두 번째 사용자 아이템 수정 시도 → 404
        mockMvc.perform(put("/api/cart/" + cartItemId)
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of("quantity", 3))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("CART_ITEM_NOT_FOUND"));
    }

    // ─── DELETE /api/cart/{cartItemId} ──────────────────────────────────────────

    @Test
    @DisplayName("장바구니 아이템 삭제 - 성공 200")
    void removeCartItem_success() throws Exception {
        // 담기
        MvcResult addResult = mockMvc.perform(post("/api/cart")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of("productId", productId, "quantity", 1))))
                .andExpect(status().isOk())
                .andReturn();

        Long cartItemId = objectMapper.readTree(addResult.getResponse().getContentAsString())
                .path("data").path("id").asLong();

        // 삭제
        mockMvc.perform(delete("/api/cart/" + cartItemId)
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 장바구니 조회 → 비어있음
        mockMvc.perform(get("/api/cart")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(jsonPath("$.data.items.length()").value(0));
    }

    // ─── DELETE /api/cart ────────────────────────────────────────────────────────

    @Test
    @DisplayName("장바구니 전체 비우기 - 성공 200")
    void clearCart_success() throws Exception {
        // 2개 담기
        mockMvc.perform(post("/api/cart")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of("productId", productId, "quantity", 1))))
                .andExpect(status().isOk());

        // 전체 비우기
        mockMvc.perform(delete("/api/cart")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // 확인
        mockMvc.perform(get("/api/cart")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(jsonPath("$.data.items.length()").value(0));
    }
}
