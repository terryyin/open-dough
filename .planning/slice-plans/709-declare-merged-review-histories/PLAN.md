# Declare merged review histories through MakeMe

**Identity:** SEED-353#declare-merged-review-histories
**Source:** [Declare merged review histories through MakeMe](../../seeds/SEED-353-declarative-git-test-state.md#declare-merged-review-histories)
**Source review:** [source-review.md](source-review.md)

## Goal, scope and evaluation

A developer reads Story A's story-branch commits, trunk integrations and
their conflict resolutions from named revisions with ordered parents and
declared file bytes, without reconstructing the Git commands that produced
them. The Commits range and merge cases keep their HTTP and UI results. The
source's shared requirements and key examples govern both slices.

Included: `dashboard/test-support/support/storyReviewTrunk.ts`
(`worktreeWithStoryCommits`, `integrateTrunk`, `sixth`) and its consumers
`e2e/review/story-review-commit-trunk.spec.ts` (4 cases) and
`e2e/review/story-review-commit-renames.spec.ts` (1 case, with its spec-local
rename/conflict history), plus starting commits made before the review opens
in `story-review-commits.spec.ts` (the newest plain edit and the empty story
commit) and `story-review-commit-refresh.spec.ts` (the first story commit).

Excluded: Story A's worktree creation, its uncommitted state and the commit
admission worktree (SEED-353#declare-local-worktree-review-state, plan 708);
Trunk Mode authorship; completed-story merges including
`storyReviewMergeDriver.ts`, which keeps importing `sixth`;
`laterStoryMergesTrunk.ts` (Intent sibling); ad-hoc session commit runs and
kept-commit records (launch/session sibling). Commits, pushes and Refresh
after opening stay scenario actions. The shared `git`, `commitAll` and
`writeAt` helpers stay while other families import them. No production
behavior change, new fixture framework, eager preparation or speedup promise.
This plan grants no execution authority.

ADR 0010 baseline: `integrateTrunk` spends 30 lines of fast-forward, push,
fetch, `merge`, a `try/catch` around an expected conflict and an overwrite to
say “trunk takes the landed slice and changes these lines; the story merges
trunk, settling `src/c.ts` as given”; the renames case repeats 17 lines of the
same plumbing in the spec. Worth keeping only when the declared revisions and
parents explain the same result with less reconstruction and the shared
construction costs less to understand than the plumbing removed. Compare
representative before/after source in each slice; green tests or line counts
alone do not establish that gain. Claim no runtime savings.

## Existing owners and architectural direction

PFE at `9a780f2134702658d50ce88f8efa8371f962036c`.

| Responsibility | Reuse/change decision |
| --- | --- |
| Named revisions, ordered parents, authors, exact bytes, removals, empty commits | Reuse `repositoryTestData.mjs` through the one `makeMe` entry (`withUnpublishedRevision` with `parents`) and `commitDeclaredRevision` (`repository-revision-commit.mjs`): a merge is its first parent's tree plus the declared resolved files, committed with the declared parents in order. Probes C2 and R settle the route. |
| Story A's worktree on `claude/story-a` | Owned by plan 708, which extends start origins to materialize the description's workspace. Reuse it; add no second worktree materializer. |
| Trunk revisions the story merges | Published revisions of the same description; named results replace incidental `rev-parse`. |
| Conflict and clean-merge evidence | An independent `git merge-tree --write-tree <story> <trunk>` observation in the consuming test, outside the description's renderer: exit 1 for a conflicted integration, success for a clean one (C2, R). |
| Review proof | Keep `keepLaunchRecord`, page objects and expected rows independent of the description. |

Follow Accepted [ADR 0002 — Direct domain mapping](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
[ADR 0008 — Published/local distinction](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
(published trunk revisions versus the story branch's unpublished ones) and
[ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
No new topic, schema, ADR exception or consequential architectural decision.

## Decisive premises and preparation evidence

Observed 2026-11-18 in this workspace at `9a780f213`, dependencies from
`npm ci --ignore-scripts`, Node 24.21.0, AC power under `caffeinate -s -i`,
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`, two E2E
workers, load 15–27 from other worktrees. Scratch edits were reverted byte for
byte before any record write.

| Premise / consuming operation | Observation and result | Unverified remainder |
| --- | --- | --- |
| The four consumer spec files pass today (both slices). | A: 11 E2E cases strict passed. | None. |
| A story-side integration merge declared with parents `[story, trunk]` and resolved bytes through `commitDeclaredRevision` in Story A's worktree keeps every commit-trunk result (slice 1). | C2: scratch `integrateTrunk` replaced `merge`/conflict/overwrite with one declared merge (clean, conflicted `c story and trunk`, resolved-back `c 5`, disjoint separate-line); 4 strict passed. A first scratch that declared `src/a.ts` without the story's separate-line edit timed out on the disjoint case: the declared resolution must state the full merged bytes. | Materialization through the start-origin description's workspace is plan 708's construction; slice 1 composes it. |
| An independent `merge-tree` observation discriminates conflicted from clean integrations (slices 1–2). | C2 log: clean → no conflict; `c story and trunk` and `c 5` → conflict; disjoint → no conflict. R: `expect(merge-tree).toThrow()` passed for the renamed conflict. | None. |
| The review proof discriminates declared parent order (slice 1). | D: same scratch with parents `[trunk, story]`; all 4 commit-trunk cases failed (row count, missing rows). | None. |
| The renamed conflict merge declared as `README.md` plus the resolved `src/d.ts` over the story parent keeps the four-commit order, original old path and flagged diff (slice 2). | R: scratch declared merge in `story-review-commit-renames.spec.ts`; 1 strict passed. | None. |
| Plain and empty starting commits declared before opening keep their range results (slice 2). | P: scratch declared the empty story commit (`commits` spec) and the refresh case's first story commit through `commitDeclaredRevision`; all 6 cases of both files strict passed. | The newest plain edit sits beside Story A's staged/unstaged/untracked state, and `commitDeclaredRevision` stages everything (`add --all`): it is declared as an unpublished workspace revision ahead of the local state, which plan 708 applies after the workspace's revisions. Slice 2's proof reruns it. |

```sh
# Common environment for every run below
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i ...
# A (11 strict passed)
OPEN_DOUGH_E2E_PROOF_RECORD=<job tmp>/a-e2e.json npm run test:e2e -- review/story-review-commit-trunk.spec.ts review/story-review-commit-renames.spec.ts review/story-review-commits.spec.ts review/story-review-commit-refresh.spec.ts --workers=2
# C2 (scratch declared merges): 4 strict passed; D (parents swapped): 4 failed
OPEN_DOUGH_E2E_PROOF_RECORD=<job tmp>/c2-e2e.json npm run test:e2e -- review/story-review-commit-trunk.spec.ts --workers=2
# R (scratch declared renamed conflict): 1 strict passed
OPEN_DOUGH_E2E_PROOF_RECORD=<job tmp>/r-e2e.json npm run test:e2e -- review/story-review-commit-renames.spec.ts --workers=2
# P (scratch declared empty and first commits): 6 strict passed
OPEN_DOUGH_E2E_PROOF_RECORD=<job tmp>/p-e2e.json npm run test:e2e -- review/story-review-commits.spec.ts review/story-review-commit-refresh.spec.ts --workers=2
```

## Outside-in proof and consumer ownership

| Promise and reached boundary | Slice / proof owner |
| --- | --- |
| Declared clean, conflicted, resolved-back and disjoint integrations keep the range, merge-alone results and flags; conflict independently confirmed | 1: `story-review-commit-trunk.spec.ts` with its `merge-tree` observations; D's parent-order discrimination repeated once against final setup. |
| Renamed conflict history, newest plain edit, empty commit and the refresh case's first commit keep their results; later commits, push and Refresh stay actions | 2: `story-review-commit-renames.spec.ts`, `story-review-commits.spec.ts`, `story-review-commit-refresh.spec.ts`. |
| `sixth` keeps serving the completed-story merge driver | 2: `story-review-completed.spec.ts` (backend) when `storyReviewTrunk.ts` changes shape. |
| Readability, one model, no superseded arrangement | Each slice compares representative before/after construction and removes newly unused setup; slice 2 updates the test-data architecture guide and audits remaining story-branch commit/range candidates across `dashboard/backend-tests/`, `e2e/`, `dashboard/frontend-tests/` and `dashboard/test-support/`, leaving siblings' candidates with them. |

Before delivery, run installed `dough-execute-plan/scripts/consumer-trace.mjs`
with `--checkout <execution checkout> --base HEAD`, adding effect terms for
`storyReviewTrunk.ts` and any changed materializer or start-origin owner.
Disposition every listed consumer as run, reused evidence, or excluded with the
unreached boundary.

## Ordered slices

### 1. Read Story A's trunk integrations from declared merges
Type: Behavior
Status: done
Proof: First consumer row; C2 and D establish the route.

Behavior: Given Story A's description — trunk's `README.md` and `src/{a,b,c}.ts`,
a landed slice trunk takes, the story's `c story` change, trunk's changing
revision, and a story merge with parents story then trunk whose declared bytes
settle `src/c.ts` (or merge cleanly, or edit a separate line of `src/a.ts`) —
opening Commits shows the same story rows, “Trunk was integrated” heading,
merge-alone result, range diff and “includes trunk's changes” flags, and an
independent `merge-tree` of the named parents conflicts exactly for the
conflicted cases. `worktreeWithStoryCommits`/`integrateTrunk` become declared
facts composed on plan 708's workspace; consumers read named revisions. One
integration loop; 15 active minutes, commands excluded.

Accepted proof (2026-11-19): `trunkIntegrationRepository` in
`storyReviewTrunk.ts` declares trunk, `landed`, `trunk changes`, Story A's
workspace from `landed` and `merge trunk` with parents story then trunk; the
spec's four cases each `test.use` it and check `parentsConflict` (independent
`git merge-tree --write-tree`, exit 1 = conflict) before the unchanged review
assertions. `story-review-commit-trunk.spec.ts` 4/4 strict passed after the
refactor pass; parents swapped to [trunk, story] failed all 4 (D repeated);
the renames consumer passed; typecheck and eslint clean. ADR 0010: about 30
lines of push/fetch/merge/try-catch plumbing became one declaration whose
merge parents are named facts the test checks; the cost is stating the merge's
full bytes (the separate-line case's merged `src/a.ts` carries both edits).
Learnings: plan 708's `materializeStartWorkspace` already commits workspace
revisions with declared parents naming trunk revisions, so no materializer
change was needed. Refactor follow-up for wrap-up: the
`getByRole("list", { name: "Story commits" }).getByRole("button")` row
locator repeats in about 15 places across 10 `e2e/review` commit specs, a
candidate for one domain-named reader in `reviewRead.ts`.

### 2. Read renamed and starting story commits from declared revisions
Type: Behavior
Status: done
Proof: Second through fourth consumer rows.

Behavior: Given `src/c.ts` renamed to `d.ts`, a declared conflicted
integration settling `d.ts`, then a rename to `e.ts`; or a declared newest
plain edit, an empty story commit, or one story commit before a refresh
scenario — the four-commit order, original old path, flagged diff, chosen
commit trees, empty range and anchored refresh results stay as today. Commits,
the push to trunk and Refresh after opening stay written in the scenario.
Remove superseded plumbing, update the guide with declared merges and the
independent conflict observation, and finish this story's candidate audit. One
range-history loop; 15 active minutes, commands excluded.

Accepted proof (2026-11-19): `trunkIntegrationRepository` gained `renamed`
and `after` for the renames history; `parentsConflict` is shared beside it and
`worktreeWithStoryCommits` is gone. `storyAReviewRepository.ts` shares
`storyAHistory` and its uncommitted state, and `storyAWithNewestRepository`
declares the newest plain edit as a workspace revision before that state; the
empty commit and the refresh case's first commit were already declared through
`storyFromBase()`. The four commit specs passed 11/11 strict; the 12 other
`storyARepository` E2E consumers passed 24/24 strict and the backend
file-text admission spec passed. `Distribution/tests/repository-test-data.md`
documents declared merges, full resolved bytes, the independent `merge-tree`
observation and starting commits before local state. ADR 0010: the renames
setup's 17 imperative lines and 16-line helper with a failing merge became a
17-line declaration plus one conflict assertion, and the newest edit's 10-line
in-test commit became one `test.use`. The renames merge's subject is now
"merge trunk". Candidate audit: only the renames merge and newest plain edit
belonged here; post-open commits in the refresh specs stay actions; Trunk Mode
(`storyReviewTrunkMode.ts`, `storyReviewTrunkCommits.ts`, `trunk-own-*`,
`trunk-worktree*`) and completed-story merges (`storyReviewMergeDriver.ts`,
`laterStoryMergesTrunk.ts`, trunk commits in `follow-up`, `diff-add-note`,
`diff-line-follow-up`) stay with their siblings; remaining `rev-parse` calls in
`story-review.spec`, `nothing`, `one-shot-landing` and `story-branch-landed`
are independent observations. Learning: a story that renames a file before a
declared merge keeps trunk's bytes only at the new path, or the merge re-adds
the old path. The refactor pass found nothing further.

## Execution complete

Product advice: no product change. The completed-story sibling
(SEED-353#declare-completed-story-review-histories) should delete
`dashboard/test-support/support/storyReviewMergeDriver.ts` rather than migrate
it: `printingMergeDriver` has had no consumer since `6b9aeef56` removed review
marks, and it is the only remaining importer of `sixth` outside this story's
specs. Optional cleanup for wrap-up: one domain-named Story commits row reader
in `reviewRead.ts` for the locator repeated across about 10 `e2e/review`
commit specs. Process review is deferred into wrap-up with its Intent Coverage
check, since this execution rewrote existing tests' setup.

## Verification and execution gates

Apply [AGENTS.md](../../../AGENTS.md#test-automation), installed MakeMe and
browser page-object selection before test edits. Builders follow consuming
tests; Git/files/environment/cleanup remain harness work. Keep default test
timeouts; never `test.slow()` or suite/file/group/hook timeout overrides.

Local gates: complete affected spec files and their traced consumers above,
`npm run typecheck:dashboard`, changed-file lint, `node --test` of
`Distribution/tests/support/repository-fixture.test.mjs`,
`repository-graph.test.mjs` and `repository-snapshot-isolation.test.mjs` when
the description or materializer changes, and `native-import-closure.test.mjs`
when MakeMe's runtime closure changes. Broaden to the affected group only when
the trace shows a shared change reaches it.

Before expensive proof inspect load/memory and competing runs; start focused.
Use the maintained [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
fully awake on AC under `caffeinate -s -i`; on battery, lid open and fully
awake under `caffeinate -i`, then inspect the sleep log. Follow the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written for every local/CI failure, carrying this link into every
delegation and repair handoff. Execution retains its required final CI
ownership.

## Current decisions and concern review

- A merge is declared as its ordered parents plus the full resolved bytes of
  every file it changes from its first parent; the conflict is confirmed by an
  independent `merge-tree` observation, never by the renderer.
- A starting commit on a worktree that also holds uncommitted state is a
  declared workspace revision applied before that state, never a commit made
  after it (the shared committer stages everything).
- Story A's workspace and its local state come from
  SEED-353#declare-local-worktree-review-state (plan 708), recorded as this
  story's blocking dependency: both slices compose start origins' declared
  workspace, and the newest plain edit needs its local state applied after
  the workspace's revisions. Building either here would add a second worktree
  materializer. Start from fetched trunk after it lands; rebase, never
  duplicate.
- Slice-plan refinement was not needed: two independently observable range
  outcomes, each one bounded migration/proof loop, within the slice limit.
- No remaining slice-specific concern was identified in this review.
- No pre-Take human decision, trunk-only operation or execution
  authorization; the one blocking dependency is recorded above.
