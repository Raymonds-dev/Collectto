# Implementation Plan: Item and Collection Creation Flow

**Feature Branch**: `feature/002-add-item-collection`  
**Status**: Planning  
**Last Updated**: 2026-05-02

---

## Technical Context

### Architecture Overview

This feature implements item and collection creation with photo storage abstraction. The architecture follows these patterns:

- **Local First**: Photos store locally during creation via `PhotoStorageProvider` abstraction
- **Decoupled Storage**: Implementation allows seamless cloud provider integration (S3, Firebase)
- **Permission Gating**: Camera/gallery access requires explicit permission grants (iOS/Android)
- **Mock-Ready**: Services abstracted for API integration via mock layer during development

### Key Technologies

- **Photo Storage**: `expo-media-library` (device access), `react-native-image-crop-picker` (capture/select)
- **Permissions**: `expo-permissions` (iOS/Android permission requests)
- **Local Storage**: `expo-file-system` (temporary photo persistence)
- **Mock Service**: `src/mocks/items` and `src/mocks/collections` (mock-centralization pattern)
- **State Management**: React Context (local to feature) + hooks for cross-screen data

### Dependencies & Integrations

1. **Backend API** (future): Item create/update endpoint, Collection create/update endpoint
2. **Device APIs**: Camera, Photo Library, Permissions (via Expo)
3. **Mock Layer**: Mock items and collections service (implements same interface as future API)

---

## Constitution Check

### Visual First ✅

- Item creation uses photo gallery as primary entry point (not text-first)
- Collection cover image is optional but strongly encouraged visually
- No dense copy; progressive disclosure for metadata fields

### Fluidez Acima de Complexidade ✅

- Inline collection creation during item flow (no modal explosion)
- Photo preview gallery within same screen
- Progressive steps: photos → metadata → collection selection → save

### Consistência > Criatividade ✅

- Reuse existing UI tokens from `src/styles/tailwind/tokens.js`
- Motion uses project presets (SlideUp for expand, FadeIn for new content)
- Component pattern follows tab layout conventions

### Coleção É Identidade ✅

- Collection creation emphasizes cover image and description
- Item display highlights primary photo and collection context
- Curation focused: users curate items into meaningful groups

### Microinterações, Performance e Motion Oficial ✅

- Permission denial handled with clear inline messaging
- Photo loading uses skeleton state or progressive placeholder
- Save action shows loading state with feedback
- Motion uses official presets only

---

## Phase 0: Research

### Decision: Photo Storage Architecture

**Decision**: Implement `PhotoStorageProvider` abstraction with local storage initial implementation

**Rationale**:

- Allows offline-first workflow
- Enables cloud provider swap without UI changes
- Supports 500 MB limit per item creation session
- Future-proofs API integration

**Alternatives Considered**:

- Direct cloud upload (rejected: requires network during creation)
- No abstraction (rejected: locks to single storage backend)

**Implementation**: Create `src/services/photo-storage/` with:

- `types.ts`: PhotoStorageProvider interface
- `local-provider.ts`: LocalStorageProvider implementation
- `factory.ts`: Provider factory for easy swapping

---

## Phase 1: Design & Contracts

### Data Model

See `data-model.md` for complete entity definitions, relationships, and validation rules.

**Key Entities**:

- **Item**: Collectible with photos, name, description, collection assignment
- **Collection**: User's categorized group of items
- **ItemPhoto**: Individual photo with local/permanent URI tracking

### API Contracts

See `/contracts/` for service interface definitions.

**Key Interfaces**:

- `ItemService`: Create, read, update item operations
- `CollectionService`: Create, read, update collection operations
- `PhotoStorageProvider`: Local/cloud photo storage abstraction

### Implementation Roadmap

#### Phase 1a: Foundation (Local Storage & Permissions)

- [ ] PhotoStorageProvider abstraction and LocalStorageProvider implementation
- [ ] Permission request system (camera + gallery)
- [ ] Mock ItemService and CollectionService (implement real API interface)

#### Phase 1b: Photo Capture & Selection

- [ ] Camera capture interface (+ permission handling)
- [ ] Photo gallery selection (+ permission handling)
- [ ] Photo preview and removal UI

#### Phase 1c: Item & Collection Creation Forms

- [ ] Item metadata form (name, description, optional collection)
- [ ] Collection creation form (name, optional description, optional cover image)
- [ ] Collection selection screen with inline creation option

#### Phase 1d: Integration & Persistence

- [ ] Save flow (persist item + collection to mock service)
- [ ] Photo migration from local to permanent storage (via PhotoStorageProvider)
- [ ] Success feedback and navigation back to context

#### Phase 1e: Polish & Testing

- [ ] Permission denial graceful handling
- [ ] Storage limit warnings (500 MB)
- [ ] Error states and retry logic
- [ ] Unit tests for services and components

---

## Constitution Compliance Check (Post-Design)

### Visual Hierarchy ✅

- Photos dominate the creation flow
- Metadata fields are secondary
- Collection selection is progressive disclosure

### Motion & Feedback ✅

- SlideUp for expanding collection creation form
- FadeIn for new photo additions to gallery
- ScalePress for button interactions
- Loading skeleton for permission requests

### Accessibility ✅

- Camera/gallery buttons have accessibilityLabel and accessibilityRole
- Form inputs are clearly labeled
- Error messages are screen-reader friendly

### Performance ✅

- Local storage operations are <100ms
- Photo preview scales images appropriately
- Collection list loads in <1s (mocked data)

### Component Reuse ✅

- Reuse existing UI buttons, form inputs from `src/components/ui/`
- Extract photo gallery component for reuse
- Use project tokens for spacing, colors, typography

---

## Design Artifacts

### Phase 1 Deliverables

1. **data-model.md**: Entity definitions with validation
2. **contracts/item-service.ts**: ItemService interface
3. **contracts/collection-service.ts**: CollectionService interface
4. **contracts/photo-storage.ts**: PhotoStorageProvider interface
5. **quickstart.md**: Developer setup and mock service usage

---

## Next Steps

1. **Phase 0 Complete**: Research decisions documented above
2. **Phase 1 In Progress**: Generate data-model.md, contracts/, quickstart.md
3. **Phase 2**: Create tasks.md with implementation tasks
4. **Phase 3**: Implement tasks with validation

---

## Branch Info

- **Branch**: `feature/002-add-item-collection`
- **Base**: main (or development branch)
- **Status**: Ready for task generation

---

## References

- **Specification**: `specs/002-add-item-collection/spec.md`
- **Constitution**: `.specify/memory/constitution.md`
- **Mock Skill**: `.github/skills/mock-centralization/SKILL.md`
- **Motion System**: `src/hooks/useAnimation/README.md`
- **UI Tokens**: `src/styles/tailwind/tokens.js`
