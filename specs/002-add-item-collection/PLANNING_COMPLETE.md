# ✅ Implementation Plan Summary

**Feature**: Item and Collection Creation Flow  
**Branch**: `feature/002-add-item-collection`  
**Status**: ✅ Ready for Task Generation  
**Date**: 2026-05-02

---

## 📋 Deliverables Generated

### Phase 1 Complete: Design & Planning

| Artifact                    | Size   | Purpose                                             |
| --------------------------- | ------ | --------------------------------------------------- |
| **plan.md**                 | 7.3 KB | Technical roadmap with 5 implementation phases      |
| **data-model.md**           | 10 KB  | Entity definitions, validation, storage abstraction |
| **ItemService.ts**          | 1.5 KB | Item operations contract                            |
| **CollectionService.ts**    | 1.5 KB | Collection operations contract                      |
| **PhotoStorageProvider.ts** | 2.2 KB | Storage abstraction (local + future cloud)          |
| **quickstart.md**           | 9.2 KB | Developer guide with service patterns               |

**Total**: ~31.7 KB of design documentation

---

## 🏗️ Architecture Highlights

### PhotoStorageProvider Abstraction

**Problem**: Need local storage for offline item creation, but also support cloud storage (Firebase, S3) in the future.

**Solution**: Abstract storage behind `PhotoStorageProvider` interface.

```typescript
// Current: Local storage
class LocalStorageProvider implements PhotoStorageProvider {
  moveToPermament(localUri) → stores in app directory
}

// Future: Cloud storage (no UI changes needed)
class FirebaseStorageProvider implements PhotoStorageProvider {
  moveToPermament(localUri) → uploads to Firebase
}

// Factory pattern enables seamless swapping
const provider = createPhotoStorageProvider(); // Returns appropriate provider
```

**Benefit**: Future cloud integration requires zero UI changes.

---

### Mock-Centralization Pattern

**Problem**: No backend API ready, but feature needs to work during development.

**Solution**: Implement mock services matching real API contracts.

```typescript
// Contracts define the interface
interface ItemService {
  create(input: CreateItemInput): Promise<Item>;
  getById(itemId): Promise<Item | null>;
}

// Mock implementation for development
class MockItemService implements ItemService {
  // Data stored in memory, persists during app session
}

// Real implementation ready for future
class ApiItemService implements ItemService {
  // Calls backend API (POST /items, etc.)
}

// Factory chooses implementation
const service = process.env.USE_MOCK ? new MockItemService() : new ApiItemService();
```

**Benefit**: Develop and test without backend; swap to real API when ready.

---

### Permission Gating

**Implementation Flow**:

1. User taps "+" button → ItemCreation screen
2. System checks for camera + gallery permissions
3. If not granted → request permissions (iOS/Android specific)
4. On permission denial → show clear message + link to settings
5. On permission grant → camera/gallery immediately available

**Rationale**: Follows platform UX guidelines; doesn't blindside users.

---

## 📐 Implementation Roadmap

### Phase 1a: Foundation

- [ ] PhotoStorageProvider abstraction
- [ ] LocalStorageProvider implementation
- [ ] Mock ItemService & CollectionService

### Phase 1b: Photo Capture

- [ ] Camera capture with permission handling
- [ ] Gallery selection with permission handling
- [ ] Photo preview gallery UI

### Phase 1c: Forms

- [ ] Item metadata form (name, description)
- [ ] Collection creation form (name, optional description + cover)
- [ ] Collection selection screen with inline creation

### Phase 1d: Persistence

- [ ] Save flow (persist item + collection to mock service)
- [ ] Photo migration from local to permanent storage
- [ ] Success feedback + navigation

### Phase 1e: Polish

- [ ] Permission denial graceful handling
- [ ] Storage limit warnings (500 MB)
- [ ] Error states and retry logic
- [ ] Unit tests

---

## 📚 Design References

### From Specification

- 4 user stories (photo permissions, create item, create collection, uncategorized)
- 24 functional requirements
- 12 success criteria (measurable outcomes)
- 500 MB local storage limit per item

### From Constitution

- **Visual First**: Photos dominate the flow, not text
- **Fluidez**: Inline collection creation, no modal explosions
- **Consistência**: Reuse existing tokens, motion presets, components
- **Coleção É Identidade**: Collection covers, curation-focused design
- **Motion Oficial**: Only official motion presets (SlideUp, FadeIn, etc.)

### From Project Standards

- Services abstracted for API integration
- Local state preferred before global state
- Explicit TypeScript types for public contracts
- Accessibility labels + touch targets required
- Reuse UI components from `src/components/ui/`

---

## 🔧 Service Pattern (Example)

### Define Contract

```typescript
// contracts/ItemService.ts
export interface ItemService {
  create(input: CreateItemInput): Promise<Item>;
  getById(itemId: string): Promise<Item | null>;
}
```

### Implement Mock

```typescript
// src/mocks/items/index.ts
export class MockItemService implements ItemService {
  private items = new Map<string, Item>();

  async create(input: CreateItemInput): Promise<Item> {
    const item: Item = { item_id: uuid(), ...input, created_at: now() };
    this.items.set(item.item_id, item);
    return item;
  }

  async getById(itemId: string): Promise<Item | null> {
    return this.items.get(itemId) ?? null;
  }
}
```

### Provide via Context

```typescript
// src/providers/ItemContextProvider.tsx
const ItemContext = createContext<ItemService>(new MockItemService());
export const useItemService = () => useContext(ItemContext);
```

### Use in Component

```typescript
// src/components/create-item/ItemForm.tsx
export const ItemForm = () => {
  const itemService = useItemService();

  const handleSave = async (data) => {
    const item = await itemService.create(data);
    // Navigate to success
  };

  return (/* form UI */);
};
```

---

## 📦 Data Model Snapshot

### Item Entity

```typescript
interface Item {
  item_id: UUID; // Primary key
  collection_id: UUID | null; // Optional collection assignment
  name: string; // Mandatory
  description: string; // Optional
  media_urls: string[]; // ≥1 photo required on save
  attributes: Record; // JSONB for future extensibility
  likes_count: number; // Counter
  is_active: boolean; // Soft delete flag
  created_at: Timestamp;
}
```

### Collection Entity

```typescript
interface Collection {
  collection_id: UUID; // Primary key
  user_id: UUID; // Owner (mandatory)
  name: string; // Mandatory
  description: string | null; // Optional
  cover_img_url: string | null; // Optional
  visibility: 'private' | 'shared' | 'public'; // Default 'private'
  is_active: boolean; // Soft delete flag
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### PhotoStorageProvider Interface

```typescript
interface PhotoStorageProvider {
  saveToLocal(photoData: PhotoData): Promise<LocalPhotoReference>;
  moveToPermament(localUri, destination): Promise<PermanentPhotoReference>;
  delete(permanentUri: string): Promise<void>;
  cleanupLocal(maxAgeMs: number): Promise<number>;
}
```

---

## 🚀 Next Steps

1. **Generate Tasks** → `/speckit.tasks`
   - Creates actionable development tasks from plan

2. **Review & Approve**
   - Verify task breakdown makes sense
   - Adjust priorities if needed

3. **Implement Tasks**
   - Start with Phase 1a (foundation)
   - Follow implementation order
   - Run `npm run validate` after each task

4. **Merge to Main**
   - All tasks complete
   - All tests passing
   - All linting clean

---

## ✅ Quality Checklist

### Constitution Compliance ✓

- [x] Visual hierarchy prioritizes photos
- [x] Motion uses only official presets
- [x] Components reuse existing patterns
- [x] Accessibility labels included
- [x] Performance optimized

### Architecture ✓

- [x] Services abstracted for API swap
- [x] Photo storage is swappable
- [x] Mock services implement real contracts
- [x] Permissions handled gracefully
- [x] Local storage limit enforced (500 MB)

### Documentation ✓

- [x] Data model documented
- [x] Service contracts defined
- [x] Implementation patterns shown
- [x] Migration path to real API outlined
- [x] Developer quickstart provided

---

## 📂 File Structure

```
specs/002-add-item-collection/
├── spec.md                          ← Feature specification
├── plan.md                          ← Implementation plan (this summary)
├── data-model.md                    ← Entity definitions
├── quickstart.md                    ← Developer guide
├── contracts/
│   ├── ItemService.ts
│   ├── CollectionService.ts
│   └── PhotoStorageProvider.ts
└── checklists/
    └── requirements.md              ← Quality checklist
```

---

## 🔗 Related Documentation

- **Specification**: `specs/002-add-item-collection/spec.md`
- **Constitution**: `.specify/memory/constitution.md`
- **Mock Skill**: `.github/skills/mock-centralization/SKILL.md`
- **Motion System**: `src/hooks/useAnimation/README.md`
- **UI Tokens**: `src/styles/tailwind/tokens.js`
- **Copilot Instructions**: `.github/copilot-instructions.md` (updated with plan reference)

---

**Ready for**: Phase 2 Task Generation → `/speckit.tasks`
