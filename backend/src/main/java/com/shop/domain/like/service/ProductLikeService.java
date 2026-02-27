package com.shop.domain.like.service;

import com.shop.domain.like.dto.AdminLikeResponse;
import com.shop.domain.like.dto.LikeToggleResponse;
import com.shop.domain.like.dto.LikedProductResponse;
import com.shop.domain.like.entity.ProductLike;
import com.shop.domain.like.repository.ProductLikeRepository;
import com.shop.domain.product.entity.Product;
import com.shop.domain.product.repository.ProductRepository;
import com.shop.domain.user.entity.User;
import com.shop.domain.user.repository.UserRepository;
import com.shop.global.exception.BusinessException;
import com.shop.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductLikeService {

    private final ProductLikeRepository productLikeRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public LikeToggleResponse toggleLike(Long userId, Long productId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

        Optional<ProductLike> existing = productLikeRepository.findByUserIdAndProductId(userId, productId);

        if (existing.isPresent()) {
            productLikeRepository.delete(existing.get());
            long count = productLikeRepository.countByProductId(productId);
            return new LikeToggleResponse(false, count);
        } else {
            productLikeRepository.save(ProductLike.of(user, product));
            long count = productLikeRepository.countByProductId(productId);
            return new LikeToggleResponse(true, count);
        }
    }

    public long getLikeCount(Long productId) {
        return productLikeRepository.countByProductId(productId);
    }

    public boolean isLiked(Long userId, Long productId) {
        return productLikeRepository.existsByUserIdAndProductId(userId, productId);
    }

    public List<LikedProductResponse> getMyLikes(Long userId) {
        return productLikeRepository.findAllByUserIdWithProduct(userId).stream()
            .map(LikedProductResponse::from)
            .toList();
    }

    public List<AdminLikeResponse> getAllLikes() {
        return productLikeRepository.findAllWithUserAndProduct().stream()
            .map(AdminLikeResponse::from)
            .toList();
    }

    public Map<Long, Long> getLikeCountMap(List<Long> productIds) {
        return productLikeRepository.countByProductIdIn(productIds).stream()
            .collect(Collectors.toMap(
                row -> (Long) row[0],
                row -> (Long) row[1]
            ));
    }
}
