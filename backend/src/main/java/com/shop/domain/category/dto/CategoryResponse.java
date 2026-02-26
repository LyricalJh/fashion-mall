package com.shop.domain.category.dto;

import com.shop.domain.category.entity.Category;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CategoryResponse {

    private Long id;
    private String name;
    private String description;
    private int displayOrder;
    private Long parentId;
    private int depth;

    public static CategoryResponse from(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .displayOrder(category.getDisplayOrder())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .depth(category.getDepth())
                .build();
    }
}
