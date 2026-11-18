# Source review — SEED-353#declare-local-worktree-review-state

Launch: fresh general-purpose reviewer, no conversation inheritance, spawned by
the execution coordinator on 2026-11-18 before slice 1 delegation. Input: only
the story's Goal, Scope, Key examples and Safe stopping point, verbatim from
[the seed section](../../seeds/SEED-353-declarative-git-test-state.md#declare-local-worktree-review-state),
with the obtain-source-review instructions; told to read no files and change
nothing.

Unnumbered context returned: the goal's reason ("Review cases become easier to
read and change together with the local-snapshot behavior they prove"); no
production behavior change or speedup promise; retained shared helpers and
sibling-owned families (`storyReviewTrunk.ts`, trunk-mode authorship,
completed-story histories); safe stopping point; "as today"/"stay the same"
sets pre-migration behavior as baseline.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Starting worktrees (full, admission, unchanged, landed, nested, large, expand-context, mode-only) declared through the shared MakeMe description and existing start-origin owners, extended for demonstrated needs; committed, staged, unstaged, untracked and ignored facts readable directly (Scope; Goal) | slice 4 | |
| 2 | Direct and indirect callers across backend, E2E and Frontend-group tests, incl. largeReviewFiles.ts, reviewPanes.ts, storyReviewTouchJourney.ts, expandContextDiff.ts and spec-local starting edits such as the edited-again story file, use the declared form (Scope; Key example 2) | slice 4 | |
| 3 | Named revision results replace incidental rev-parse setup (Scope) | slice 4 | |
| 4 | Deferred, prepared-prefix reuse preserved (Scope) | slice 1 | observed: startOriginInitialization.ts strips workspace before preparedStartOrigin; full backend (1755 passed) and E2E groups on shared prepared prefix, slice 1 evidence s1-be-full-1, s1-e2e-full-1 + s1-e2e-ranges-2 |
| 5 | Each test keeps its private mutable worktree (Scope) | slice 1 | observed: startOriginWorkspace.ts materializes .worktrees/story-a in each test project clone; backend launches/start-origin-private.spec.ts and repository-snapshot-isolation.test.mjs passed (s1-be-focused-1, s1-I-1) |
| 6 | Edits, stages, reverts or commits after opening, and trunk publication observed by refresh, stay visible scenario actions (Scope; Key example 3) | slice 2 | |
| 7 | observed and other Git status/index reads stay independent of the description's renderer (Scope) | slice 2 | |
| 8 | Test-data architecture guide updated (Scope) | slice 4 | |
| 9 | Representative construction compared before and after under ADR 0010 (Scope) | slice 4 | |
| 10a | Story A's declared worktree: review shows the same seven changed files, baseline, counts and wide-line diff (Key example 1) | slice 2 | |
| 10b | Story A's declared worktree: Git reports the same porcelain status and staged names before and after (Key example 1) | slice 2 | |
| 11a | Committed story file edited again before opening: turning Include uncommitted changes off lists the four committed files with committed counts (Key example 2) | slice 2 | |
| 11b | A worktree declared with nothing uncommitted offers no check (Key example 2) | slice 2 | |
| 12a | Declared worktree open in review: a further commit and new file do not change the snapshot before Refresh (Key example 3) | slice 2 | |
| 12b | Refresh shows the new commit and new file (Key example 3) | slice 2 | |
| 13a | Nested trunk files and cross-folder rename: tree rows stay as today (Key example 4) | slice 3 | |
| 13b | Mode-only change: mode-change counts stay as today (Key example 4) | slice 2 | |
| 13c | Large single-commit comparison: pane scrolling stays as today (Key example 4) | slice 3 | |
| 13d | Two distant edits in one long file: expandable context stays as today (Key example 4) | slice 3 | |
| 14a | Admission worktree whose trunk moved without fetch: admission and refusal results stay the same (Key example 5) | slice 4 | |
| 14b | Landed first slice with later local commit and edit: landed-review results stay the same (Key example 5) | slice 4 | |
