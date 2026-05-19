# Implementation Plan: Collection and Item Management

**Branch**: `feature/005-collection-item-management` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md#L1)
**Input**: Feature specification from `spec.md`

**Note**: Plano gerado automaticamente por `/speckit.plan` com base na spec e no OpenAPI disponível em `/v3/api-docs`.

## Summary

Implementar telas de edição e ações em massa para `Collection` e `Item`, disponíveis somente para o proprietário. A implementação inicial será integrada ao modo DEBUG (dados em memória) e exporá contratos/serviços compatíveis com a API pública (OpenAPI `/v3/api-docs`) para facilitar futura migração para o backend real. As atualizações de frontend devem usar estruturas de request alinhadas com `UpdateItemRequest` e `UpdateCollectionRequest` (conforme Swagger).

## Technical Context

**Language/Version**: TypeScript (Node 20+), React Native (Expo).  
**Primary Dependencies**: Expo, Expo Router, NativeWind, TypeScript, React Navigation.  
**Storage**: Debug in-memory provider (existing mocks under `src/mocks` and `src/services/debug`).  
**Testing**: Jest + React Native Testing Library for components; unit tests for service adapters.  
**Target Platform**: iOS and Android (Expo-managed); web optional.  
**Project Type**: Mobile frontend integrating with REST API.  
**Performance Goals**: Responsive forms (<500ms perceived), bulk operations safe for up to 50 items.  
**Constraints**: Feature must work in DEBUG mode without external API calls.  
**Scale/Scope**: Two primary screens (collection edit full-screen, item edit), list + bulk selection UI.

## Constitution Check

No constitution violations detected for documentation-only changes. Re-check after design if implementation requires new dependencies or API key handling.

## Project Structure

### Documentation (this feature)

```text
specs/005-collection-item-management/
├── plan.md              # This file (generated)
├── research.md          # Phase 0 findings (generated)
├── data-model.md        # Phase 1 data model (generated)
├── quickstart.md        # Phase 1 quickstart (generated)
├── contracts/           # TypeScript contract interfaces (generated)
└── checklists/requirements.md
```

### Source Code (repository impact)

Keep code changes inside existing frontend structure. Recommended layout for implementation tasks:

```text
src/
├── components/
│   ├── collection/
│   │   └── CollectionItemsBulkList.tsx
│   └── item/
│       └── ItemEditForm.tsx
├── screens/
│   ├── collection/
│   │   └── EditCollectionScreen.tsx
│   └── item/
│       └── EditItemScreen.tsx
├── services/
│   ├── api/
│   │   ├── collectionService.ts   # adapter to API or debug provider
│   │   └── itemService.ts
│   └── debug/                     # debug-mode implementations already present
└── types/
    └── api.ts                      # typedefs generated from OpenAPI contracts
```

**Structure Decision**: Reuse existing `src/providers` and `src/services` abstractions; add adapter services and screens as new files. Contracts will live in `specs/.../contracts` and be copy-pasted to `src/types/api.ts` during implementation.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
