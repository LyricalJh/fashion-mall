# Gap Detector Memory

## Project: fashion-mall (shop)

### Completed Analyses
- **MyPage**: 91% match rate (2026-02-26) - 8/12 issues fixed in iteration 1
- **Claim**: 100% match rate (2026-02-26) - perfect design-implementation sync

### Key Patterns Observed
- Backend follows: Entity -> Repository -> DTO -> Service -> Controller
- Frontend follows: types/api.ts -> hooks/ -> pages/
- N+1 prevention: 2-query pattern (page IDs first, then fetch join by IDs)
- All DTOs use static `from(Entity)` factory method
- Validation: Jakarta Bean Validation on request DTOs, not entities
- Transactions: @Transactional on service class, readOnly on reads

### File Locations
- Design docs: `docs/02-design/features/{feature}.design.md`
- Analysis output: `docs/03-analysis/{feature}.analysis.md`
- Backend base: `backend/src/main/java/com/shop/`
- Frontend base: `fashion-mall/src/`
- Error codes: `global/exception/ErrorCode.java`
- Frontend types: `fashion-mall/src/types/api.ts`
