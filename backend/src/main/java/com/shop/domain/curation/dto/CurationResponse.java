package com.shop.domain.curation.dto;

import com.shop.domain.curation.entity.Curation;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@AllArgsConstructor
public class CurationResponse {

    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private List<CurationProductResponse> products;

    public static CurationResponse from(Curation c, Map<Long, Long> likeCountMap) {
        List<CurationProductResponse> products = c.getCurationProducts().stream()
            .map(cp -> CurationProductResponse.from(cp,
                likeCountMap.getOrDefault(cp.getProduct().getId(), 0L).intValue()))
            .toList();
        return new CurationResponse(c.getId(), c.getTitle(), c.getDescription(), c.getImageUrl(), products);
    }
}
