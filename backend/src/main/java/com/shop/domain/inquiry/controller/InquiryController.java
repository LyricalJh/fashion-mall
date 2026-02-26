package com.shop.domain.inquiry.controller;

import com.shop.domain.inquiry.dto.AnswerInquiryRequest;
import com.shop.domain.inquiry.dto.CreateInquiryRequest;
import com.shop.domain.inquiry.dto.InquiryResponse;
import com.shop.domain.inquiry.service.InquiryService;
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
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
@Tag(name = "Inquiry", description = "문의 API")
public class InquiryController {

    private final InquiryService inquiryService;

    @Operation(summary = "문의 등록", description = "새로운 문의를 등록합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<InquiryResponse>> createInquiry(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody @Valid CreateInquiryRequest request) {

        InquiryResponse response = inquiryService.createInquiry(principal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @Operation(summary = "내 문의 목록 조회", description = "현재 로그인한 사용자의 문의 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<InquiryResponse>>> getInquiries(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<InquiryResponse> response = inquiryService.getInquiries(principal.getUserId(), pageable);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "문의 상세 조회", description = "특정 문의의 상세 정보를 조회합니다.")
    @GetMapping("/{inquiryId}")
    public ResponseEntity<ApiResponse<InquiryResponse>> getInquiry(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long inquiryId) {

        InquiryResponse response = inquiryService.getInquiry(principal.getUserId(), inquiryId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "문의 답변", description = "관리자가 문의에 답변합니다.")
    @PostMapping("/{inquiryId}/answer")
    public ResponseEntity<ApiResponse<InquiryResponse>> answerInquiry(
            @PathVariable Long inquiryId,
            @RequestBody @Valid AnswerInquiryRequest request) {

        InquiryResponse response = inquiryService.answerInquiry(inquiryId, request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
