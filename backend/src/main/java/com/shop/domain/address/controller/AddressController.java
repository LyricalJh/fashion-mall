package com.shop.domain.address.controller;

import com.shop.domain.address.dto.AddressResponse;
import com.shop.domain.address.dto.CreateAddressRequest;
import com.shop.domain.address.dto.UpdateAddressRequest;
import com.shop.domain.address.service.AddressService;
import com.shop.global.response.ApiResponse;
import com.shop.global.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@Tag(name = "Address", description = "배송지 API")
public class AddressController {

    private final AddressService addressService;

    @Operation(summary = "배송지 등록", description = "새로운 배송지를 등록합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> createAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody @Valid CreateAddressRequest request) {

        AddressResponse response = addressService.createAddress(principal.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    @Operation(summary = "내 배송지 목록 조회", description = "현재 로그인한 사용자의 배송지 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses(
            @AuthenticationPrincipal UserPrincipal principal) {

        List<AddressResponse> response = addressService.getAddresses(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "배송지 수정", description = "배송지 정보를 수정합니다.")
    @PutMapping("/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long addressId,
            @RequestBody @Valid UpdateAddressRequest request) {

        AddressResponse response = addressService.updateAddress(principal.getUserId(), addressId, request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "배송지 삭제", description = "배송지를 삭제합니다.")
    @DeleteMapping("/{addressId}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long addressId) {

        addressService.deleteAddress(principal.getUserId(), addressId);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @Operation(summary = "기본 배송지 설정", description = "선택한 배송지를 기본 배송지로 설정합니다.")
    @PatchMapping("/{addressId}/default")
    public ResponseEntity<ApiResponse<AddressResponse>> setDefaultAddress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long addressId) {

        AddressResponse response = addressService.setDefaultAddress(principal.getUserId(), addressId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
