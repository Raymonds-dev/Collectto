# Implementation Tasks: Item and Collection Creation Flow

**Feature Branch**: `002-add-item-collection`  
**Specification**: `specs/002-add-item-collection/spec.md`  
**Implementation Plan**: `specs/002-add-item-collection/plan.md`  
**Status**: Ready for Implementation  
**Total Tasks**: 48

---

## Overview

This feature implements item and collection creation with four independent user stories (3 P1, 1 P2). The implementation is organized in phases to enable parallel development:

- **Phase 1**: Setup (project structure + dependencies)
- **Phase 2**: Foundational (photo storage, permissions, mock services)
- **Phase 3**: US1 - Photo Permissions & Device Access
- **Phase 4**: US2 - Create Item in Existing Collection
- **Phase 5**: US3 - Create Collection While Creating Item
- **Phase 6**: US4 - Create Item Without Collection
- **Phase 7**: Polish & Testing

---

## Phase 1: Setup

### Goal

Initialize project structure, install dependencies, and prepare foundations.

### Independent Test

Project builds successfully with all dependencies installed; no runtime errors on app startup.

---

- [x] T001 Create project directories for item creation feature in `src/components/create-item/`, `src/services/photo-storage/`, `src/mocks/items/`, `src/mocks/collections/`, `src/hooks/`

- [x] T002 Install dependencies: `expo-media-library`, `react-native-image-crop-picker`, `expo-permissions`, `expo-file-system` via `npm install`

- [x] T003 Create TypeScript interfaces and contracts in `src/types/items.ts`, `src/types/collections.ts`, `src/types/photo-storage.ts` (import from `specs/002-add-item-collection/contracts/`)

- [x] T004 Setup Context providers directory: create `src/providers/ItemContextProvider.tsx`, `src/providers/CollectionContextProvider.tsx` with empty exports

- [x] T005 Create main entry component `src/components/create-item/CreateItemFlow.tsx` (shell component)

---

## Phase 2: Foundational

### Goal

Build foundational infrastructure: photo storage abstraction, permission system, mock services, and context providers.

### Independent Test

- Photo storage provider saves/moves files without errors
- Permission hooks request permissions on demand
- Mock services create/retrieve items and collections
- Context providers work in React components

---

### PhotoStorageProvider Abstraction

- [x] T006 [P] Create `src/services/photo-storage/types.ts` with PhotoStorageProvider interface (import from `specs/002-add-item-collection/contracts/PhotoStorageProvider.ts`)

- [x] T007 [P] Create `src/services/photo-storage/local-provider.ts` implementing LocalStorageProvider with:
  - `saveToLocal()` - copies photo to `${FileSystem.documentDirectory}collectto/photos/temp/`
  - `moveToPermament()` - moves file to permanent directory with metadata
  - `delete()` - removes file from storage
  - `cleanupLocal()` - removes files older than 24 hours

- [x] T008 [P] Create `src/services/photo-storage/factory.ts` exporting `createPhotoStorageProvider()` factory function (returns LocalStorageProvider currently)

- [x] T009 [P] Create `src/services/photo-storage/index.ts` barrel export with all photo storage functions

### Permission System

- [x] T010 [P] Create `src/hooks/usePhotoPermissions.ts` hook with:
  - `requestCameraPermission()` - requests camera access
  - `requestGalleryPermission()` - requests photo library access
  - `hasPermission` state tracking
  - Error handling and permission status checking

- [x] T011 [P] Create `src/hooks/usePhotoSource.ts` hook to abstract camera/gallery picker with:
  - `launchCamera()` - opens camera using `react-native-image-crop-picker`
  - `launchGallery()` - opens photo picker
  - Error handling and cancellation support

### Mock Services

- [x] T012 [P] Create `src/mocks/items/types.ts` - mock service types and test fixtures

- [x] T013 [P] Create `src/mocks/items/index.ts` implementing MockItemService:
  - `create(input)` - creates item with generated UUID
  - `getById(itemId)` - retrieves item from Map
  - `getByCollection(collectionId)` - filters items by collection
  - `update(itemId, input)` - updates existing item
  - `delete(itemId)` - soft deletes item
  - `getUserItems(userId)` - returns all user items

- [x] T014 [P] Create `src/mocks/collections/types.ts` - mock service types and test fixtures

- [x] T015 [P] Create `src/mocks/collections/index.ts` implementing MockCollectionService:
  - `create(input)` - creates collection with generated UUID
  - `getById(collectionId)` - retrieves collection from Map
  - `getMe()` - returns current user's collections
  - `update(collectionId, input)` - updates collection
  - `delete(collectionId)` - soft deletes collection
  - `getItemCount(collectionId)` - returns item count

### Context Providers

- [x] T016 [P] Create `src/providers/ItemContextProvider.tsx` with:
  - ItemContext wrapping MockItemService
  - `useItemService()` hook for component access
  - Memoization for performance

- [x] T017 [P] Create `src/providers/CollectionContextProvider.tsx` with:
  - CollectionContext wrapping MockCollectionService
  - `useCollectionService()` hook for component access
  - Memoization for performance

- [x] T018 Create `src/providers/index.tsx` barrel export combining all providers as `createItemCollectionProviders()` wrapper

### Custom Hook for Form State

- [x] T019 Create `src/hooks/useItemCreation.ts` managing item creation state:
  - `formData` state (name, description, collection_id)
  - `localPhotos` array (temporary photo references)
  - `addPhoto(photoData)` - adds photo via PhotoStorageProvider
  - `removePhoto(tempId)` - removes photo from local array
  - `setFormField(field, value)` - updates metadata
  - `selectCollection(collectionId)` - sets collection
  - `reset()` - clears form state

---

## Phase 3: User Story 1 - Photo Permissions & Device Access (P1)

**Story Goal**: Users can grant camera and gallery permissions and access device photos/camera.

**Acceptance Criteria**:

- Permission dialogs appear on iOS and Android
- Camera capture works after permission grant
- Gallery selection works after permission grant
- Graceful messaging on permission denial
- Retry option links to app settings

**Independent Test**: Complete user story 1 independently by:

1. Tapping "+" button (mocked)
2. System requests permissions
3. Granting permissions
4. Camera/gallery opens and works

---

- [x] T020 [US1] Create `src/components/create-item/PermissionGate.tsx` component:
  - Checks camera and gallery permissions on mount
  - Displays permission request buttons if not granted
  - Passes through to children if permissions granted
  - Shows inline error message with link to settings on denial

- [x] T021 [US1] Create `src/components/create-item/PhotoPicker.tsx` component:
  - Button to open camera (uses `usePhotoSource` hook)
  - Button to open gallery (uses `usePhotoSource` hook)
  - Permission request handling via `usePhotoPermissions`
  - Displays captured/selected photo to parent
  - Handles errors and cancellation gracefully

- [x] T022 [US1] Create `src/components/create-item/PhotoGallery.tsx` component:
  - Displays array of local photo references
  - Shows preview thumbnail for each photo
  - "Remove" button per photo
  - Horizontal scroll gallery layout
  - Uses Tailwind tokens for styling

- [x] T023 [US1] Create `src/components/create-item/PhotoPreview.tsx` component:
  - Displays single photo with remove button
  - Responsive image sizing
  - Accessibility labels and touch targets

- [x] T024 [US1] Create `src/app/(tabs)/create-item.tsx` screen:
  - Wraps `CreateItemFlow` component
  - Sets up route parameters and navigation context
  - Handles back navigation and cleanup

- [x] T025 [US1] Update `src/app/(tabs)/_layout.tsx` to add "+" button:
  - Button navigates to create-item screen
  - Uses existing tab layout button styling
  - Positioned in header or footer (per design)

- [x] T026 [US1] Create `src/hooks/usePhotoPermissionsFlow.ts` custom hook:
  - Orchestrates permission request flow
  - Tracks permission grant status
  - Provides error messaging
  - Retry logic for denied permissions

- [x] T027 [US1] [P] Implement `src/components/create-item/PermissionRequest.tsx` component:
  - Shows permission request explanation
  - "Allow" button triggers permission request
  - "Deny" button shows alternatives or app settings link
  - Accessibility labels included

- [x] T028 [US1] [P] Create mock test data in `src/mocks/__fixtures__/photos.ts`:
  - Sample photo URIs for testing
  - Photo metadata (size, dimensions, MIME type)

---

## Phase 4: User Story 2 - Create Item in Existing Collection (P1)

**Story Goal**: Users can add items to existing collections with photos, name, and description.

**Acceptance Criteria**:

- Item form accepts name (mandatory) and description (optional)
- Photos displayed in gallery with remove option
- Existing collections loaded and selectable
- Item saved with all metadata and assigned to collection
- Success confirmation shown
- User returned to appropriate screen

**Independent Test**: Complete user story 2 by:

1. Permission flow passes (US1)
2. Adding 2+ photos
3. Entering name and description
4. Selecting existing collection
5. Tapping save
6. Confirming item created

---

- [ ] T029 [US2] Create `src/components/create-item/ItemForm.tsx` component:
  - Text input for item name (mandatory, max 255 chars)
  - Text input for item description (optional)
  - Display validation errors inline
  - Focus management between fields
  - Uses Tailwind + existing UI components

- [ ] T030 [US2] Create `src/components/create-item/CollectionSelector.tsx` component:
  - Fetches user collections via `useCollectionService()`
  - Displays collection list (name + cover image if available)
  - "Create new collection" option at bottom
  - Selection state management
  - Loading skeleton while fetching

- [ ] T031 [US2] Create `src/components/create-item/CollectionListItem.tsx` component:
  - Shows collection cover image (or placeholder)
  - Shows collection name
  - Selection indicator
  - Touch target size ≥44pt (iOS) / ≥48dp (Android)

- [ ] T032 [US2] Create `src/components/create-item/ItemMetadataForm.tsx` component:
  - Combines PhotoGallery + ItemForm + CollectionSelector
  - Step-by-step layout (or all on one screen)
  - Validates: ≥1 photo, name provided, collection selected
  - "Save" button enabled only when valid

- [ ] T033 [US2] Create `src/hooks/useItemSave.ts` hook:
  - `saveItem()` async function
  - Migrates photos from local to permanent storage
  - Creates item via `useItemService()`
  - Handles errors and retries
  - Returns saved item or error

- [ ] T034 [US2] [P] Create `src/components/create-item/SaveButton.tsx` component:
  - Shows "Save" text
  - Disabled during save
  - Shows loading state (spinner or text)
  - Accessibility role and label
  - Uses existing Button component from `src/components/ui/`

- [ ] T035 [US2] [P] Create `src/components/create-item/ItemSaveFlow.tsx` component:
  - Orchestrates save flow:
    - Validate form data
    - Show loading state
    - Migrate photos via PhotoStorageProvider
    - Create item via ItemService
    - Show success confirmation
    - Navigate back on success
  - Error handling with retry option

- [ ] T036 [US2] Create `src/components/create-item/SuccessConfirmation.tsx` component:
  - Shows success message
  - Displays created item thumbnail
  - "Done" button to navigate back
  - Uses motion preset (FadeIn per constitution)

- [ ] T037 [US2] Update `src/components/create-item/CreateItemFlow.tsx` main component:
  - Combines PermissionGate + PhotoPicker + ItemMetadataForm + ItemSaveFlow
  - State management via `useItemCreation` hook
  - Error boundaries for graceful failure
  - Cleanup on unmount (cancel in-progress saves)

- [ ] T038 [US2] [P] Create `src/mocks/items/fixtures.ts` with sample items and collections for testing

---

## Phase 5: User Story 3 - Create Collection While Creating Item (P1)

**Story Goal**: Users can create collections inline during item creation without losing progress.

**Acceptance Criteria**:

- "Create new collection" option available in CollectionSelector
- Collection form shown (name mandatory, description + cover optional)
- New collection created and selected for current item
- Item and collection both saved together
- No loss of item progress during collection creation

**Independent Test**: Complete user story 3 by:

1. US2 flow up to collection selection
2. Tapping "Create new collection"
3. Entering collection name
4. Optionally adding cover image
5. Confirming collection created
6. Completing item save in new collection

---

- [ ] T039 [US3] Create `src/components/create-item/CollectionCreator.tsx` component:
  - Text input for collection name (mandatory)
  - Text input for description (optional)
  - Photo picker for cover image (optional)
  - Validation: name required, max lengths enforced
  - "Create" and "Cancel" buttons

- [ ] T040 [US3] Create `src/components/create-item/CollectionCreationForm.tsx` wrapper:
  - Expands CollectionSelector to show inline creation form
  - SlideUp animation for smooth UX (per motion presets)
  - State management for form visibility toggle
  - Delegates to CollectionCreator component

- [ ] T041 [US3] Create `src/hooks/useCollectionCreation.ts` hook:
  - `createCollection()` async function
  - Migrates cover image from local to permanent storage (if provided)
  - Creates collection via `useCollectionService()`
  - Returns created collection or error
  - Handles errors with retry option

- [ ] T042 [US3] Update `src/components/create-item/ItemSaveFlow.tsx`:
  - Check if new collection was created during flow
  - If new collection: save collection first, then item
  - Ensure both collection_id is set on item before save
  - Transaction-like behavior (both succeed or both fail)

- [ ] T043 [US3] Create `src/components/create-item/CollectionCreationSuccess.tsx` component:
  - Shows "Collection created" confirmation
  - Displays collection name and cover
  - Auto-closes or shows "Continue" button
  - Uses FadeIn motion preset

- [ ] T044 [US3] [P] Update `src/mocks/collections/index.ts`:
  - Enhance to support creating collections during item flow
  - Track user_id for filtering collections

- [ ] T045 [US3] [P] Create `src/components/create-item/CollectionCoverPreview.tsx` component:
  - Shows selected cover image preview
  - Remove button to clear selection
  - Placeholder for no cover selected

---

## Phase 6: User Story 4 - Create Item Without Collection (P2)

**Story Goal**: Users can create items without collection assignment for later organization.

**Acceptance Criteria**:

- Option to skip collection selection
- Item saved without collection_id (null)
- Item clearly marked as "Uncategorized" when viewed
- Can assign collection later when editing item

**Independent Test**: Complete user story 4 by:

1. US2 flow up to collection selection
2. Tapping "Skip" or "Create without collection"
3. Completing item save without collection
4. Item created with collection_id = null

---

- [ ] T046 [US4] Update `src/components/create-item/CollectionSelector.tsx`:
  - Add "Create without collection" or "Skip" button
  - Option to proceed with null collection_id
  - Clear messaging about uncategorized items

- [ ] T047 [US4] Update `src/components/create-item/ItemMetadataForm.tsx`:
  - Make collection selection optional
  - Adjust validation to allow null collection_id
  - Show "Optional" label next to collection step

- [ ] T048 [US4] Create `src/components/create-item/UncategorizedIndicator.tsx` component:
  - Shows "Uncategorized" badge for items without collection
  - Visual indicator (color, icon, or text)
  - Used in item display/list views

---

## Phase 7: Polish & Testing

### Goal

Validate all user stories work correctly, handle edge cases, optimize performance, and ensure quality.

### Testing Scope

- Permission denial handling and retry flow
- Storage limit warnings (500 MB)
- Error states and recovery
- Performance: photo loading, list rendering
- Accessibility: labels, touch targets, screen readers
- Constitution compliance: motion, visual hierarchy, component reuse

---

- [ ] T049 Create unit tests for `src/services/photo-storage/local-provider.ts`:
  - Test saveToLocal creates files correctly
  - Test moveToPermament copies files to permanent location
  - Test delete removes files
  - Test cleanupLocal removes old files

- [ ] T050 Create unit tests for `src/mocks/items/index.ts`:
  - Test create returns item with generated ID
  - Test getById retrieves item
  - Test getByCollection filters correctly
  - Test update modifies fields
  - Test delete soft-deletes

- [ ] T051 Create unit tests for `src/mocks/collections/index.ts`:
  - Test create returns collection with generated ID
  - Test getById retrieves collection
  - Test getMe returns user's collections
  - Test update modifies fields
  - Test getItemCount returns correct count

- [ ] T052 Create integration test for US1 (Photo Permissions):
  - Test permission request flow
  - Test camera capture after permission grant
  - Test gallery selection after permission grant
  - Test graceful handling of permission denial

- [ ] T053 Create integration test for US2 (Create Item):
  - Test full item creation flow
  - Test item saved with correct collection_id
  - Test photos migrated to permanent storage
  - Test success confirmation shown

- [ ] T054 Create integration test for US3 (Create Collection):
  - Test collection creation during item flow
  - Test new collection selected for item
  - Test both item and collection persisted

- [ ] T055 Create integration test for US4 (Uncategorized):
  - Test item created with null collection_id
  - Test item marked as uncategorized
  - Test no errors without collection

- [ ] T056 Validate accessibility:
  - Add accessibilityLabel to all buttons
  - Add accessibilityRole to form inputs
  - Ensure touch targets ≥44pt (iOS) / ≥48dp (Android)
  - Test with screen readers (VoiceOver/TalkBack)

- [ ] T057 Validate constitution compliance:
  - Verify photos are visual focus (not text-first)
  - Verify motion uses only official presets (SlideUp, FadeIn, etc.)
  - Verify component reuse (no duplicates)
  - Verify collection cover emphasized
  - Verify no dense text blocks

- [ ] T058 Performance optimization:
  - Profile photo loading and rendering
  - Optimize image sizes (scale appropriately)
  - Add React.memo to photo gallery items
  - Ensure collection list loads in <1s

- [ ] T059 Error handling & edge cases:
  - Test permission denial retry flow
  - Test storage limit warning (500 MB)
  - Test network errors (mock service errors)
  - Test form validation (empty name, no photos)
  - Test cancellation at each step

- [ ] T060 Run `npm run lint` and fix any issues

- [ ] T061 Run `npm run type-check` and fix any type errors

- [ ] T062 Run `npm run format` and ensure formatting is clean

- [ ] T063 Run `npm run validate` (full test suite) and verify all tests pass

- [ ] T064 Documentation:
  - Add JSDoc comments to all public functions
  - Document service interfaces with examples
  - Add README.md in `src/components/create-item/` explaining component hierarchy
  - Add comments explaining PhotoStorageProvider abstraction

---

## Task Dependencies & Parallel Execution

### Dependency Graph

```
Phase 1: Setup
  └─ T001-T005: Project structure (sequential, ~2 tasks in parallel)

Phase 2: Foundational
  ├─ Photo Storage: T006-T009 (can run in parallel)
  ├─ Permissions: T010-T011 (can run in parallel)
  ├─ Mock Services: T012-T015 (can run in parallel)
  ├─ Contexts: T016-T018 (depends on mock services)
  └─ Hooks: T019 (depends on contexts and storage)

Phase 3: US1 (Photo Permissions)
  └─ T020-T028 (most can run in parallel, T025 depends on T024)

Phase 4: US2 (Create Item)
  ├─ Item Form: T029-T035 (most in parallel, T035 depends on T033)
  ├─ Save Flow: T036-T037 (depends on all above)
  └─ Layout: T038 (depends on T037)

Phase 5: US3 (Create Collection)
  ├─ Collection Creator: T039-T041 (in parallel)
  ├─ Save Flow: T042 (depends on US2 + T041)
  └─ UI: T043-T045 (depends on T042)

Phase 6: US4 (Uncategorized)
  └─ T046-T048 (all depend on US2)

Phase 7: Testing
  └─ T049-T064 (after implementation phases)
```

### Parallel Execution Examples

**Week 1 - Setup & Foundational** (can assign to team members):

- Dev A: Photo Storage (T006-T009)
- Dev B: Permissions (T010-T011)
- Dev C: Mock Services (T012-T015)
- Dev D: Contexts (T016-T018, wait for Dev C)
- Dev D then: Custom Hooks (T019, wait for Dev A & C)

**Week 2 - User Stories** (after Phase 2 complete):

- Dev A: US1 Photo Permissions (T020-T028)
- Dev B: US2 Item Creation (T029-T038)
- Dev C: US3 Collection Creation (T039-T045, wait for Dev B)
- Dev D: US4 Uncategorized (T046-T048, wait for Dev B)

**Week 3 - Testing & Polish**:

- All: Unit Tests (T049-T055, tasks independent)
- All: Accessibility & Compliance (T056-T057)
- All: Performance & Edge Cases (T058-T059)
- All: Code Quality (T060-T064)

---

## Implementation Strategy

### MVP Scope (Recommended for v1)

Start with User Stories 1 + 2 only:

- US1: Photo permissions & device access
- US2: Create item in existing collection

**MVP Tasks**: T001-T038 (~38 tasks, ~2-3 weeks)

**Why**: Covers core creation flow without collection management complexity. US3 (create collection) and US4 (uncategorized) can follow in v1.1.

### Full Scope (v1 complete)

Include all 4 user stories:

- US1 + US2 + US3 + US4

**Full Tasks**: T001-T064 (~64 tasks, ~4-5 weeks including testing)

### Incremental Delivery

1. **Increment 1**: Phase 1 + Phase 2 (setup + foundational)
2. **Increment 2**: Phase 3 (US1 - permissions)
3. **Increment 3**: Phase 4 (US2 - create item)
4. **Increment 4**: Phase 5 (US3 - create collection)
5. **Increment 5**: Phase 6 (US4 - uncategorized)
6. **Increment 6**: Phase 7 (testing + polish)

Each increment is deployable independently.

---

## Notes

- **Mock Services**: Persist in memory only. For persistence during development, consider adding localStorage layer later.
- **Photo Storage**: Uses local device storage initially. Cloud integration ready via PhotoStorageProvider swapping.
- **Validation**: Form validation shown inline immediately; no blocking validation modals.
- **Error Handling**: All errors caught and displayed inline; retry options provided.
- **Accessibility**: All interactive elements have labels and appropriate touch targets.
- **Performance**: Photos optimized for mobile; no unoptimized full-res images in UI.
- **Testing**: Unit tests for services; integration tests for user stories; accessibility testing required.

---

## Checklist Format Validation

All tasks follow strict format:

- ✅ Checkbox: `- [ ]`
- ✅ Task ID: Sequential (T001, T002, ...)
- ✅ [P] marker: Only for parallelizable tasks
- ✅ [Story] label: Only for user story phases (US1, US2, US3, US4)
- ✅ Description: Clear action with file paths

Example: `- [ ] T020 [US1] Create PermissionGate in src/components/create-item/PermissionGate.tsx`

---

## Summary

| Metric                         | Count                             |
| ------------------------------ | --------------------------------- |
| **Total Tasks**                | 64                                |
| **Setup Phase**                | 5 tasks                           |
| **Foundational Phase**         | 14 tasks                          |
| **US1 (Photo Permissions) P1** | 9 tasks                           |
| **US2 (Create Item) P1**       | 10 tasks                          |
| **US3 (Create Collection) P1** | 7 tasks                           |
| **US4 (Uncategorized) P2**     | 3 tasks                           |
| **Testing & Polish Phase**     | 16 tasks                          |
| **Parallelizable Tasks**       | 28 [P]                            |
| **Estimated Duration**         | 4-5 weeks (full), 2-3 weeks (MVP) |

---

## Ready for Execution

Branch: `002-add-item-collection` ✓ Active  
Specification: `specs/002-add-item-collection/spec.md` ✓ Complete  
Plan: `specs/002-add-item-collection/plan.md` ✓ Complete  
Tasks: This document ✓ Complete

**Next**: Assign tasks to team members and begin Phase 1 setup.
