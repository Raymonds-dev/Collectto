# Research: Comentários no Feed

**Purpose**: Resolve unknowns from Technical Context and identify best practices
**Created**: 2026-05-01

## Resolved Clarifications

### Tech Stack (No unknowns)

- **Decision**: React Native/Expo SDK 54 with TypeScript strict mode
- **Rationale**: Projeto already using Expo Router, Reanimated, NativeWind; continuation natural
- **Alternatives considered**: Standalone React components or Flutter – rejected because team expertise + existing codebase

### Animation & Motion (No unknowns)

- **Decision**: Use official motion presets (SlideUp, ScalePress, FadeIn, Stagger)
- **Rationale**: Constitution v1.0.0 enforces motion discipline; existing hooks/wrappers already established
- **Alternatives considered**: Ad-hoc Reanimated config – rejected by constitution (Microinterações principle)

### Component Reutilization (No unknowns)

- **Decision**: Reuse Button, AnimatedPressable, MotionView; create new Comment\* components in src/components/comments
- **Rationale**: Visual consistency + maintainability; existing UI patterns established in Post component
- **Alternatives considered**: Single monolithic component – rejected for reusability and future scaling

### Mock Data Strategy (No unknowns)

- **Decision**: Create src/mocks/comments.ts following mock-centralization skill; export via src/mocks/index.ts barrel
- **Rationale**: Skill prescribes domain-specific organization; easier future API migration
- **Alternatives considered**: Inline mocks in components – rejected by skill guidance

## Best Practices Applied

### Mobile UX

- Touch targets ≥44pt (nativo em React Native)
- Scroll preservation quando fecha comentários (context maintain)
- Skeleton loading cuando aplicável (Phase 2 refinement)
- Accessibility labels en todos os botões

### Componentização

- Comment: single comment display (reusable para threads, searches)
- CommentThread: list + input (scoped ao item do feed)
- CommentInput: input field standalone (reuse em outros contextos)
- Padrão: composition over inheritance

### Performance

- FlatList para listas de comentários (virtualization)
- Memoization onde render receba muitos props
- Lazy modal/expansion (não renderiza invisível)

## Deferred Decisions

None. Phase 1 data-model.md defines entity schema; Phase 2 tasks.md addresses implementation sequencing.
