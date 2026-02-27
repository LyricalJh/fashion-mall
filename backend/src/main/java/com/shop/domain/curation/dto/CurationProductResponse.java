package com.shop.domain.curation.dto;

import com.shop.domain.curation.entity.CurationProduct;
import com.shop.domain.product.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Getter
@AllArgsConstructor
public class CurationProductResponse {

    private Long productId;
    private String productName;
    private String brandName;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer discountRate;
    private String thumbnailUrl;
    private String badgeText;
    private String shippingInfo;
    private int likeCount;

    public static CurationProductResponse from(CurationProduct cp, int likeCount) {
        Product p = cp.getProduct();
        BigDecimal origPrice = cp.getOriginalPrice();
        Integer discount = null;
        if (origPrice != null && origPrice.compareTo(p.getPrice()) > 0) {
            discount = origPrice.subtract(p.getPrice())
                .multiply(BigDecimal.valueOf(100))
                .divide(origPrice, 0, RoundingMode.HALF_UP)
                .intValue();
        }
        return new CurationProductResponse(
            p.getId(), p.getName(),
            p.getCategory().getName(),
            p.getPrice(), origPrice, discount,
            p.getThumbnailUrl(), cp.getBadgeText(),
            p.getShippingInfo(), likeCount
        );
    }
}
