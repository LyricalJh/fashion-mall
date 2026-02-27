package com.shop.domain.curation.entity;

import com.shop.domain.common.BaseEntity;
import com.shop.domain.product.entity.Product;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Entity
@Table(name = "curation_products", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"curation_id", "product_id"})
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CurationProduct extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curation_id", nullable = false)
    private Curation curation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int displayOrder;

    private String badgeText;

    @Column(name = "original_price", precision = 10, scale = 2)
    private BigDecimal originalPrice;
}
