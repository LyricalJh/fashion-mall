package com.shop.domain.curation.repository;

import com.shop.domain.curation.entity.Curation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CurationRepository extends JpaRepository<Curation, Long> {

    @Query("SELECT DISTINCT c FROM Curation c " +
           "LEFT JOIN FETCH c.curationProducts cp " +
           "LEFT JOIN FETCH cp.product p " +
           "LEFT JOIN FETCH p.category " +
           "WHERE c.active = true " +
           "ORDER BY c.displayOrder ASC")
    List<Curation> findAllActiveWithProducts();
}
