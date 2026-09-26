<!--
Sync Impact Report
Version change: 1.3.0 → 1.4.0
Modified principles:
- None
Added sections:
- Organização e Modularização de Componentes
Expanded sections:
- Diretrizes de Engenharia e Arquitetura (added explicit standards for component organization, submodules, and public API encapsulation)
Removed sections:
- None
Templates requiring updates:
- ✅ .specify/templates/plan-template.md (reviewed; aligned)
- ✅ .specify/templates/spec-template.md (reviewed; aligned)
- ✅ .specify/templates/tasks-template.md (reviewed; aligned)
Deferred items:
- None
-->

# Collectto Constitution

## Core Principles

### Visual First

Every user-facing surface MUST prioritize imagery, cards, grids, carousels, and other
visual cues over long copy. If a message can be shown visually, it MUST not be
explained in extended text. Dense text blocks are reserved for help, legal, or
editorial contexts where visual treatment cannot carry the meaning.

Rationale: Collectto is a product about pride in collections, so the first read must
be visual and immediate.

### Fluidez Acima de Complexidade

Interactions MUST feel lightweight, progressive, and local to the current surface.
Prefer state changes, expansion, inline detail, and progressive disclosure before
creating a new route or multi-step flow. Every simple user intent MUST take the fewest
possible steps that preserve clarity.

Rationale: movement without effort is part of the premium feel.

### Consistência > Criatividade Isolada

New work MUST reuse existing spacing, typography, tokens, motion, and component
patterns before introducing new ones. When a new pattern is unavoidable, it MUST be
implemented as a reusable component or system extension instead of a one-off visual
exception.

Rationale: familiarity reduces cognitive load and keeps the app feeling like one
product.

### Coleção É Identidade

Profile and collection experiences MUST emphasize curation, ownership, and personal
expression. Collection surfaces SHOULD favor strong covers, elegant organization,
and shareable presentation over generic list semantics.

Rationale: showing a collection is showing who the user is.

### Microinterações, Performance e Motion Oficial

Every interactive state MUST provide clear feedback, and all motion MUST use the
official presets or wrappers already defined in the codebase. Ad-hoc animations are
not permitted. Use SlideUp for details and expansion, FadeIn for gentle entry,
ScalePress for touch feedback, and Stagger for lists and grids. Loading states MUST
prefer skeletons, image-aware rendering, and efficient list behavior over blocking
spinners.

Rationale: microfeedback and consistent motion create the premium feel; performance
is part of the experience.

## Diretrizes de Produto e UX

The product MUST remain social without visual pollution. Feeds, comments, and discovery
surfaces SHOULD keep metrics restrained, actions obvious, and content dominant.

Mobile UX MUST remain first-class: touch targets need comfortable sizing, scroll must
feel natural, accessibility basics are mandatory, and contextual loading states MUST be
used instead of bare spinners whenever the user is waiting.

Navigation SHOULD prefer inline detail, expanding cards, and section swaps before
creating a new screen. New routes are justified only when the interaction cannot be
expressed cleanly on the current surface.

When a Figma design or captured reference exists, it MUST be treated as the source of
truth for layout and visual hierarchy. Behavior and UX may be adapted to the codebase,
but the visual intent must not be reinvented.

## Diretrizes de Engenharia e Arquitetura

Screens control flow, page-level state, and navigation decisions. Components render UI
and local interactions. Shared behavior MUST be extracted into reusable components or
hooks when repetition appears or when a pattern is expected to scale.

Local state MUST be preferred before global state. Global state is reserved for
cross-screen coordination, persistence, or auth-level concerns that cannot stay local.

Code MUST stay simple, explicit, and predictable. Complex control flow should be
reduced with guard clauses, and public contracts SHOULD use explicit TypeScript types.
Accessibility labels, touch feedback, and safe interaction states are required for
user-facing actions.

### Arquitetura Multiplataforma (Web & Native)

- **Isolamento de Infraestrutura por Adaptadores**: Serviços de infraestrutura, armazenamento e upload com dependências de plataforma (ex: `SecureStore`, `FileSystem`, `localStorage`) MUST ser isolados via adaptadores e extensões de arquivo nativas do bundler (`.web.ts` e `.native.ts`) ou subpastas de adaptadores.
- **Componente Único e Responsividade**: Telas e componentes visuais MUST ser mantidos em arquivo único utilizando NativeWind com utilitários responsivos (`md:`, `lg:`) e containers delimitadores (`max-w-* mx-auto`), sendo expressamente vedada a duplicação de telas inteiras apenas para suporte à Web.
- **Fallbacks Nativos**: Quando bibliotecas nativas de UI/corte (ex: `ViewShot`) não tiverem suporte equivalente direto na Web, MUST-SE utilizar adaptadores visuais isolados (ex: HTML5 Canvas para corte de imagem) preservando o componente de tela principal intacto.

### Organização e Modularização de Componentes

- **Camada UI / Design System (`src/components/ui/`)**: Componentes atômicos e agnósticos (`Button`, `Card`, `Modal`, `SearchInput`). Expressamente vedada lógica de negócio ou dependência direta de stores de entidades.
- **Features e Domínios Simples (`src/components/<feature>/`)**: Para funcionalidades com até 5-6 arquivos (ex: `settings/`, `comments/`, `notifications/`), deve-se manter uma pasta plana com arquivo barrel `index.ts`.
- **Fluxos Complexos e Wizards Multi-etapas (`src/components/<fluxo>/`)**: Fluxos extensos (ex: `create-item/`) MUST ser decompostos em subpastas funcionais por etapa ou responsabilidade (`photos/`, `form/`, `collection/`, `preview/`, `feedback/`), mantendo o orquestrador raiz da tela e steppers na raiz da feature.
- **Encapsulamento e API Pública (`index.ts`)**: Componentes externos e telas de rotas (`src/app/`) MUST consumir a feature exclusivamente através do barrel export público (`index.ts`). É expressamente vedado o acoplamento ou import direto de telas a subpastas internas de implementação.

### Padrões de Código Escrito e Qualidade

- **Uso de Arrow Functions**: Funções auxiliares, helpers, utilitários, hooks e callbacks globais MUST ser declarados através de arrow functions atribuídas a constantes. Componentes React, métodos de classe e callbacks inline são exceções permitidas.
- **Tipagem Estrita**: Declarações em TypeScript MUST evitar o tipo `any`, preferindo tipos estruturados, união de tipos literais ou `unknown`. Contratos de serviço, utilitários e APIs públicas MUST ter anotações explícitas de parâmetros e retorno.
- **Estruturas de Controle**: O aninhamento profundo de condicionais MUST ser evitado através de retornos precoces (*guard clauses*).
- **Gates de Qualidade**: Antes de qualquer commit ou pull request, o código MUST passar livre de warnings ou erros pelo linter, TypeScript compiler e formatador através da execução do comando `npm run validate`.
- **Tratamento Resiliente de Erros**: Falhas de comunicação externa MUST ser tratadas usando o mapeador centralizado em português (pt-BR) com códigos de diagnósticos simplificados anexados para o usuário.
- **Segurança de Logs**: Logs gerados pelo aplicativo MUST sanitizar e omitir qualquer informação pessoal identificável (PII), incluindo e-mails, tokens JWT e credenciais brutas, priorizando armazenamento temporário em memória (buffer FIFO circular).
- **Padrão de Branches e Commits**: Branches de desenvolvimento MUST seguir o formato `<tipo>/<descricao-curta>`, onde o tipo é uma categoria semântica (`feature/`, `fix/`, `refactor/`, `chore/`). As mensagens de commit correspondentes MUST ser curtas e indicar o objetivo principal em português.
- **Desenvolvimento Multiplataforma**: Funcionalidades e componentes desenvolvidos MUST priorizar a compatibilidade nativa em Android, iOS e Web. Deve-se adotar soluções multiplataforma explícitas e consistentes, como o uso de adaptadores de plataforma (`.web.ts` e `.native.ts`) para APIs de sistema e NativeWind para responsividade de tela.

## Governance

This constitution supersedes local style preferences, ad-hoc patterns, and conflicting
implementation habits. Every feature plan, spec, and task set MUST be checked against
these principles before work starts and again before merge.

Amendments require a documented rationale, a semantic version bump, and an explicit
review of affected templates and guidance files. Versioning follows semantic rules:
MAJOR for incompatible principle changes, MINOR for new principles or materially
expanded guidance, and PATCH for clarifications or wording improvements.

Compliance review MUST verify visual hierarchy, motion discipline, accessibility,
performance, and component reuse. If a change violates the constitution, the plan
must record the violation and the reason a simpler compliant alternative was rejected.

**Version**: 1.4.0 | **Ratified**: 2026-05-01 | **Last Amended**: 2026-09-26
