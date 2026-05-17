---
description: 'Task list for feed comments feature implementation'
---

# Tasks: Comentários no Feed

**Input**: Design documents from `/specs/001-feed-comments/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are OPTIONAL - not explicitly requested in spec, but include smoke test acceptance for each story.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, types, and mock data structure

- [x] T001 Create types for comments domain in src/types/comments.ts (Comment, CommentThreadState, PostCommentMeta interfaces)
- [x] T002 [P] Create mock data file src/mocks/comments.ts with MOCK_COMMENTS, buildTeaser, getCommentsByPostId builders following mock-centralization skill
- [x] T003 Update src/mocks/index.ts barrel to export comments domain (export \* from './comments')

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Reusable components that support all user stories

- [x] T004 [P] Create Comment.tsx component in src/components/comments/ (pure display, no state; shows single comment with author avatar, name, text, timestamp)
- [x] T005 [P] Create CommentInput.tsx component in src/components/comments/ (reusable input field with validation, submit button, character counter)
- [x] T006 Create CommentThread.tsx component in src/components/comments/ (manages thread state, FlatList for comments, integration with CommentInput, open/close logic)
- [x] T007 Create src/components/comments/index.ts barrel export (export Comment, CommentThread, CommentInput)
- [x] T008 Review Post.tsx component to confirm onPressComment callback exists and is ready for integration (no changes needed if callback already present)

**Checkpoint**: Foundational components ready - user story work can now begin in parallel

---

## Phase 3: User Story 1 - Teaser de comentários no feed (Priority: P1) 🎯 MVP

**Goal**: Each feed item displays a teaser comment to create social curiosity and indicate activity

**Independent Test**: Load feed screen and verify each Post item displays at least one comment visible by default

### Implementation for User Story 1

- [x] T009 [P] [US1] Update Post.tsx to display teaser comment (integrate buildTeaser call, render first comment inline or in preview badge)
- [x] T010 [P] [US1] Add teaser comment styling in Post.tsx using tokens from src/styles/tailwind/tokens.js (brand colors, surface, text)
- [x] T011 [US1] Test teaser display: load feed, verify each item shows comment preview without user interaction

**Checkpoint**: User Story 1 complete - teaser comments visible on all feed items

---

## Phase 4: User Story 2 - Abrir e ler comentários (Priority: P1)

**Goal**: User can tap comment button and view full comment thread for that item without leaving feed context

**Independent Test**: Tap comment button on a feed item, verify comment thread opens with full list and closes to return feed position

### Implementation for User Story 2

- [x] T012 [P] [US2] Implement CommentThread.tsx comment list visualization (FlatList to display all comments from mock data)
- [x] T013 [P] [US2] Add modal or inline expansion UI to show/hide CommentThread (use MotionView with SlideUp preset for entrance)
- [x] T014 [US2] Wire onPressComment callback from Post component to trigger CommentThread open (modal or expanded state in feed screen)
- [x] T015 [US2] Add ScalePress motion feedback to comment button using AnimatedPressable (visual feedback on tap)
- [x] T016 [US2] Test comment thread workflow: tap button → thread opens → close → feed returns to same scroll position

**Checkpoint**: User Story 2 complete - read comments workflow functional and tested

---

## Phase 5: User Story 3 - Criar comentário no contexto do feed (Priority: P2)

**Goal**: User can write and publish a new comment within the thread without losing item context

**Independent Test**: Open comment thread, enter valid text, submit, verify new comment appears immediately in list

### Implementation for User Story 3

- [x] T017 [P] [US3] Implement CommentInput.tsx submission logic (trim input, validate non-empty, reject spaces-only)
- [x] T018 [P] [US3] Add new comment creation to CommentThread.tsx (append to local state, clear input, reset form)
- [x] T019 [US3] Integrate CommentInput into CommentThread.tsx (position at bottom of list, bind onSubmit handler)
- [ ] T020 [US3] Add FadeIn animation on new comment entry using MotionView preset
- [x] T021 [US3] Add error/validation feedback on empty submit attempt (show temporary message or disable button state)
- [x] T022 [US3] Test comment creation: open thread → type valid text → submit → comment appears in list, input cleared

**Checkpoint**: User Story 3 complete - create comment workflow functional and tested

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Refinements, accessibility, and validation

- [ ] T023 [P] Accessibility audit: verify all buttons have accessibilityRole + accessibilityLabel, touch targets ≥44pt
- [ ] T024 [P] Performance optimization: verify FlatList virtualization for comment lists, memoize Comment components if needed
- [ ] T025 [P] Type checking and linting: run npm run type-check, npm run lint to ensure no errors or warnings
- [ ] T026 Code formatting: run npm run format:check, fix any formatting issues with npm run format
- [ ] T027 Run npm run validate to confirm full project health (lint + format + type check)
- [ ] T028 Manual testing checklist: Execute quickstart.md testing strategy; verify all acceptance scenarios pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent of US1 but should be implemented before US3
- **User Story 3 (P2)**: Should start after US2 complete (reads comment thread state from US2 implementation)

### Within Each User Story

- Foundational/UI components built first
- Logic/state management second
- Integration/testing last

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- Once Foundational completes:
  - All US1 tasks [P] can run in parallel
  - All US2 tasks [P] can run in parallel
  - All US3 tasks [P] can run in parallel (after US2 ready)
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Tasks can run in parallel:
- T009 [P] [US1] Update Post.tsx to display teaser comment
- T010 [P] [US1] Add teaser comment styling
```

Then sequentially:

- T011 [US1] Test teaser display

---

## Parallel Example: User Story 2

```bash
# Tasks can run in parallel:
- T012 [P] [US2] Implement CommentThread list visualization
- T013 [P] [US2] Add modal/expansion UI
- T015 [US2] Wire onPressComment callback (depends on T012)
```

Then sequentially:

- T014 [US2] Add ScalePress feedback
- T016 [US2] Test workflow

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Teaser - visual curiosity signal)
4. Complete Phase 4: User Story 2 (Read - main interaction)
5. **STOP and VALIDATE**: Test US1 + US2 independently
6. Deploy/demo MVP if ready

### Full Feature (Add User Story 3)

7. Complete Phase 5: User Story 3 (Create - social participation)
8. **VALIDATE**: Test US3 independently
9. Proceed to Phase 6 Polish

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Teaser visible (minimal interaction)
3. Add User Story 2 → Full read workflow (MVP)
4. Add User Story 3 → Participation enabled (full feature)
5. Each story adds value independently

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Teaser display)
   - Developer B: User Story 2 (Read thread)
   - Developer C: User Story 3 (Create) after US2 ready
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify type-check and lint pass before committing each task
- Run `npm run validate` after completion to ensure no regressions
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
