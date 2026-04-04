---
description: 'Use when editing or reviewing motion-related files in Collectto, especially src/hooks/useAnimation, src/components/ui/animated, or other animation wrappers. Enforces motion system references, semantic wrappers, and paired enter/exit behavior.'
applyTo: 'src/hooks/useAnimation/**', 'src/components/ui/animated/**', 'src/components/ui/Button.tsx', 'src/components/ui/OptionsBar.tsx'
---

# Collectto Motion Files

This instruction applies to motion-related files and reinforces the local animation design system.

## Required references

Before editing motion-related code, consult:

- [Motion System README](../../src/hooks/useAnimation/README.md)
- [Animation Semantic Standardization](../skills/animation-semantic-standardization/SKILL.md)
- [Project Standards](../../AGENTS.md)
- [Product Context](../PRODUCTS.md)

## Rules

1. Prefer semantic wrappers and hooks over ad-hoc Reanimated usage.
2. Keep enter and exit behavior paired when it makes sense for the UX.
3. Use tokens from `src/styles/tailwind/tokens.js` for motion defaults.
4. Do not pass undefined easing values to `withTiming`.
5. Keep motion readable and directional: users should understand where content came from and where it goes.
6. If a new motion behavior becomes recurring, update the motion README and semantic skill references.

## Review checklist

- Motion follows existing presets or wrappers.
- Exit animation matches the entry animation when appropriate.
- No duplicated timing logic exists where a shared hook would fit.
- Product scope stays inside Collectto collection-centric UX.
- Validation remains required after edits.
