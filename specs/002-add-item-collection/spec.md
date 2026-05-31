# Feature Specification: Item and Collection Creation Flow

**Feature Branch**: `feature/002-add-item-collection`  
**Created**: 2026-05-02  
**Status**: Draft  
**Input**: User description: "Create a feature para criar um item e coleção. O usuário irá clicar no botão de "mais" na @src\app\(tabs)\_layout.tsx e seguirá um fluxo de adicionar as fotos do item, descrição e nome e escolherá a coleção ao qual ele pertence, caso não exista uma coleção ou não se encaixe em nenhuma ele terá a opção de seguir um fluxo de criar coleção. O fluxo de coleção será simples, ele colocará o nome, descrição (opcional) e a imagem cover (opcional)."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Request Photo Permissions and Access Camera/Gallery (Priority: P1)

As a collector, I want to grant the app permission to access my device's camera and photo gallery so that I can immediately start adding photos to my items.

**Why this priority**: This is the critical first step. Without camera and gallery permissions, users cannot proceed with item creation. This must work reliably before any other photo-related functionality.

**Independent Test**: User can independently grant camera and gallery permissions, and the system correctly requests permissions following platform-specific guidelines (iOS/Android). If permission is denied, system handles gracefully and allows retry.

**Acceptance Scenarios**:

1. **Given** user taps the "more" button on tab layout, **When** the item creation flow is initiated, **Then** system checks for camera and gallery permissions
2. **Given** permissions have not been granted, **When** system detects first photo action, **Then** platform-specific permission dialogs are displayed
3. **Given** user grants camera permission, **When** user opens camera interface, **Then** camera feed is available and functional
4. **Given** user grants gallery permission, **When** user opens photo library, **Then** existing photos are accessible for selection
5. **Given** user denies permission, **When** user attempts to add photos, **Then** system displays clear message and option to grant permission in settings
6. **Given** permissions are already granted from previous usage, **When** user taps to add photos, **Then** camera/gallery opens immediately without additional prompts

---

### User Story 2 - Create Item in Existing Collection (Priority: P1)

As a collector, I want to add a new item to one of my existing collections so that I can build and organize my collection over time.

**Why this priority**: This is the core primary action that enables value. Users need to be able to quickly add items to existing collections without additional friction, once photo permissions are established.

**Independent Test**: User can independently access the item creation flow with permissions granted, add photos and metadata, select an existing collection, and complete the item creation successfully.

**Acceptance Scenarios**:

1. **Given** user is on the tab layout screen with appropriate permissions, **When** user taps the "more" button, **Then** the item creation flow is initiated
2. **Given** user is in the item creation flow, **When** user accesses camera or gallery, **Then** photos are captured or selected and displayed in the creation form
3. **Given** user has added photos and metadata (name and description), **When** user selects an existing collection, **Then** the item is created and assigned to that collection
4. **Given** user completes item creation, **When** the item is saved, **Then** user is returned to the appropriate screen with confirmation

---

### User Story 3 - Create New Collection While Creating Item (Priority: P1)

As a collector, when creating an item, if none of my existing collections fit, I want to create a new collection inline so that I don't lose progress on the item I'm creating.

**Why this priority**: This is equally critical to the primary flow. Users must be able to create missing collections without abandoning the item creation process, ensuring seamless workflow.

**Independent Test**: User can initiate item creation, reach the collection selection step, create a new collection with name and optional metadata, and complete the item creation in that new collection.

**Acceptance Scenarios**:

1. **Given** user is at the collection selection step during item creation, **When** user chooses to create a new collection, **Then** the collection creation form is displayed
2. **Given** user is creating a new collection, **When** user enters a collection name and optionally a description and cover image, **Then** collection details are accepted
3. **Given** user completes the collection creation, **When** user confirms, **Then** the new collection is created and automatically selected for the current item
4. **Given** the item and collection are configured, **When** user saves, **Then** both the collection and item are persisted and linked

---

### User Story 4 - Create Item Without Collection (Priority: P2)

As a collector, I want to be able to create an item even if I'm unsure which collection it belongs to, so I can capture items quickly and organize them later.

**Why this priority**: This provides flexibility and accommodates workflow variations. While less critical than having collections, it ensures items aren't lost due to collection indecision.

**Independent Test**: User can create an item with photos and metadata, defer collection assignment or assign to an "Uncategorized" bucket, and complete the flow.

**Acceptance Scenarios**:

1. **Given** user has added item photos and metadata, **When** user opts not to select a collection, **Then** the system allows item creation without collection assignment
2. **Given** an item is created without a collection, **When** user views the item later, **Then** it is clearly marked as uncategorized or unassigned
3. **Given** user later views uncategorized items, **When** user edits the item, **Then** user can assign it to a collection retroactively

---

### Edge Cases

- What happens if user denies camera or gallery permissions initially? (Assumption: System displays user-friendly message and provides link to app settings to grant permission)
- What happens if permissions are revoked while the app is in use? (Assumption: System gracefully handles permission loss and prompts user to re-grant)
- What happens if user starts item creation and navigates away without saving? (Assumption: form state is not persisted; user loses unsaved progress including temporary local photos)
- How does system handle if collection name already exists? (Assumption: Duplicate collection names are allowed; user can rename later if desired)
- What if user adds photos but doesn't add a name before trying to save? (Assumption: Name is mandatory; system validates and displays error)
- How large can individual photo files be? (Assumption: Platform-standard limits apply; client-side validation warns user about oversized images)
- What happens if local storage is full or approaching 500 MB limit? (Assumption: System displays warning, allows user to continue with warning, or removes oldest photos if limit exceeded; user can manage photos before save)
- What happens if item creation is interrupted after photos are saved to local storage? (Assumption: Photos remain in local cache for a reasonable time period (e.g., 24 hours) and are cleaned up automatically if not referenced by a completed item)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a "more" button accessible on the tab layout screen that initiates the item creation flow
- **FR-002**: System MUST request camera and photo library permissions from the device following platform-specific guidelines (iOS/Android) before allowing photo capture or selection
- **FR-003**: System MUST handle permission denial gracefully by displaying clear messaging and providing option to access app settings to grant permissions
- **FR-004**: Item creation flow MUST provide interface to access device camera for capturing photos
- **FR-005**: Item creation flow MUST provide interface to access device photo gallery/library for selecting existing photos
- **FR-006**: Item creation flow MUST allow user to add one or more photos to the item (via camera or gallery)
- **FR-007**: System MUST store captured/selected photos in local device storage with a unique identifier tied to the temporary item being created
- **FR-008**: System MUST implement a photo storage abstraction layer that supports local storage operations and is designed to accept cloud storage providers in future integrations
- **FR-009**: Item creation flow MUST display all added photos in a preview gallery within the creation form
- **FR-010**: Item creation flow MUST allow user to remove individual photos before item is saved
- **FR-011**: Item creation flow MUST allow user to enter and edit item name (text field)
- **FR-012**: Item creation flow MUST allow user to enter and edit item description (text field)
- **FR-013**: Item creation flow MUST display a list of existing collections for the user to choose from
- **FR-014**: Item creation flow MUST provide an option to create a new collection if desired
- **FR-015**: New collection creation flow MUST accept a collection name (mandatory)
- **FR-016**: New collection creation flow MUST accept an optional collection description (text field)
- **FR-017**: New collection creation flow MUST accept an optional collection cover image (photo via camera or gallery)
- **FR-018**: Item creation flow MUST validate that item name is provided before allowing save
- **FR-019**: Item creation flow MUST validate that at least one photo is provided before allowing save
- **FR-020**: System MUST persist the created item with all provided metadata and assigned collection
- **FR-021**: System MUST move locally stored photos to their permanent storage location (via abstraction layer) during item persistence
- **FR-022**: System MUST persist the newly created collection (if created during item flow) and link it to the item
- **FR-023**: Item creation flow MUST provide visual feedback during save (e.g., loading state, success confirmation)
- **FR-024**: System MUST return user to appropriate screen after successful item creation

### Key Entities

- **Item**: Represents a collectible with photos, name, description, and collection assignment. Attributes include: id, photos (array of ItemPhoto objects), name (string), description (string, optional), collection_id (foreign key, optional), created_at, updated_at.
- **Collection**: Represents a user's categorized group of items. Attributes include: id, name (string), description (string, optional), cover_image (ItemPhoto or PhotoReference, optional), owner_id (foreign key), created_at, updated_at.
- **ItemPhoto**: Represents individual photos associated with an item or collection. Attributes include: id, item_id (foreign key, optional), collection_id (foreign key, optional), local_uri (string, local path during creation), permanent_uri (string, final storage URI after sync), display_order (number), uploaded_at (timestamp).
- **PhotoStorageProvider**: Abstraction interface for photo storage operations. Supports: save_to_local(photo_data) → local_uri, move_to_permanent(local_uri, destination) → permanent_uri, delete(uri) → success. Current implementation: LocalStorageProvider. Future implementations: CloudStorageProvider (S3, Firebase, etc.)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Camera and gallery permissions are requested and granted before any photo capture/selection occurs with 100% success rate on first attempt
- **SC-002**: Permission denial is handled gracefully with clear messaging; users can re-attempt permission grant from app settings
- **SC-003**: Photos captured or selected from gallery display in preview within 2 seconds of selection
- **SC-004**: Users can successfully create an item with all required fields (including photos) in under 3 minutes from button tap to completion
- **SC-005**: 100% of item creation attempts include at least one photo (as required by validation)
- **SC-006**: 95% of item creation attempts complete successfully without requiring re-submission due to validation errors
- **SC-007**: Users can create a new collection and assign an item to it without navigating away from the item creation flow
- **SC-008**: System displays collection selection step with all existing user collections loaded in under 1 second
- **SC-009**: Photos stored locally during creation occupy no more than 500 MB of device storage; system validates and warns user if exceeding this limit
- **SC-010**: Newly created items appear in the appropriate collection view within 2 seconds of completion
- **SC-011**: Collection creation defaults (optional fields) do not prevent item completion
- **SC-012**: Photo storage abstraction layer successfully handles all local storage operations and is documented for future cloud provider integration

## Assumptions

- **User Authentication**: User is already authenticated and logged in; item and collection are automatically linked to the authenticated user
- **Platform Permissions**: App requests camera and photo library permissions using platform-specific APIs (iOS: AVFoundation/PHPickerViewController, Android: camera/READ_EXTERNAL_STORAGE). Permission requests follow platform UX guidelines.
- **Local Photo Storage**: Photos captured during item creation are stored locally on device storage (not in cloud) until item is successfully saved
- **Photo Storage Abstraction**: Photo storage is handled through an abstraction layer (PhotoStorageProvider interface) that:
  - Implements local storage initially via LocalStorageProvider
  - Is designed to accept cloud storage providers (Firebase, AWS S3, etc.) in future integrations
  - Decouples storage implementation from business logic
  - Provides consistent API regardless of storage backend
- **Photo Cleanup**: Photos in local storage are cleaned up after successful item persistence or if user abandons item creation (after reasonable timeout or manual clearance)
- **Collection List Display**: Existing collections are fetched from the backend API; system handles pagination or scrolling if user has many collections
- **Item Creation Triggers**: The "more" button in tab layout is accessible and navigates to item creation screen; navigation state management uses existing patterns in the app
- **Optional Fields**: Collection description and cover image are truly optional; system handles empty/null values gracefully
- **No Collection Required for V1**: Items can be created without assignment (uncategorized flow) unless product requirements mandate collection selection
- **Duplicate Collections**: Users are allowed to create collections with the same name; system does not enforce uniqueness
- **Photo Ordering**: If multiple photos are added, they are stored in the order user added them; user can reorder later if feature evolves
- **Network Reliability**: Network failures during save are handled by existing error handling patterns in the app
- **Device Storage**: App assumes sufficient local device storage is available for temporary photo files; if insufficient, system displays warning
