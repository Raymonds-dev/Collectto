---
name: Collectto Standards Execution
description: 'Use when implementing or refactoring a feature in Collectto and you want strict orchestration by product context plus project skills. Best for scoped work by folder, screen, or flow.'
argument-hint: 'Descreva escopo, pastas, objetivo e criterios de aceite'
agent: 'Collectto Standards Orchestrator'
---

Execute the requested task with strict standards orchestration.

Task input from user:

{{input}}

Mandatory execution context:

- Read and enforce [Product Context](../PRODUCTS.md)
- Read and enforce [Project Standards](../../AGENTS.md)
- Apply [Animation Semantic Standardization](../skills/animation-semantic-standardization/SKILL.md) when motion/interaction appears
- Apply [Mock Centralization](../skills/mock-centralization/SKILL.md) when mock/fixture/TODO(api) appears
- Apply [UI UX Pro Max](../skills/ui-ux-pro-max/SKILL.md) when UI/UX/design work appears

Execution policy:

1. Restate scope in terms of folder/module responsibility.
2. Identify which skills are required for this task.
3. Implement only what is inside product scope.
4. Prefer existing wrappers, tokens, and reusable components.
5. Validate and report results with related and unrelated issues clearly separated.

Required output sections:

1. Scope and assumptions
2. Skills applied and why
3. Changes made
4. Validation status
5. Residual risks and next steps
