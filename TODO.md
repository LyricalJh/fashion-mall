# SHOP Backend Project — Claude Code Agent Team Spec

> Root Path: `/shop`  
> Frontend Path: `/shop/fashion-mall`  
> Backend Path: `/shop/backend`  
> Architecture: Monorepo (Frontend + Backend)  
> Development Mode: Claude Code Agent Teams  

---

# 1. 🎯 Project Goal

패션 쇼핑몰 MVP를 프론트엔드와 완전히 연동 가능한 **Spring Boot 기반 백엔드 시스템**으로 확장한다.

목표:

- 프론트엔드와 REST API 연동
- PostgreSQL 기반 데이터 영속화
- Docker 기반 로컬 개발 환경
- 실서비스 확장을 고려한 구조 설계
- 보안/QA/PM 검증을 거친 안정적 구조

---

# 2. 👥 Claude Agent Team 구성

Claude Code 실행 시 반드시 아래 팀을 구성하여 역할 분담 후 병렬 개발 진행한다.

---

## 1️⃣ Frontend Agent

역할:

- 기존 `/shop/fashion-mall` 유지
- SWR 기반 API 연동 준비
- 환경변수로 API URL 분리
- 에러 핸들링 UX 처리
- 인증/토큰 저장 구조 준비

주의:

- API 계약 변경 시 Backend Agent와 즉시 협의
- 하드코딩 금지
- mock → 실제 API 전환 시 fallback 제거

---

## 2️⃣ Backend Agent

기술 스택:

- Spring Boot 3.x
- Spring Web
- Spring Data JPA
- JPQL
- QueryDSL (복잡 쿼리 발생 시 도입)
- PostgreSQL
- Lombok
- Validation
- Global Exception Handler
- Swagger (springdoc-openapi)

책임:

- 도메인 설계
- JPA Entity 작성
- Repository 설계
- Service 계층 분리
- Controller REST 설계
- 페이징/정렬/검색 구현
- 트랜잭션 관리

원칙:

- Controller는 비즈니스 로직 금지
- Service 계층에 트랜잭션
- DTO 사용 (Entity 직접 반환 금지)
- N+1 방지
- Fetch Join 전략 명확화

---

## 3️⃣ QA Engineering Agent

책임:

- API 응답 스키마 검증
- 예외 케이스 테스트
- 경계값 테스트
- 장바구니 수량 음수 방지 검증
- 주문 금액 계산 정확성 검증
- 동시성 테스트

필수 검증 목록:

- 상품이 없을 때 404 반환
- 잘못된 ID 접근 시 예외 처리
- SQL Injection 방어
- 잘못된 JSON 요청 처리

---

## 4️⃣ Security Audit Agent

점검 항목:

- SQL Injection
- XSS
- CSRF 전략
- CORS 설정
- 비밀번호 암호화 (BCrypt)
- JWT 토큰 구조 설계
- 민감정보 로그 출력 금지
- Spring Security 설정

정책:

- 모든 write API 인증 필요
- 관리자 API 분리
- Role 기반 접근 제어

---

## 5️⃣ PM Agent (쇼핑몰 도메인 전문가)

목표:

사용자가 아래 흐름에서 이탈하지 않도록 설계 검증한다.

User Flow:

1. 홈 → 카테고리 → 상품 상세
2. 장바구니 담기
3. 수량 변경
4. 주문
5. 결제
6. 주문 완료

검증 항목:

- UX 끊김 없음
- 가격 계산 오류 없음
- 재고 부족 시 처리 명확
- 주문 실패 시 롤백
- 재주문 가능 여부

---

# 3.📁 Backend 프로젝트 구조







/shop
├── fashion-mall   (frontend)
└── backend
├── src/main/java/com/shop
│   ├── domain
│   │   ├── product
│   │   ├── category
│   │   ├── cart
│   │   ├── order
│   │   ├── user
│   │   └── common
│   ├── global
│   │   ├── config
│   │   ├── exception
│   │   └── security
│   └── ShopApplication.java
├── src/main/resources
│   ├── application.yml
│   └── data.sql
├── build.gradle
└── Dockerfile







---

# 4. 🗄️ Database 설계 (PostgreSQL)

기본 테이블:

- users
- categories
- products
- product_images
- cart_items
- orders
- order_items

설계 원칙:

- FK 명확화
- index 필수 적용
- soft delete 여부 명확히 정의
- created_at / updated_at 공통 컬럼

---

# 5. 🐳 Docker 기반 개발 환경

루트 경로: `/shop`

## docker-compose.yml






version: “3.9”

services:

postgres:
image: postgres:16
container_name: shop-postgres
environment:
POSTGRES_DB: shop
POSTGRES_USER: shop
POSTGRES_PASSWORD: shop
ports:
- “5432:5432”
volumes:
- postgres-data:/var/lib/postgresql/data

backend:
build: ./backend
container_name: shop-backend
ports:
- “8080:8080”
depends_on:
- postgres
environment:
SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/shop
SPRING_DATASOURCE_USERNAME: shop
SPRING_DATASOURCE_PASSWORD: shop

volumes:
postgres-data:






---

# 6. 🔄 개발 단계 전략

### Phase 1 — 기본 인프라

- Docker 구성
- Spring Boot 프로젝트 생성
- PostgreSQL 연결
- Swagger 설정
- Global Exception 설정

---

### Phase 2 — 상품 도메인

- Category
- Product
- ProductImage
- 페이징 조회
- 카테고리 필터
- 가격 정렬

---

### Phase 3 — 장바구니

- 로그인 사용자 기준
- 장바구니 추가
- 수량 변경
- 삭제
- 총 금액 계산

---

### Phase 4 — 주문

- 주문 생성
- 재고 감소
- 주문 아이템 분리
- 트랜잭션 처리
- 주문 완료 응답

---

# 7. 📡 API 설계 원칙

REST 규칙 준수:

GET /api/products  
GET /api/products/{id}  
POST /api/cart  
PUT /api/cart/{id}  
DELETE /api/cart/{id}  
POST /api/orders  

## 응답 형식






{
“success”: true,
“data”: {},
“error”: null
}





## 에러 형식





{
“success”: false,
“error”: {
“code”: “PRODUCT_NOT_FOUND”,
“message”: “상품이 존재하지 않습니다.”
}
}






---

# 8. 🔐 보안 기본 정책

- JWT 기반 인증
- Access + Refresh 구조
- BCrypt 비밀번호 암호화
- CORS 프론트엔드 도메인만 허용
- 관리자 권한 분리

---

# 9. 🧪 QA 자동 검증 체크리스트

- 상품이 없을 때 404
- 재고 초과 주문 불가
- 주문 취소 시 재고 복구
- 음수 수량 입력 차단
- 가격 변조 방지

---

# 10. 🚀 최종 목표

프론트엔드와 완전 연동 가능한:

- 확장 가능한 구조
- 보안 검증 완료
- 도메인 중심 설계
- Docker 기반 실행 가능
- 실서비스 이전 가능한 아키텍처

---

# 실행 규칙

Claude Code는:

1. 위 팀을 구성한다.
2. Backend Agent가 먼저 인프라 구축을 시작한다.
3. QA + Security Agent는 병렬 검증을 수행한다.
4. PM Agent는 사용자 흐름 기준으로 기능 누락 여부 검증한다.
5. Frontend Agent는 API 계약 기반으로 SWR 연동 준비한다.

---

# End of Agent Team Spec