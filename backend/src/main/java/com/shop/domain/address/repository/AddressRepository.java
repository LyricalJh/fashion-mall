package com.shop.domain.address.repository;

import com.shop.domain.address.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUserIdOrderByIsDefaultDescCreatedAtDesc(Long userId);

    Optional<Address> findByUserIdAndIsDefaultTrue(Long userId);

    boolean existsByUserId(Long userId);
}
