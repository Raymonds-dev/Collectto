# Quickstart: Items & Collections CRUD Development

**Date**: 2026-06-07  
**Feature**: Items & Collections CRUD Integration  
**Phase**: 1 (Design & Contracts)

## Quick Reference

| Item | Details |
|------|---------|
| **Feature Branch** | `014-items-collections-crud` |
| **API Base URL** | http://89.167.89.185:8080 |
| **Auth** | Bearer token (existing interceptor) |
| **Debug Mode** | Via `src/services/debug/debugFlags.ts` |
| **Component Patterns** | Reuse from `src/components/create-item/` |
| **Service Pattern** | Mock + Real API dual mode |

---

## Development Setup

### 1. Enable Debug Mode (Recommended for Testing)

**File**: `src/services/debug/debugFlags.ts`

```typescript
export const DEBUG_MODE = true; // Toggle between mock and real API
```

**When DEBUG_MODE = true**:
- All CRUD operations use mockCollectionService + mockItemService
- Data stored in debugSession (in-memory)
- No real API calls
- Safe for testing forms and flows

**When DEBUG_MODE = false**:
- Real API calls to http://89.167.89.185:8080
- Requires valid auth token
- Persistent changes on backend

### 2. Local Development Flow

```bash
# Install dependencies (if not done)
npm install

# Start Expo app
npm run start

# In app:
# 1. Navigate to Profile
# 2. Look for "Create Collection" button
# 3. Fill form → Create
# 4. Collection appears in profile
# 5. Click collection → Add Item
# 6. Fill item form → Create
# 7. Item appears in collection
```

### 3. Test CRUD Operations in Order

| Step | Action | Expected Result | Files to Check |
|------|--------|-----------------|-----------------|
| 1 | CREATE collection | Appears in profile | `profile.tsx`, `CollectionCreationForm.tsx` |
| 2 | VIEW collection | Shows items grid | `[collectionId].tsx`, `CollectionItemsGrid.tsx` |
| 3 | CREATE item | Appears in collection | `ItemForm.tsx`, `ItemSaveFlow.tsx` |
| 4 | UPDATE collection | Changes reflected in profile | `CollectionEditForm.tsx` |
| 5 | UPDATE item | Changes reflected in grid | Edit item form (to be created) |
| 6 | DELETE item | Removed from collection | Confirm modal, then delete |
| 7 | DELETE collection | Removed from profile | Confirm modal, then delete |

---

## Service Layer Implementation Checklist

### Collections Service (src/services/api/api.ts)

```typescript
// ✅ MUST ADD - Collection endpoints

export const createCollection = async (
  req: CreateCollectionRequest
): Promise<CollectionResponse> => {
  // POST /collections/create
};

export const updateCollection = async (
  id: string,
  req: UpdateCollectionRequest
): Promise<CollectionResponse> => {
  // PATCH /collections/{id}
};

export const getCollection = async (id: string): Promise<CollectionResponse> => {
  // GET /collections/{id}
};

export const getCollectionsByUser = async (
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<CollectionResponse>> => {
  // GET /collections/by-user/{userId}?page=page&pageSize=pageSize
};

export const deleteCollection = async (id: string): Promise<void> => {
  // DELETE /collections/{id}
};
```

### Items Service (src/services/api/api.ts)

```typescript
// ✅ MUST ADD - Item endpoints

export const createItem = async (
  req: CreateItemRequest
): Promise<ItemResponse> => {
  // POST /items/create
};

export const updateItem = async (
  id: string,
  req: UpdateItemRequest
): Promise<ItemResponse> => {
  // PATCH /items/{id}
};

export const getItem = async (
  collectionId: string,
  itemId: string
): Promise<ItemResponse> => {
  // GET /items/{collectionId}/{itemId}
};

export const getItemsByCollection = async (
  collectionId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<ItemResponse>> => {
  // GET /items/by-collection/{collectionId}?page=page&pageSize=pageSize
};

export const deleteItem = async (id: string): Promise<void> => {
  // DELETE /items/{id}
};
```

### Mock Services (Already Complete)

✅ `src/services/debug/mockCollectionService.ts` — CRUD complete  
✅ `src/services/debug/mockItemService.ts` — CRUD complete  
✅ No changes needed; use as-is

---

## Component Implementation Checklist

### Forms & Inputs

| Component | Location | Status | Action |
|-----------|----------|--------|--------|
| CollectionCreationForm | `src/components/create-item/` | EXISTS | ✅ Reuse as-is for CREATE, extend for EDIT |
| ItemForm | `src/components/create-item/` | EXISTS | ✅ Reuse as-is for CREATE, extend for EDIT |
| CollectionEditForm | `src/components/collection/` | EXISTS | ✅ Verify integration with API |
| Edit item form | `src/app/collections/edit-item/[itemId].tsx` | NEW | 🔨 Create by extending ItemForm |

### Layouts & Displays

| Component | Location | Status | Action |
|-----------|----------|--------|--------|
| Profile screen | `src/app/(tabs)/profile.tsx` | EXISTS | ✅ Display collections, add action buttons |
| Collection view | `src/app/collections/[collectionId].tsx` | EXISTS | ✅ Show items grid, add action buttons |
| CollectionItemsGrid | `src/components/collection-items-grid/` | EXISTS | ✅ Reuse for displaying items |
| CollectionCover | `src/components/ui/` | EXISTS | ✅ Reuse in profile collections list |
| ItemCover | `src/components/ui/` | EXISTS | ✅ Reuse in collection items grid |

### Actions & Dialogs

| Component | Location | Status | Action |
|-----------|----------|--------|--------|
| Button | `src/components/ui/Button.tsx` | EXISTS | ✅ Reuse for all action buttons |
| Modal | `src/components/ui/Modal.tsx` | EXISTS | ✅ Reuse for delete confirmations |
| OptionsBar | `src/components/ui/OptionsBar.tsx` | EXISTS | ✅ Reuse for edit/delete menus |

---

## Route Structure (Proposed)

### Existing Routes (No Changes)

```
(auth)/
  - login
  - signup
  
(tabs)/
  - index (home/feed)
  - explore
  - profile ← MODIFY: show collections with actions
  - create-item ← USE: existing collection selector
  - settings/
  
collections/
  - [collectionId].tsx ← MODIFY: show items with actions
  - edit/[collectionId].tsx ← USE: existing form
```

### New Routes

```
collections/
  - edit-item/[itemId].tsx ← CREATE: item edit form
```

### Proposed Route Handlers for CRUD

| Route | Method | Action |
|-------|--------|--------|
| POST `/collections/create` | API | New collection via form |
| PATCH `/collections/{id}` | API | Update collection via form |
| DELETE `/collections/{id}` | API | Delete with confirmation |
| GET `/collections/{id}` | API | Load edit form data |
| POST `/items/create` | API | New item via form |
| PATCH `/items/{id}` | API | Update item via form |
| DELETE `/items/{id}` | API | Delete with confirmation |
| GET `/items/{collectionId}/{itemId}` | API | Load edit form data |

---

## Error Handling Patterns

### Validation Errors (Before API)

```typescript
// In form component
const errors = validateCollectionForm(formData);
if (Object.keys(errors).length > 0) {
  setFormErrors(errors);
  return; // Don't call API
}
```

### Network Errors (From API Interceptor)

```typescript
// In api interceptor
try {
  const response = await client.post(...);
  return response;
} catch (error) {
  // Transform to user-friendly message
  const userMessage = mapErrorToMessage(error);
  throw new AppError(userMessage);
}
```

### UI Error Display

```typescript
// In form component
{formError && (
  <ErrorAlert 
    message={formError.message} 
    onDismiss={() => setFormError(null)} 
  />
)}
```

---

## State Management Pattern

### Local Form State

```typescript
const [formData, setFormData] = useState<CreateCollectionRequest>({
  name: '',
  description: '',
  tags: [],
  visibility: 'PUBLIC',
});

const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Profile State (Global)

```typescript
// In AuthProvider or ProfileContext
const [collections, setCollections] = useState<CollectionResponse[]>([]);
const [items, setItems] = useState<ItemResponse[]>([]);
const [isLoadingCollections, setIsLoadingCollections] = useState(false);

// After CRUD operation
setCollections([...collections, newCollection]);
```

### Refresh Pattern

```typescript
// After create, update, delete
await refreshProfileCollections(); // Re-fetch from API or mock
```

---

## Testing Scenarios

### Test 1: Create Collection (Mock Mode)

```
1. Enable debug mode
2. Navigate to profile
3. Click "Create Collection"
4. Fill form (name: "My Books", description: "...", visibility: PUBLIC)
5. Click Save
6. Collection appears in profile with correct data
7. Collection shows in collections grid
```

**Files to verify**:
- `debugSession.ts` has new collection
- `profile.tsx` displays it
- UI shows no errors

### Test 2: Create Item in Collection (Mock Mode)

```
1. Profile shows collection
2. Click collection
3. Click "Add Item"
4. Fill form (name: "Item 1", description: "...")
5. Click Save
6. Item appears in collection grid
7. Collection shows updated item count
```

**Files to verify**:
- `debugSession.items` has new item
- `[collectionId].tsx` displays it
- Item count increments

### Test 3: Update Collection (Mock Mode)

```
1. Profile shows collection
2. Click "Edit" on collection card
3. Change name to "Updated Books"
4. Click Save
5. Return to profile
6. Collection name updated
```

**Files to verify**:
- `debugSession.collections` reflects change
- `profile.tsx` displays updated name
- No errors

### Test 4: Delete Item with Confirmation (Mock Mode)

```
1. Collection shows items
2. Click options on item (three dots)
3. Click "Delete"
4. Confirmation modal appears
5. Click "Confirm"
6. Item removed from grid
7. Item count decrements
```

**Files to verify**:
- Confirmation modal shows correctly
- `debugSession.items` has item removed
- `[collectionId].tsx` updates grid

### Test 5: Delete Collection with Confirmation (Mock Mode)

```
1. Profile shows collections
2. Click options on collection
3. Click "Delete"
4. Confirmation modal: "Confirma exclusão de [name]?"
5. Click "Confirm"
6. Collection removed from profile
7. All items deleted or moved (per strategy)
```

**Files to verify**:
- Confirmation modal shows correctly
- `debugSession.collections` has collection removed
- `profile.tsx` updates collections list

---

## Real API Testing Prerequisites

Before testing against http://89.167.89.185:8080:

1. ✅ Backend running and accessible
2. ✅ Valid JWT token in `debugSession.currentUser.token`
3. ✅ User has existing collection to test with
4. ✅ Images have valid presigned URLs (or upload works)
5. ✅ Network connectivity to backend

**To enable real API**:

```typescript
// src/services/debug/debugFlags.ts
export const DEBUG_MODE = false; // Switch to real API
```

---

## Development Workflow (Recommended)

### Phase 1: Mock Mode (Days 1-2)

- [ ] Set up service layer (5 collection + 5 item endpoints)
- [ ] Create edit forms (extend existing)
- [ ] Add route handlers for edit screens
- [ ] Test CRUD in mock mode (all 7 scenarios above)
- [ ] Fix UI bugs and validation errors
- [ ] Verify no errors in Expo dev tools

### Phase 2: Real API Integration (Days 3-4)

- [ ] Switch DEBUG_MODE to false
- [ ] Test CRUD against real backend
- [ ] Handle network errors gracefully
- [ ] Test error scenarios (invalid data, server down)
- [ ] Verify profile updates correctly

### Phase 3: Polish & Edge Cases (Days 5)

- [ ] Test edge cases (concurrent operations, race conditions)
- [ ] Verify mobile UX (touch targets, scroll performance)
- [ ] Add loading states and optimistic UI
- [ ] Final testing with real network conditions
- [ ] Review code against Constitution

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/services/api/api.ts` | Add 10 new CRUD endpoints here |
| `src/services/api/client.ts` | Existing Axios client (no changes) |
| `src/services/debug/debugFlags.ts` | Toggle mock vs real API |
| `src/services/debug/debugSession.ts` | In-memory state for mock mode |
| `src/components/create-item/*` | Reuse for collection/item forms |
| `src/app/(tabs)/profile.tsx` | Display collections, add buttons |
| `src/app/collections/[collectionId].tsx` | Display items, add buttons |
| `src/types/collections.ts` | Collection types (verify) |
| `src/types/items.ts` | Item types (verify) |

---

## Debugging Tips

### Mock Mode Issues

```
Q: Collection doesn't appear after create
A: Check debugSession.collections has been updated
   Check profile.tsx calls refreshProfileCollections()

Q: Item not appearing in collection
A: Check debugSession.items has matching collectionId
   Check CollectionItemsGrid filters by collectionId correctly

Q: Form validation always fails
A: Check error messages in console
   Verify form field names match type definitions
```

### Real API Issues

```
Q: 401 Unauthorized
A: Auth token missing or expired
   Check debugSession.currentUser.token is set
   Verify interceptor adds Authorization header

Q: 404 Not Found
A: Endpoint path incorrect or resource doesn't exist
   Verify endpoint URL matches API docs
   Check collectionId/itemId are valid UUIDs

Q: 500 Server Error
A: Backend issue or invalid request shape
   Check request matches API schema
   Verify backend logs for errors
```

---

## Conclusion

This quickstart provides a step-by-step guide to implement and test CRUD operations. Start with mock mode, then migrate to real API when stable. Refer to research.md and data-model.md for detailed specifications.

**Next**: Review checklist.md to ensure quality gate, then proceed to task generation.
