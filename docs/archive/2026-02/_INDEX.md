# Archive Index - 2026-02

## shop (Fashion Mall E-Commerce Platform)

- **Archived**: 2026-02-26
- **Match Rate**: 95%
- **PDCA Duration**: 2026-02-25 ~ 2026-02-26

### Documents

| Document | Description |
|----------|-------------|
| [feature-db.md](shop/feature-db.md) | DB 스키마 설계 (Plan) |
| [kakao-login-api-plan.md](shop/kakao-login-api-plan.md) | 카카오 소셜 로그인 API 계획 (Plan) |
| [toss-payments-api-plan.md](shop/toss-payments-api-plan.md) | 토스페이먼츠 결제 API 계획 (Plan) |
| [toss-payments-cancel-api-plan.md](shop/toss-payments-cancel-api-plan.md) | 토스페이먼츠 결제 취소 API 계획 (Plan) |
| [toss-payments-LLMs.md](shop/toss-payments-LLMs.md) | 토스페이먼츠 LLM 연동 가이드 (Plan) |
| [shop.analysis.md](shop/shop.analysis.md) | Gap Analysis v1.0~v3.0 (Check) |
| [shop.report.md](shop/shop.report.md) | PDCA 완료 보고서 (Report) |

### Summary

- 30 API endpoints across 9 domains
- 18 frontend routes, 15+ pages
- 4 check iterations: 72% → 93% → 93% → 95%
- 2 agent team rounds (Team 1: entities, Team 2: API integration)

---

## MyPage (마이페이지 기능 개선)

- **Archived**: 2026-02-26
- **Match Rate**: 91%
- **PDCA Duration**: 2026-02-25 ~ 2026-02-26
- **Iterations**: 1

### Documents

| Document | Description |
|----------|-------------|
| [MyPage.analysis.md](MyPage/MyPage.analysis.md) | Gap Analysis — 프론트/백엔드 정합성 분석 (Check) |
| [MyPage.report.md](MyPage/MyPage.report.md) | PDCA 완료 보고서 (Report) |

### Summary

- 10 MyPage 페이지, 4 커스텀 훅, 4 백엔드 도메인
- 주문 상태 매핑 버그 수정 (PENDING→결제대기)
- InquiryPage ISO 날짜 파싱 버그 수정
- 3개 페이지 error state UI 추가
- OrderDetailPage SWR mutate 패턴 적용
- 1 iteration: 87% → 91%

---

## Claim (취소/반품 도메인 — 1차)

- **Archived**: 2026-02-26
- **Match Rate**: 100%
- **PDCA Duration**: 2026-02-26
- **Iterations**: 0

### Documents

| Document | Description |
|----------|-------------|
| [Claim.design.md](Claim/Claim.design.md) | Claim 엔티티/API 설계 (Design) |
| [Claim.analysis.md](Claim/Claim.analysis.md) | Gap Analysis — 38/38 체크포인트 (Check) |
| [Claim.report.md](Claim/Claim.report.md) | PDCA 완료 보고서 (Report) |

### Summary

- Backend: 11 신규 파일 (Claim, ClaimItem 엔티티 + 4 DTO + Repository + Service + Controller)
- Frontend: 4 파일 수정 (types, useClaims hook, CancelReturnPage, ClaimDetailPage)
- 4 REST endpoints: POST/GET/GET/{id}/DELETE claims
- 취소 자동완료 (CONFIRMED/PAID → 환불+재고복원), 반품 접수 (DELIVERED → 관리자 처리)
- 중복 클레임 수량 검증, N+1 방지 Fetch Join
- 0 iteration: 100% first-time match
