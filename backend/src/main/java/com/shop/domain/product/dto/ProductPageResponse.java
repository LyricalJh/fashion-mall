package com.shop.domain.product.dto;

import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Builder
public class ProductPageResponse {

    private List<ProductSummaryResponse> content;
    private long totalElements;
    private int totalPages;
    private int pageNumber;
    private int pageSize;

    public static ProductPageResponse from(Page<ProductSummaryResponse> page) {
        return ProductPageResponse.builder()
                .content(page.getContent())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .build();
    }
}
