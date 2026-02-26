package com.shop.domain.inquiry.repository;

import com.shop.domain.inquiry.entity.Inquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    Page<Inquiry> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
