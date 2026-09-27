# Project Guidelines

## Purpose

These instructions keep Copilot aligned with the project standards documented in [AGENTS.md](../AGENTS.md) and with the current Expo Router architecture used in this repository.

## Build and Validation

- Use Node.js 20+ and npm 10+.
- Install dependencies with `npm install`.
- Run the app with `npm run start`, `npm run android`, `npm run ios`, or `npm run web`.
- Before finalizing code changes, run `npm run validate`.
- If Expo Router navigation or cache issues appear, run `npm run cache:clear`.

## Command Set

- `npm run lint`
- `npm run lint:fix`
- `npm run type-check`
- `npm run format`
- `npm run format:check`
- `npm run validate`

Prefer the existing scripts above. Do not introduce alternate script names unless the package.json is updated at the same time.

## TypeScript Conventions

- Prefer arrow function assignments for TypeScript functions.
- Use explicit parameter and return types in public functions, service contracts, and shared utilities.
- Avoid `any`; prefer `unknown`, unions, interfaces, and semantic types.
- Keep functions small and single-purpose.
- Use guard clauses to reduce nesting when that improves readability.
- React component definitions, class methods, and inline callbacks are the only exceptions to the arrow-function rule.

## Architecture

- This project uses Expo Router with route groups in `src/app`:
  - `(auth)`: unauthenticated flow.
  - `(tabs)`: authenticated flow.
- Route guarding and auth redirects are handled in `src/app/_layout.tsx` via `AuthProvider` and `AuthGate`.
- Keep responsibilities separated:
  - `src/providers`: app state and context boundaries.
  - `src/services`: storage and API access logic with no UI concerns.
  - `src/components/ui`: reusable UI primitives.
  - `src/components/<feature>`: feature-level composed components.
  - `src/types`: shared domain and app types.

## Code Conventions

- Prefer TypeScript strict-safe changes and explicit types for public props and service contracts.
- Use path aliases from `tsconfig.json` such as `@/components`, `@/services`, and `@/types`.
- Avoid long relative imports across layers.
- Prefer named exports for components and utilities when practical.
- Keep code self-documenting; add comments only when they explain non-obvious intent.
- Remove unused imports, variables, and dead code.

## UI and Styling Conventions

- Reuse primitives in `src/components/ui` before creating new custom controls.
- Keep UI token-driven with NativeWind classes backed by `src/styles/tailwind/tokens.js`.
- Avoid hardcoded brand, surface, or text colors when a token exists.
- Use `expo-linear-gradient` and `StyleSheet` only where NativeWind support is limited.
- Follow the token and naming guidance in `src/styles/tailwind/README.md`.
- Do not introduce broad dark-mode behavior unless product scope explicitly requires it.

## Testing, Linting, and Quality

- New features should include appropriate test coverage.
- Bug fixes should include regression tests.
- Tests should be written with the project's testing framework when available.
- Run linting before finalizing changes and keep ESLint at zero warnings.
- Run formatting before finalizing changes and keep Prettier output clean.
- Keep type checking clean and fix type errors before closing a task.

## Accessibility

- Give buttons `accessibilityRole` and `accessibilityLabel`.
- Use `hitSlop` when touch targets need to be larger.
- Do not depend only on color to communicate state.
- Preserve contrast between text and background.

## Security and Safety

- Validate user input and handle errors predictably.
- Do not store sensitive data in `localStorage` or `sessionStorage`.
- Review new dependencies for known security issues before adding them.
- Treat client-side owner or visitor UI states as UX only; authorization must still be enforced by the backend.

## Pitfalls and Environment Notes

- Keep Expo Router peer dependencies aligned for SDK 54: `expo-constants`, `expo-linking`, and `react-native-screens`.
- Do not add legacy `eslint-env` header comments to flat ESLint config files.
- For local image background URIs, prefer the established patterns used in tab and profile screens.

## Multiplatform Conventions

- Prioritize cross-platform compatibility for both Android and iOS in all developed features.
- Avoid relying solely on automatic platform-specific behaviors (such as automatic FlatList scrolling on Android when the keyboard opens).
- Implement explicit, consistent cross-platform solutions, such as using `KeyboardAvoidingView` to ensure input fields or interactive content are not obscured by the keyboard.
- Third-party libraries (e.g., specialized keyboard packages) are permitted only when a native solution is not viable or performant.

## References

- Project overview and setup: README.md
- Branch and PR flow: BRANCHING.md
- Tailwind and NativeWind tokens: src/styles/tailwind/README.md
- Project rules: AGENTS.md

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan at [specs/019-architecture-refactoring/plan.md](file:///C:/Users/garam/.projetos/Collectto/frontend/specs/019-architecture-refactoring/plan.md)
<!-- SPECKIT END -->
