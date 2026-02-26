package com.shop.domain.product.dto;

import com.shop.domain.product.entity.Product;
import com.shop.domain.product.entity.ProductImage;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class ProductDetailResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private int stock;
    private Long categoryId;
    private String categoryName;
    private List<String> images;
    private String productCode;
    private String status;
    private BigDecimal shippingFee;
    private String shippingInfo;

    public static ProductDetailResponse from(Product product) {
        List<String> imageUrls = product.getImages().stream()
                .map(ProductImage::getUrl)
                .collect(Collectors.toList());

        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .images(imageUrls)
                .productCode(product.getProductCode())
                .status(product.getStatus().name())
                .shippingFee(product.getShippingFee())
                .shippingInfo(product.getShippingInfo())
                .build();
    }
}
