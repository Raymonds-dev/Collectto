# Tasks: Collection & Item Management

**Generated**: 2026-05-18
**Plan**: [plan.md](plan.md)
**Spec**: [spec.md](spec.md)

## Phase 1 — Types & Contracts

- [x] **T-001**: Add management types to `src/types/collections.ts` (DeleteCollectionRequest, DeleteCollectionItemsStrategy, MoveItemCommand, isSystem field)
- [x] **T-002**: Add management types to `src/types/items.ts` (DeleteItemRequest, MoveItemCommand, MoveItemsBulkCommand)

## Phase 2 — Debug Provider Enhancements

- [x] **T-003**: Extend `mockCollectionService` with `deleteWithStrategy` (move items to uncategorized or delete all)
- [x] **T-004**: Extend `mockItemService` with `moveItem`, `moveItemsBulk`, `deleteItemsBulk`
- [x] **T-005**: Add "Sem categoria" system collection to debug seed data

## Phase 3 — Edit Collection Screen

- [x] **T-006**: Create `EditCollectionScreen` route at `src/app/(tabs)/collections/edit/[collectionId].tsx`
- [x] **T-007**: Create `CollectionEditForm` component (name, description, visibility, cover image, tags)
- [x] **T-008**: Create `CollectionItemsBulkList` component (item list with multi-select, bulk actions bar)
- [x] **T-009**: Add three-dot menu actions to collection view screen (Edit, Delete) for owner only
- [x] **T-010**: Implement delete collection modal with strategy choice (move to uncategorized / delete all items)

## Phase 4 — Edit Item Screen

- [x] **T-011**: Create `EditItemScreen` route at `src/app/(tabs)/collections/edit-item/[itemId].tsx`
- [x] **T-012**: Create `useItemEdit` hook (loads existing item, manages form state with pre-filled data)
- [x] **T-013**: Reuse `ItemMetadataForm` with pre-filled data for editing (add edit mode support)
- [x] **T-014**: Add three-dot menu actions to item detail view (Edit, Move, Delete) for owner only
- [x] **T-015**: Implement move item modal (select target collection)
- [x] **T-016**: Implement delete item confirmation modal

## Phase 5 — Wiring & Navigation

- [x] **T-017**: Register new routes in `(tabs)/_layout.tsx`
- [x] **T-018**: Wire collection view → edit collection navigation
- [x] **T-019**: Wire item detail → edit item navigation

## Phase 6 — Validation

- [x] **T-020**: Run `npm run validate` and fix any issues with `npm run validate:fix`

