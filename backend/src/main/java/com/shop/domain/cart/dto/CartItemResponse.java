package com.shop.domain.cart.dto;

import com.shop.domain.cart.entity.CartItem;
import com.shop.domain.product.entity.ProductImage;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class CartItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private BigDecimal productPrice;
    private String imageUrl;
    private int quantity;
    private BigDecimal subtotal;

    public static CartItemResponse from(CartItem cartItem) {
        List<ProductImage> images = cartItem.getProduct().getImages();
        String imageUrl = images.isEmpty() ? null : images.get(0).getUrl();

        BigDecimal subtotal = cartItem.getProduct().getPrice()
                .multiply(BigDecimal.valueOf(cartItem.getQuantity()));

        return CartItemResponse.builder()
                .id(cartItem.getId())
                .productId(cartItem.getProduct().getId())
                .productName(cartItem.getProduct().getName())
                .productPrice(cartItem.getProduct().getPrice())
                .imageUrl(imageUrl)
                .quantity(cartItem.getQuantity())
                .subtotal(subtotal)
                .build();
    }
}
