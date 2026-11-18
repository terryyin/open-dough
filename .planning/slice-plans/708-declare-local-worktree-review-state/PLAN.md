# Declare local worktree review state through MakeMe

**Identity:** SEED-353#declare-local-worktree-review-state
**Source:** [Declare local worktree review state through MakeMe](../../seeds/SEED-353-declarative-git-test-state.md#declare-local-worktree-review-state)
**Source review:** [source-review.md](source-review.md)

## Goal, scope and evaluation

A developer reads the committed, staged, unstaged, untracked and ignored facts
explaining a story review and its refresh from the shared repository
description, without reconstructing worktree Git setup. The same independent
HTTP, UI and Git status/index observations hold. The source's shared
requirements and key examples govern all four slices.

Included: the starting worktrees in
`dashboard/test-support/support/storyReviewWorktree.ts` (`storyWorktree`,
`admissionWorktree`, `changeModeOnly`, `unchangedWorktree`, `landedWorktree`,
`nestedWorktree`, `largeWorktree`, `expandContextWorktree`), their indirect
owners (`largeReviewFiles.ts`, `reviewPanes.ts`, `storyReviewTouchJourney.ts`,
`expandContextDiff.ts`) and spec-local starting edits such as the uncommitted
check's `storyWorktreeEditedAgain`. Consumers today: 15 spec files for
`storyWorktree` (13 E2E review/navigation, backend file-text admission), 5 for
`unchangedWorktree`, 4 for `nestedWorktree`, 2 backend for
`admissionWorktree`, and one each for landed, mode-only and expand-context.

Excluded: the shared `git`, `commitAll`, `writeAt` and `lines` exports stay
while other families import them; `storyReviewTrunk.ts` commit/range topology,
Trunk Mode authorship, completed-story and launch/session families stay with
their receiving siblings. No production behavior change, new fixture framework,
eager preparation or speedup promise. This plan grants no execution authority.

ADR 0010 baseline: `storyWorktree` spends 58 lines of `writeFileSync`,
`git mv`, clone/config/push from a throwaway clone, `rev-parse` and
`info/exclude` plumbing to say “Story A renamed, added, deleted and redrew
files, merged another developer's trunk, trunk moved on unfetched, and the
worktree holds staged, unstaged, untracked and ignored changes”. Worth keeping
only when named facts explain the same result with less reconstruction and the
shared construction costs less to understand than the plumbing removed. Compare
representative before/after source in each slice; line reduction or green tests
alone do not establish that gain. Do not claim runtime savings.

## Existing owners and architectural direction

PFE at `ad27474b2dfb13285b976b5af13a121cf8808b3f`.

| Responsibility | Reuse/change decision |
| --- | --- |
| Named revisions, authors, ordered parents, exact bytes, executables, removals | Reuse `repositoryTestData.mjs` through the one `makeMe` entry and `commitDeclaredRevision` (`repository-revision-commit.mjs`); probe C shows it reproduces Story A's committed history, rename detection, binary bytes and an authored merge. |
| Workspace on a branch from a named trunk revision, with unpublished revisions | Reuse `withWorkspace`/`withUnpublishedRevision` and the workspace step of `repository-history.mjs`. Start origins (`startOriginInitialization.ts`) ignore `workspace` today: extend that owner to materialize it as Story A's linked worktree, `.worktrees/story-a` on `claude/story-a`, answering named commits through `origin.revisions`. No second worktree helper. |
| Uncommitted index/file state and ignore rules | New fact on the same workspace description (staged, unstaged, untracked, ignored-by-exclude, mode change), applied by the same materialization owners after the workspace's revisions. `repositoryTestData.mjs` (231 lines) and `repository-revision-files.mjs` (248) are near the 250-line limit: place workspace-state facts and their writing in one cohesive module beside them rather than growing either. |
| A trunk revision the checkout has not fetched | One fact on the trunk revision (published to origin, absent from the checkout's tracking ref), used by Story A's later trunk and the admission worktree. |
| Prepared prefixes and private copies | Reuse `startOriginPreparation.ts` and `startOrigin.ts`; the workspace and local state are per-test, applied to each private copy after shared later revisions. |
| Review proof and Git observation | Keep `observed`, `keepLaunchRecord`, page objects and expected rows independent of the description's renderer. |

Follow Accepted [ADR 0002 — Direct domain mapping](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
[ADR 0008 — Published/local distinction](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
(published revisions versus a checkout's local index, files and fetched refs)
and [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
No new topic, schema, ADR exception or consequential architectural decision.

## Decisive premises and preparation evidence

Observed 2026-11-18 in this workspace at `ad27474b2`, dependencies from
`npm ci --ignore-scripts`, Node 24.21.0, AC power under `caffeinate -s -i`,
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`, two E2E
workers, load 10.5–20.7 from other worktrees. Scratch edits were reverted
byte for byte before any record write.

| Premise / consuming operation | Observation and result | Unverified remainder |
| --- | --- | --- |
| The reached review consumers pass today (all slices). | A: 12 E2E cases in 8 files strict passed; backend admission/refusal/file-text 4 cases strict passed. | Remaining consumer files are rerun by their slice. |
| Story A's committed history declared through the shared committer yields the same review, baseline, fetched trunk and Git observations (slice 1). | C: scratch `storyWorktree` committed every trunk/workspace revision via `commitDeclaredRevision` (rename as remove+add, binary `Buffer`, merge with declared `other.txt`, another-developer author, later trunk pushed with the tracking ref left at `merged`); `story-review.spec.ts` (asserts baseline, `fetchedTrunk() === later`, unchanged `observed`) and backend file-text admission strict passed. | Materialization through the start-origin description (prepared prefix, private copy, linked worktree path) is new construction proven by slice 1. |
| The review proof distinguishes staged from unstaged starting state (slice 2). | **False.** D1: with `git add staged.txt` removed, 9 E2E cases (review, uncommitted check, refresh, line counts, commit worktree) and backend file-text admission strict passed. The review only asserts the index is left unchanged. | Slice 2 adds an independent materializer check asserting `git status --porcelain=v1 --ignored` and `diff --cached --name-status` for each declared local state. |
| Ignored state is discriminated (slice 2). | D2: with the `info/exclude` rule removed, the full-worktree review case and the uncommitted check's whole-snapshot case failed (`ignored.log` counted); the other 3 selected cases, which do not use the full worktree's file count, passed. | None. |
| Materializer topology, workspace ancestry, executable bytes and private-copy isolation (slices 1–2). | I: 8 passed (`repository-fixture`, `repository-graph`, `repository-snapshot-isolation`). | Rerun after materializer changes. |

```sh
# A (E2E 12 strict passed; backend 4 strict passed)
OPEN_DOUGH_E2E_PROOF_RECORD=<job tmp>/a-e2e.json caffeinate -s -i npm run test:e2e -- review/story-review.spec.ts review/story-review-uncommitted-check.spec.ts review/story-review-line-counts.spec.ts review/story-review-landed.spec.ts review/story-review-tree.spec.ts review/story-review-diff-context.spec.ts review/story-review-panes.spec.ts review/story-review-refresh.spec.ts --workers=2
OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD=<job tmp>/a-be.json caffeinate -s -i npm run test:dashboard:backend -- review/story-review-commit-admission.spec.ts review/story-review-refusal.spec.ts review/story-review-file-text-admission.spec.ts
# C (scratch declared committed history): 1 + 1 strict passed
OPEN_DOUGH_E2E_PROOF_RECORD=<job tmp>/c-e2e.json caffeinate -s -i npm run test:e2e -- review/story-review.spec.ts --workers=2
OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD=<job tmp>/c-be.json caffeinate -s -i npm run test:dashboard:backend -- review/story-review-file-text-admission.spec.ts
# D1 (staged edit left unstaged): 9 + 1 strict passed
OPEN_DOUGH_E2E_PROOF_RECORD=<job tmp>/d1-e2e.json caffeinate -s -i npm run test:e2e -- review/story-review.spec.ts review/story-review-uncommitted-check.spec.ts review/story-review-refresh.spec.ts review/story-review-line-counts.spec.ts review/story-review-commit-worktree.spec.ts --workers=2
# D2 (ignore rule removed): 2 of 5 failed as described
OPEN_DOUGH_E2E_PROOF_RECORD=<job tmp>/d2-e2e.json caffeinate -s -i npm run test:e2e -- review/story-review.spec.ts review/story-review-uncommitted-check.spec.ts --workers=2
# I: 8 passed
node --test Distribution/tests/support/repository-fixture.test.mjs Distribution/tests/support/repository-graph.test.mjs Distribution/tests/support/repository-snapshot-isolation.test.mjs
```

## Outside-in proof and consumer ownership

| Promise and reached boundary | Slice / proof owner |
| --- | --- |
| Declared committed Story A history keeps baseline, file kinds, fetched later trunk and unchanged Git observation | 1: every `storyWorktree` consumer file (E2E review, commit, context-line, nothing, refresh, uncommitted-check, navigation side-panel; backend file-text admission) plus I and the start-origin private-copy isolation proof. |
| Declared local state is materialized as stated | 2: new materializer check of porcelain/staged output per state; D2's ignored discrimination repeated against final setup. |
| Uncommitted check, refresh and mode-only counts keep their results; post-opening edits stay actions | 2: uncommitted-check, uncommitted-check-refresh, refresh, line-counts, landed, story-review E2E files. |
| Nested/rename tree rows, large-pane scrolling, context expansion and an empty worktree stay as today | 3: tree, tree-collapse, file-moves, panes, diff-context, nothing, commits, commit-worktree, commit-refresh E2E files and the touch journey's consumers. |
| Admission/refusal against trunk moved unfetched; landed review | 4: backend commit-admission and refusal, `story-review-landed.spec.ts`. |
| Readability, one model, no superseded arrangement | Each slice compares representative before/after construction and removes newly unused setup; slice 4 updates the guide and audits remaining local-worktree candidates across `dashboard/backend-tests/`, `e2e/`, `dashboard/frontend-tests/` and `dashboard/test-support/`. |

Before delivery, run installed `dough-execute-plan/scripts/consumer-trace.mjs`
with `--checkout <execution checkout> --base HEAD`, adding effect terms for the
changed worktree fixtures, start-origin initialization and materializer.
Disposition every listed consumer as run, reused evidence, or excluded with
the unreached boundary, including non-review consumers of start origins and the
materializer.

## Story obligations

### G1. Story A's uncommitted edits still written imperatively
Reported: slice 1 — "It still writes the uncommitted edits imperatively (the interim until slice 2)."
Story clause: "file modes and the uncommitted index and file state through the shared MakeMe repository description and existing start-origin owners"
Disposition: proved by slice 2: storyAReviewRepository.ts declares the local state via withLocalState; materializeStartWorkspace writes it; storyWorktree writes nothing (s2-e2e, s2-i evidence)

## Ordered slices

### 1. Read Story A's committed review history from named revisions
Type: Behavior
Status: done
Proof: First consumer row; C establishes the route.

Behavior: Given Story A's description — trunk files, a workspace on
`claude/story-a` with rename, story file, deletion and redrawn image, another
developer's trunk revision merged into it, and a later trunk revision the
checkout has not fetched — opening the review shows the same files, baseline
and context, and the review's fetch reaches the later revision. Start origins
materialize the description's workspace as the linked worktree at
`.worktrees/story-a`; consumers read `merged`/`later` as named revisions.
Interim: the helper still writes Story A's uncommitted edits after
materialization, replaced in slice 2. One committed-history loop; 15 active
minutes, commands excluded.

Accepted: `storyAReviewRepository.ts` declares Story A; start origins
materialize its workspace via `startOriginWorkspace.ts` and honor a trunk
revision's `fetched: false`. Proof: full backend group, full E2E group (one
own defect in commit-ranges fixed, that file rerun green), I, typecheck/lint.
Learning: a spec's `test` override does not reach sibling test objects
(`olderGit`); use `test.use` in files mixing test objects. Full local groups
queue on `refs/dough/local-test-suite` behind other worktrees (≈1 h here).
Slice 4's guide update notes `fetched: false` is honored only by start origins.

### 2. Read uncommitted review state from declared workspace facts
Type: Behavior
Status: done
Proof: Local-state and uncommitted-check rows.

Behavior: Given declared staged, unstaged (with the wide line), untracked
nested, ignored and mode-only state, Git reports exactly that state and the
review, uncommitted check and line counts keep their results; the
edited-again story file is a declared starting edit. Edits, stages, reverts
and commits after opening stay written in the scenario. One local-state loop;
15 active minutes, commands excluded.

Accepted: `repository-local-state.mjs` holds `withLocalState`/`writeLocalState`;
both start origins and `buildRepository` write a workspace's `local` after its
revisions. `repository-local-state.test.mjs` checks literal porcelain, cached
names and mode change. D2 repeated (rule dropped, file kept as untracked):
the two predicted cases failed. 11b moves to slice 3 (`nestedWorktree`).
Focused Playwright proof runs through `npx playwright test --config …`.

### 3. Read nested, large and context worktrees from declared revisions
Type: Behavior
Status: done
Proof: Nested/large/context row.

Behavior: Given declared unchanged, nested cross-folder rename, large
single-commit and two-distant-edit worktrees, tree rows, pane scrolling,
expandable context and the nothing-changed review stay as today. Migrate
`unchangedWorktree`, `nestedWorktree`, `largeWorktree` (with
`largeReviewFiles.ts`) and `expandContextWorktree` (with
`expandContextDiff.ts`). One committed-content loop; 15 active minutes,
commands excluded.

Accepted: `unchangedRepository`, `nestedRepository`, `largeRepository`,
`expandContextRepository` and `storyFromBase()` declare the off-trunk
worktrees; `storyWorktree(origin)` is the one reader (named `base`, `merged`,
`later`). Pre-opening starting edits in commits, commit-worktree,
commit-refresh and uncommitted-check are declared; post-opening actions stay
in scenarios. Frontend proof records use `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`.

### 4. Read admission and landed worktrees from declared revisions
Type: Behavior
Status: planned
Proof: Admission/landed and readability rows.

Behavior: Given the admission worktree whose trunk later moved without a
fetch, and a landed first slice with a later local commit and uncommitted
edit, admission, refusal and the landed review keep their results. Remove
superseded worktree plumbing, update the test-data architecture guide with
the workspace and local-state facts, and finish this story's candidate audit,
leaving siblings' candidates with them. One admission/landed loop; 15 active
minutes, commands excluded.

## Verification and execution gates

Apply [AGENTS.md](../../../AGENTS.md#test-automation), installed MakeMe and
browser page-object selection before test edits. Builders follow consuming
tests; Git/files/environment/cleanup remain harness work. Keep default test
timeouts; never `test.slow()` or suite/file/group/hook timeout overrides.

Local gates: complete affected spec files and their traced consumers above,
`npm run typecheck:dashboard`, changed-file lint, I when repository or origin
materialization changes, and `native-import-closure.test.mjs` when MakeMe's
runtime closure changes. Broaden to the affected group when the trace shows a
shared change reaches it (start-origin initialization reaches every origin
consumer, so slice 1 runs the backend and E2E groups once). Repeat D2 against
final setup.

Before expensive proof inspect load/memory and competing runs; start focused.
Use the maintained [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
fully awake on AC under `caffeinate -s -i`; on battery, lid open and fully
awake under `caffeinate -i`, then inspect the sleep log. Follow the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written for every local/CI failure, carrying this link into every
delegation and repair handoff. Execution retains its required final CI
ownership.

## Current decisions and concern review

- One workspace description, with its unpublished revisions and local state,
  serves all four outcomes; later slices compose it rather than add variant
  helpers.
- Slice-plan refinement was not needed: four independently observable review
  outcomes, each a bounded migration/proof loop, within the eight-slice limit.
- No remaining slice-specific concern was identified in this review. Probe C
  settles the committed-history route; D1's false premise is answered by slice
  2's independent materializer check.
- No blocking dependency, pre-Take human decision, trunk-only operation or
  execution authorization. Sibling SEED-353 stories may change the same shared
  owners; rebase onto their landed changes rather than duplicating them.
