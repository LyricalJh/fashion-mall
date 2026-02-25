package com.shop.domain.order.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
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

import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Order API 테스트")
class OrderControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired JdbcTemplate jdbcTemplate;
    @Autowired EntityManager em;

    private Long categoryId;
    private Long productId;
    private String accessToken;

    private static final Map<String, Object> ORDER_BODY_TEMPLATE = Map.of(
            "shippingAddress", "서울시 강남구 테헤란로 1",
            "receiverName", "홍길동",
            "receiverPhone", "010-1234-5678"
    );

    private String toJson(Object obj) throws Exception {
        return objectMapper.writeValueAsString(obj);
    }

    @BeforeEach
    void setUp() throws Exception {
        // 카테고리 & 상품 (stock=10)
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
                "주문용 상품", "주문 테스트 상품", 30000, 10, categoryId
        );
        productId = jdbcTemplate.queryForObject(
                "SELECT id FROM products WHERE name = ?", Long.class, "주문용 상품"
        );

        // 회원가입 후 토큰 획득
        MvcResult result = mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of(
                        "email", "order@test.com",
                        "password", "password1234",
                        "name", "주문유저"
                ))))
                .andExpect(status().isCreated())
                .andReturn();

        accessToken = objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();
    }

    // ─── 주문 생성 ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("주문 생성 - 인증 없이 401")
    void createOrder_unauthorized() throws Exception {
        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(buildOrderRequest(1))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("주문 생성 - 성공 201, 재고 감소 확인")
    void createOrder_success() throws Exception {
        mockMvc.perform(post("/api/orders")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(buildOrderRequest(2))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.items").isArray())
                .andExpect(jsonPath("$.data.items.length()").value(1))
                .andExpect(jsonPath("$.data.items[0].quantity").value(2))
                .andExpect(jsonPath("$.data.totalPrice").value(60000))
                .andExpect(jsonPath("$.data.shippingAddress").value("서울시 강남구 테헤란로 1"))
                .andExpect(jsonPath("$.data.receiverName").value("홍길동"));

        // 재고 감소 검증: 재고(10) - 2 = 8 → 이후 9개 주문 시도 시 400 발생
        mockMvc.perform(post("/api/orders")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(buildOrderRequest(9))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("OUT_OF_STOCK"));
    }

    @Test
    @DisplayName("주문 생성 - 재고 초과 시 400")
    void createOrder_outOfStock_badRequest() throws Exception {
        mockMvc.perform(post("/api/orders")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(buildOrderRequest(999))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("OUT_OF_STOCK"));
    }

    @Test
    @DisplayName("주문 생성 - 존재하지 않는 상품 404")
    void createOrder_productNotFound() throws Exception {
        Map<String, Object> body = Map.of(
                "items", List.of(Map.of("productId", 999999L, "quantity", 1)),
                "shippingAddress", "서울시",
                "receiverName", "홍길동",
                "receiverPhone", "010-0000-0000"
        );
        mockMvc.perform(post("/api/orders")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(body)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("PRODUCT_NOT_FOUND"));
    }

    @Test
    @DisplayName("주문 생성 - 필수 필드 누락 시 400")
    void createOrder_missingField_badRequest() throws Exception {
        Map<String, Object> body = Map.of(
                "items", List.of(Map.of("productId", productId, "quantity", 1))
                // shippingAddress, receiverName, receiverPhone 누락
        );
        mockMvc.perform(post("/api/orders")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(body)))
                .andExpect(status().isBadRequest());
    }

    // ─── 주문 목록 조회 ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("주문 목록 조회 - 인증 없이 401")
    void getOrders_unauthorized() throws Exception {
        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("주문 목록 조회 - 성공 200, 페이지네이션")
    void getOrders_success() throws Exception {
        // 주문 2건 생성
        mockMvc.perform(post("/api/orders")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(buildOrderRequest(1))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/orders")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(buildOrderRequest(1))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/orders")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").value(2));
    }

    // ─── 주문 단건 조회 ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("주문 단건 조회 - 성공 200")
    void getOrder_success() throws Exception {
        Long orderId = createOrder(1);

        mockMvc.perform(get("/api/orders/" + orderId)
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(orderId))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.items").isArray());
    }

    @Test
    @DisplayName("주문 단건 조회 - 다른 사용자의 주문 404")
    void getOrder_otherUserOrder_notFound() throws Exception {
        Long orderId = createOrder(1);

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

        // 두 번째 사용자가 첫 번째 사용자 주문 조회 → 404
        mockMvc.perform(get("/api/orders/" + orderId)
                .header("Authorization", "Bearer " + token2))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("ORDER_NOT_FOUND"));
    }

    @Test
    @DisplayName("주문 단건 조회 - 존재하지 않는 주문 404")
    void getOrder_notFound() throws Exception {
        mockMvc.perform(get("/api/orders/999999")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("ORDER_NOT_FOUND"));
    }

    // ─── 주문 취소 ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("주문 취소 - PENDING 상태 취소 성공, 재고 복구 확인")
    void cancelOrder_pending_success() throws Exception {
        Long orderId = createOrder(3); // stock 10 → 7

        mockMvc.perform(delete("/api/orders/" + orderId)
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));

        // 재고 복구 검증: 취소 후 10개 주문이 가능해야 함
        mockMvc.perform(post("/api/orders")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(buildOrderRequest(10))))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("주문 취소 - SHIPPING 상태는 취소 불가 400")
    void cancelOrder_shipping_badRequest() throws Exception {
        Long orderId = createOrder(1);

        // JPA 1차 캐시를 flush/clear 후 DB 직접 업데이트
        // → 이후 MockMvc 요청이 DB에서 최신 상태를 재조회하도록 보장
        em.flush();
        em.clear();
        jdbcTemplate.update(
                "UPDATE orders SET status = 'SHIPPING' WHERE id = ?", orderId
        );

        mockMvc.perform(delete("/api/orders/" + orderId)
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("INVALID_INPUT"));
    }

    @Test
    @DisplayName("주문 취소 - 다른 사용자의 주문 취소 시도 404")
    void cancelOrder_otherUserOrder_notFound() throws Exception {
        Long orderId = createOrder(1);

        MvcResult result2 = mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of(
                        "email", "cancel_other@test.com",
                        "password", "password1234",
                        "name", "다른유저2"
                ))))
                .andExpect(status().isCreated())
                .andReturn();
        String token2 = objectMapper.readTree(result2.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        mockMvc.perform(delete("/api/orders/" + orderId)
                .header("Authorization", "Bearer " + token2))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("ORDER_NOT_FOUND"));
    }

    // ─── 헬퍼 ─────────────────────────────────────────────────────────────────────

    /** 주문을 생성하고 orderId를 반환 */
    private Long createOrder(int quantity) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/orders")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(buildOrderRequest(quantity))))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("id").asLong();
    }

    /** 표준 주문 요청 본문 생성 */
    private Map<String, Object> buildOrderRequest(int quantity) {
        return Map.of(
                "items", List.of(Map.of("productId", productId, "quantity", quantity)),
                "shippingAddress", "서울시 강남구 테헤란로 1",
                "receiverName", "홍길동",
                "receiverPhone", "010-1234-5678"
        );
    }
}
