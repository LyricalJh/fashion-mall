package com.shop.domain.inquiry.service;

import com.shop.domain.inquiry.dto.AnswerInquiryRequest;
import com.shop.domain.inquiry.dto.CreateInquiryRequest;
import com.shop.domain.inquiry.dto.InquiryResponse;
import com.shop.domain.inquiry.entity.Inquiry;
import com.shop.domain.inquiry.repository.InquiryRepository;
import com.shop.domain.order.entity.Order;
import com.shop.domain.order.repository.OrderRepository;
import com.shop.domain.user.entity.User;
import com.shop.domain.user.repository.UserRepository;
import com.shop.global.exception.BusinessException;
import com.shop.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public InquiryResponse createInquiry(Long userId, CreateInquiryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Order order = null;
        if (request.getOrderId() != null) {
            order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
        }

        Inquiry inquiry = Inquiry.builder()
                .user(user)
                .order(order)
                .category(request.getCategory())
                .title(request.getTitle())
                .content(request.getContent())
                .build();

        inquiryRepository.save(inquiry);
        return InquiryResponse.from(inquiry);
    }

    @Transactional(readOnly = true)
    public Page<InquiryResponse> getInquiries(Long userId, Pageable pageable) {
        return inquiryRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(InquiryResponse::from);
    }

    @Transactional(readOnly = true)
    public InquiryResponse getInquiry(Long userId, Long inquiryId) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INQUIRY_NOT_FOUND));

        if (!inquiry.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.INQUIRY_NOT_FOUND);
        }

        return InquiryResponse.from(inquiry);
    }

    public InquiryResponse answerInquiry(Long inquiryId, AnswerInquiryRequest request) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INQUIRY_NOT_FOUND));

        inquiry.answer(request.getAnswer());
        return InquiryResponse.from(inquiry);
    }
}
