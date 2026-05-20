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

## Phase 0: Outline & Research

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

### Output: research.md

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

## Phase 2: Implementation (High-Level Breakdown)

### P1 Tasks (Foundational)

**Task 001: Create profileService**
- GET `/users/{userId}` with retry logic
- PATCH `/users/update` with context-specific error handling
- Integrate with existing auth context for userId

**Task 002: Create collectionAPIService**
- GET `/collections/by-user/{userId}` with pagination
- POST `/collections/create`, PATCH `/collections/update`, DELETE `/collections/{id}`
- Handle `deleteWithStrategy` pattern (reference debug service logic, don't import)

**Task 003: Create itemAPIService**
- GET `/items/by-collection/{collectionId}` with pagination
- GET `/items/{collectionId}/{itemId}` for detail view
- POST `/items/create`, PATCH `/items/update`, DELETE `/items/{id}`

**Task 004: Create uploadService**
- POST `/uploads/presigned-urls` with context routing (PROFILE_PICTURE, PROFILE_BACKGROUND, COLLECTION, ITEM)
- Coordinate with collectionAPIService and itemAPIService for final save

**Task 005: Implement cache layer with stale-while-revalidate**
- 5-minute TTL using AsyncStorage
- Background revalidation hooks (useProfile, useCollections, useItems)
- Offline-read mode (use cache when offline; block writes)

**Task 006: Refactor ProfileHeader component**
- Display user data (name, username, bio, pictures, counts)
- "Edit Profile" button → modal/sheet
- Loading skeleton while fetching
- Error state with retry button

**Task 007: Create ProfileEditForm component**
- Editable fields: name, username, bio, profilePictureUrl, profileBackgroundUrl, birthdayDate
- Image picker integration
- Form validation (email, username, date format)
- Save with retry logic + error feedback

**Task 008: Refactor CollectionsTab component**
- List user collections from API with pagination
- Empty state + loading skeleton
- Collection cards with covers, item count, follower count
- Edit/Delete actions for each collection
- Create collection button

**Task 009: Create CollectionEditModal component**
- Create or edit collection
- Fields: name, description, coverImageUrl, visibility, tags
- Image upload with pre-signed URLs
- Form validation

**Task 010: Refactor ItemsGrid component**
- List collection items with pagination
- Empty state + loading skeleton
- Item cards with thumbnails, name, metadata
- Edit/Delete actions
- Create item button

**Task 011: Create ItemEditModal component**
- Create or edit item
- Fields: name, description, acquisitionDate, lastUsedDate, imageFilesUrls, attributes, tags
- Multi-image upload with pre-signed URLs
- Form validation + attribute manager

**Task 012: Implement error handling + retry layer**
- useRetry hook (exponential backoff, max 5 retries, filter permanent errors)
- Context-specific error messages (403 → "No permission", 401 → re-auth, 5xx → "Server unavailable")
- Retry UI (inline button or banner)

### P2 Tasks (Enhancement)

**Task 013: View other users' profiles**
- GET `/users/{userId}` with visibility filtering (apply PUBLIC/PRIVATE/FRIENDS logic)
- Display limited vs full profile based on access level
- Follow/unfollow actions

**Task 014: Item detail screen with comments/likes**
- GET `/items/{collectionId}/{itemId}` with full metadata
- Display likes/comments pagination
- Like/unlike toggle
- Comment form (if in scope)

**Task 015: Collection follow/unfollow**
- POST `/collections/follow/{collectionId}`
- DELETE `/collections/follow/{collectionId}` (unfollow)
- Update UI state + follower count

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

### Before Phase 1 Design
- [ ] research.md complete + all unknowns resolved
- [ ] API endpoints validated vs OpenAPI spec
- [ ] Cache infrastructure reviewed

### Before Phase 2 Implementation
- [ ] data-model.md + contracts complete
- [ ] quickstart.md written for developers
- [ ] Agent context updated
- [ ] Constitution re-checked on designs

### Before Merge
- [ ] All P1 tasks complete + tested
- [ ] Error handling verified (all 5 error scenarios)
- [ ] Pagination works with 10+ items
- [ ] Offline-read mode tested
- [ ] Performance targets met
- [ ] Accessibility check passed
- [ ] Code reviewed + lint/format clean
- [ ] npm run validate passes

---

**Status**: Ready for Phase 0 Research  
**Next Command**: Proceder com planejamento detalhado de tarefas
