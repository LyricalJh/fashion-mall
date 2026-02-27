package com.shop.domain.like.controller;

import com.shop.domain.like.dto.AdminLikeResponse;
import com.shop.domain.like.dto.LikeToggleResponse;
import com.shop.domain.like.dto.LikedProductResponse;
import com.shop.domain.like.service.ProductLikeService;
import com.shop.global.response.ApiResponse;
import com.shop.global.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProductLikeController {

    private final ProductLikeService productLikeService;

    @PostMapping("/api/products/{productId}/like")
    public ApiResponse<LikeToggleResponse> toggleLike(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(productLikeService.toggleLike(principal.getUserId(), productId));
    }

    @GetMapping("/api/products/{productId}/like/count")
    public ApiResponse<Long> getLikeCount(@PathVariable Long productId) {
        return ApiResponse.ok(productLikeService.getLikeCount(productId));
    }

    @GetMapping("/api/products/{productId}/like/status")
    public ApiResponse<Boolean> getLikeStatus(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(productLikeService.isLiked(principal.getUserId(), productId));
    }

    @GetMapping("/api/my/likes")
    public ApiResponse<List<LikedProductResponse>> getMyLikes(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(productLikeService.getMyLikes(principal.getUserId()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/admin/likes")
    public ApiResponse<List<AdminLikeResponse>> getAllLikes() {
        return ApiResponse.ok(productLikeService.getAllLikes());
    }
}
