package com.shop.domain.claim.repository;

import com.shop.domain.claim.entity.Claim;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClaimRepository extends JpaRepository<Claim, Long> {

    Page<Claim> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<Claim> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT DISTINCT c FROM Claim c " +
           "LEFT JOIN FETCH c.items ci " +
           "LEFT JOIN FETCH ci.orderItem oi " +
           "LEFT JOIN FETCH oi.product " +
           "WHERE c.id = :claimId")
    Optional<Claim> findByIdWithItems(@Param("claimId") Long claimId);

    @Query("SELECT DISTINCT c FROM Claim c " +
           "LEFT JOIN FETCH c.items ci " +
           "LEFT JOIN FETCH ci.orderItem oi " +
           "LEFT JOIN FETCH oi.product " +
           "WHERE c.id IN :ids " +
           "ORDER BY c.createdAt DESC")
    List<Claim> findAllWithItemsByIdIn(@Param("ids") List<Long> ids);

    /**
     * 특정 OrderItem에 대해 완료되지 않은(REJECTED 제외) 클레임의 수량 합계 조회
     */
    @Query("SELECT COALESCE(SUM(ci.quantity), 0) FROM ClaimItem ci " +
           "WHERE ci.orderItem.id = :orderItemId " +
           "AND ci.claim.status NOT IN (com.shop.domain.claim.entity.ClaimStatus.REJECTED)")
    int sumClaimedQuantityByOrderItemId(@Param("orderItemId") Long orderItemId);
}
