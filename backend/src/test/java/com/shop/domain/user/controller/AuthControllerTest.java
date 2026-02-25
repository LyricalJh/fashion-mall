package com.shop.domain.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("Auth API 테스트")
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    // ─── Helper ───────────────────────────────────────────────────────────────

    private String toJson(Object obj) throws Exception {
        return objectMapper.writeValueAsString(obj);
    }

    // ─── Signup ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("회원가입 성공 - 201, accessToken 반환")
    void signup_success() throws Exception {
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of(
                        "email", "user1@test.com",
                        "password", "password1234",
                        "name", "홍길동"
                ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.email").value("user1@test.com"))
                .andExpect(jsonPath("$.data.name").value("홍길동"))
                .andExpect(jsonPath("$.data.role").value("USER"));
    }

    @Test
    @DisplayName("회원가입 실패 - 이메일 중복 시 409")
    void signup_duplicateEmail_conflict() throws Exception {
        // first signup
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of(
                        "email", "dup@test.com",
                        "password", "password1234",
                        "name", "중복유저"
                ))))
                .andExpect(status().isCreated());

        // second signup with same email
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of(
                        "email", "dup@test.com",
                        "password", "other1234",
                        "name", "다른유저"
                ))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("USER_ALREADY_EXISTS"));
    }

    @Test
    @DisplayName("회원가입 실패 - 이메일 형식 오류 시 400")
    void signup_invalidEmail_badRequest() throws Exception {
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of(
                        "email", "not-an-email",
                        "password", "password1234",
                        "name", "유저"
                ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("회원가입 실패 - 필수 필드 누락 시 400")
    void signup_missingName_badRequest() throws Exception {
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of(
                        "email", "missing@test.com",
                        "password", "password1234"
                ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    // ─── Login ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("로그인 성공 - 200, accessToken 반환")
    void login_success() throws Exception {
        // pre-register
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of(
                        "email", "login@test.com",
                        "password", "password1234",
                        "name", "로그인유저"
                ))))
                .andExpect(status().isCreated());

        // login
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of(
                        "email", "login@test.com",
                        "password", "password1234"
                ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.email").value("login@test.com"));
    }

    @Test
    @DisplayName("로그인 실패 - 비밀번호 불일치 시 401")
    void login_wrongPassword_unauthorized() throws Exception {
        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of(
                        "email", "wp@test.com",
                        "password", "password1234",
                        "name", "유저"
                ))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of(
                        "email", "wp@test.com",
                        "password", "wrongpassword"
                ))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("로그인 실패 - 존재하지 않는 이메일 시 404")
    void login_userNotFound_notFound() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJson(Map.of(
                        "email", "ghost@test.com",
                        "password", "password1234"
                ))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("USER_NOT_FOUND"));
    }
}
