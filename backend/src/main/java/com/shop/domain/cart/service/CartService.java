package com.shop.domain.cart.service;

import com.shop.domain.cart.dto.AddCartRequest;
import com.shop.domain.cart.dto.CartItemResponse;
import com.shop.domain.cart.dto.CartResponse;
import com.shop.domain.cart.dto.UpdateCartRequest;
import com.shop.domain.cart.entity.CartItem;
import com.shop.domain.cart.repository.CartItemRepository;
import com.shop.domain.product.entity.Product;
import com.shop.domain.product.entity.ProductStatus;
import com.shop.domain.product.repository.ProductRepository;
import com.shop.domain.user.entity.User;
import com.shop.domain.user.repository.UserRepository;
import com.shop.global.exception.BusinessException;
import com.shop.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * 장바구니 조회
     */
    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        List<CartItemResponse> items = cartItemRepository.findByUserId(userId).stream()
                .map(CartItemResponse::from)
                .toList();

        return CartResponse.from(items);
    }

    /**
     * 장바구니 담기 (이미 담겨 있으면 수량 추가)
     */
    public CartItemResponse addToCart(Long userId, AddCartRequest request) {
        Product product = productRepository.findByIdAndStatus(request.getProductId(), ProductStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

        if (product.getStock() <= 0) {
            throw new BusinessException(ErrorCode.OUT_OF_STOCK);
        }

        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, product.getId())
                .map(existing -> {
                    int newQuantity = existing.getQuantity() + request.getQuantity();
                    if (newQuantity > product.getStock()) {
                        throw new BusinessException(ErrorCode.OUT_OF_STOCK);
                    }
                    existing.addQuantity(request.getQuantity());
                    return existing;
                })
                .orElseGet(() -> {
                    if (request.getQuantity() > product.getStock()) {
                        throw new BusinessException(ErrorCode.OUT_OF_STOCK);
                    }
                    User user = userRepository.getReferenceById(userId);
                    return cartItemRepository.save(
                            CartItem.builder()
                                    .user(user)
                                    .product(product)
                                    .quantity(request.getQuantity())
                                    .build()
                    );
                });

        return CartItemResponse.from(cartItem);
    }

    /**
     * 수량 변경
     */
    public CartItemResponse updateCartItem(Long userId, Long cartItemId, UpdateCartRequest request) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .filter(ci -> ci.getUser().getId().equals(userId))
                .orElseThrow(() -> new BusinessException(ErrorCode.CART_ITEM_NOT_FOUND));

        if (request.getQuantity() > cartItem.getProduct().getStock()) {
            throw new BusinessException(ErrorCode.OUT_OF_STOCK);
        }

        cartItem.updateQuantity(request.getQuantity());

        return CartItemResponse.from(cartItem);
    }

    /**
     * 장바구니 아이템 삭제
     */
    public void removeCartItem(Long userId, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .filter(ci -> ci.getUser().getId().equals(userId))
                .orElseThrow(() -> new BusinessException(ErrorCode.CART_ITEM_NOT_FOUND));

        cartItemRepository.delete(cartItem);
    }

    /**
     * 장바구니 전체 비우기 (주문 완료 시 사용)
     */
    public void clearCart(Long userId) {
        cartItemRepository.deleteAllByUserId(userId);
    }
}
