# 카카오 로그인 API 연동 플랜

> 문서 경로: /c/projects/shopping/fashion-mall/docs/01-plan/kakao-login-api-plan.md
> 작성일: 2026-02-26
> 참고: https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api

---

## 1. 개요

패션 쇼핑몰 프로젝트에 카카오 로그인 REST API를 연동합니다.
사용자 인증, 회원 정보 조회, 배송지 정보 조회 기능을 구현합니다.

---

## 2. 카카오 로그인 전체 흐름 (시퀀스)

```
사용자 클라이언트 ──> 서비스 서버 ──> 카카오 API 서버

[Step 1] 인가 코드 요청
  GET https://kauth.kakao.com/oauth/authorize

[Step 2] 토큰 요청  
  POST https://kauth.kakao.com/oauth/token

[Step 3] 사용자 로그인 처리
  GET/POST https://kapi.kakao.com/v2/user/me
```

---

## 3. 사전 설정 (카카오 개발자 콘솔)

- [ ] 카카오 개발자 콘솔에서 앱 생성 (https://developers.kakao.com/console/app)
- [ ] REST API 키 발급 확인 (앱 > 플랫폼 키 > REST API 키)
- [ ] 카카오 로그인 활성화
- [ ] Redirect URI 등록
  - 개발: http://localhost:3000/auth/kakao/callback
  - 운영: https://your-domain.com/auth/kakao/callback
- [ ] 동의항목 설정
  - 필수: 닉네임, 프로필 사진
  - 선택: 카카오계정(이메일), 배송지 정보(shipping_address)
- [ ] Client Secret 설정 (보안 강화 권장)

---

## 4. 환경 변수 설정

```env
KAKAO_REST_API_KEY=your_rest_api_key
KAKAO_CLIENT_SECRET=your_client_secret
KAKAO_REDIRECT_URI=http://localhost:3000/auth/kakao/callback
KAKAO_REDIRECT_URI_PROD=https://your-domain.com/auth/kakao/callback
```

---

## 5. 구현 태스크 목록

### Task 1: 인가 코드 요청 (프론트엔드)

구현 파일: src/auth/kakao.auth.ts

```
GET https://kauth.kakao.com/oauth/authorize

필수 파라미터:
  - client_id    : 앱 REST API 키
  - redirect_uri : 인가 코드를 받을 서버 URI
  - response_type: code (고정값)

선택 파라미터:
  - scope: 추가 동의항목 ID (쉼표 구분)
           예) shipping_address,account_email
  - state: CSRF 방지용 랜덤 문자열 (권장)
  - prompt: login (기존 세션 무관 재로그인 강제)
```

- [ ] 카카오 로그인 버튼 UI 구현 (카카오 공식 디자인 가이드 준수)
- [ ] state 값 생성 및 세션 저장 (CSRF 방지)
- [ ] 인가 코드 요청 URL 생성 후 리다이렉트

---

### Task 2: Callback 처리 및 토큰 교환 (백엔드)

구현 파일: src/auth/auth.controller.ts

```
GET /auth/kakao/callback?code={인가코드}&state={state값}

POST https://kauth.kakao.com/oauth/token
Content-Type: application/x-www-form-urlencoded;charset=utf-8

필수 Body 파라미터:
  - grant_type  : authorization_code (고정값)
  - client_id   : 앱 REST API 키
  - redirect_uri: 등록된 Redirect URI (정확히 일치)
  - code        : 인가 코드

선택 Body 파라미터:
  - client_secret: 클라이언트 시크릿 (사용 시 필수)

응답:
  - token_type              : bearer
  - access_token            : 액세스 토큰 (유효기간 21600초 = 6시간)
  - expires_in              : 액세스 토큰 만료 시간(초)
  - refresh_token           : 리프레시 토큰 (유효기간 5184000초 = 60일)
  - refresh_token_expires_in: 리프레시 토큰 만료 시간(초)
  - scope                   : 인증된 권한 범위
```

- [ ] state 검증 (세션 저장값과 비교, CSRF 방어)
- [ ] 인가 코드 유효성 확인
- [ ] 카카오 토큰 요청 API 호출
- [ ] 토큰 응답 DB 저장

---

### Task 3: 사용자 정보 조회 (백엔드)

구현 파일: src/auth/kakao.auth.ts

```
GET https://kapi.kakao.com/v2/user/me
Authorization: Bearer {access_token}

선택 파라미터:
  - secure_resource: true (HTTPS 이미지 URL 사용 권장)
  - property_keys  : ["kakao_account.email","kakao_account.profile",
                       "kakao_account.gender","kakao_account.age_range"]

주요 응답 필드:
  - id                                      : 카카오 회원번호 (Long, 고유값)
  - kakao_account.profile.nickname          : 닉네임
  - kakao_account.profile.profile_image_url : 프로필 이미지 URL (640x640)
  - kakao_account.profile.thumbnail_image_url: 썸네일 이미지 URL (110x110)
  - kakao_account.email                     : 이메일 (동의 시)
  - kakao_account.age_range                 : 연령대 (동의 시)
  - kakao_account.gender                    : 성별 male/female (동의 시)
```

- [ ] 사용자 정보 조회 API 호출
- [ ] kakao_id로 DB에서 기존 회원 조회
- [ ] 신규 회원이면 자동 회원가입 처리
- [ ] JWT 또는 세션 기반 서비스 토큰 발급 후 클라이언트 응답

---

### Task 4: 배송지 정보 조회 (쇼핑몰 특화 기능)

구현 파일: src/user/shipping.service.ts

```
GET https://kapi.kakao.com/v1/user/shipping_address
Authorization: Bearer {access_token}

사전 조건: 동의항목 shipping_address 동의 필요

주요 응답 필드 (shipping_addresses 배열):
  - id                    : 배송지 ID
  - name                  : 배송지 이름 (예: 집, 회사)
  - is_default            : 기본 배송지 여부 (Boolean)
  - address_name          : 주소 이름
  - base_address          : 기본 주소
  - detail_address        : 상세 주소
  - receiver_name         : 수령인 이름
  - receiver_phone_number1: 수령인 전화번호
  - zone_number           : 우편번호
```

- [ ] 배송지 조회 API 호출 및 응답 파싱
- [ ] 주문 시 카카오 배송지 자동 불러오기 UI 연동

---

### Task 5: 토큰 갱신 (백엔드)

구현 파일: src/auth/kakao.auth.ts

```
POST https://kauth.kakao.com/oauth/token
Content-Type: application/x-www-form-urlencoded;charset=utf-8

필수 파라미터:
  - grant_type   : refresh_token (고정값)
  - client_id    : 앱 REST API 키
  - refresh_token: 저장된 리프레시 토큰

선택 파라미터:
  - client_secret: 클라이언트 시크릿 (사용 시 필수)

응답:
  - access_token                : 새 액세스 토큰
  - token_type                  : bearer
  - expires_in                  : 액세스 토큰 만료 시간(초)
  - (조건부) refresh_token      : 리프레시 토큰 갱신 시에만 포함
  - (조건부) refresh_token_expires_in
```

- [ ] API 호출 시 액세스 토큰 만료 감지 (401 응답)
- [ ] 자동 토큰 갱신 미들웨어/인터셉터 구현
- [ ] 갱신된 토큰 DB 업데이트

---

### Task 6: 로그아웃 (백엔드)

구현 파일: src/auth/auth.controller.ts

```
# 서비스 내 로그아웃 (액세스 토큰 방식)
POST https://kapi.kakao.com/v1/user/logout
Authorization: Bearer {access_token}

# 카카오계정과 함께 로그아웃 (선택)
GET https://kauth.kakao.com/oauth/logout
  ?client_id={REST_API_KEY}
  &logout_redirect_uri={LOGOUT_REDIRECT_URI}
```

- [ ] POST /auth/kakao/logout 라우터 구현
- [ ] 카카오 로그아웃 API 호출
- [ ] 서비스 세션/JWT 무효화

---

### Task 7: 연결 해제 / 회원 탈퇴 (백엔드)

구현 파일: src/auth/auth.controller.ts

```
POST https://kapi.kakao.com/v1/user/unlink
Authorization: Bearer {access_token}
```

- [ ] DELETE /auth/kakao/unlink 라우터 구현
- [ ] 카카오 연결 해제 API 호출
- [ ] 서비스 회원 데이터 처리 (탈퇴 처리 또는 kakao_id 초기화)

---

## 6. 데이터베이스 스키마 수정

```sql
-- users 테이블에 카카오 로그인 관련 컬럼 추가
ALTER TABLE users ADD COLUMN kakao_id BIGINT UNIQUE COMMENT '카카오 회원번호';
ALTER TABLE users ADD COLUMN kakao_access_token VARCHAR(512) COMMENT '카카오 액세스 토큰';
ALTER TABLE users ADD COLUMN kakao_refresh_token VARCHAR(512) COMMENT '카카오 리프레시 토큰';
ALTER TABLE users ADD COLUMN kakao_token_expires_at DATETIME COMMENT '토큰 만료 시각';
ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(512) COMMENT '프로필 이미지 URL';
ALTER TABLE users ADD COLUMN login_type ENUM('local','kakao') DEFAULT 'local' COMMENT '로그인 유형';
```

---

## 7. API 라우트 설계

| Method | Path | 설명 |
|--------|------|------|
| GET | /auth/kakao | 카카오 로그인 시작 (인가 코드 URL로 리다이렉트) |
| GET | /auth/kakao/callback | 인가 코드 수신 → 토큰 교환 → 로그인 처리 |
| POST | /auth/kakao/logout | 카카오 + 서비스 로그아웃 |
| DELETE | /auth/kakao/unlink | 카카오 연결 해제 (회원 탈퇴) |
| GET | /user/shipping-address | 카카오 배송지 목록 조회 |

---

## 8. 디렉토리 구조

```
fashion-mall/
├── src/
│   ├── auth/
│   │   ├── kakao.auth.ts          # 카카오 API 호출 함수 모음
│   │   └── auth.controller.ts     # 인증 관련 라우터
│   ├── user/
│   │   ├── user.entity.ts         # User 엔티티 (kakao_id 등 포함)
│   │   ├── user.service.ts        # 회원가입/조회 로직
│   │   └── shipping.service.ts    # 배송지 조회 서비스
│   └── config/
│       └── kakao.config.ts        # 카카오 API 설정 상수
├── .env
├── .env.example
└── docs/
    └── 01-plan/
        └── kakao-login-api-plan.md
```

---

## 9. 보안 체크리스트

- [ ] state 파라미터로 CSRF 공격 방지
- [ ] client_secret 설정으로 토큰 발급 보안 강화
- [ ] 액세스 토큰은 서버 측에서만 보관 (클라이언트 노출 금지)
- [ ] HTTPS 환경에서만 운영 (redirect_uri 포함)
- [ ] 토큰 만료 시간 관리
  - 액세스 토큰: 21600초 (6시간)
  - 리프레시 토큰: 5184000초 (60일)
- [ ] 리프레시 토큰 암호화 저장 (DB)
- [ ] 로그아웃 시 서버 토큰 즉시 무효화

---

## 10. 참고 링크

- 카카오 로그인 REST API: https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api
- 카카오 개발자 콘솔: https://developers.kakao.com/console/app
- 디자인 가이드: https://developers.kakao.com/docs/latest/ko/kakaologin/design-guide
- 에러 코드: https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#error-code
