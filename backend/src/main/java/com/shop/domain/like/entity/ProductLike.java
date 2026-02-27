package com.shop.domain.like.entity;

import com.shop.domain.product.entity.Product;
import com.shop.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "product_likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "product_id"})
}, indexes = {
    @Index(name = "idx_product_likes_product_id", columnList = "product_id")
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class ProductLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public static ProductLike of(User user, Product product) {
        ProductLike like = new ProductLike();
        like.user = user;
        like.product = product;
        return like;
    }
}
