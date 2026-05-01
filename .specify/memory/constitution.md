<!--
Sync Impact Report
Version change: template → 1.0.0
Modified principles:
- Principle 1 placeholder → Visual First
- Principle 2 placeholder → Fluidez Acima de Complexidade
- Principle 3 placeholder → Consistência > Criatividade Isolada
- Principle 4 placeholder → Coleção É Identidade
- Principle 5 placeholder → Microinterações, Performance e Motion Oficial
Added sections:
- Diretrizes de Produto e UX
- Diretrizes de Engenharia e Arquitetura
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

**Version**: 1.0.0 | **Ratified**: 2026-05-01 | **Last Amended**: 2026-05-01
