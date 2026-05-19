# Implementation Plan: Collection and Item Management

**Branch**: `feature/005-collection-item-management` | **Date**: 2026-05-18 | **Spec**: [spec.md](spec.md#L1)
**Input**: Feature specification from `spec.md`

**Note**: Plano gerado automaticamente por `/speckit.plan` com base na spec e no OpenAPI disponível em `/v3/api-docs`.

## Summary

Implementar telas de edição e ações em massa para `Collection` e `Item`, disponíveis somente para o proprietário. A implementação inicial será integrada ao modo DEBUG (dados em memória) e exporá contratos/serviços compatíveis com a API pública (OpenAPI `/v3/api-docs`) para facilitar futura migração para o backend real.

Estratégia confirmada para esta feature:

- Primeiro entregar DEBUG mode completo (editar, excluir e mover em massa/individual).
- Exigir endpoints `DELETE` no backend para integração real de exclusão.
- Tratar movimentação entre coleções como operação DEBUG-first enquanto não existe endpoint dedicado.
- Usar coleção de sistema fixa por usuário para `Sem categoria`.

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

## Delivery Strategy (Debug First)

### Phase A - Debug provider (entrega imediata)

- Implementar `edit`, `delete`, `move` e operações em massa no provider de DEBUG.
- Operações de exclusão e movimentação atualizam estado em memória e refletem instantaneamente na UI.
- `Sem categoria` representada por coleção de sistema fixa por usuário.

### Phase B - API integration (futura)

- Reaproveitar os mesmos contratos de serviço usados no DEBUG.
- Integrar updates com `PATCH /items/update` e `PATCH /collections/update`.
- Integrar exclusão com endpoints de backend a serem disponibilizados:
  - `DELETE /items/{itemId}` (ou equivalente)
  - `DELETE /collections/{collectionId}` com estratégia de itens vinculados
- Movimentação de item permanece bloqueada para API até endpoint dedicado (ou ajuste oficial de contrato) ser publicado.

## API Gaps & Dependencies

- Gap 1: Não há endpoint explícito para mover item entre coleções.
  - Decisão: operação disponível apenas em DEBUG na primeira entrega.
  - Dependência futura: endpoint dedicado de move (`PATCH /items/move` ou equivalente).

- Gap 2: Não há endpoint explícito de exclusão de item/coleção na documentação disponível.
  - Decisão: criar contratos frontend de exclusão desde já e habilitar integração real quando backend expor os endpoints DELETE.

- Gap 3: Estratégia para `Sem categoria`.
  - Decisão: coleção de sistema fixa por usuário (não nula), evitando ambiguidades de `collectionId = null`.

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

### Contract Additions for This Plan

- `contracts/UpdateItemRequest.ts`
- `contracts/UpdateCollectionRequest.ts`
- `contracts/DeleteItemRequest.ts`
- `contracts/DeleteCollectionRequest.ts`
- `contracts/MoveItemCommand.ts` (debug-first command contract)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
