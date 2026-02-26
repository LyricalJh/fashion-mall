package com.shop.domain.claim.controller;

import com.shop.domain.claim.dto.ClaimResponse;
import com.shop.domain.claim.dto.ClaimSummaryResponse;
import com.shop.domain.claim.dto.CreateClaimRequest;
import com.shop.domain.claim.service.ClaimService;
import com.shop.global.response.ApiResponse;
import com.shop.global.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
@Tag(name = "Claim", description = "취소/반품 API")
public class ClaimController {

    private final ClaimService claimService;

    @Operation(summary = "클레임 접수", description = "취소 또는 반품을 접수합니다. 취소는 CONFIRMED/PAID, 반품은 DELIVERED 상태에서만 가능합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<ClaimResponse>> createClaim(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody @Valid CreateClaimRequest request) {

        ClaimResponse response = claimService.createClaim(principal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @Operation(summary = "클레임 목록 조회", description = "현재 로그인한 사용자의 취소/반품 내역을 최신순으로 페이징 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ClaimSummaryResponse>>> getClaims(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<ClaimSummaryResponse> response = claimService.getClaims(principal.getUserId(), pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "클레임 상세 조회", description = "특정 클레임의 상세 정보를 조회합니다. 본인의 클레임만 조회 가능합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClaimResponse>> getClaim(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {

        ClaimResponse response = claimService.getClaim(principal.getUserId(), id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "클레임 철회", description = "접수 상태의 클레임을 철회합니다. RECEIVED 상태에서만 철회 가능합니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> withdrawClaim(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {

        claimService.withdrawClaim(principal.getUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
