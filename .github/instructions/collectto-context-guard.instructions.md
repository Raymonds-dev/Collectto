---
name: Collectto Context Guard
description: 'Use when planning or implementing multi-file features, refactors, architecture changes, navigation updates, or shared UI patterns in Collectto. Enforce PRODUCTS and AGENTS context first, then apply relevant skills.'
---

# Collectto Context Guard

Use this instruction for medium and large tasks that can affect architecture, product scope, or reusable patterns.

## Mandatory reading order

1. [Product Context](../PRODUCTS.md)
2. [Project Standards](../../AGENTS.md)
3. Relevant skills based on task type:

- [Animation Semantic Standardization](../skills/animation-semantic-standardization/SKILL.md)
- [Mock Centralization](../skills/mock-centralization/SKILL.md)
- [UI UX Pro Max](../skills/ui-ux-pro-max/SKILL.md)

## Applicability rule

Treat a task as medium/large when at least one condition is true:

- Changes touch 3 or more files
- Changes affect shared UI components
- Changes affect route/layout/navigation flow
- Changes introduce or refactor design-system patterns
- Changes include new motion behavior or mock domain shifts

## Enforcement checklist

Before editing:

1. Confirm product scope alignment from PRODUCTS
2. Confirm coding and validation rules from AGENTS
3. Map task category to one or more skills

During editing:

1. Prefer semantic wrappers, tokens, and reusable components
2. Avoid ad-hoc patterns when skill-covered alternatives exist
3. Keep changes scoped to the requested outcome

Before finalizing:

1. Run required validation scripts when code changed
2. Report related and unrelated failures separately
3. Document which skill logic was applied

## Non-scope guard

Do not introduce features outside Collectto scope, including:

- marketplace
- financial transactions
- chat/direct messaging
- gamification systems

## Output expectation

For medium/large tasks, always include:

1. Scope and product-fit decision
2. Standards and skills used
3. Summary of changes
4. Validation results
5. Risks or follow-up actions
