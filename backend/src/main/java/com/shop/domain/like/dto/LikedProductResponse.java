package com.shop.domain.like.dto;

import com.shop.domain.like.entity.ProductLike;
import com.shop.domain.product.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class LikedProductResponse {

    private Long productId;
    private String productName;
    private BigDecimal price;
    private String thumbnailUrl;
    private LocalDateTime likedAt;

    public static LikedProductResponse from(ProductLike like) {
        Product p = like.getProduct();
        return new LikedProductResponse(
            p.getId(), p.getName(), p.getPrice(),
            p.getThumbnailUrl(), like.getCreatedAt()
        );
    }
}
