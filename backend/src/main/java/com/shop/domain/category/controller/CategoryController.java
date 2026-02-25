package com.shop.domain.category.controller;

import com.shop.domain.category.dto.CategoryResponse;
import com.shop.domain.category.service.CategoryService;
import com.shop.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Category", description = "카테고리 API")
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "카테고리 전체 조회", description = "모든 카테고리 목록을 반환합니다.")
    @GetMapping
    public ApiResponse<List<CategoryResponse>> getCategories() {
        return ApiResponse.ok(categoryService.findAll());
    }

    @Operation(summary = "카테고리 단건 조회", description = "ID로 카테고리를 조회합니다.")
    @GetMapping("/{id}")
    public ApiResponse<CategoryResponse> getCategory(
            @Parameter(description = "카테고리 ID", required = true)
            @PathVariable Long id) {
        return ApiResponse.ok(categoryService.findById(id));
    }
}
