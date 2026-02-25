package com.shop.domain.product.service;

import com.shop.domain.product.dto.ProductDetailResponse;
import com.shop.domain.product.dto.ProductPageResponse;
import com.shop.domain.product.dto.ProductSummaryResponse;
import com.shop.domain.product.repository.ProductRepository;
import com.shop.global.exception.BusinessException;
import com.shop.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public ProductPageResponse getProducts(Long categoryId, String sort, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));

        Page<ProductSummaryResponse> resultPage = productRepository
                .findAllByCondition(categoryId, pageable)
                .map(ProductSummaryResponse::from);

        return ProductPageResponse.from(resultPage);
    }

    public ProductDetailResponse getProduct(Long id) {
        return productRepository.findByIdAndDeletedFalse(id)
                .map(ProductDetailResponse::from)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
    }

    private Sort resolveSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        return switch (sort) {
            case "price,asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price,desc" -> Sort.by(Sort.Direction.DESC, "price");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }
}
