# Feature Specification: Profile Screen API Integration

**Feature Branch**: `agents/integracao-perfil-api-colecoes-itens`  
**Created**: 2026-05-19  
**Status**: Draft  
**Input**: User request: "Quero integrar toda a tela de perfil com a API, inclusive subtelas relacionadas a ela como a de editar as coleções e itens, com base nas collecto-api-docs.json e nos modelos de dados já existentes em types."

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Authenticated User Profile with API Data (Priority: P1)

As an authenticated user, I want to view my profile screen populated with real data from the API (name, username, email, bio, profile picture, background, followers/following counts, birth date) so that I can see my current profile information and take further actions.

**Why this priority**: This is the foundational feature; all other profile-related actions depend on fetching and displaying user data.

**Independent Test**: Can be fully tested by navigating to the profile screen after login and verifying that all user data fields are populated correctly from the API response.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** the profile screen loads, **Then** the user's details (name, username, email, bio, profilePictureUrl, profileBackgroundUrl, followersCount, followingCount, birthdayDate) are fetched from `/users/{userId}` and displayed
2. **Given** the user has no profile picture or background, **When** the profile screen renders, **Then** default placeholders are shown
3. **Given** a network error occurs during profile fetch, **When** the profile screen loads, **Then** an error message is displayed with a retry option
4. **Given** the API returns invalid/missing fields, **When** the profile screen renders, **Then** missing fields are handled gracefully with sensible defaults or hidden

---

### User Story 2 - Edit User Profile Information (Priority: P1)

As an authenticated user, I want to edit my profile information (name, username, bio, profile picture, background, birth date) and save these changes to the API so that my profile reflects my current information.

**Why this priority**: Core profile customization feature; users expect to update their own profile data.

**Independent Test**: Can be tested by entering an edit mode, modifying profile fields, and verifying the changes persist via the API using PATCH `/users/update`.

**Acceptance Scenarios**:

1. **Given** a user on the profile screen, **When** they tap "Edit Profile", **Then** the screen transitions to an edit form with all profile fields editable
2. **Given** the user modifies one or more profile fields, **When** they tap "Save", **Then** a PATCH request is sent to `/users/update` with only the changed fields
3. **Given** the PATCH request succeeds, **When** the update completes, **Then** the profile screen reflects the new data and displays a success message
4. **Given** the PATCH request fails (validation error, network error), **When** the update completes, **Then** an error message is shown and previous values are restored
5. **Given** the user uploads a new profile picture or background, **When** they proceed to save, **Then** pre-signed upload URLs are generated via POST `/uploads/presigned-urls` before the profile is updated

---

### User Story 3 - View and Manage User Collections (Priority: P1)

As a profile owner, I want to view all my collections on a dedicated tab/section, with options to create new collections and edit/delete existing ones, so that I can manage my collection inventory.

**Why this priority**: Collections are central to Collectto; users need easy access to manage them from their profile.

**Independent Test**: Can be tested by viewing the collections tab on the profile screen and verifying all user collections are listed with correct metadata (name, description, cover image, item count, visibility).

**Acceptance Scenarios**:

1. **Given** a user on the profile screen, **When** they navigate to the "Collections" tab, **Then** a paginated list of their collections is fetched from GET `/collections/by-user/{userId}` and displayed
2. **Given** the collections list is displayed, **When** the user scrolls down, **Then** pagination loads additional collections (page increment)
3. **Given** the user views a collection card, **When** they tap the edit button, **Then** the edit collection modal/screen opens with current collection data
4. **Given** the user is editing a collection, **When** they modify fields and save, **Then** a PATCH request is sent to `/collections/update` with the collection ID
5. **Given** the user taps "Delete Collection", **When** a confirmation dialog appears and they confirm, **Then** a DELETE request is sent to `/collections/{collectionId}`

---

### User Story 3 - View and Manage Items Within Collections (Priority: P2)

As a collection owner, I want to view all items in a specific collection, with options to add new items, edit, or delete existing items, so that I can organize and maintain my collection contents.

**Why this priority**: Item management is secondary to collection creation/viewing but critical for users who have collections.

**Independent Test**: Can be tested by opening a specific collection and verifying items are fetched from GET `/items/by-collection/{collectionId}` with correct metadata (name, description, images, attributes, like/comment counts).

**Acceptance Scenarios**:

1. **Given** a user views a collection, **When** the collection details load, **Then** items in the collection are fetched from GET `/items/by-collection/{collectionId}` and paginated
2. **Given** the items list is displayed, **When** the user taps an item, **Then** the item detail screen opens showing full item information (description, attributes, acquisition date, tags, likes, comments)
3. **Given** the user is viewing their own item, **When** they tap "Edit Item", **Then** the edit item modal/screen opens with current item data
4. **Given** the user is editing an item, **When** they modify fields (name, description, attributes, tags, images, dates) and save, **Then** a PATCH request is sent to `/items/update`
5. **Given** the user taps "Delete Item", **When** a confirmation dialog appears and they confirm, **Then** a DELETE request is sent to `/items/{itemId}`
6. **Given** a user is creating/editing an item, **When** they select images to upload, **Then** a POST request is sent to `/uploads/presigned-urls` for each image; pre-signed URLs are returned and the client uploads via PUT; URLs are included in the item create/update request
7. **Given** an item has multiple images, **When** the user is editing, **Then** they can add/remove/reorder images; uploads and removals are atomic (all succeed or all fail on save)
8. **Given** an item upload fails, **When** the user retries, **Then** the system reuses cached pre-signed URLs if fresh, or generates new ones after 15 minutes

---

### User Story 4 - View Other Profiles with Visibility Filtering (Priority: P2)

As an authenticated user, I want to view other users' profiles with appropriate visibility filtering so that I can discover other collectors and their public collections.

**Why this priority**: Secondary to own profile management; enables discovery and social features.

**Independent Test**: Can be tested by navigating to another user's profile and verifying visibility rules are applied (PUBLIC → all data, PRIVATE → limited data, FRIENDS → conditional access).

**Acceptance Scenarios**:

1. **Given** a user navigates to another user's profile (via search or collection owner link), **When** the profile loads, **Then** a GET request is sent to `/users/{targetUserId}`
2. **Given** the target user's profile has PUBLIC visibility, **When** the profile renders, **Then** all profile data is displayed (name, username, bio, picture, background, follower/following counts, collections)
3. **Given** the target user's profile is PRIVATE, **When** the profile renders, **Then** limited data is shown (name, username, profile picture) with a "Follow to see more" prompt
4. **Given** the current user is in the target user's FRIENDS follow list, **When** the target profile is FRIENDS visibility, **Then** full profile data is displayed

---

### Edge Cases

- What happens when a user tries to view another user's profile? → Visibility filtering applies based on follow/collection visibility settings
- What if a collection or item count exceeds the page size? → Pagination handles large datasets
- How does the system handle concurrent edits to the same collection/item? → Last write wins (API responsibility); client shows fresh data after save
- What if the user lacks permission to edit/delete a collection? → API returns 403 Forbidden; client displays "unauthorized" message
- What if a collection cannot be deleted due to a constraint (e.g., default "Uncategorized" collection)? → API returns error; client displays appropriate message to user

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST fetch the authenticated user's profile data from GET `/users/{userId}` on profile screen load
- **FR-002**: System MUST display user profile fields: name, username, email, bio, profilePictureUrl, profileBackgroundUrl, followersCount, followingCount, birthdayDate, createdAt
- **FR-003**: System MUST provide an "Edit Profile" interface allowing users to modify: name, username, bio, profilePictureUrl, profileBackgroundUrl, birthdayDate
- **FR-004**: System MUST send profile updates via PATCH `/users/update` with only changed fields
- **FR-005**: System MUST fetch collections for the authenticated user via GET `/collections/by-user/{userId}` with pagination support
- **FR-006**: System MUST allow users to create new collections via POST `/collections/create`
- **FR-007**: System MUST allow users to update existing collections via PATCH `/collections/update`
- **FR-008**: System MUST allow users to delete collections via DELETE `/collections/{collectionId}`
- **FR-009**: System MUST fetch items in a collection via GET `/items/by-collection/{collectionId}` with pagination support
- **FR-010**: System MUST allow users to create items via POST `/items/create` with fields: collectionId, name, description, acquisitionDate, lastUsedDate, imageFilesUrls, attributes, tags
- **FR-011**: System MUST allow users to update items via PATCH `/items/update`
- **FR-012**: System MUST allow users to delete items via DELETE `/items/{itemId}`
- **FR-013**: System MUST generate pre-signed upload URLs via POST `/uploads/presigned-urls` for image uploads (contexts: PROFILE_PICTURE, PROFILE_BACKGROUND, COLLECTION, ITEM)
- **FR-014**: System MUST handle pagination for collections and items lists (page, size, sortBy parameters)
- **FR-015**: System MUST display context-specific error messages based on HTTP status: 403 → "Sem permissão"; 401 → re-auth flow; 5xx → "Servidor indisponível"; network → "Sem conexão"; default → "Erro ao carregar"
- **FR-016**: System MUST implement exponential backoff with jitter for transient errors (5xx, network timeouts) with max 5 retries; do NOT retry permanent errors (400, 401, 403)
- **FR-017**: System MUST implement caching with TTL of 5 minutes using stale-while-revalidate pattern: serve cached data immediately, revalidate in background, update UI when fresh data arrives
- **FR-018**: System MUST support offline-read mode: cached profile, collection, and item data is accessible without network connection; all write operations (create/update/delete) require active connection
- **FR-019**: System MUST validate form inputs before sending requests (e.g., required fields, email format, birth date format: yyyy-MM-dd)

### Key Entities

- **User**: Represents the authenticated user; attributes: id, name, username, email, bio, profilePictureUrl, profileBackgroundUrl, followersCount, followingCount, birthdayDate, createdAt, isActive
- **Collection**: Represents a collection owned by a user; attributes: id, userId, name, description, coverImageUrl, visibility (PUBLIC/PRIVATE/FRIENDS), followersCount, tags, isActive, isSystem, createdAt, updatedAt
- **Item**: Represents an item within a collection; attributes: id, collectionId, userId, name, description, acquisitionDate, lastUsedDate, imageFilesUrls, attributes (key-value pairs), likesCount, commentsCount, tags, isActive, createdAt, updatedAt
- **Upload Context**: Enum for upload contexts (PROFILE_PICTURE, PROFILE_BACKGROUND, COLLECTION, ITEM)
- **CollectionVisibility**: Enum for collection visibility (PUBLIC, PRIVATE, FRIENDS)

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: User profile data loads within 2 seconds on profile screen open (cold cache)
- **SC-002**: Profile edit form submits and reflects changes within 1 second (after API response)
- **SC-003**: Collections list loads and displays at least 10 items without perceptible lag
- **SC-004**: Image upload completes (pre-signed URL generation + file upload) within 5 seconds for files ≤5MB
- **SC-005**: All API endpoints return data matching the TypeScript interface definitions (no type mismatches)
- **SC-006**: Error handling displays user-friendly messages for all API error scenarios (4xx, 5xx, network timeouts)
- **SC-007**: Pagination works correctly for collections and items (e.g., "page=0&size=10" returns correct subset)
- **SC-008**: Form validation prevents submission of invalid data (e.g., empty required fields, invalid email format, invalid date format)
- **SC-009**: 100% of profile-related API calls are integrated with the existing auth token mechanism (Bearer token in Authorization header)
- **SC-010**: Concurrent navigation (rapid screen transitions) does not cause crashes or data corruption

---

## Assumptions

- Users have stable internet connectivity during profile and collection management sessions
- The existing authentication system (JWT-based, Bearer token) is functional and will be reused
- The backend API is operational and accessible at the configured base URL
- User birth dates are stored and validated using the yyyy-MM-dd format
- Collection visibility (PUBLIC/PRIVATE/FRIENDS) is enforced by the backend; the client displays data according to user's access level
- Image uploads are handled via AWS S3 with pre-signed URLs; the client only needs to perform HTTP PUT/POST to the returned URL
- Profile picture and background URLs are optional; if not provided, the UI will use default placeholders
- The "Delete Collection" endpoint may enforce constraints (e.g., system collections cannot be deleted); error handling is the client's responsibility
- Collection and item counts are accurate at the time of API response; eventual consistency is acceptable
- The API supports sorting and pagination as documented in the OpenAPI spec (page, size, sortBy)

---

## Clarifications

### Session 2026-05-19

- **Q1**: Deve o app suportar visualização de perfis de outros usuários? **A**: Sim, com filtro de visibilidade (opção B) – Usuários podem ver perfis alheios com regras PUBLIC/PRIVATE/FRIENDS aplicadas, incluindo contadores de seguidores para descoberta social.
- **Q2**: Qual estratégia de cache para perfis e coleções? **A**: Cache com TTL (5 min) + revalidação em background (opção C) – Mostra dados em cache imediatamente; revalida em background silenciosamente; atualiza UI quando novos dados chegam.
- **Q3**: Estratégia para deletar coleção com itens? **A**: Escolher na confirmação (opção B) – Modal oferece "Deletar tudo" ou "Mover itens para Sem categoria"; usuário escolhe antes de confirmar. *Nota: `deleteWithStrategy` já implementado em `mockCollectionService`; reutilizar.*
- **Q4**: Tratamento de erros e retry? **A**: Erro específico + ação contextual (opção B) com ressalvas:
  - **Max Retries**: 5 tentativas padrão
  - **Jitter**: Pequena variação (exponential backoff com jitter)
  - **Filtro de Exceções**: Aplicar retry apenas em erros transientes (5xx, timeouts); NÃO aplicar em erros permanentes (400, 401, 403)
- **Q5**: Suporte a offline e sincronização? **A**: Offline-read apenas (opção A) – Usuário pode VER dados em cache; ações (create/update/delete) exigem conexão online. Evolução futura: offline-first com sync.