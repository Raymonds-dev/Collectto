# Implementation Plan: Ephemeral Debug Mode

**Branch**: `003-create-feature-spec` | **Date**: 2026-05-12 | **Spec**: [specs/003-ephemeral-debug-mode/spec.md](specs/003-ephemeral-debug-mode/spec.md)
**Input**: Feature specification from `/specs/003-ephemeral-debug-mode/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implementar modo DEBUG efêmero para Collectto permitindo testes offline com dados em memória, mock de autenticação, e visualização de fluxos sem conectividade externa. O modo será ativado via variável de ambiente, inicializará dados seed na autenticação, e manterá estado efêmero sincronizado entre telas durante a sessão. Preparar contratos de serviço estáveis para facilitar migração futura para API real sem reescrever fluxos de UI.

## Technical Context

**Language/Version**: TypeScript 4.x (strict mode), React 19.1.0, React Native 0.81.5  
**Primary Dependencies**: Expo SDK 54, Expo Router 6.0.23, React Native Reanimated 4.1.1, NativeWind (Tailwind), uuid 14.0.0  
**Storage**: AsyncStorage (sessão em memória), expo-file-system (cache local de imagens)  
**Testing**: Jest, React Native Testing Library  
**Target Platform**: iOS, Android, Web (via Expo)  
**Project Type**: Mobile App (React Native social collection platform)  
**Performance Goals**: 60 fps animations, <2s initial load, <1s state sync between screens  
**Constraints**: Offline-capable, lightweight in-memory storage, accessibility compliance, consistent UX parity with API mode  
**Scale/Scope**: Single tester session, ~5 core screens (auth, profile, collections, create item, feed)

## Constitution Check (Re-validated Post-Design)

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Constraints Verification (Final)

**Visual First**: ✅ CONFIRMED AFTER DESIGN

- UI componentes reutilizados (ProfileHeader, CollectionGrid, ItemCard)
- Dados efêmeros não alteram visual design
- Nenhum novo componente visual criado para DEBUG
- Feed reflete visualmente posts sem mudança de treatment

**Fluidez Acima de Complexidade**: ✅ CONFIRMED AFTER DESIGN

- DebugSession em Context Provider (não adiciona routing complexity)
- Estado sync <1s entre telas (sem spinners)
- Login automático (0 steps de autenticação)
- Sem multi-step flows; tudo local

**Consistência > Criatividade Isolada**: ✅ CONFIRMED AFTER DESIGN

- Contratos de serviço reutilizáveis (AuthService, ProfileService, etc)
- Derivação de posts segue padrão único (DESC by createdAt)
- Validações reusadas entre DEBUG e API mode
- Motion presets FadeIn/SlideUp alinhados com sistema oficial

**Coleção É Identidade**: ✅ CONFIRMED AFTER DESIGN

- DEBUG seed data destaca coleções diversas (Carros, Sneakers, Relógios)
- Profile mostra coleções criadas claramente
- Feed apresenta posts derivados com item preview visual
- Coleção como expressão de identidade mantida

**Microinterações, Performance e Motion Oficial**: ✅ CONFIRMED AFTER DESIGN

- State sync <1s (confirmado em data-model.md)
- Sem spinners bloqueantes (lógica local)
- Feedback via FadeIn preset para novos itens/collections
- Performance: em-memória = zero latência

### Design Artifacts Generated ✅

- ✅ research.md - Todas clarificações resolvidas
- ✅ data-model.md - Entidades, relacionamentos, invariantes definidos
- ✅ contracts/ - 5 service contracts (auth, profile, collections, items, posts)
- ✅ quickstart.md - Instruções para ativar e testar DEBUG mode

**GATE STATUS**: ✅ PASSED (Final) - Design alinhado com todos princípios; pronto para Phase 2 (Tasks)

## Project Structure

### Documentation (this feature)

```text
specs/003-ephemeral-debug-mode/
├── plan.md              # This file (/speckit.plan command output) ✅ COMPLETE
├── research.md          # Phase 0 output ✅ COMPLETE
├── data-model.md        # Phase 1 output ✅ COMPLETE
├── quickstart.md        # Phase 1 output ✅ COMPLETE
├── contracts/           # Phase 1 output ✅ COMPLETE
│   ├── auth.contract.ts
│   ├── profile.contract.ts
│   ├── collections.contract.ts
│   ├── items.contract.ts
│   └── posts.contract.ts
└── tasks.md             # Phase 2 output (/speckit.tasks command - PENDING)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── _layout.tsx          # Auth detection & route guarding (modify for DEBUG)
│   ├── (auth)/
│   │   └── login.tsx        # Integrate seed credentials for DEBUG
│   └── (tabs)/
│       ├── profile/         # Show collections created in session
│       ├── collections/     # Display ephemeral collections
│       ├── create-item/     # Trigger collection + item creation
│       ├── discover/        # Show posts derived from items
│       └── feed/            # Display session posts
├── providers/
│   ├── AuthProvider.tsx     # Detect DEBUG ↔ load seed session
│   ├── CollectionContextProvider.tsx  # Ephemeral collection state
│   └── ItemContextProvider.tsx        # Ephemeral item state
├── services/
│   ├── api/                 # Existing API layer (not used in DEBUG)
│   ├── debug/               # NEW: Debug data & session management
│   │   ├── debugSession.ts  # In-memory session singleton
│   │   ├── seedData.ts      # Seed user, collections, items
│   │   └── mockAuthService.ts
│   └── photo-storage/       # Use for cache-based image storage
├── types/
│   ├── debug.ts            # NEW: Debug-mode specific types
│   └── [existing types]
├── mocks/                  # Existing mock data (expand for DEBUG)
└── components/
    └── ui/                 # Reuse existing UI components
```

**Structure Decision**: Collectto é um app React Native/Expo com Expo Router. O debug mode será implementado como:

1. Nova camada em `src/services/debug/` para gerenciar estado efêmero e seed
2. Modificação em `AuthProvider` para detectar DEBUG e carregar dados seed
3. Context providers existentes (Collection, Item) usarão memória em DEBUG
4. Interfaces de contrato em `/contracts/` para possível swap futuro de implementação
5. Sem novas telas; fluxos existentes reutilizados com dados em memória

**Architecture Decisions (Clarified from Phase 1):**

1. **AuthProvider Integration**: DebugSession integrado em AuthProvider via hooks separados (`useDebugSession()`, `useAuthSession()`) para modularidade sem ficar enorme
2. **Seed Data Location**: `src/mocks/debug-seed.ts` (novo arquivo centralizado) para armazenar SEED_PROFILE, SEED_COLLECTIONS, SEED_ITEMS
3. **Post Derivation**: Função pura em `src/services/debug/postDerivation.ts` para Item → PostProjection transformation
4. **Service Contracts**: Interfaces em `/contracts/` servem como templates; implementações em `src/services/debug/` seguem os contratos para facilitar swap por API real
5. **Testing Strategy**: Sem testes de regressão extras; foco em simplicidade local; validação manual e e2e se necessário

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations found**. Constitution gate passed successfully.

## Phase 0: Research Findings (COMPLETED) ✅

All 9 NEEDS CLARIFICATION items from the specification phase have been resolved in [research.md](research.md):

**Key Decisions Made:**

| Topic           | Decision                            | Rationale                                   |
| --------------- | ----------------------------------- | ------------------------------------------- |
| Session State   | Context in-memory                   | Padrão projeto; sem persistência necessária |
| Photo Cache     | expo-file-system + factory          | Integração simples; já instalado            |
| API Schemas     | Tipos locais + referência           | Alinhado com interface existente            |
| IDs             | UUID v4 strings                     | Package instalado; padrão universal         |
| Logging         | console.\* nativo                   | Mobile-first; suficiente para DEBUG         |
| Post Derivation | Item → Post via mapeamento          | Transformação simples; 1:1 mapping          |
| Validation      | Reutilizar lógica existente         | DRY; UX parity entre DEBUG e API            |
| Testing         | Jest + React Native Testing Library | Padrão projeto                              |
| Mode Locking    | Imutável em runtime                 | Simplifica design; requer restart           |

**See Also**: [research.md](research.md) contains full decision tables, rationale, and alternatives considered.
