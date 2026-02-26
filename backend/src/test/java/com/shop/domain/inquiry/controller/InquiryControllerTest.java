package com.shop.domain.inquiry.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Inquiry API 테스트")
class InquiryControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    private String accessToken;

    @BeforeEach
    void setUp() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "email", "inquiry@test.com",
                        "password", "password1234",
                        "name", "문의유저"
                ))))
                .andExpect(status().isCreated())
                .andReturn();

        accessToken = objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();
    }

    // ─── 문의 등록 ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("문의 등록 - 인증 없이 401")
    void createInquiry_unauthorized() throws Exception {
        mockMvc.perform(post("/api/inquiries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buildInquiryRequest())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("문의 등록 - 성공 201")
    void createInquiry_success() throws Exception {
        mockMvc.perform(post("/api/inquiries")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buildInquiryRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andExpect(jsonPath("$.data.title").value("배송 문의"))
                .andExpect(jsonPath("$.data.content").value("배송이 언제 오나요?"))
                .andExpect(jsonPath("$.data.status").value("PENDING"));
    }

    @Test
    @DisplayName("문의 등록 - 필수 필드 누락 시 400")
    void createInquiry_missingField() throws Exception {
        mockMvc.perform(post("/api/inquiries")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("title", "제목만"))))
                .andExpect(status().isBadRequest());
    }

    // ─── 문의 목록 조회 ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("내 문의 목록 조회 - 인증 없이 401")
    void getInquiries_unauthorized() throws Exception {
        mockMvc.perform(get("/api/inquiries"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("내 문의 목록 조회 - 성공 200, 페이지네이션")
    void getInquiries_success() throws Exception {
        createInquiry();
        createInquiry();

        mockMvc.perform(get("/api/inquiries")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.totalElements").value(2));
    }

    // ─── 문의 상세 조회 ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("문의 상세 조회 - 성공 200")
    void getInquiry_success() throws Exception {
        Long inquiryId = createInquiry();

        mockMvc.perform(get("/api/inquiries/" + inquiryId)
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(inquiryId))
                .andExpect(jsonPath("$.data.title").value("배송 문의"));
    }

    @Test
    @DisplayName("문의 상세 조회 - 다른 사용자의 문의 404")
    void getInquiry_otherUser_notFound() throws Exception {
        Long inquiryId = createInquiry();

        // 두 번째 사용자
        MvcResult result2 = mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "email", "other_inquiry@test.com",
                        "password", "password1234",
                        "name", "다른유저"
                ))))
                .andExpect(status().isCreated())
                .andReturn();
        String token2 = objectMapper.readTree(result2.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        mockMvc.perform(get("/api/inquiries/" + inquiryId)
                .header("Authorization", "Bearer " + token2))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("INQUIRY_NOT_FOUND"));
    }

    @Test
    @DisplayName("문의 상세 조회 - 존재하지 않는 문의 404")
    void getInquiry_notFound() throws Exception {
        mockMvc.perform(get("/api/inquiries/999999")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("INQUIRY_NOT_FOUND"));
    }

    // ─── 문의 답변 ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("문의 답변 - 성공 200")
    void answerInquiry_success() throws Exception {
        Long inquiryId = createInquiry();

        mockMvc.perform(post("/api/inquiries/" + inquiryId + "/answer")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("answer", "내일 배송 예정입니다."))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("ANSWERED"))
                .andExpect(jsonPath("$.data.answer").value("내일 배송 예정입니다."))
                .andExpect(jsonPath("$.data.answeredAt").isNotEmpty());
    }

    // ─── 헬퍼 ─────────────────────────────────────────────────────────────────────

    private Long createInquiry() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/inquiries")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(buildInquiryRequest())))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("id").asLong();
    }

    private Map<String, Object> buildInquiryRequest() {
        return Map.of(
                "title", "배송 문의",
                "content", "배송이 언제 오나요?"
        );
    }
}
