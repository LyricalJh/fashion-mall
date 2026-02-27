package com.shop.domain.like.repository;

import com.shop.domain.like.entity.ProductLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductLikeRepository extends JpaRepository<ProductLike, Long> {

    Optional<ProductLike> findByUserIdAndProductId(Long userId, Long productId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    long countByProductId(Long productId);

    @Query("SELECT pl FROM ProductLike pl " +
           "JOIN FETCH pl.product p " +
           "LEFT JOIN FETCH p.images " +
           "WHERE pl.user.id = :userId " +
           "ORDER BY pl.createdAt DESC")
    List<ProductLike> findAllByUserIdWithProduct(@Param("userId") Long userId);

    @Query("SELECT pl FROM ProductLike pl " +
           "JOIN FETCH pl.user u " +
           "JOIN FETCH pl.product p " +
           "ORDER BY pl.createdAt DESC")
    List<ProductLike> findAllWithUserAndProduct();

    @Query("SELECT pl.product.id, COUNT(pl) FROM ProductLike pl " +
           "WHERE pl.product.id IN :productIds " +
           "GROUP BY pl.product.id")
    List<Object[]> countByProductIdIn(@Param("productIds") List<Long> productIds);
}
