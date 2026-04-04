---
name: Collectto Standards Governance
description: 'Use when you need a quick decision on whether a proposed change requires updates to PRODUCTS.md, AGENTS.md, both, or neither. Best for standards review, scope changes, guardrails, and deciding if a refactor should be proposed.'
argument-hint: 'Descreva a mudanca ou a ideia para decidir se altera PRODUCTS.md, AGENTS.md ou nenhum'
agent: 'Collectto Standards Governor'
---

Classify the proposed change and decide whether the source of truth must change.

Task input from user:

{{input}}

Rules:

1. Decide whether the change belongs in PRODUCTS.md, AGENTS.md, both, or neither.
2. If code is involved, use the governor's workflow to coordinate a review with Collectto Standards Orchestrator before suggesting refactor locations.
3. Update documentation only when the decision criteria are clearly satisfied.
4. If refactor is optional, ask the user whether they want code changes after the standards decision.

Decision criteria:

- Update PRODUCTS.md when the change introduces a new screen, flow, feature, or product scope change.
- Update AGENTS.md when the change introduces a project-wide guardrail, reusable pattern, style rule, skill context, or validation expectation.
- Update neither when the change is local and does not affect product scope or global standards.

Required output:

1. Decision: PRODUCTS.md, AGENTS.md, both, or neither.
2. Why that decision is justified.
3. If code is involved, impacted files or areas from the orchestrator review.
4. A clear question if refactor is optional.
