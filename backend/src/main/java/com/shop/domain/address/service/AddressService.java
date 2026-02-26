package com.shop.domain.address.service;

import com.shop.domain.address.dto.AddressResponse;
import com.shop.domain.address.dto.CreateAddressRequest;
import com.shop.domain.address.dto.UpdateAddressRequest;
import com.shop.domain.address.entity.Address;
import com.shop.domain.address.repository.AddressRepository;
import com.shop.domain.user.entity.User;
import com.shop.domain.user.repository.UserRepository;
import com.shop.global.exception.BusinessException;
import com.shop.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressResponse createAddress(Long userId, CreateAddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (request.isDefault()) {
            clearDefaultAddress(userId);
        }

        Address address = Address.builder()
                .user(user)
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .zipCode(request.getZipCode())
                .address(request.getAddress())
                .addressDetail(request.getAddressDetail())
                .isDefault(request.isDefault())
                .build();

        addressRepository.save(address);
        return AddressResponse.from(address);
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> getAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).stream()
                .map(AddressResponse::from)
                .collect(Collectors.toList());
    }

    public AddressResponse updateAddress(Long userId, Long addressId, UpdateAddressRequest request) {
        Address address = findUserAddress(userId, addressId);

        address.update(
                request.getReceiverName(),
                request.getReceiverPhone(),
                request.getZipCode(),
                request.getAddress(),
                request.getAddressDetail()
        );

        return AddressResponse.from(address);
    }

    public void deleteAddress(Long userId, Long addressId) {
        Address address = findUserAddress(userId, addressId);
        addressRepository.delete(address);
    }

    public AddressResponse setDefaultAddress(Long userId, Long addressId) {
        Address address = findUserAddress(userId, addressId);

        clearDefaultAddress(userId);
        address.setDefault(true);

        return AddressResponse.from(address);
    }

    private Address findUserAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ADDRESS_NOT_FOUND));

        if (!address.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.ADDRESS_NOT_FOUND);
        }

        return address;
    }

    private void clearDefaultAddress(Long userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(addr -> addr.setDefault(false));
    }
}
