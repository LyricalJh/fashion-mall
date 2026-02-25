package com.shop.domain.product.repository;

import com.shop.domain.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * 삭제되지 않은 상품 목록을 카테고리 필터링과 함께 조회합니다.
     * images Fetch Join으로 N+1 문제를 방지합니다.
     * Pagination 시 countQuery를 분리하여 올바른 페이징 처리를 보장합니다.
     */
    @Query(
            value = "SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images " +
                    "WHERE p.deleted = false AND (:categoryId IS NULL OR p.category.id = :categoryId)",
            countQuery = "SELECT COUNT(p) FROM Product p " +
                    "WHERE p.deleted = false AND (:categoryId IS NULL OR p.category.id = :categoryId)"
    )
    Page<Product> findAllByCondition(@Param("categoryId") Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.images LEFT JOIN FETCH p.category WHERE p.id = :id AND p.deleted = false")
    Optional<Product> findByIdAndDeletedFalse(@Param("id") Long id);
}
