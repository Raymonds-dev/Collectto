# Feature Specification: Unified Upload and Local Storage Service

**Feature Branch**: `015-centralize-uploads`  
**Created**: 2026-06-07  
**Status**: Draft  
**Input**: Quero centralizar a gestão de uploads para o backend. Atualmente a gestão do storage local está muito bagunçado e conclitando na hora de subir o arquivo para o S3. Quero centralizar isso e organizar melhor o storage para atender os padrões da API

## Clarifications

### Session 2026-06-07

- Q: Outros tipos de mídia (como vídeos ou documentos) estão fora de escopo? → A: Sim, apenas imagens (JPEG, PNG, WEBP, GIF) estão no escopo. Outros formatos estão explicitamente fora de escopo.
- Q: Como deve ser o feedback visual durante o upload? → A: Apenas estados de carregamento padrão (ActivityIndicator/Skeleton) são suficientes, sem necessidade de progresso em tempo real.
- Q: Como deve ser o tratamento de logs e observabilidade em falhas? → A: Apenas logs no console local com sanitização de PII e dados sensíveis são suficientes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unified Upload Flow & Temp Cleanup (Priority: P1)

A user wants to create a new item or collection and attach photos from their device camera or gallery. The photos should be saved in a temporary local cache (`/photos/temp/`) while they edit the form. Upon clicking "Save", the application must request presigned URLs, upload the photos to S3/Oracle cloud storage, and automatically delete the local cached files immediately upon a successful upload to avoid cluttering the device storage.

**Why this priority**: This is the core MVP requirement. It directly resolves the "messy local storage and S3 conflict" by defining a clear lifecycle for local files and ensuring that temporary files are cleaned up after a successful cloud upload.

**Independent Test**: 
1. Select/take an image (saved to `/photos/temp/`).
2. Submit the form to save the item.
3. The app requests a presigned URL, uploads the image to S3/Oracle, and deletes the file from `/photos/temp/`.
4. Verify that `/photos/temp/` is empty and the item has been created with the correct remote URL path.

**Acceptance Scenarios**:

1. **Given** a user has selected a photo and is saving an item, **When** the cloud upload succeeds, **Then** the local temporary photo is deleted from `/photos/temp/` within 5 seconds, and the relative path is sent to the backend database.
2. **Given** a user is saving an item, **When** the cloud upload fails due to network issues, **Then** the local temporary photo is NOT deleted from `/photos/temp/`, allowing the user to retry the upload.

---

### User Story 2 - Centralized Upload Service (Priority: P2)

As a developer, I want all file upload logic (`uploadProfilePhoto`, `uploadProfileBackground`, `uploadCollectionCover`, `uploadItemPhoto`) to be consolidated into a single, centralized `UploadService` in the frontend. This service will standardize how presigned URLs are requested, handle binary HTTP PUT uploads, validate content types, and provide uniform error mapping.

**Why this priority**: Eliminates duplicate and decentralized upload logic currently split between `profileService.ts` and `uploadService.ts`, establishing a clean, maintainable architecture.

**Independent Test**: Verify that the profile screen, collection creation screen, and item creation screen all import and use the same unified `UploadService` for their image upload needs.

**Acceptance Scenarios**:

1. **Given** a profile image change, **When** the upload is initiated, **Then** it goes through `UploadService.uploadProfilePhoto`, utilizing standardized Axios clients, headers, and error handling.
2. **Given** any upload operation, **When** the request is unauthorized (session expired), **Then** the service throws a standardized error redirecting the user to the login flow.

---

### User Story 3 - Debug Mode & Mock Storage Fallback (Priority: P3)

As a developer, I want the storage service to support a local mock mode (active when `isDebugModeEnabled` is true) where files are copied to a permanent local directory (`/photos/permanent/`) instead of being uploaded to the cloud, allowing offline testing and development without S3/Oracle Cloud credentials.

**Why this priority**: Maintains developer productivity when working offline or without cloud credentials, ensuring the app remains fully functional under mock storage profiles.

**Independent Test**: Enable debug mode, create a collection with a cover photo, and verify that the cover photo is copied to `/photos/permanent/collections/` and successfully rendered in the application using the local URI.

**Acceptance Scenarios**:

1. **Given** `isDebugModeEnabled` is true, **When** a user uploads a cover image, **Then** the service moves the image to `/photos/permanent/collections/`, bypasses S3/Oracle upload, and returns the local file URI.

---

### Edge Cases

- **App crashes or closes mid-upload**: Stale files left in the `/photos/temp/` directory due to crashes or form cancellations must be cleared by a periodic background cleanup task.
- **Upload timeout or connection loss**: When uploading multiple images for an item and one fails, the upload queue must halt, and the user must be given a clear retry option for the failed images without losing the successfully uploaded ones.
- **Large file selection**: If a user selects a file larger than 10MB, the frontend must intercept and block the upload before calling the backend for presigned URLs, displaying an alert to the user.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST implement a centralized `UploadService` class/module containing all remote upload operations: `uploadProfilePhoto`, `uploadProfileBackground`, `uploadCollectionCover`, and `uploadItemPhoto`.
- **FR-002**: The `UploadService` MUST use a unified `requestPresignedUpload` helper that contacts the backend `/uploads/presigned-urls` endpoint to obtain upload URLs.
- **FR-003**: The system MUST define a clear lifecycle for local files: save to `/photos/temp/` upon selection, upload to remote, and delete from `/photos/temp/` upon success.
- **FR-004**: In `isDebugModeEnabled` (or mock mode), the system MUST bypass remote uploads and instead copy files to local permanent storage (`/photos/permanent/`).
- **FR-005**: The system MUST implement file size validation on the frontend, rejecting files larger than 10MB before sending upload requests.
- **FR-006**: The system MUST sanitize media URIs and resolve correct content types (`image/jpeg`, `image/png`, `image/webp`, `image/gif`) before requesting presigned URLs.
- **FR-007**: Old profile pictures/covers MUST be deleted or cleaned up from remote storage when a new one is successfully uploaded (or when the entity is deleted).
- **FR-008**: The system MUST expose a background task or startup hook to clean up files in `/photos/temp/` older than 24 hours.
- **FR-009**: The application MUST display a standard activity indicator or skeleton loading state during file uploads instead of real-time percentage indicators.
- **FR-010**: All file upload logs (warnings/errors) MUST be recorded locally in the console, ensuring that all PII (such as JWT tokens, usernames, and emails) is sanitized and omitted.

### Key Entities *(include if feature involves data)*

- **LocalPhotoReference**: `{ localUri: string, tempId: string }`
- **PermanentPhotoReference**: `{ permanentUri: string, mediaType: string }`
- **UploadResult**: `{ filePath: string, uploadUrl: string }`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of temporary photos stored in `/photos/temp/` are deleted automatically within 5 seconds of a successful remote upload.
- **SC-002**: Consolidate 4 separate upload logic segments into a single `UploadService`, reducing code duplication by at least 40%.
- **SC-003**: In mock/debug mode, 100% of operations run completely offline and persist files locally without throwing network errors.

## Assumptions

- The backend API conforms to the presigned URL generation contracts defined in `uploads.ts`.
- Expo File System library is fully supported on both Android and iOS targets.
- Local temporary storage uses the device cache directory, which can be cleared by the OS if storage is low, while permanent storage uses the app document directory.
- Non-image media uploads (such as videos, audio, and documents) are explicitly out of scope for this service iteration.
