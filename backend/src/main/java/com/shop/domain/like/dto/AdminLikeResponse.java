package com.shop.domain.like.dto;

import com.shop.domain.like.entity.ProductLike;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class AdminLikeResponse {

    private Long likeId;
    private Long userId;
    private String userEmail;
    private String userName;
    private Long productId;
    private String productName;
    private LocalDateTime createdAt;

    public static AdminLikeResponse from(ProductLike like) {
        return new AdminLikeResponse(
            like.getId(),
            like.getUser().getId(),
            like.getUser().getEmail(),
            like.getUser().getName(),
            like.getProduct().getId(),
            like.getProduct().getName(),
            like.getCreatedAt()
        );
    }
}
