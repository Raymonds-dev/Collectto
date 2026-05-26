# Implementation Plan: API-Aligned Item and Collection Creation

**Branch**: `feature/004-api-aligned-creation` | **Date**: 2026-05-17 | **Spec**: [specs/004-api-aligned-creation/spec.md](spec.md)
**Input**: Feature specification for aligning item and collection creation with API data models.

## Summary

Align the item and collection creation flows with the backend API schema (Swagger). This involves adding new fields such as acquisition date, usage date, attributes (key-value), tags, and visibility settings. We will prioritize a "Debug Mode first" approach using ephemeral storage while ensuring interfaces are ready for API integration. A key technical requirement is refactoring the existing `DatePicker` logic from the registration flow into a reusable UI component. Implementation will strictly follow the provided Swagger documentation, with TODO markers to revisit discrepancies (like missing update fields).

## Technical Context

**Language/Version**: TypeScript 5.x, React Native (Expo)
**Primary Dependencies**: `react-native-calendars`, `expo-router`, `nativewind`
**Storage**: Ephemeral Debug Mode (In-memory mock)
**Testing**: Manual validation in Debug Mode
**Target Platform**: iOS, Android (Expo)
**Project Type**: Mobile App
**Performance Goals**: Instant feedback on data entry, fluid transitions
**Constraints**: Visual First, surgical updates, component reuse
**Scale/Scope**: Creation and Update flows for Items and Collections

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

1. **Visual First**: All new fields must use standard UI patterns (DatePickers, Chips for tags, Row-based attributes).
2. **Fluidez**: Use native components for smooth interaction.
3. **Consistência**: Refactor `DatePicker` to `src/components/ui/` for reuse.
4. **Microinterações**: Provide clear feedback on tag addition and attribute removal.

## Project Structure

### Documentation (this feature)

```text
specs/004-api-aligned-creation/
├── plan.md              # This file
├── research.md          # Research findings
├── data-model.md        # Updated data models
├── quickstart.md        # Integration guide
└── checklists/          # Requirements validation
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/
│   │   ├── DatePicker.tsx       # REFACTORED from user_create.tsx
│   │   ├── TagInput.tsx         # NEW: Chip-based tag input
│   │   └── AttributeInput.tsx   # NEW: Key-value row input
│   └── create-item/
│       ├── ItemForm.tsx         # UPDATED: Added dates, tags, attributes
│       └── CollectionCreationForm.tsx # UPDATED: Added visibility, tags, cover
├── types/
│   ├── items.ts                 # UPDATED: Added API fields
│   └── collections.ts           # UPDATED: Added API fields
└── mocks/
    ├── items.ts                 # UPDATED: Mock data support
    └── collections.ts           # UPDATED: Mock data support
```

## Phase 0: Research & Component Refactoring

1. **Research `react-native-calendars` usage**: Analyze current implementation in `user_create.tsx`.
2. **Refactor `DatePicker`**:
   - Extract logic to `src/components/ui/DatePicker.tsx`.
   - Support props for initial date, label, and onChange.
   - Ensure it matches the visual style of the login flow.
3. **Design `TagInput`**: Standard chip-based UI using existing `useAnimation` hooks for feedback.
4. **Design `AttributeInput`**: Row-based key-value management.

## Phase 1: Data Model & Contracts

1. **Update Domain Types**: Align `Item` and `Collection` interfaces with Swagger.
2. **Define Request Interfaces**: Create `CreateItemRequest`, `UpdateItemRequest`, etc.
3. **Update Mocks**: Ensure `Debug Mode` can store and retrieve the new fields. Centralize the source of truth for updates in `src/mocks/profile.ts` (mapping collections and items to the active session profile).

## Phase 2: UI Implementation

1. **Update `ItemForm.tsx`**:
   - Integrate `DatePicker` for `acquisitionDate` and `lastUsedDate`.
   - Integrate `TagInput` for tags.
   - Integrate `AttributeInput` for dynamic attributes.
   - Support edit mode by pre-populating with existing data from `src/mocks/profile.ts`.
2. **Update `CollectionCreationForm.tsx`**:
   - Add visibility picker (Public, Private, Friends).
   - Integrate `TagInput`.
   - Ensure the description field is optional (can be submitted empty).
   - Support edit mode linked to the profile collections.
3. **Update Success/Preview screens**: Ensure all new data is visible.

## Phase 3: Validation

1. **Manual Testing**:
   - Verify creation with all new fields in Debug Mode.
   - Verify update with all new fields.
   - Ensure `DatePicker` reuse works in both `UserCreate` and `ItemForm`.
   - Check mobile accessibility labels.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| None      | N/A        | N/A                                  |
