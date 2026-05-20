---
description: "Task list for Profile Screen API Integration (feature 006)"
---

# Tasks: Profile Screen API Integration

**Input**: Design documents from `/specs/006-profile-api-integration/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Branch**: `agents/integracao-perfil-api-colecoes-itens`

**Total Tasks**: 52 | **Organized by**: 7 phases + user stories

---

## Overview

Profile Screen API Integration delivers comprehensive user profile management with collections and items. Organized as:
- **Phase 1: Setup** (3 tasks)
- **Phase 2: Foundational** (9 tasks) ⚠️ **CRITICAL - BLOCKS all UI**
- **Phase 3: User Story 1** - Profile View/Edit (P1, 8 tasks)
- **Phase 4: User Story 2** - Collections (P1, 10 tasks)
- **Phase 5: User Story 3** - Items (P2, 9 tasks)
- **Phase 6: User Story 4** - Other Profiles (P2, 5 tasks)
- **Phase 7: Polish** (8 tasks)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and foundational structure

- [ ] T001 Create directory structure per plan: `src/services/api/`, `src/hooks/`, `src/components/profile/`, `src/services/cache/`
- [ ] T002 Create contract files in `specs/006-profile-api-integration/contracts/`: `profile-service.contract.ts`, `collection-api-service.contract.ts`, `item-api-service.contract.ts`, `upload-service.contract.ts`
- [ ] T003 [P] Configure TypeScript strict mode validation for new services in `tsconfig.json` (if needed) and update ESLint rules for service layer

**Checkpoint**: Project structure ready - foundational services can be implemented

---

## Phase 2: Foundational Services & Infrastructure (⚠️ CRITICAL - BLOCKS ALL UI)

**Purpose**: Core services and caching infrastructure that MUST be complete before ANY user story work begins

**⚠️ CRITICAL**: No UI component work can start until Phase 2 is 100% complete

### 2.1 API Services (No UI Dependencies)

- [ ] T004 Create `src/services/api/profileService.ts` with `getProfile(userId)` and `updateProfile(userId, data)` methods, axios integration, error context
- [ ] T005 Create `src/services/api/collectionAPIService.ts` with pagination, CRUD operations (create, read, update, delete), `deleteWithStrategy()` pattern (reference debug service), follow/unfollow
- [ ] T006 Create `src/services/api/itemAPIService.ts` with pagination, CRUD, move/bulk operations, like/unlike (optimistic updates)
- [ ] T007 Create `src/services/api/uploadService.ts` for pre-signed URL flow (POST `/uploads/presigned-urls`, context routing: PROFILE_PICTURE, PROFILE_BACKGROUND, COLLECTION, ITEM)

### 2.2 Cache & Retry Infrastructure (Depends on T004-T007)

- [ ] T008 Implement `src/hooks/useRetry.ts` hook: exponential backoff (max 5 retries), jitter (±50%), filter permanent errors (400, 401, 403), with `isRetrying` state
- [ ] T009 [P] Create cache layer utilities in `src/services/cache/cacheManager.ts`: in-memory + AsyncStorage TTL management (5 min default), expiration checking, set/get/remove/clear
- [ ] T010 [P] Create `src/hooks/useProfile.ts` with stale-while-revalidate pattern, cache + background revalidation, refresh() method (depends on T004, T009)
- [ ] T011 [P] Create `src/hooks/useCollections.ts` with pagination + cache per page, background revalidation, page management (depends on T005, T009)
- [ ] T012 [P] Create `src/hooks/useItems.ts` with pagination + cache per page, background revalidation, page management (depends on T006, T009)

**Checkpoint**: ✅ All services, cache, and hooks complete - UI work can now proceed

---

## Phase 3: User Story 1 - View & Edit Own Profile (Priority: P1) 🎯 MVP

**Goal**: Authenticated user can view and edit their own profile with API integration

**Independent Test**: 
- Navigate to profile screen → data loads from API with skeleton
- Click "Edit Profile" → form opens with current data pre-filled
- Edit fields (name, bio, picture) and save → API updates, UI reflects change immediately
- Verify form validation prevents invalid submissions

### 3.1 Implementation for User Story 1

- [ ] T013 [P] [US1] Refactor `src/components/profile/ProfileHeader.tsx`: display user data (name, username, bio, pictures, follower counts), add "Edit" button, show skeleton while loading (depends on T010)
- [ ] T014 [P] [US1] Create `src/components/profile/ProfileEditForm.tsx`: form with name, username, bio, profilePictureUrl, profileBackgroundUrl, birthdayDate fields, form validation (email format, date format), save handler (depends on T010, T008)
- [ ] T015 [US1] Integrate image picker for profile picture in `src/components/profile/ProfileEditForm.tsx`: use `expo-image-picker`, trigger uploadService.generatePresignedUrls(), handle S3 upload, include returned URL in profile update (depends on T007, T014)
- [ ] T016 [US1] Connect ProfileEditForm to `profileService.updateProfile()` in `src/components/profile/ProfileEditForm.tsx`: save on submit, invalidate cache, show success/error feedback (depends on T004, T014)
- [ ] T017 [US1] Add error handling + retry UI to ProfileEditForm in `src/components/profile/ProfileEditForm.tsx`: handle 403 (no permission), 401 (re-auth), 5xx (retry) via useRetry hook, show error banner (depends on T008, T016)
- [ ] T018 [US1] Add form validation utilities in `src/utils/validation.ts`: email format, username format (3-30 alphanumeric+underscore), date format (yyyy-MM-dd), required fields
- [ ] T019 [US1] Test form validation: submit with invalid email, username, date → validation errors shown (T018 validation in place)
- [ ] T020 [US1] Test profile load performance: cold cache profile load ≤2s, edit response ≤1s after API response (manual performance check)

**Checkpoint**: User Story 1 fully functional - profile view/edit works independently without collections/items

---

## Phase 4: User Story 2 - Manage Collections (Priority: P1)

**Goal**: User can view, create, edit, and delete their collections via API

**Independent Test**:
- Navigate to Collections tab → list loads from API with pagination (10+ items scroll smoothly)
- Click "New Collection" → modal opens, can fill form (name, description, cover, visibility, tags)
- Click edit on collection → form pre-fills with data, can update
- Click delete → modal prompt for strategy (Delete all items / Move to Uncategorized)

### 4.1 Implementation for User Story 2

- [ ] T021 [P] [US2] Refactor `src/components/profile/CollectionsTab.tsx`: fetch collections via `useCollections()` hook, display list with pagination (load next page on scroll), show empty state + skeleton during load (depends on T011)
- [ ] T022 [P] [US2] Create `src/components/profile/CollectionEditModal.tsx`: create/edit form with name, description, coverImageUrl, visibility (PUBLIC/PRIVATE/FRIENDS), tags fields, form validation, cancel/save buttons (depends on T011, T008)
- [ ] T023 [US2] Integrate image picker for collection cover in `src/components/profile/CollectionEditModal.tsx`: use `expo-image-picker`, generate pre-signed URL via T007, handle S3 upload, include URL in collection create/update (depends on T007, T022)
- [ ] T024 [US2] Implement collection create flow in `src/components/profile/CollectionEditModal.tsx`: POST `/collections/create` via `collectionAPIService`, handle form submit, show loading state, invalidate cache on success, display success message (depends on T005, T023)
- [ ] T024a [US2] Implement collection update flow in `src/components/profile/CollectionEditModal.tsx`: PATCH `/collections/update` via `collectionAPIService`, handle form submit with changed fields only, invalidate cache on success (depends on T005, T024)
- [ ] T025 [US2] Implement collection delete with strategy in `src/components/profile/CollectionsTab.tsx`: on delete, show modal with 2 options ("Delete all items" or "Move to Uncategorized"), call `deleteWithStrategy()` with selected strategy, invalidate cache (depends on T005, T021)
- [ ] T026 [US2] Add collection form validation in `src/utils/validation.ts`: name required (1-100 chars), description optional (max 500 chars), tags max 10 each 1-30 chars (depends on T018)
- [ ] T027 [US2] Add error handling + retry to CollectionsTab in `src/components/profile/CollectionsTab.tsx`: handle API errors (403, 404, 5xx) via useRetry, show error banner with retry button (depends on T008, T021)
- [ ] T028 [US2] Test collection CRUD: create, read, update, delete scenarios with mock/real API (verify all 4 operations work independently)
- [ ] T029 [US2] Test pagination: scroll load 10+ collections without lag (manual performance check)

**Checkpoint**: User Story 2 fully functional - collections management works independently

---

## Phase 5: User Story 3 - Manage Items (Priority: P2)

**Goal**: User can view, create, edit, and delete items within collections

**Independent Test**:
- From collection detail → ItemsGrid loads items from API with pagination
- Click "New Item" → modal opens, can fill form (name, description, dates, multiple images, attributes)
- Click edit → form pre-fills, can update
- Click delete → item removed from API

### 5.1 Implementation for User Story 3

- [ ] T030 [P] [US3] Create `src/components/profile/ItemsGrid.tsx`: fetch items via `useItems()` hook, display paginated grid, load next page on scroll, show empty state + skeleton (depends on T012)
- [ ] T031 [P] [US3] Create `src/components/profile/ItemEditModal.tsx`: create/edit form with name, description, acquisitionDate, lastUsedDate, imageFilesUrls, attributes (key-value), tags fields (depends on T012, T008)
- [ ] T032 [US3] Integrate multi-image picker for items in `src/components/profile/ItemEditModal.tsx`: use `expo-image-picker` (allow multiple), generate pre-signed URLs, handle S3 uploads, include URLs in item create/update (depends on T007, T031)
- [ ] T033 [US3] Create attribute manager UI in `src/components/profile/ItemEditModal.tsx`: add/remove key-value pairs dynamically, validate keys are strings, values string/number/boolean (depends on T031)
- [ ] T034 [US3] Connect ItemEditModal to `itemAPIService` in `src/components/profile/ItemEditModal.tsx`: POST (create), PATCH (update), DELETE, handle responses, invalidate cache (depends on T006, T031)
- [ ] T035 [US3] Add item form validation in `src/utils/validation.ts`: name required (1-200 chars), description optional (max 1000 chars), dates ISO format (yyyy-MM-dd) ≤ today, attributes max 20 (depends on T018)
- [ ] T036 [US3] Add error handling + retry to ItemsGrid in `src/components/profile/ItemsGrid.tsx`: handle API errors via useRetry, show error banner (depends on T008, T030)
- [ ] T037 [US3] Test item CRUD: create with 10 images, update attributes, delete items
- [ ] T038 [US3] Test multi-image upload: verify ≤5s for ≤5MB files (manual performance check)

**Checkpoint**: User Story 3 fully functional - items management works independently

---

## Phase 6: User Story 4 - View Other Profiles & Collections (Priority: P2)

**Goal**: Discover and view other users' PUBLIC profiles and collections with visibility filtering

**Independent Test**:
- Navigate to another user's profile → see profile if PUBLIC
- See collections with visibility filtering applied (PUBLIC visible, PRIVATE hidden)
- Can follow/unfollow collection (if in scope)

### 6.1 Implementation for User Story 4

- [ ] T039 [US4] Add visibility filtering logic to `profileService` in `src/services/api/profileService.ts`: apply PUBLIC/PRIVATE/FRIENDS filtering when viewing other profile, handle 403 (access denied) (depends on T004)
- [ ] T040 [US4] Create `src/app/(tabs)/profile/[userId].tsx` screen for other user's profile: display limited/full profile based on visibility level, show only PUBLIC collections (depends on T039, T013)
- [ ] T041 [US4] Add follow/unfollow actions to `collectionAPIService` in `src/services/api/collectionAPIService.ts`: POST/DELETE `/collections/follow/{id}`, update followersCount optimistically (depends on T005)
- [ ] T042 [US4] Integrate follow button in `src/components/profile/CollectionsTab.tsx`: show follow button when viewing other user's profile, handle follow/unfollow via `collectionAPIService.followCollection()` (depends on T041, T021)
- [ ] T043 [US4] Test visibility filtering: verify correct access to PUBLIC (show), PRIVATE (hide), FRIENDS (conditional) profiles

**Checkpoint**: User Story 4 fully functional - profile discovery works

---

## Phase 7: Polish & Validation

**Purpose**: Cross-cutting concerns, performance, accessibility, and final validation

- [ ] T044 [P] Audit all components for accessibility: touch targets (hitSlop), labels, contrast ratios, screen reader support per WCAG guidelines
- [ ] T045 [P] Audit all components for design system compliance: verify NativeWind tokens used (no hardcoded colors), motion presets (FadeIn, SlideUp, no spinners), reusable primitives (Button, Modal, Card)
- [ ] T046 [P] Performance audit: measure profile load ≤2s (cold), edit ≤1s, pagination smooth, media upload ≤5s (use React Native Performance Monitor or manual measurement)
- [ ] T047 [P] Error injection testing: simulate 400, 401, 403, 5xx, network timeout scenarios; verify user-facing error messages are clear and actionable (SC-006)
- [ ] T048 [P] Offline mode testing: enable offline via NetInfo mock, verify cache read works, write operations blocked with clear message (FR-018)
- [ ] T049 Run `npm run validate`: lint (ESLint), format (Prettier), type-check (TypeScript strict) all services + components; fix all warnings/errors before proceeding
- [ ] T050 Update documentation: ensure `quickstart.md` reflects final implementation, add code examples from actual services
- [ ] T051 Code review + merge preparation: verify commit history is clean, PR description ready, all test scenarios passed, no TODOs left behind

**Checkpoint**: Feature complete and validated - ready for merge + release

---

## Dependencies & Execution Order

### Critical Path (Sequential)

```
T001-T003 Setup
    ↓
T004-T007 API Services
    ↓
T008-T012 Cache + Hooks (Foundational) ⚠️ BLOCKS UI
    ↓
T013-T020 US1 Profile (Independent) → testable
    ↓
T021-T029 US2 Collections (Independent) → testable
    ↓
T030-T038 US3 Items (Independent) → testable
    ↓
T039-T043 US4 Other Profiles (Independent) → testable
    ↓
T044-T051 Polish + Validation
```

### Parallel Opportunities

**Phase 2 Parallelization** (after T004-T007):
- T009-T012 can run in parallel (each hooks different service, no cross-dependencies)

**Phase 3+ Parallelization** (after Phase 2 complete):
- **Developer A**: T013-T020 (US1 Profile)
- **Developer B**: T021-T029 (US2 Collections)
- **Developer C**: T030-T038 (US3 Items)
- **Developer D**: T039-T043 (US4 Other Profiles)
- All independent, no cross-story dependencies

**Phase 7 Parallelization**:
- T044-T048 can mostly run in parallel (audit different aspects)
- T049-T051 sequential (validation + finalization)

### Within Each User Story (Example: US1)

```
T013-T014 [P] Component refactor + form creation (parallel: different files)
    ↓
T015-T016 Integration (sequential: form needs both image + save logic)
    ↓
T017 Error handling
    ↓
T018 Validation utils
    ↓
T019-T020 Testing (manual)
```

---

## Independent Test Criteria (Per User Story)

### User Story 1: Profile View/Edit
- ✅ Profile loads with skeleton ≤2s
- ✅ Form displays current user data
- ✅ Edit + save updates API + UI ≤1s
- ✅ Form validation prevents invalid submissions
- ✅ Image picker + upload works
- ✅ Offline mode: read profile from cache

### User Story 2: Collections
- ✅ Collections list loads with pagination
- ✅ Create collection form works
- ✅ Edit collection form pre-fills data
- ✅ Delete with strategy (MOVE_TO_UNCATEGORIZED or DELETE_ALL_ITEMS)
- ✅ Pagination: scroll load 10+ collections smoothly
- ✅ Image picker + upload for cover

### User Story 3: Items
- ✅ Items grid loads with pagination per collection
- ✅ Create item form works
- ✅ Edit item form pre-fills data
- ✅ Delete item works
- ✅ Multi-image upload (≤5s for ≤5MB)
- ✅ Attributes manager (add/remove key-value pairs)

### User Story 4: Other Profiles
- ✅ View PUBLIC profile of another user
- ✅ Cannot view PRIVATE profile (403 or hidden)
- ✅ Can follow/unfollow collections
- ✅ See only PUBLIC collections

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T012) ⚠️ **CRITICAL**
3. Complete Phase 3: US1 Profile (T013-T020)
4. **STOP and VALIDATE**: Test US1 independently (no collections/items yet)
5. Deploy/demo MVP if ready

### Incremental Delivery

1. Phases 1-2 → Foundation ready
2. Add US1 → Test independently → Deploy/Demo (MVP!)
3. Add US2 → Test independently → Deploy/Demo
4. Add US3 → Test independently → Deploy/Demo
5. Add US4 → Test independently → Deploy/Demo
6. Polish & release

### Parallel Team Strategy (with 4+ developers)

1. All developers: Phases 1-2 together (3-4 days)
   - Phase 2 is critical blocker, must be perfect
2. Phase 2 complete → split:
   - Developer A: US1 (Profile) - T013-T020
   - Developer B: US2 (Collections) - T021-T029
   - Developer C: US3 (Items) - T030-T038
   - Developer D: US4 (Other Profiles) - T039-T043
3. All stories complete independently, then integrate
4. Team: Polish + validation (T044-T051)

---

## Task Format Validation

**Every task follows strict checklist format**:
- ✅ Checkbox: `- [ ]`
- ✅ Task ID: T001, T002, ..., T051
- ✅ [P] flag: for parallelizable tasks
- ✅ [Story] label: [US1], [US2], [US3], [US4] where applicable
- ✅ File path: explicit src/path/file.ts
- ✅ Dependencies: "depends on T00X" when sequential

**Example**:
```
- [ ] T013 [P] [US1] Refactor src/components/profile/ProfileHeader.tsx: display user data...
```

---

## Notes

- [P] tasks = different files, no sequential dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Phase 2 (T004-T012) is CRITICAL and BLOCKS all UI work - prioritize this phase
- Verify tests fail before implementing (if tests written first)
- Commit after each task or logical group (good checkpoint granularity)
- Stop at any checkpoint to validate story independently before proceeding

---

**Total**: 52 tasks across 7 phases | **MVP scope**: Phase 1 + Phase 2 + Phase 3 (US1) = ~20 tasks | **Full scope**: All phases (52 tasks)

