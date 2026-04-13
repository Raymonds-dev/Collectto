---
name: merge
description: Merge changes from the topic branch to the merge base branch. Use when the user wants to merge their session's work back to the base branch.
---

<!-- Customize this skill and select save to override its behavior. Delete that copy to restore the built-in behavior. -->

# Merge Changes

Merge the topic branch (checked out in the current worktree) into the merge base branch (checked out in the main worktree). The context block appended to the prompt contains the source branch, target branch, and main worktree path.

## Guidelines

- Preserve the intent of both branches whenever possible instead of blindly favoring one side.
- Treat business logic as sensitive: do not drop behavior unless you can prove it is redundant or incorrect.
- Resolve simple conflicts directly, but stop and ask the user when a conflict changes flow, validation, data shape, or side effects.
- **Never force-push** (`--force`, `--force-with-lease`) without explicit user approval.
- **Never skip pre-push hooks** (do not use `--no-verify`).
- **Never rewrite or drop commits** without asking the user.
- When in doubt about conflict resolution — ask the user.

## Workflow

### 1. Commit uncommitted changes in the current worktree

Check for uncommitted changes in the current worktree:

```
git status --porcelain
```

If there are uncommitted changes, use the `/commit` skill to commit them before continuing.

### 2. Merge the topic branch into the base branch

Use `git -C <main-worktree-path>` to run commands against the main worktree without leaving the current worktree.

```
git -C <main-worktree-path> merge <topic-branch>
```

If the target is the repository's `develop` branch, fetch first and merge the remote tracking branch when that is the project convention:

```
git fetch origin
git -C <main-worktree-path> merge origin/develop
```

### 3. Handle merge conflicts

If the merge reports conflicts:

3.1. List conflicted files:

```
git -C <main-worktree-path> diff --name-only --diff-filter=U
```

3.2. For each conflicted file, read the file content, resolve the conflict by preserving the intent of both sides, and stage the resolved file:

```
git -C <main-worktree-path> add <resolved-file>
```

3.3. Prefer the smallest safe resolution:

- keep both implementations if they can coexist without duplication or side effects
- extract a shared helper when both sides do the same work differently
- add a short TODO only when a business rule conflict cannot be safely resolved in the moment

  3.4. When in doubt on how to resolve a merge conflict, ask the user for guidance. If the user wants to abort, run:

```
git -C <main-worktree-path> merge --abort
```

3.5. Once all conflicts are resolved and staged, commit the merge:

```
git -C <main-worktree-path> commit --no-edit
```

## Validation

After the merge completes, verify the result:

1. Confirm the main worktree is clean:

```
git -C <main-worktree-path> status --porcelain
```

2. Confirm the topic branch is an ancestor of the base branch (i.e. all commits are merged):

```
git -C <main-worktree-path> merge-base --is-ancestor <topic-branch> HEAD
```

3. If the merge touched logic-heavy files, review the diff before closing the task to ensure no behavior was lost.
