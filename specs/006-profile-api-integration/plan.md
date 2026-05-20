# Implementation Plan: Profile Screen API Integration

**Branch**: `agents/integracao-perfil-api-colecoes-itens` | **Date**: 2026-05-19 | **Spec**: [specs/006-profile-api-integration/spec.md](spec.md)

**Input**: Feature specification for integrating profile screen (authenticated user view, edit, and management of collections/items) with backend API endpoints (GET/PATCH `/users`, GET/POST/PATCH/DELETE `/collections`, GET/POST/PATCH/DELETE `/items`, POST `/uploads/presigned-urls`).

## Summary

Implement comprehensive profile screen integration with the Collectto API. This includes:
1. **P1**: View authenticated user profile with API data (name, username, email, bio, pictures, follower counts, birthdate)
2. **P1**: Edit user profile with PATCH `/users/update` and image upload (pre-signed URLs)
3. **P1**: View and manage user collections with pagination (GET, POST, PATCH, DELETE)
4. **P2**: View and manage items within collections (GET, POST, PATCH, DELETE with pagination)
5. **P2**: Media upload for collections/items via pre-signed URLs

**Approach**: Leverage existing debug services (`mockCollectionService`, `mockItemService`) as reference patterns. Create new **production API services** (`profileService`, `collectionAPIService`, `itemAPIService`) without importing mocks directly. Use stale-while-revalidate caching (TTL 5 min), context-specific error handling with exponential backoff (max 5 retries, no retry on 400/401/403), and offline-read support.

## Technical Context

**Language/Version**: TypeScript 5.x, React Native (Expo 54)  
**Primary Dependencies**: `axios` (existing), `react-native-calendars` (for dates), `nativewind` (styling), `expo-image-picker` (media selection)  
**Storage**: Persistent cache (AsyncStorage via existing `storage` service); debug mode for development  
**Testing**: Manual validation + acceptance scenarios from spec  
**Target Platform**: iOS, Android (Expo)  
**Project Type**: Mobile app (collection curator social platform)  
**Performance Goals**: Profile load ≤2s (cold cache), edit response ≤1s, pagination instant, media upload ≤5s for ≤5MB files  
**Constraints**: Visual First, Fluidez, Consistência (reuse tokens + motion presets), Collection Identity (strong covers, elegant org)  
**Scale/Scope**: Profile + Collections + Items management (read/write with offline-read support)

## Constitution Check

_GATE: Must pass before Phase 0. Re-check Phase 1 design._

✅ **Visual First**: Profile screen uses existing card/header patterns; collections/items in grids with strong cover images (follows "Coleção É Identidade" principle)  
✅ **Fluidez**: Edit profile uses inline expansion or modal (not new route); collection/item mgmt via cards + sheets (not multi-step flows)  
✅ **Consistência**: Reuse existing UI primitives (`Button`, `Modal`, `Card`); NativeWind tokens for colors/spacing; motion presets (`FadeIn` for data load, `SlideUp` for edit forms)  
✅ **Coleção É Identidade**: Collection cards prominently display covers + item count + follower count; profile shows user curation center  
✅ **Microinterações & Motion**: All state changes use existing motion presets; loading uses skeleton + progressive image rendering; no spinners  

**GATE PASSED** ✅ – Design aligns with constitution; no principle violations.

## Project Structure

### Documentation (this feature)

```text
specs/006-profile-api-integration/
├── plan.md              # This file
├── spec.md              # Feature specification (DONE)
├── research.md          # Research findings (Phase 0)
├── data-model.md        # Domain entities & validation (Phase 1)
├── contracts/           # Service contracts (Phase 1)
│   ├── profile-service.contract.ts
│   ├── collection-api-service.contract.ts
│   └── item-api-service.contract.ts
├── quickstart.md        # Integration guide for developers (Phase 1)
└── checklists/          # Requirements validation
    └── acceptance.md    # Scenario mapping
```

### Source Code (repository root, generated during Phase 1–2)

```text
src/
├── components/
│   ├── ui/              # Reusable primitives (existing)
│   └── profile/         # New profile-specific composed components
│       ├── ProfileHeader.tsx          # User info + cover + edit button
│       ├── ProfileEditForm.tsx        # Form for name/username/bio/dates
│       ├── CollectionsTab.tsx         # Collections list + pagination
│       ├── ItemsGrid.tsx              # Items paginated grid
│       ├── CollectionEditModal.tsx    # Create/edit collection
│       └── ItemEditModal.tsx          # Create/edit item
├── services/
│   └── api/
│       ├── profileService.ts          # GET /users/{id}, PATCH /users/update (NEW)
│       ├── collectionAPIService.ts    # Collection CRUD via API (NEW)
│       ├── itemAPIService.ts          # Item CRUD via API (NEW)
│       └── uploadService.ts           # POST /uploads/presigned-urls (NEW)
├── hooks/
│   ├── useProfile.ts                  # Fetch + cache user profile (NEW)
│   ├── useCollections.ts              # Fetch + paginate collections (NEW)
│   ├── useItems.ts                    # Fetch + paginate items (NEW)
│   └── useRetry.ts                    # Retry with exponential backoff (NEW)
└── app/
    └── (tabs)/
        └── profile/
            └── index.tsx              # Profile screen (REFACTOR)
```

---

## Phase 0: Research & Validation

**Status**: READY TO EXECUTE

### Research Tasks

1. **Validate API endpoint contracts** vs OpenAPI spec (collecto-api-docs.json)
   - Confirm request/response shapes for all CRUD operations
   - Verify error codes (400, 401, 403, 5xx, network timeouts)
   - Document pre-signed URL flow (POST → PUT to S3)

2. **Assess existing cache infrastructure**
   - Review `src/services/storage` for AsyncStorage patterns
   - Identify TTL management approach (in-memory + persisted)
   - Plan stale-while-revalidate implementation

3. **Identify motion presets for state changes**
   - Confirm `FadeIn`, `SlideUp`, `ScalePress` availability in `src/hooks/useAnimation`
   - Document loading skeleton patterns used in existing screens
   - Plan image-aware rendering for profile pictures

4. **Analyze form validation patterns**
   - Review existing form validation (e.g., registration flow)
   - Plan email, username, date (yyyy-MM-dd) validation rules

5. **Document debug mode service patterns**
   - Study `mockCollectionService.deleteWithStrategy()` logic (reuse pattern, not import)
   - Map error handling in debug services
   - Plan production service architecture (no direct mock imports)

**Output**: research.md (consolidates all findings with decisions + rationale)

---

## Phase 1: Design & Contracts

**Prerequisites**: research.md complete

### 1. Data Model (data-model.md)

**Entities to document**:

- **User** (authenticated context)
  - id, name, username, email, bio, profilePictureUrl, profileBackgroundUrl, followersCount, followingCount, birthdayDate, createdAt, isActive
  - Validation: email format, username (no spaces), birthdate ISO format
  - State: profile vs editing mode

- **Collection** (user-owned)
  - id, userId, name, description, coverImageUrl, coverImageUrls[], visibility (PUBLIC/PRIVATE/FRIENDS), followersCount, tags, isActive, isSystem, createdAt, updatedAt
  - Validation: name required, visibility enum, tags array
  - State transitions: created → visible → deleted (with strategy)

- **Item** (within collection)
  - id, collectionId, userId, name, description, acquisitionDate, lastUsedDate, imageFilesUrls[], attributes (key-value), likesCount, commentsCount, tags, isActive, createdAt, updatedAt
  - Validation: name required, dates ISO format, image URLs
  - State: active vs deleted

- **Upload Context** → `PROFILE_PICTURE | PROFILE_BACKGROUND | COLLECTION | ITEM`
- **Collection Visibility** → `PUBLIC | PRIVATE | FRIENDS`
- **Delete Strategy** → `MOVE_TO_UNCATEGORIZED | DELETE_ALL_ITEMS`

### 2. Service Contracts (contracts/)

Three new services, no direct mock imports:

**profileService.ts**
```typescript
interface IProfileService {
  getProfile(userId: string): Promise<UserResponse>;
  updateProfile(userId: string, data: UpdateUserRequest): Promise<UserResponse>;
}
```

**collectionAPIService.ts**
```typescript
interface ICollectionAPIService {
  getCollectionsByUser(userId: string, page: number, size: number): Promise<CollectionPageResponse>;
  createCollection(data: CreateCollectionRequest): Promise<CollectionResponse>;
  updateCollection(id: string, data: UpdateCollectionRequest): Promise<CollectionResponse>;
  deleteCollection(id: string, strategy?: DeleteCollectionItemsStrategy): Promise<void | DeleteCollectionResponse>;
  getCollection(id: string): Promise<CollectionResponse>;
}
```

**itemAPIService.ts**
```typescript
interface IItemAPIService {
  getItemsByCollection(collectionId: string, page: number, size: number): Promise<ItemPageResponse>;
  getItem(collectionId: string, itemId: string): Promise<ItemResponse>;
  createItem(data: CreateItemRequest): Promise<ItemResponse>;
  updateItem(id: string, data: UpdateItemRequest): Promise<ItemResponse>;
  deleteItem(id: string): Promise<void>;
}
```

**uploadService.ts**
```typescript
interface IUploadService {
  generatePresignedUrls(resourceId: string, parentId?: string, context: UploadContext, files: FileInput[]): Promise<GenerateUploadUrlsResponse>;
}
```

### 3. Quickstart Guide (quickstart.md)

- How to use new services in components
- Cache/retry behavior explained
- Error handling patterns
- Form validation examples

### 4. Agent Context Update

Update `.github/copilot-instructions.md` with reference to this plan file (between SPECKIT markers).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize project structure and foundational patterns

- [ ] T001 Create directory structure per plan: `src/services/api/`, `src/hooks/`, `src/components/profile/`
- [ ] T002 Create contract files in `specs/006-profile-api-integration/contracts/`: `profile-service.contract.ts`, `collection-api-service.contract.ts`, `item-api-service.contract.ts`, `upload-service.contract.ts`
- [ ] T003 [P] Configure TypeScript strict mode validation for new services (update `tsconfig.json` if needed)

**Checkpoint**: Project structure ready - foundational phase can begin

---

## Phase 2: Foundational Services & Infrastructure

**Purpose**: Core services and caching that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No UI work can begin until this phase is complete

### Services (No Dependencies on User Stories)

- [ ] T004 Create `src/services/api/profileService.ts` with getProfile() and updateProfile() methods
- [ ] T005 Create `src/services/api/collectionAPIService.ts` with pagination + CRUD operations
- [ ] T006 Create `src/services/api/itemAPIService.ts` with pagination + CRUD operations
- [ ] T007 Create `src/services/api/uploadService.ts` for pre-signed URL flow (POST `/uploads/presigned-urls`)
- [ ] T008 Implement useRetry hook in `src/hooks/useRetry.ts` (exponential backoff, max 5 retries, filter 400/401/403)

### Cache & Hooks (Depends on T004-T007)

- [ ] T009 [P] Create cache layer utilities in `src/services/cache/` (TTL 5 min, AsyncStorage integration)
- [ ] T010 [P] Create `src/hooks/useProfile.ts` with stale-while-revalidate pattern (depends on T004, T009)
- [ ] T011 [P] Create `src/hooks/useCollections.ts` with pagination + cache (depends on T005, T009)
- [ ] T012 [P] Create `src/hooks/useItems.ts` with pagination + cache (depends on T006, T009)

**Checkpoint**: Services + cache + hooks ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View & Edit Own Profile (Priority: P1) 🎯 MVP

**Goal**: Authenticated user can view and edit their own profile with API integration

**Independent Test**: 
- Navigate to profile screen → data loads from API with skeleton
- Click "Edit Profile" → form opens with current data
- Edit fields (name, bio, picture) and save → API updates, UI reflects change
- Verify form validation (email format, date format)

### Implementation for User Story 1

- [ ] T013 [P] [US1] Refactor ProfileHeader component `src/components/profile/ProfileHeader.tsx`: display user data, add "Edit" button, show skeleton while loading (depends on T010)
- [ ] T014 [P] [US1] Create ProfileEditForm component `src/components/profile/ProfileEditForm.tsx`: name, username, bio, profilePictureUrl, birthdayDate fields with validation (depends on T010, T008)
- [ ] T015 [US1] Integrate image picker for profile picture `src/components/profile/ProfileEditForm.tsx`: use expo-image-picker, generate pre-signed URL via uploadService (depends on T007, T014)
- [ ] T016 [US1] Connect ProfileEditForm to profileService.updateProfile() in `src/components/profile/ProfileEditForm.tsx`: save on submit, show error/success feedback (depends on T004, T014)
- [ ] T017 [US1] Add error handling + retry UI to ProfileEditForm `src/components/profile/ProfileEditForm.tsx`: handle 403, 401, 5xx via useRetry (depends on T008, T016)
- [ ] T018 [US1] Test form validation: email format, username, date format in ProfileEditForm
- [ ] T019 [US1] Test profile load performance: verify ≤2s on cold cache (SC-001)
- [ ] T020 [US1] Test edit response time: verify ≤1s after API response (SC-002)

**Checkpoint**: User Story 1 fully functional - profile view/edit works independently

---

## Phase 4: User Story 2 - Manage Collections (Priority: P1)

**Goal**: User can view, create, edit, and delete their collections via API

**Independent Test**:
- Navigate to Collections tab → list loads from API with pagination (10+ items)
- Click "New Collection" → modal opens, can create collection
- Click edit on collection → can update name/description/cover/visibility
- Click delete → modal prompt for delete strategy (Delete all / Move to Uncategorized)

### Implementation for User Story 2

- [ ] T021 [P] [US2] Refactor CollectionsTab component `src/components/profile/CollectionsTab.tsx`: fetch collections via useCollections hook, display list with pagination (depends on T011)
- [ ] T022 [P] [US2] Create CollectionEditModal component `src/components/profile/CollectionEditModal.tsx`: create/edit form with name, description, coverImageUrl, visibility, tags fields (depends on T011, T008)
- [ ] T023 [US2] Integrate image picker for collection cover `src/components/profile/CollectionEditModal.tsx`: generate pre-signed URL, handle upload (depends on T007, T022)
- [ ] T024 [US2] Connect CollectionEditModal to collectionAPIService `src/components/profile/CollectionEditModal.tsx`: POST (create), PATCH (update), DELETE (delete with strategy) (depends on T005, T022)
- [ ] T025 [US2] Implement delete strategy modal in CollectionsTab `src/components/profile/CollectionsTab.tsx`: "Delete all items" vs "Move to Uncategorized" choice (depends on T021, T024)
- [ ] T026 [US2] Add error handling + retry to CollectionsTab `src/components/profile/CollectionsTab.tsx`: handle API errors with useRetry (depends on T008, T021)
- [ ] T027 [US2] Test collection CRUD operations: create, read, update, delete scenarios
- [ ] T028 [US2] Test pagination: scroll load 10+ collections smoothly (SC-003)
- [ ] T029 [US2] Test offline mode: verify collections cached, writes blocked (FR-018)

**Checkpoint**: User Story 2 fully functional - collections management works independently

---

## Phase 5: User Story 3 - Manage Items (Priority: P2)

**Goal**: User can view, create, edit, and delete items within collections

**Independent Test**:
- From collection detail → ItemsGrid loads items from API with pagination
- Click "New Item" → modal opens, can create item with images
- Click edit → can update item details
- Click delete → item removed from API

### Implementation for User Story 3

- [ ] T030 [P] [US3] Create ItemsGrid component `src/components/profile/ItemsGrid.tsx`: fetch items via useItems hook, display paginated grid (depends on T012)
- [ ] T031 [P] [US3] Create ItemEditModal component `src/components/profile/ItemEditModal.tsx`: create/edit form with name, description, dates, multi-image URLs, attributes, tags (depends on T012, T008)
- [ ] T032 [US3] Integrate multi-image picker for items `src/components/profile/ItemEditModal.tsx`: upload multiple images via pre-signed URLs (depends on T007, T031)
- [ ] T033 [US3] Connect ItemEditModal to itemAPIService `src/components/profile/ItemEditModal.tsx`: POST (create), PATCH (update), DELETE (depends on T006, T031)
- [ ] T034 [US3] Add attribute manager for items `src/components/profile/ItemEditModal.tsx`: key-value pairs UI (depends on T031)
- [ ] T035 [US3] Add error handling + retry to ItemsGrid `src/components/profile/ItemsGrid.tsx`: handle API errors with useRetry (depends on T008, T030)
- [ ] T036 [US3] Test item CRUD operations: create, read, update, delete scenarios
- [ ] T037 [US3] Test multi-image upload: verify ≤5s for ≤5MB files (SC-004)
- [ ] T038 [US3] Test pagination: items list smooth scroll (SC-003)

**Checkpoint**: User Story 3 fully functional - items management works independently

---

## Phase 6: User Story 4 - View Other Profiles & Collections (Priority: P2)

**Goal**: Discover and view other users' PUBLIC profiles and collections

**Independent Test**:
- From collection detail → can navigate to collection owner's profile
- View other profile with visibility filtering applied (PUBLIC/PRIVATE/FRIENDS)
- Can follow/unfollow collection

### Implementation for User Story 4

- [ ] T039 [US4] Add visibility filtering logic to profileService `src/services/api/profileService.ts`: apply PUBLIC/PRIVATE/FRIENDS filtering when viewing other profile (depends on T004)
- [ ] T040 [US4] Create OtherProfileScreen component `src/app/(tabs)/profile/[userId].tsx`: display limited/full profile based on visibility (depends on T039, T013)
- [ ] T041 [US4] Add follow/unfollow actions to collectionAPIService `src/services/api/collectionAPIService.ts`: POST/DELETE `/collections/follow/{id}` (depends on T005)
- [ ] T042 [US4] Integrate follow button in CollectionsTab `src/components/profile/CollectionsTab.tsx`: show follow button when viewing other user (depends on T041, T021)
- [ ] T043 [US4] Test visibility filtering: verify correct access to PUBLIC/PRIVATE/FRIENDS profiles

**Checkpoint**: User Story 4 fully functional - profile discovery works

---

## Phase 7: Polish & Validation

**Purpose**: Cross-cutting concerns and final validation

- [ ] T044 [P] Audit all components for accessibility: touch targets, labels, contrast (SC-009, SC-010)
- [ ] T045 [P] Audit all components for design system compliance: NativeWind tokens, motion presets, reusable primitives
- [ ] T046 [P] Performance audit: profile load ≤2s, edit ≤1s, pagination smooth, media upload ≤5s (SC-001–SC-004)
- [ ] T047 [P] Error injection testing: simulate 400, 401, 403, 5xx, network timeouts; verify user messages (SC-006)
- [ ] T048 [P] Offline testing: enable offline mode, verify cache read, write blocked (FR-018)
- [ ] T049 Run `npm run validate`: lint, format, type-check pass
- [ ] T050 Update documentation: quickstart.md with integration examples + cache behavior
- [ ] T051 Code review + merge preparation: commit history clean, PR ready

**Checkpoint**: Feature complete and validated - ready for release

---

## Dependencies & Execution Order

### Critical Path

```
T001-T003 (Setup)
    ↓
T004-T012 (Foundational Services + Cache) ⚠️ BLOCKS all UI
    ↓
T013-T020 (US1: Profile) → Independent, testable
    ↓
T021-T029 (US2: Collections) → Independent, testable
    ↓
T030-T038 (US3: Items) → Independent, testable
    ↓
T039-T043 (US4: Other Profiles) → Independent, testable
    ↓
T044-T051 (Polish & Validation)
```

### Parallel Opportunities

- **Phase 2**: T009-T012 can run in parallel after T004-T007 complete
- **Phase 3+**: Once Phase 2 complete, US1-US4 can proceed in parallel (different components, no cross-story dependencies)
  - Developer A: US1 (T013-T020)
  - Developer B: US2 (T021-T029)
  - Developer C: US3 (T030-T038)
  - Developer D: US4 (T039-T043)
- **Phase 7**: T044-T050 can mostly run in parallel

### Within Each User Story

- Component refactor [P] tasks can run in parallel if different files
- Integration tasks sequence: hooks/services → components → error handling → testing

---

## Acceptance Criteria (from spec)

### Performance (SC-001–SC-004)
- ✅ Profile loads ≤2s (cold cache)
- ✅ Edit submit ≤1s after API response
- ✅ Collections/items list scrolls without lag (10+ items)
- ✅ Media upload ≤5s for ≤5MB

### Integration & Data (SC-005–SC-007)
- ✅ API responses match TypeScript interfaces (zero type mismatches)
- ✅ Error messages contextual (403, 401, 5xx, network, validation)
- ✅ Pagination works (page=0&size=10 returns correct subset)

### Validation & Security (SC-008–SC-010)
- ✅ Form validation prevents invalid submission
- ✅ 100% of API calls use Bearer token auth
- ✅ Rapid navigation doesn't crash or corrupt data

---

## Testing Strategy

- **Manual acceptance testing**: Navigate through each user story; verify acceptance scenarios
- **API contract testing**: Confirm request/response shapes match spec
- **Error injection**: Simulate 400, 401, 403, 5xx, network timeout; verify error handling
- **Offline testing**: Enable offline mode; verify read works, write blocked
- **Performance**: Measure profile load time, edit response time, pagination smoothness
- **Accessibility**: Verify touch targets, labels, contrast per constitution

---

## Known Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| Pre-signed URL flow complexity | Validate upload service contract early; test with real S3 (or mock if API not ready) |
| Cache invalidation on concurrent edits | Document "last write wins" behavior; show fresh data after edit |
| Image upload large files on slow networks | Implement progress tracking + ability to retry/cancel |
| Retry logic retry storm on sustained outage | Cap retries at 5; exponential backoff with jitter; show user message after retries exhaust |
| Offline mode data stale | Show "last updated X min ago" timestamp; offer "Refresh now" button |
| Performance regression from pagination | Test with 100+ collections/items; optimize list rendering (memoization, virtual lists if needed) |

---

## Deliverables

Upon completion:

1. ✅ research.md (Phase 0)
2. ✅ data-model.md (Phase 1)
3. ✅ contracts/ (Phase 1)
4. ✅ quickstart.md (Phase 1)
5. ✅ Updated `.github/copilot-instructions.md` with plan reference (Phase 1)
6. ✅ All components + services implemented (Phase 2)
7. ✅ Tests passing + manual acceptance verified (Phase 2)
8. ✅ PR ready with commit history documenting changes

---

## Checklist for Go/No-Go

### Before Phase 0 Research
- [x] Spec complete and clarified
- [x] Constitution check passed
- [x] Technical context documented

### Before Phase 1 Setup
- [x] Feature approved for development
- [ ] research.md complete + all unknowns resolved
- [ ] API endpoints validated vs OpenAPI spec

### Before Phase 2 Foundational
- [ ] research.md + data-model.md complete
- [ ] Service contracts designed (`/contracts/`)
- [ ] Cache infrastructure validated

### Before Phase 3+ User Stories
- [x] Phase 2 (Foundational) 100% complete
- [ ] All services (profileService, collectionAPIService, itemAPIService, uploadService) created
- [ ] All hooks (useProfile, useCollections, useItems, useRetry) implemented
- [ ] Cache layer working with TTL + stale-while-revalidate

### Before Merge
- [ ] All P1 tasks complete + tested (US1, US2)
- [ ] P2 tasks complete + tested (US3, US4)
- [ ] Error handling verified (all 5 error scenarios)
- [ ] Pagination works with 10+ items (SC-003)
- [ ] Offline-read mode tested (FR-018)
- [ ] Performance targets met (SC-001 to SC-004)
- [ ] Accessibility check passed (SC-009, SC-010)
- [ ] Code reviewed + lint/format clean
- [ ] npm run validate passes

---

**Status**: Ready for Phase 1 Setup  
**Next Command**: Execute Phase 1 tasks (T001-T003) to initialize project structure
