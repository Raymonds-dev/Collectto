# Tasks: Unified Upload and Local Storage Service

**Input**: Design documents from `/specs/015-centralize-uploads/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Manual validation scenarios are defined in `specs/015-centralize-uploads/quickstart.md`. No automated TDD test tasks are added as they were not explicitly requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies within the same phase)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project structure: `src/` at repository root
- Hooks: `src/hooks/`
- Services: `src/services/`
- Types: `src/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 [P] Verify type definitions for local and remote storage in `src/types/uploads.ts` and `src/types/photo-storage.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Refactor local storage cache directory helper methods in `src/services/photo-storage/local-provider.ts`
- [X] T003 [P] Implement helper function `resolveContentType` and file name sanitization `resolveFileName` in `src/services/api/uploadService.ts`
- [X] T004 [P] Verify backend presigned URL endpoint call exports in `src/services/api/api.ts`
- [X] T005 Create the unified upload helper `requestPresignedUpload` in `src/services/api/uploadService.ts` to coordinate pre-signed URL requests

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Unified Upload Flow & Temp Cleanup (Priority: P1) 🎯 MVP

**Goal**: Enable camera/gallery photos to be saved locally to a temporary cache (`/photos/temp/`) and uploaded to remote storage via S3/Oracle pre-signed URLs with immediate cache cleanup.

**Independent Test**: Select a photo during collection/item creation, save, and verify that the photo is uploaded, local temp is empty, and the relative path is saved in the database.

### Implementation for User Story 1

- [X] T006 [P] [US1] Implement `uploadCollectionCover` in `src/services/api/uploadService.ts` using binary PUT and temp file deletion
- [X] T007 [P] [US1] Implement `uploadItemPhoto` in `src/services/api/uploadService.ts` using binary PUT and temp file deletion
- [X] T008 [US1] Update item save hook `src/hooks/useItemSave.ts` to use unified `uploadItemPhoto` and verify cleanup
- [X] T009 [US1] Update collection creation hook `src/hooks/useCollectionCreation.ts` to use unified `uploadCollectionCover` and verify cleanup
- [X] T010 [US1] Add startup/background cleanup task in `src/services/photo-storage/local-provider.ts` to delete stale temp files older than 24 hours

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (MVP ready)

---

## Phase 4: User Story 2 - Centralized Upload Service (Priority: P2)

**Goal**: Consolidate all upload operations (including profile picture and background banner) into `UploadService` with unified error handling and PII-sanitized logging.

**Independent Test**: Change profile picture and verify that the upload uses `UploadService`, sanitizes logs, and handles errors gracefully.

### Implementation for User Story 2

- [X] T011 [P] [US2] Implement `uploadProfilePhoto` in `src/services/api/uploadService.ts` using the centralized upload flow
- [X] T012 [P] [US2] Implement `uploadProfileBackground` in `src/services/api/uploadService.ts` using the centralized upload flow
- [X] T013 [US2] Refactor profile service `src/services/profileService.ts` to delegate uploads to `src/services/api/uploadService.ts`
- [X] T014 [US2] Add centralized error mapping and PII-sanitized logging in `src/services/api/uploadService.ts` for all upload methods

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Debug Mode & Mock Storage Fallback (Priority: P3)

**Goal**: Fallback to local disk storage (`/photos/permanent/`) when `isDebugModeEnabled` is active to support offline execution.

**Independent Test**: Run the app in debug mode, save an item, and verify that the image is stored in permanent local folders and renders correctly.

### Implementation for User Story 3

- [X] T015 [US3] Add branch/toggle in `uploadCollectionCover` and `uploadItemPhoto` (in `src/services/api/uploadService.ts`) to bypass S3 upload and copy to permanent device storage if `isDebugModeEnabled()` is true
- [X] T016 [US3] Implement mock offline behavior for profile photo and background uploads in `src/services/api/uploadService.ts` during debug mode

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final code validation and manual verification

- [X] T017 [P] Run code validation `npm run validate` to ensure zero lint errors, type errors, or format warnings
- [X] T018 Execute manual verification scenarios in `specs/015-centralize-uploads/quickstart.md` to verify file cleanup and upload flows

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1) is the MVP and should be completed first
  - User Story 2 (P2) can run after Foundational completion
  - User Story 3 (P3) can run after Foundational completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel
- Foundational tasks marked [P] can run in parallel (T003, T004)
- Once Foundational phase completes, all user stories can start in parallel (US1, US2, US3) if staffing allows
- Within User Story 1, T006 and T007 can run in parallel
- Within User Story 2, T011 and T012 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch cover upload and item upload tasks together:
Task: "Implement uploadCollectionCover in src/services/api/uploadService.ts"
Task: "Implement uploadItemPhoto in src/services/api/uploadService.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify User Story 1 independently per `quickstart.md`

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
