package com.shop.domain.curation.controller;

import com.shop.domain.curation.dto.CurationResponse;
import com.shop.domain.curation.service.CurationService;
import com.shop.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/curations")
@RequiredArgsConstructor
public class CurationController {

    private final CurationService curationService;

    @GetMapping
    public ApiResponse<List<CurationResponse>> getCurations() {
        return ApiResponse.ok(curationService.getCurations());
    }
}
