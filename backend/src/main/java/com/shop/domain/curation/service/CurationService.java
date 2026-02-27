package com.shop.domain.curation.service;

import com.shop.domain.curation.dto.CurationResponse;
import com.shop.domain.curation.entity.Curation;
import com.shop.domain.curation.repository.CurationRepository;
import com.shop.domain.like.service.ProductLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CurationService {

    private final CurationRepository curationRepository;
    private final ProductLikeService productLikeService;

    public List<CurationResponse> getCurations() {
        List<Curation> curations = curationRepository.findAllActiveWithProducts();

        List<Long> productIds = curations.stream()
            .flatMap(c -> c.getCurationProducts().stream())
            .map(cp -> cp.getProduct().getId())
            .distinct()
            .toList();

        Map<Long, Long> likeCountMap = productIds.isEmpty()
            ? Map.of()
            : productLikeService.getLikeCountMap(productIds);

        return curations.stream()
            .map(c -> CurationResponse.from(c, likeCountMap))
            .toList();
    }
}
