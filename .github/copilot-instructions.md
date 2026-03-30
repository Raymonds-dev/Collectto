# Project Guidelines

## Build and Validation

- Use Node.js 20+ and npm 10+.
- Install dependencies with: npm install.
- Run the app with: npm run start (or npm run android, npm run ios, npm run web).
- Before finalizing code changes, run: npm run validate.
- If navigation/cache issues appear in Expo Router, run: npm run cache:clear.

## Architecture

- This project uses Expo Router with route groups in src/app:
  - (auth): unauthenticated flow.
  - (tabs): authenticated flow.
- Route guarding and auth redirects are handled in src/app/\_layout.tsx via AuthProvider/AuthGate.
- Keep responsibilities separated:
  - src/providers: app state and context boundaries.
  - src/services: storage/API access logic (no UI concerns).
  - src/components/ui: reusable UI primitives.
  - src/components/<feature>: feature-level composed components.
  - src/types: shared domain and app types.

## Code Conventions

- Prefer TypeScript strict-safe changes and explicit types for public props and service contracts.
- Use path aliases from tsconfig (for example @/components, @/services, @/types).
- Avoid long relative imports across layers.
- Prefer named exports for components and utilities.
- Keep UI token-driven: use NativeWind classes backed by src/styles/tailwind/tokens.js.
- Avoid hardcoded brand/surface/text colors in components when a token exists.

## UI and Styling Conventions

- Reuse primitives in src/components/ui before creating new custom controls.
- For gradient-heavy sections, use expo-linear-gradient and keep complex style objects in StyleSheet when className support is limited.
- Dark-mode tokens exist, but do not introduce broad dark-mode behavior unless explicitly requested by product/design scope.

## Pitfalls and Environment Notes

- Keep Expo Router peer dependencies aligned for SDK 54 (expo-constants, expo-linking, react-native-screens).
- Do not add legacy eslint-env header comments to flat ESLint config files.
- For local image background URIs, prefer established project patterns used in tab/profile screens.

## Project References

- Project overview and setup: README.md
- Branch and PR flow: BRANCHING.md
- Tailwind/NativeWind tokens and naming: src/styles/tailwind/README.md
- Following rules in .agents/rules
