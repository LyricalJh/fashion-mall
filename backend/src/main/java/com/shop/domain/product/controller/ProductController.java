package com.shop.domain.product.controller;

import com.shop.domain.product.dto.ProductDetailResponse;
import com.shop.domain.product.dto.ProductPageResponse;
import com.shop.domain.product.service.ProductService;
import com.shop.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Product", description = "상품 API")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Operation(summary = "상품 목록 조회", description = "카테고리 필터링 및 정렬 옵션을 적용하여 상품 목록을 페이징으로 반환합니다.")
    @GetMapping
    public ApiResponse<ProductPageResponse> getProducts(
            @Parameter(description = "카테고리 ID (선택)")
            @RequestParam(required = false) Long categoryId,

            @Parameter(description = "정렬 기준 (price,asc | price,desc | createdAt,desc). 기본값: createdAt,desc")
            @RequestParam(required = false, defaultValue = "createdAt,desc") String sort,

            @Parameter(description = "페이지 번호 (0부터 시작). 기본값: 0")
            @RequestParam(required = false, defaultValue = "0") int page,

            @Parameter(description = "페이지 크기. 기본값: 10")
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        return ApiResponse.ok(productService.getProducts(categoryId, sort, page, size));
    }

    @Operation(summary = "상품 단건 조회", description = "ID로 상품 상세 정보를 조회합니다. 삭제된 상품은 조회되지 않습니다.")
    @GetMapping("/{id}")
    public ApiResponse<ProductDetailResponse> getProduct(
            @Parameter(description = "상품 ID", required = true)
            @PathVariable Long id
    ) {
        return ApiResponse.ok(productService.getProduct(id));
    }
}
