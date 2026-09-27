# Implementation Plan: Architecture Refactoring and Service Decoupling

**Branch**: `019-architecture-refactoring` | **Date**: 2026-09-07 | **Spec**: [spec.md](file:///C:/Users/garam/.projetos/Collectto/frontend/specs/019-architecture-refactoring/spec.md)  
**Input**: Feature specification from `/specs/019-architecture-refactoring/spec.md`

## Summary

Decouple live API operations from debug mock logic, modularize `AuthProvider.tsx` by extracting non-React responsibilities into dedicated utility modules (`jwt.ts`, `userMappers.ts`, `validation.ts`), and unify notification service strategies (`apiNotificationService` vs `mockNotificationService`) while ensuring 100% zero-regression backward compatibility across the application.

## Technical Context

**Language/Version**: TypeScript 5.x / React Native (Expo)  
**Primary Dependencies**: React, React Native, Axios, Expo Router  
**Storage**: SecureStore / Async Storage (`authSession.ts`)  
**Testing**: ESLint, TypeScript `type-check`, Prettier (`npm run validate`)  
**Target Platform**: Mobile (iOS & Android cross-platform)  
**Project Type**: React Native Mobile Application (Frontend)  
**Performance Goals**: Instant provider state updates, zero blocking work on UI main loop  
**Constraints**: Zero broken imports across existing screens, strict TypeScript types, adherence to Collectto Constitution  
**Scale/Scope**: ~3 providers (`AuthProvider`, `NotificationProvider`, Post service integration), ~4 utility files  

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

1. **Visual First**: Refactoring is pure architectural/structural cleanup; zero visual or UI regressions. (PASSED)
2. **Fluidez Acima de Complexidade**: Simplifies Provider state updates and maintains fast, fluid UX. (PASSED)
3. **Consistência > Criatividade Isolada**: Aligns `PostService` and `NotificationService` to the established Strategy Pattern used by `CollectionService` and `ItemService`. (PASSED)
4. **Padrões de Código Escrito e Qualidade**:
   - Uses arrow functions assigned to `const` for helpers and utilities. (PASSED)
   - Strict TypeScript typing without `any`. (PASSED)
   - Early returns / guard clauses for control flow. (PASSED)
   - Zero linter/type warnings via `npm run validate`. (PASSED)
   - Cross-platform native support for iOS & Android. (PASSED)

## Project Structure

### Documentation (this feature)

```text
specs/019-architecture-refactoring/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Technical decisions & research
├── data-model.md        # Interfaces & service contracts
├── quickstart.md        # Developer quickstart guide
└── checklists/
    └── requirements.md  # Quality validation checklist
```

### Source Code Layout

```text
src/
├── providers/
│   ├── AuthProvider.tsx            # Modularized Auth state provider (~300 lines)
│   └── NotificationProvider.tsx    # Clean notification provider consuming NotificationService
├── services/
│   ├── api/
│   │   ├── api.ts                  # Axios base client
│   │   ├── crudServices.ts         # Collection & Item services
│   │   ├── postService.ts          # NEW: Dedicated live API PostService implementation
│   │   └── notificationService.ts  # UPDATED: Unified live API NotificationService implementation
│   ├── debug/
│   │   ├── mockPostService.ts      # UPDATED: Pure in-memory debug mock PostService
│   │   └── mockNotificationService.ts # Pure in-memory debug mock NotificationService
│   └── auth/
│       └── sessionRefreshManager.ts # Session refresh manager
├── types/
│   ├── auth.ts                     # Auth types
│   ├── posts.ts                    # NEW/UPDATED: PostService interface
│   └── notifications.ts            # Notification types
└── utils/
    ├── jwt.ts                      # NEW: Extracted JWT parsing, decoding & validation
    ├── userMappers.ts              # NEW: Extracted user normalization & photo URL resolution
    └── validation.ts               # NEW: Extracted register data validation logic
```

**Structure Decision**: Single project layout (`src/` with `providers/`, `services/`, `utils/`, `types/`).

## Complexity Tracking

> No constitution violations detected. Refactoring reduces complexity and lines of code.

| Aspect | Current | Post-Refactor | Benefit |
| --- | --- | --- | --- |
| `AuthProvider.tsx` Size | 857 lines | ~300 lines | Single responsibility, easier maintenance |
| `mockPostService.ts` HTTP Calls | Mixed with mock data | 0 HTTP calls in mock service | No false positive mock fallbacks on API errors |
| `NotificationProvider.tsx` Branching | 4+ inline `if(isDebug)` | 1 strategy resolution at init | Unified service contract |
