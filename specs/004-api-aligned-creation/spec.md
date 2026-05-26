# Feature Specification: API-Aligned Item and Collection Creation

**Feature Branch**: `feature/004-api-aligned-creation`  
**Created**: 2026-05-17  
**Status**: Draft  
**Input**: User description: "Atualizar a tela de criação de item para os dados baterem com a da API. Atualmente o fluxo de criação de um item só precisa do nome, descrição e foto. O que é suficiente para criar, porém não contempla o todo. Assim como a criação da coleção, que atualmente só precisa do nome da coleção, descrição e foto. Meu objetivo e atualizar esse fluxo para que ele utilize intefaces reais para a integração com a API. Como estou fazendo tudo pelo modo DEBUG vamos utilizar ele para fazer os teste, mas não esqueça de manter as intefaces adaptadas para a API, mesmo que no momento não a utilizamos."

## Clarifications

### Session 2026-05-17

- Q: Como os usuários devem inserir os atributos dinâmicos (pares chave-valor) na interface? → A: Lista dinâmica onde os usuários podem adicionar linhas de "Chave: Valor".
- Q: Como os usuários devem inserir e visualizar as tags no formulário? → A: Sistema de "Chips" interativos (digitar + Enter).
- Q: Qual deve ser o valor padrão de visibilidade ao criar uma nova coleção? → A: `PRIVATE` (Privado por padrão).
- Q: Como deve ser a experiência de exclusão de atributos e tags? → A: Ícone "X" para remoção individual e uso de Backspace em campos vazios.
- Q: Como a data (acquisitionDate/lastUsedDate) deve ser selecionada pelo usuário? → A: Seletor de data nativo (Date Picker), seguindo o padrão já implementado no login.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Comprehensive Item Creation (Priority: P1)

As a collector, I want to create new items with detailed metadata (acquisition date, usage date, attributes, and tags) so that my collection is well-documented and searchable.

**Why this priority**: Core functionality that aligns the app with the backend capabilities. It enables rich data capture which is the value proposition of the app.

**Independent Test**: User can successfully create an item by filling in all available fields (name, description, acquisition date, last used date, custom attributes, tags, and multiple images) and verify the data matches the API schema in debug mode.

**Acceptance Scenarios**:

1. **Given** user is in the item creation flow, **When** user enters all mandatory fields (name, collection selection) and optional fields (dates, tags, attributes), **Then** the item is created successfully.
2. **Given** user has multiple images, **When** user selects them for the item, **Then** all images are associated with the new item.
3. **Given** user adds custom attributes (key-value pairs), **When** the item is saved, **Then** these attributes are correctly persisted.

---

### User Story 2 - Comprehensive Collection Creation (Priority: P1)

As a collector, I want to create new collections with descriptions, cover images, tags, and visibility settings so that I can organize my items effectively and share them if I choose.

**Why this priority**: Essential for organization and future social features. Aligns collection metadata with backend requirements.

**Independent Test**: User can create a new collection with name, description, cover image, visibility (Public/Private/Friends), and tags.

**Acceptance Scenarios**:

1. **Given** user initiates collection creation, **When** user provides a name, description, cover image, and visibility, **Then** the collection is created with these specific settings.
2. **Given** user is creating a collection, **When** user adds multiple tags, **Then** the collection is saved with all associated tags.

---

### User Story 3 - Updating Existing Items and Collections (Priority: P2)

As a collector, I want to update the details of my existing items and collections so that I can keep my inventory information accurate over time.

**Why this priority**: Vital for long-term data management. Users often need to correct or add info later.

**Independent Test**: User selects an existing item/collection, changes its name/description/attributes, and saves the changes, verifying the update matches the API contract.

**Acceptance Scenarios**:

1. **Given** an existing item, **When** user edits its metadata (e.g., updates last used date), **Then** the changes are saved according to the `UpdateItemRequest` schema.
2. **Given** an existing collection, **When** user changes its visibility or cover image, **Then** the collection is updated according to the `UpdateCollectionRequest` schema.

---

### Edge Cases

- **Missing Mandatory Fields**: What happens if the user tries to save an item without a name or a collection? (Assumption: System prevents saving and highlights missing fields).
- **Invalid Date Formats**: How does the system handle manually entered dates? (Assumption: UI uses date pickers to ensure valid ISO-8601 strings).
- **Duplicate Tags**: What if the user enters the same tag multiple times? (Assumption: System de-duplicates tags before sending to API).
- **Empty Image List**: Can an item be created without images? (Assumption: While the API might allow it, the app requires at least one image as per current UX).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide input fields for `acquisitionDate` and `lastUsedDate` using native Date Pickers, supporting ISO-8601 date strings.
- **FR-002**: System MUST allow users to add, manage, and remove dynamic `attributes` for items via a dynamic "Key: Value" row interface, with an "X" icon for deletion and Backspace support.
- **FR-003**: System MUST allow users to add multiple `tags` (string array) to both items and collections via an interactive "Chips" interface, supporting individual "X" removal and Backspace deletion.
- **FR-004**: System MUST support `visibility` settings for collections with values: `PUBLIC`, `PRIVATE`, or `FRIENDS` (Default: `PRIVATE`).
- **FR-005**: Item creation MUST link to a `collectionId` (UUID string).
- **FR-006**: Item forms MUST support multiple image URLs (`imageFilesUrls` array).
- **FR-007**: Collection forms MUST support a `coverImageUrl` string.
- **FR-008**: System MUST use UUID strings for all identifiers (`id`, `collectionId`, `userId`) across all data models.
- **FR-009**: UI components MUST be updated to handle the expanded data structure while maintaining compatibility with the current `Debug Mode` ephemeral storage.

### Key Entities

- **CreateItemRequest**:
  - `collectionId*` (UUID string)
  - `name*` (string)
  - `description` (string)
  - `acquisitionDate` (string, date)
  - `lastUsedDate` (string, date)
  - `imageFilesUrls` (string array)
  - `attributes` (Map<string, object>)
  - `tags` (string array)
- **UpdateItemRequest**:
  - `id*` (UUID string)
  - `name` (string)
  - `description` (string)
  - `acquisitionDate` (string, date)
  - `imageFilesUrls` (string array)
  - `attributes` (Map<string, object>)
  - `tags` (string array)
  - **TODO**: Revisit Swagger to check if `lastUsedDate` should be included in updates.

- **CreateCollectionRequest**:
  - `name*` (string)
  - `description` (string)
  - `coverImageUrl` (string)
  - `tags` (string array)
  - **TODO**: Revisit Swagger to check if `visibility` should be included in the creation payload.

- **UpdateCollectionRequest**:
  - `id*` (UUID string)
  - `name` (string)
  - `description` (string)
  - `coverImageUrl` (string)
  - `visibility` (Enum: `PUBLIC`, `PRIVATE`, `FRIENDS`)
  - `tags` (string array)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% alignment between frontend data models and the provided Swagger API documentation.
- **SC-002**: Users can complete the "rich" item creation flow (with 5+ fields) in under 1 minute.
- **SC-003**: In Debug Mode, all new fields are correctly reflected in the local session state immediately after saving.
- **SC-004**: Zero regressions in the basic creation flow (name/desc/photo) while adding the new fields.

## Assumptions

- **Date Format**: The system assumes dates are handled as strings in `YYYY-MM-DD` format or ISO-8601 for timestamps.
- **Mock Implementation**: Even though the target is the API, the current implementation will store this data in the ephemeral `Debug Mode` memory.
- **Image Uploads**: Actual image uploading to a server is out of scope for this task; we continue to use local cache URIs for `imageFilesUrls` and `coverImageUrl`.
- **Validation**: Basic frontend validation is sufficient for the debug mode (required fields check).
