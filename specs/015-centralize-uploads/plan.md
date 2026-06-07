# Implementation Plan: Unified Upload and Local Storage Service

**Branch**: `015-centralize-uploads` | **Date**: 2026-06-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/015-centralize-uploads/spec.md`

## Summary

Centralize all frontend media upload operations and local file cache storage lifecycles. We will create a unified `UploadService` that coordinates requests for pre-signed URLs from the backend and performs binary PUT requests to storage. We will refactor local storage so that chosen/taken files are kept in `/photos/temp/` and deleted immediately after successful upload, removing redundant moves to local permanent storage and preventing device storage leakage.

## Technical Context

**Language/Version**: TypeScript 5.x / React Native (Expo)  
**Primary Dependencies**: `expo-file-system/legacy`, `axios` (centralized client wrapper)  
**Storage**: Device Cache Directory (`/photos/temp/`) and App Documents Directory (`/photos/permanent/`)  
**Testing**: Jest / React Native Testing Library  
**Target Platform**: iOS 15+, Android 8.0+  
**Project Type**: mobile-app  
**Performance Goals**: File copy under 100ms, upload under 5s on normal mobile connections, UI responsiveness maintained.  
**Constraints**: Absolute cleanup of local temp files post-upload; frontend-only mock fallback for offline/debug.  
**Scale/Scope**: Refactoring all 3 areas of media upload (profile picture, profile background, collection cover, item photos).

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

1. **Uso de Arrow Functions**: All helper, service, and utility functions in `UploadService` and `local-provider` must be written as arrow functions assigned to `const` statements.
2. **Tipagem Estrita**: No `any` type allowed. All request and response structures must use strict types defined in `contracts/upload.ts`.
3. **Estruturas de Controle**: Early returns (guard clauses) must be used for validation (e.g. file size checks, content type checks).
4. **Gates de Qualidade**: Code must pass `npm run validate` (linting, type-checking, formatting) before commit/merge.
5. **Tratamento Resiliente de Erros**: Network or upload failures must be mapped to friendly messages in Portuguese (pt-BR) with diagnostic codes.
6. **Segurança de Logs**: Omit JWT tokens, email addresses, and raw credentials in log messages.

## Project Structure

### Documentation (this feature)

```text
specs/015-centralize-uploads/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── upload.ts        # Type contracts for payloads
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── hooks/
│   ├── useCollectionCreation.ts   # Updated: use UploadService cover upload & cleanup
│   └── useItemSave.ts             # Updated: use UploadService media upload & cleanup
├── services/
│   ├── api/
│   │   ├── api.ts                 # Export presigned upload request
│   │   └── uploadService.ts       # Refactored: central UploadService functions
│   ├── photo-storage/
│   │   └── local-provider.ts      # Refactored: clean cache directories & operations
│   └── profileService.ts          # Updated: delegate profile photo/bg upload to uploadService.ts
└── types/
    └── photo-storage.ts           # Type definitions for local providers
```

**Structure Decision**: Single React Native project layout with files located under `src/` organized by service and hook domains.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations detected.
