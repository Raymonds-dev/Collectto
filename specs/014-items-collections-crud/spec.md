# Feature Specification: Items & Collections CRUD Integration

**Feature Branch**: `014-items-collections-crud`  
**Created**: 2026-06-07  
**Status**: Draft  
**Input**: Frontend integration for items and collections creation with profile synchronization

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create and Manage Collections (Priority: P1)

A user (collector/owner) wants to create, view, and modify collections to organize their items. This is the foundational feature that enables all item management.

**Why this priority**: Essential for the core use case of the platform - enabling users to organize and manage collections of items.

**Independent Test**: Can be fully tested by creating a new collection and verifying it appears in the user profile, allowing immediate value delivery of collection organization.

**Acceptance Scenarios**:

1. **Given** a user is logged in and on their profile, **When** they click "Create Collection", **Then** a form appears with fields for collection name, description, and visibility settings
2. **Given** a user has filled out the collection form, **When** they click "Create", **Then** the collection is saved and appears in their profile with the correct data
3. **Given** a user views a collection in their profile, **When** they click "Edit", **Then** the collection form opens with current data pre-filled and they can modify it
4. **Given** a user has updated a collection, **When** they save the changes, **Then** the profile updates to reflect the new collection data
5. **Given** a user is viewing their profile with collections, **When** they click "Delete Collection", **Then** a confirmation dialog appears and upon confirmation, the collection is removed from the profile

---

### User Story 2 - Create and Manage Items Within Collections (Priority: P1)

A user wants to create items within their collections and manage them (add details, update, remove). Items are the primary content managed within collections.

**Why this priority**: Equal importance to collections - items are the actual content being collected and are inseparable from the collection management workflow.

**Independent Test**: Can be fully tested by creating an item in a collection and verifying it appears both in the collection and in the profile's item list.

**Acceptance Scenarios**:

1. **Given** a user is viewing a collection, **When** they click "Add Item", **Then** a form appears with fields for item name, description, image, and other relevant attributes
2. **Given** a user has filled out the item form, **When** they click "Save", **Then** the item is created, appears in the collection, and is reflected in the profile
3. **Given** a user is viewing an item, **When** they click "Edit", **Then** the item form opens with current data and they can modify any field
4. **Given** a user has updated an item, **When** they save, **Then** the collection and profile both update to show the new item data
5. **Given** a user is viewing items in a collection, **When** they click "Delete Item", **Then** a confirmation appears and upon confirmation, the item is removed from both the collection and profile

---

### User Story 3 - Profile Reflects Real-Time Collection and Item Changes (Priority: P2)

A user's profile page always displays the current state of their collections and items. When collections or items are created, updated, or deleted, the profile updates automatically to maintain consistency.

**Why this priority**: High priority for data consistency and user experience - ensures users see accurate information without manual refresh.

**Independent Test**: Can be tested by performing CRUD operations and verifying profile updates reflect all changes immediately or upon navigation.

**Acceptance Scenarios**:

1. **Given** a user creates a new collection, **When** they navigate back to profile, **Then** the new collection appears in the collections list
2. **Given** a user adds an item to a collection, **When** they check the profile, **Then** the item count for that collection updates and the item appears in the profile's item list
3. **Given** a user deletes a collection, **When** they view the profile, **Then** the collection is no longer visible and item counts update accordingly
4. **Given** a user updates collection details, **When** they view the profile, **Then** the updated information is immediately visible

---

### Edge Cases

- **Collection names**: Users cannot create a collection with the same name as an existing one in their profile. System rejects with error: "Já existe uma coleção com este nome"
- How does the system handle creating items without uploading an image? (Handled — image is required)
- What happens if a collection is deleted while the user is editing an item in that collection? (Error handling)
- How does the system handle concurrent updates to the same collection/item? (Last-write-wins or conflict resolution?)
- What is the maximum number of items per collection or collections per user? (Limits or unlimited?)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to create a new collection with name, description, and visibility settings
- **FR-002**: System MUST allow users to view all their collections in their profile
- **FR-003**: System MUST allow users to update collection name, description, and visibility settings
- **FR-004**: System MUST allow users to delete a collection and remove all associated items
- **FR-005**: System MUST allow users to create items within a collection with name, description, and **required image upload**
- **FR-006**: System MUST allow users to view all items within a collection in an organized list or grid
- **FR-007**: System MUST allow users to update item details (name, description, image)
- **FR-008**: System MUST allow users to delete an item from a collection
- **FR-009**: System MUST update the profile collections list immediately when a collection is created, updated, or deleted
- **FR-010**: System MUST update the profile items list and collection item counts when items are created, updated, or deleted
- **FR-011**: System MUST display confirmation dialogs before destructive operations (delete collection or item)
- **FR-012**: System MUST validate that required fields are filled before allowing save operations
- **FR-013**: System MUST handle network errors gracefully with appropriate user feedback
- **FR-014**: System MUST maintain optimistic UI updates where possible for better perceived performance

### Key Entities

- **Collection**: A grouping entity that contains items. Attributes: id, name, description, visibility (public/private/unlisted), owner, createdAt, updatedAt, itemCount
- **Item**: Content within a collection. Attributes: id, collectionId, name, description, imageUrl **(required)**, createdAt, updatedAt
- **Profile**: User's profile display. Relationships: has many Collections, has many Items through Collections

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can create a collection in under 30 seconds from clicking "Create Collection" to seeing it in their profile
- **SC-002**: Users can add an item to a collection in under 45 seconds from clicking "Add Item" to seeing it appear in both collection and profile
- **SC-003**: Collection and item updates are reflected in the user's profile within 2 seconds of save
- **SC-004**: 95% of CRUD operations complete successfully without errors
- **SC-005**: Users can delete a collection with confirmation, removing it from profile completely within 2 seconds
- **SC-006**: UI remains responsive during item/collection operations (no freezing or lag)
- **SC-007**: All destructive actions (delete) require explicit user confirmation before execution

## Clarifications

### Session 2026-06-07

- Q: Como deve funcionar quando um usuário tenta criar uma coleção com o mesmo nome de uma existente? → A: Impedir nomes duplicados com mensagem de erro (rejeitar a criação).
- Q: Qual deve ser o comportamento com imagens em itens? → A: Imagem obrigatória — usuário deve fazer upload antes de salvar o item.

## Assumptions

- User authentication and authorization are already implemented and working
- Backend API endpoints for collection and item CRUD operations are available and functional
- Image upload/storage functionality is available (if images are part of items)
- Profile page exists and has the structure to display collections and items
- TypeScript and Expo Router are used for the frontend architecture as defined in project standards
- Users have one-time access to update their own collections and items (owner-only editing)
- Collections and items are scoped to individual users (no sharing between users in v1)
- Item image is **required** — all items must have at least one image; items cannot be created without an image upload
- Validation errors should be shown inline in forms (not modals)
- The profile page uses existing providers and services for state management
- **Collection names must be unique per user** — duplicate collection names are rejected with an error message
