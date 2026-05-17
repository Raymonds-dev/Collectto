<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
[specs/004-api-aligned-creation/plan.md](specs/004-api-aligned-creation/plan.md)
<!-- SPECKIT END -->

# Collectto Context Guard

Use these instructions for medium and large tasks that affect architecture, product scope, or reusable patterns.

## Mandatory reading order

1. [Product Context](.github/PRODUCTS.md)
2. [Project Standards](AGENTS.md)
3. Relevant skills: `animation-semantic-standardization`, `mock-centralization`, `ui-ux-pro-max`.

## Applicability rule

Treat a task as medium/large when:
- Changes touch 3 or more files.
- Changes affect shared UI components.
- Changes affect route/layout/navigation flow.
- Changes introduce or refactor design-system patterns.
- Changes include new motion behavior or mock domain shifts.

## Enforcement checklist

- **Alignment**: Confirm product scope (PRODUCTS) and coding rules (AGENTS).
- **Patterns**: Prefer semantic wrappers, tokens, and reusable components.
- **Scope**: Keep changes focused; do not introduce non-scope features (marketplace, chat, gamification, etc.).
- **Validation**: Run validation scripts after code changes.

