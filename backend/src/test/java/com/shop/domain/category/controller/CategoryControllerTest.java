package com.shop.domain.category.controller;

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
@DisplayName("Category API 테스트")
class CategoryControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired JdbcTemplate jdbcTemplate;

    private Long categoryId;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update(
                "INSERT INTO categories (name, description, display_order, created_at, updated_at) " +
                "VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                "여성", "여성 카테고리", 1
        );
        jdbcTemplate.update(
                "INSERT INTO categories (name, description, display_order, created_at, updated_at) " +
                "VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                "남성", "남성 카테고리", 2
        );
        categoryId = jdbcTemplate.queryForObject(
                "SELECT id FROM categories WHERE name = ?", Long.class, "여성"
        );
    }

    @Test
    @DisplayName("전체 카테고리 조회 - 200, 리스트 반환")
    void getCategories_success() throws Exception {
        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].name").value("여성"))
                .andExpect(jsonPath("$.data[0].id").isNumber());
    }

    @Test
    @DisplayName("카테고리 단건 조회 - 200, 상세 반환")
    void getCategory_success() throws Exception {
        mockMvc.perform(get("/api/categories/{id}", categoryId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(categoryId))
                .andExpect(jsonPath("$.data.name").value("여성"))
                .andExpect(jsonPath("$.data.description").value("여성 카테고리"));
    }

    @Test
    @DisplayName("카테고리 단건 조회 - 존재하지 않는 ID 시 404")
    void getCategory_notFound() throws Exception {
        mockMvc.perform(get("/api/categories/{id}", 999999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("CATEGORY_NOT_FOUND"));
    }

    @Test
    @DisplayName("카테고리 목록 - 인증 없이 접근 가능 (공개 API)")
    void getCategories_noAuthRequired() throws Exception {
        // No Authorization header - should still succeed
        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk());
    }
}
