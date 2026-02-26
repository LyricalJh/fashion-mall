package com.shop.domain.product.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Product API 테스트")
class ProductControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired JdbcTemplate jdbcTemplate;

    private Long categoryId;
    private Long productId;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update(
                "INSERT INTO categories (name, description, display_order, depth, created_at, updated_at) " +
                "VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                "여성", "여성 카테고리", 1
        );
        categoryId = jdbcTemplate.queryForObject(
                "SELECT id FROM categories WHERE name = ?", Long.class, "여성"
        );

        // product 1 (expensive)
        jdbcTemplate.update(
                "INSERT INTO products (name, description, price, stock, category_id, product_code, status, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                "프리미엄 코트", "고급 울 소재 코트", 299000, 10, categoryId, "TST-PRD-001"
        );
        // product 2 (cheap)
        jdbcTemplate.update(
                "INSERT INTO products (name, description, price, stock, category_id, product_code, status, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                "베이직 티셔츠", "편안한 기본 티셔츠", 29000, 50, categoryId, "TST-PRD-002"
        );
        // product 3 (inactive — should NOT appear in results)
        jdbcTemplate.update(
                "INSERT INTO products (name, description, price, stock, category_id, product_code, status, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, 'INACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                "삭제된 상품", "삭제 처리된 상품", 10000, 0, categoryId, "TST-PRD-003"
        );

        productId = jdbcTemplate.queryForObject(
                "SELECT id FROM products WHERE name = ?", Long.class, "프리미엄 코트"
        );
    }

    @Test
    @DisplayName("상품 목록 조회 - 200, 페이지네이션 반환")
    void getProducts_success() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").value(2)) // deleted 상품 제외
                .andExpect(jsonPath("$.data.content[0].id").isNumber())
                .andExpect(jsonPath("$.data.content[0].name").isString())
                .andExpect(jsonPath("$.data.content[0].price").isNumber());
    }

    @Test
    @DisplayName("상품 목록 조회 - 카테고리 필터링")
    void getProducts_filterByCategory() throws Exception {
        // insert another category + product to verify filtering
        jdbcTemplate.update(
                "INSERT INTO categories (name, description, display_order, depth, created_at, updated_at) " +
                "VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                "남성", "남성 카테고리", 2
        );
        Long otherCategoryId = jdbcTemplate.queryForObject(
                "SELECT id FROM categories WHERE name = ?", Long.class, "남성"
        );
        jdbcTemplate.update(
                "INSERT INTO products (name, description, price, stock, category_id, product_code, status, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                "남성 재킷", "남성용 재킷", 150000, 20, otherCategoryId, "TST-PRD-004"
        );

        mockMvc.perform(get("/api/products").param("categoryId", String.valueOf(categoryId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalElements").value(2)); // 여성 카테고리 2개만
    }

    @Test
    @DisplayName("상품 목록 조회 - 가격 오름차순 정렬")
    void getProducts_sortByPriceAsc() throws Exception {
        mockMvc.perform(get("/api/products")
                .param("sort", "price,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].name").value("베이직 티셔츠")) // 29000 first
                .andExpect(jsonPath("$.data.content[1].name").value("프리미엄 코트")); // 299000 second
    }

    @Test
    @DisplayName("상품 목록 조회 - 페이지 크기 제한")
    void getProducts_pagination() throws Exception {
        mockMvc.perform(get("/api/products")
                .param("page", "0")
                .param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content.length()").value(1))
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.totalPages").value(2));
    }

    @Test
    @DisplayName("상품 단건 조회 - 200, 상세 정보 반환")
    void getProduct_success() throws Exception {
        mockMvc.perform(get("/api/products/{id}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(productId))
                .andExpect(jsonPath("$.data.name").value("프리미엄 코트"))
                .andExpect(jsonPath("$.data.price").value(299000))
                .andExpect(jsonPath("$.data.stock").value(10))
                .andExpect(jsonPath("$.data.categoryName").value("여성"));
    }

    @Test
    @DisplayName("상품 단건 조회 - 존재하지 않는 ID 시 404")
    void getProduct_notFound() throws Exception {
        mockMvc.perform(get("/api/products/{id}", 999999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("PRODUCT_NOT_FOUND"));
    }

    @Test
    @DisplayName("상품 단건 조회 - soft-delete 된 상품은 404")
    void getProduct_deletedProduct_notFound() throws Exception {
        Long deletedId = jdbcTemplate.queryForObject(
                "SELECT id FROM products WHERE name = ?", Long.class, "삭제된 상품"
        );
        mockMvc.perform(get("/api/products/{id}", deletedId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("PRODUCT_NOT_FOUND"));
    }

    @Test
    @DisplayName("상품 목록 조회 - 인증 없이 접근 가능 (공개 API)")
    void getProducts_noAuthRequired() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk());
    }
}
