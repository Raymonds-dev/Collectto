# Tasks: API-Aligned Item and Collection Creation

**Feature**: [API-Aligned Item and Collection Creation](spec.md)
**Status**: Complete
**Plan**: [Implementation Plan](plan.md)

## Implementation Strategy

We will follow an incremental delivery approach, starting with the refactoring of shared UI components, followed by data model alignment, and finally implementing the rich creation and update flows. The "Debug Mode" (ephemeral storage) will be used for immediate validation while keeping the interfaces API-ready.

## Phase 1: Setup & Refactoring

Focus: Extracting shared components and preparing the codebase for the new fields.

- [x] T001 Refactor `DatePicker` logic from `src/app/(auth)/user_create.tsx` to `src/components/ui/DatePicker.tsx`
- [x] T002 Update `src/app/(auth)/user_create.tsx` to use the new `DatePicker` component
- [x] T003 [P] Create `TagInput` component with chip-based interface in `src/components/ui/TagInput.tsx`
- [x] T004 [P] Create `AttributeInput` component with dynamic "Key: Value" row interface in `src/components/ui/AttributeInput.tsx`

## Phase 2: Foundational Data Models

Focus: Aligning TypeScript types and mocks with the API Swagger.

- [x] T005 Update `ItemResponse` and `CreateItemRequest` in `src/types/items.ts` to include acquisition/usage dates, attributes, and tags
- [x] T006 Update `CollectionResponse` and `CreateCollectionRequest` in `src/types/collections.ts` to include visibility, tags, and cover image
- [x] T007 [P] Update `src/mocks/items.ts` and `src/mocks/profile.ts` to support persistence of the new API fields in Debug Mode
- [x] T008 [P] Update `src/mocks/collections.ts` and `src/mocks/profile.ts` to ensure collections are tracked within the profile context for updates
- [x] T009 [P] Standardize naming in `src/types/items.ts` and `src/types/collections.ts` (e.g., `imagesURL` to `imageFilesUrls`) to match Swagger naming convention (SC-001)

## Phase 3: User Story 1 - Comprehensive Item Creation (Priority: P1)

Goal: Implement the rich item creation flow.
Test: User can create an item with all fields and verify metadata in Debug Mode.

- [x] T010 [US1] Integrate `DatePicker` for `acquisitionDate` and `lastUsedDate` in `src/components/create-item/ItemForm.tsx`
- [x] T011 [US1] Integrate `TagInput` for multiple tags in `src/components/create-item/ItemForm.tsx`
- [x] T012 [US1] Integrate `AttributeInput` for dynamic metadata in `src/components/create-item/ItemForm.tsx`
- [x] T013 [US1] Update `src/components/create-item/CreateItemFlow.tsx` to handle the expanded item state and save to mock storage

## Phase 4: User Story 2 - Comprehensive Collection Creation (Priority: P1)

Goal: Implement the rich collection creation flow.
Test: User can create a collection with visibility, tags, and cover image.

- [x] T014 [US2] Add visibility picker (Public, Private, Friends) to `src/components/create-item/CollectionCreationForm.tsx`
- [x] T015 [US2] Integrate `TagInput` for collection tags in `src/components/create-item/CollectionCreationForm.tsx`
- [x] T016 [US2] Ensure `description` field is optional in `src/components/create-item/CollectionCreationForm.tsx`
- [x] T017 [US2] Update `src/components/create-item/CollectionCreator.tsx` to handle the expanded collection state

## Phase 5: User Story 3 - Updating Items and Collections (Priority: P2)

Goal: Implement the update/edit flow for existing items and collections.
Test: User can edit metadata and verify changes persist in the profile context.

- [x] T018 [US3] Implement edit mode in `src/components/create-item/ItemForm.tsx` using `UpdateItemRequest` schema, fetching data from `src/mocks/profile.ts`
- [x] T019 [US3] Implement edit mode in `src/components/create-item/CollectionCreationForm.tsx` using `UpdateCollectionRequest` schema, fetching data from `src/mocks/profile.ts`
- [x] T020 [US3] Update persistence logic in `src/mocks/profile.ts` to handle item/collection update operations during the Debug session

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T021 Add accessibility labels to new UI components (DatePicker, TagInput, AttributeInput)
- [x] T022 [P] Ensure error feedback is informative for invalid date or missing mandatory fields in creation flows
- [x] T023 Final verification of Debug Mode session persistence for all new fields
- [x] T024 [US1] Verify that a "rich" item creation flow (5+ fields) can be completed in under 1 minute (SC-002)
- [x] T025 Perform regression testing on the basic creation flow (name/desc/photo) to ensure zero regressions (SC-004)

## Dependencies

- Phase 1 must be completed before Phase 3 and 4.
- Phase 2 (Foundational) must be completed before UI integration.
- US3 (Phase 5) depends on the form updates in US1 and US2.

## Parallel Execution Examples

- T003, T004, T007, T008, T009 can be worked on simultaneously by different developers.
- T022 can be implemented in parallel with Phase 5.
