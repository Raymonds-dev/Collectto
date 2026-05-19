# Research: Collection & Item Management

Date: 2026-05-18

Summary
- Alinhei os modelos de request/response com o OpenAPI exposto em `/v3/api-docs`.
- Decisão: usar `UpdateItemRequest` e `UpdateCollectionRequest` como contratos-canônicos no frontend, mesmo ao operar em DEBUG mode. Implementar adaptadores (DebugProvider <-> API adapter) que aceitam esses tipos.

Findings from OpenAPI
- `CreateItemRequest` requires: `collectionId`, `name`. Optional: `description`, `acquisitionDate`, `lastUsedDate`, `imageFilesUrls`, `attributes`, `tags`.
- `UpdateItemRequest` includes: `id`, optional `name`, `description`, `acquisitionDate`, `imageFilesUrls` (nullable semantics documented: null = keep existing, [] = remove all), `attributes` (map), `tags` (array).
- `CreateCollectionRequest` requires: `name`, `description`. Optional: `coverImageUrl`, `tags`.
- `UpdateCollectionRequest` includes: `id`, optional `name`, `description`, `coverImageUrl` (null = keep, empty string = remove), `visibility` (enum: `PUBLIC`|`PRIVATE`|`FRIENDS`), `tags`.
- Upload flow: API exposes `/uploads/presigned-urls` to obtain presigned URLs for direct upload; frontend should request pre-signed URLs when persisting new images and then set `imageFilesUrls`/`coverImageUrl` to the returned `filePath` values.

Decisions / Rationale
- Use API shapes exactly as source-of-truth to avoid translation bugs when switching from Debug provider to real API.
- Respect nullable semantics in `UpdateItemRequest.imageFilesUrls` and `UpdateCollectionRequest.coverImageUrl`.
- Implement frontend helpers for: `normalizeItemForUpdate(itemFormState) -> UpdateItemRequest` and `normalizeCollectionForUpdate(...)`.

Open Questions (resolved)
- Visibility enum chosen: `PUBLIC` / `PRIVATE` / `FRIENDS` (Default `PRIVATE`).
