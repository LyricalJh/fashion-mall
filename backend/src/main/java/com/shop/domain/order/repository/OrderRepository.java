package com.shop.domain.order.repository;

import com.shop.domain.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * 주문 ID와 사용자 ID로 주문 조회 (소유자 검증)
     */
    Optional<Order> findByIdAndUserId(Long orderId, Long userId);

    /**
     * 사용자별 주문 ID 페이징 (가벼운 쿼리)
     */
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * 주문 ID 목록으로 items + product fetch join (N+1 방지)
     */
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.items i " +
           "LEFT JOIN FETCH i.product " +
           "WHERE o.id IN :ids " +
           "ORDER BY o.createdAt DESC")
    List<Order> findAllWithItemsByIdIn(@Param("ids") List<Long> ids);

    /**
     * 주문 상세 조회 - OrderItem 및 Product Fetch Join (N+1 방지)
     */
    @Query("SELECT DISTINCT o FROM Order o " +
           "JOIN FETCH o.items i " +
           "JOIN FETCH i.product " +
           "WHERE o.id = :orderId")
    Optional<Order> findByIdWithItems(@Param("orderId") Long orderId);
}
