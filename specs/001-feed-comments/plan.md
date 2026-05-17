# Implementation Plan: Comentários no Feed

**Branch**: `feature/001-feed-comments` | **Date**: 2026-05-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-feed-comments/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Adicionar a capacidade de visualizar, ler e criar comentários no feed do Collectto. Os usuários devem ver um comentário teaser em cada item do feed para criar curiosidade social, clicar para abrir a visualização completa de comentários do item, e publicar novos comentários mantendo o contexto. Mocks serão centralizados seguindo a skill de mock-centralization, reutilizando componentes existentes (Button, AnimatedPressable, MotionView) e padrões de dados já estabelecidos (builders mock, tokens de tailwind).

## Technical Context

**Language/Version**: TypeScript 5+ (React Native/Expo SDK 54)  
**Primary Dependencies**: Expo Router, React Native, Reanimated, NativeWind, Ionicons  
**Storage**: Mock data centralized in src/mocks; API integration deferred  
**Testing**: ESLint, Prettier, TypeScript strict mode via npm run validate  
**Target Platform**: iOS 13+, Android 7+, Web (React Native Web)  
**Project Type**: Mobile app (React Native/Expo)  
**Performance Goals**: 60 fps animations, <100ms interaction response  
**Constraints**: Mobile-first UX, accessibility labels mandatory, touch targets ≥44pt  
**Scale/Scope**: Feature scope: comment display + creation on feed items; mock data for 2–3 comments per item

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

✅ **Visual First**: Comentários exibem-se inline com teaser visual sem bloqueio de tela.  
✅ **Fluidez**: Abertura de comentários via expansion inline/modal leve, sem nova rota.  
✅ **Consistência**: Reutilizar Button, AnimatedPressable, MotionView; novos componentes como reutilizáveis.  
✅ **Microinterações**: Motion usa presets SlideUp para abertura, ScalePress para botões.  
✅ **Componentização**: Extrair Comment, CommentThread, CommentInput como reutilizáveis em src/components/comments/.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── post/                          # Existing Post component, callback for comments
│   ├── comments/                      # NEW: feature-scoped comment components
│   │   ├── Comment.tsx                # Single comment display
│   │   ├── CommentThread.tsx          # Comment list + input for item
│   │   ├── CommentInput.tsx           # Composable input field
│   │   └── index.ts                   # Exports
│   └── ui/
│       ├── Button.tsx                 # Existing, reuse for actions
│       └── animated/                  # Existing, use MotionView, AnimatedPressable
├── mocks/
│   ├── posts.ts                       # Existing, add teaser comment + mock builder
│   └── comments.ts                    # NEW: comment mock data + builders
├── app/
│   └── (tabs)/
│       └── index.tsx                  # Feed screen, integrate comment interactions
```

**Structure Decision**:  
Mobile-first React Native app using Expo Router. Comment feature layers on top of existing Post component. Reuse Button, AnimatedPressable, MotionView from existing UI library. Create comment-specific components (Comment, CommentThread, CommentInput) in src/components/comments for reusability. Centralize mock comment data in src/mocks/comments.ts following the mock-centralization skill (domínio-specific export). Update src/mocks/index.ts barrel to export new comments domain. Feed screen dispatches onPressComment callback from Post component. Comments open via inline expansion or modal (design TBD in Phase 1), not a new route.

## Complexity Tracking

> **No constitution violations**. All work aligns with Visual First, Fluidez, Consistência, and Microinterações principles.
