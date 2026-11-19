# Declare trunk review authorship through MakeMe

**Identity:** SEED-353#declare-trunk-review-authorship
**Source:** [Declare trunk review authorship through MakeMe](../../seeds/SEED-353-declarative-git-test-state.md#declare-trunk-review-authorship)
**Source review:** [source-review.md](./source-review.md)

## Goal, scope and evaluation

A developer reads a Trunk Mode story's review cases from who authored each
trunk and worktree revision, which worktrees an agent holds and where each
starts, without reconstructing the pushes, pulls, rebases and Git config calls
that produced them. Own-change comparisons, flags, older-Git explanations and
worktree-ambiguity results stay as today. The source's shared requirements and
key examples govern every slice.

Included: `dashboard/test-support/support/storyReviewTrunkMode.ts`
(`trunkModeRepository`, `trunkModeStory`, `publishRewrittenLine`,
`commitUnpublished`, the unused `publishLater`) and
`storyReviewTrunkCommits.ts`, with their consumers
`e2e/review/story-review-trunk-own-changes.spec.ts` (2 cases),
`story-review-trunk-own-flagged.spec.ts` (2) and
`story-review-trunk-own-older-git.spec.ts` (1); and the starting worktrees of
`e2e/review/story-review-trunk-worktree-ambiguity.spec.ts` (2).

Excluded: `story-review-trunk-worktree.spec.ts`, which keeps the real terminal
Trunk Mode start and its later commit and push; completed-story specs that
import `agentAuthoredWorktree.ts` (completed-story sibling); Story Branch Mode
merges (plan 709); launch, start and session arrangement. Changes made after a
review opened stay scenario actions: `u1` before reopening, publishing `s2`
and `o3` before Refresh, and the older-Git reset. Shared `git`, `commitAll`,
`writeAt` and `agentAuthoredWorktree.ts` stay while other families import
them. No production behavior change, eager preparation or speedup promise.
This plan grants no execution authority.

ADR 0010 baseline: `trunkModeStory` spends 45 lines of worktree add,
three config calls, write/commit/push/pull, a side-branch checkout, an
`execFileSync` merge, branch deletion and a rebase to say “Yui-chan's two
story commits sit on trunk among another developer's, Mina-chan's and her own
merge; her worktree is at trunk's head”; `publishRewrittenLine` and the
ambiguity spec's `storyTakenWithOneSlice` repeat that plumbing. Worth keeping
only when the declared revisions, authors and worktrees explain the same
results with less reconstruction and the shared extension costs less to
understand than the plumbing removed. Compare representative before/after
source in each slice; green tests or line counts alone do not establish that
gain. Claim no runtime savings.

## Existing owners and architectural direction

PFE at `c3ae51d6b9562095d04258f2d1a37359b3e6b550`.

| Responsibility | Reuse/change decision |
| --- | --- |
| Named trunk revisions, authors, ordered merge parents, file bytes | Reuse `repositoryTestData.mjs` through `makeMe` and `commitDeclaredRevision`: the side work's parent is `prepare another story`, and Yui-chan's merge names parents `[prepare another story, side work]` with `merged.md` declared (S2, S3). |
| Story A's Trunk Mode worktree at trunk's head, untracked files, unpublished commits | Reuse the start-origin workspace (`startOriginWorkspace.ts`, plan 708): `withWorkspace("claude/story-a", { from: <last trunk revision> })`, `withUnpublishedRevision`, and `withLocalState` untracked files. |
| The worktree's agent authorship | Change: a workspace states its `agent`; the materializer applies it through the real `configureAgentAuthorship` (`workspace-agent-authorship.mjs`), the per-worktree `author.name`/`author.email` the review reads. `checkoutIdentity` sets the committer (`user.*`) and is not that fact. |
| Several agent-authored worktrees beside the story's | Change: the description holds more than one workspace (today `withWorkspace` refuses a second), each materialized as `.worktrees/<branch basename>`. Demonstrated by the ambiguity cases' five worktrees; `agentAuthoredWorktree.ts` stays for the completed-story consumers. |
| Trunk Mode claim | Reuse `trunkModeRepository`'s declared `take Story A`; S4 shows it serves the ambiguity cases in place of the real start. |
| Review and Git observations | Keep `keepLaunchRecord`, page objects, `merge-base`, subject and parent-tree observations independent of the description. |

Follow Accepted [ADR 0002 — Direct domain mapping](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
[ADR 0008 — Published/local distinction](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
(published trunk revisions versus each worktree's unpublished ones) and
[ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
No new topic, schema, ADR exception or consequential architectural decision.

File size (250-line check): `Distribution/tests/support/repositoryTestData.mjs`
is 232 lines and slice 4's multiple workspaces would pass 250. Slice 3 moves
the workspace facts (`withWorkspace`, `withUnpublishedRevision`, the workspace
typedefs and checks) into their own module beside it, keeping the builder's
public chain unchanged for every caller; `repository-fixture.test.mjs` and
`repository-local-state.test.mjs` prove it. Other expected edits stay under
250 (`storyReviewTrunkMode.ts` 216, `startOriginWorkspace.ts` 73).

## Decisive premises and preparation evidence

Observed 2026-11-19 in this workspace at `c3ae51d6b`, dependencies from
`npm ci --ignore-scripts`, Node 24.21.0, AC power under `caffeinate -s -i`,
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`, two E2E
workers, load about 11. Scratch edits were reverted with
`git checkout -- dashboard e2e` before any record write.

| Premise / consuming operation | Observation and result | Unverified remainder |
| --- | --- | --- |
| The five Trunk Mode review spec files pass today (all slices). | A: 8 cases strict passed. | None. |
| Yui-chan's published history declared on trunk (authored `s1`, `s2`, her merge with ordered parents, another developer's and Mina-chan's commits), her worktree on `claude/story-a` at `s2` with untracked `notes.md`, authored through `configureAgentAuthorship`, keeps the own-changes results including reopening after `u1` (slice 1). | S2: scratch description in `storyReviewTrunkMode.ts`; own-changes case 1 used it with `origin.revision("s2")` as trunk; 2 strict passed. | The `agent` workspace fact itself is slice 1's construction; S2 applied the same real function after start. |
| The proof discriminates declared authorship (slice 1). | D1: worktree authorship not configured → case failed (published commits expected 2, received none). D2: `s2` not authored by Yui-chan → failed. | None. |
| The rewritten-line history declared before opening (`s1 more` ninth line, `s2` third line and `d.md`, another developer's `o3`) keeps the two-commit flag from the named tree of `o2`, `+2 −2` and `HEAD~1` = `s2` (slice 2). | S3: scratch description; flagged case 2 strict passed, case 1 unchanged and passed. | None. |
| The declared `take Story A` and agent-authored worktrees at named revisions replace the real start for both ambiguity cases (slice 4). | S4: scratch `test.use({ originRepository: trunkModeRepository })`, `trunk-a`/`trunk-b` made by `agentWorktree` at `origin.revision("take Story A")`, `earlier` at `close the earlier story`, branch `exec/trunk-a`; 2 strict passed. | The multi-workspace description is slice 4's construction; S4 used the existing helper's equivalent `worktree add` and real authorship. |

```sh
# Common environment for every run below
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i ...
# A (8 strict passed)
OPEN_DOUGH_E2E_PROOF_RECORD=<job tmp>/a-e2e.json npm run test:e2e -- review/story-review-trunk-own-changes.spec.ts review/story-review-trunk-own-flagged.spec.ts review/story-review-trunk-own-older-git.spec.ts review/story-review-trunk-worktree-ambiguity.spec.ts review/story-review-trunk-worktree.spec.ts --workers=2
# S2 (2 passed); D1, D2 (-g "all changes lists", each failed)
OPEN_DOUGH_E2E_PROOF_RECORD=<job tmp>/b-e2e.json npm run test:e2e -- review/story-review-trunk-own-changes.spec.ts --workers=2
# S3 (2 passed)
OPEN_DOUGH_E2E_PROOF_RECORD=<job tmp>/f-e2e.json npm run test:e2e -- review/story-review-trunk-own-flagged.spec.ts --workers=2
# S4 (2 passed)
OPEN_DOUGH_E2E_PROOF_RECORD=<job tmp>/w-e2e.json npm run test:e2e -- review/story-review-trunk-worktree-ambiguity.spec.ts --workers=2
```

## Outside-in proof and consumer ownership

| Promise and reached boundary | Slice / proof owner |
| --- | --- |
| Declared published/unpublished authorship keeps own-change lists, published counts, context line and merge-base baseline; older Git keeps its explanation and reset action | 1: `story-review-trunk-own-changes.spec.ts`, `story-review-trunk-own-older-git.spec.ts`; D1 repeated once against the final `agent` fact. |
| Declared rewritten line keeps flags, counts and diffs; the after-open publication and Refresh stay actions | 2: `story-review-trunk-own-flagged.spec.ts`. |
| Declared claim and agent worktrees keep the single-worktree read, the ambiguity explanation and the 409 refusals | 4: `story-review-trunk-worktree-ambiguity.spec.ts`. |
| The real terminal start stays reviewable | 4: `story-review-trunk-worktree.spec.ts`, unchanged, run because the materializer changes. |
| Builder and materializer changes keep other descriptions | Slices 1, 3 and 4: `node --test Distribution/tests/support/repository-fixture.test.mjs Distribution/tests/support/repository-local-state.test.mjs Distribution/tests/support/repository-graph.test.mjs Distribution/tests/support/repository-snapshot-isolation.test.mjs`. |
| Readability, one model, no superseded arrangement | Each slice compares representative before/after construction and removes newly unused setup; slice 4 updates the test-data architecture guide and audits remaining Trunk Mode attribution candidates across `dashboard/backend-tests/`, `e2e/`, `dashboard/frontend-tests/` and `dashboard/test-support/`, leaving siblings' candidates with them. |

Before delivery, run installed `dough-execute-plan/scripts/consumer-trace.mjs`
with `--checkout <execution checkout> --base HEAD`, adding effect terms for
`repositoryTestData.mjs`, `startOriginWorkspace.ts`, `storyReviewTrunkMode.ts`
and `storyReviewTrunkCommits.ts`. Disposition every listed consumer as run,
reused evidence, or excluded with the unreached boundary.

## Ordered slices

### 1. Read published Trunk Mode attribution from declared authors
Type: Behavior
Status: done
Proof: First consumer row and the builder row; S2, D1 and D2 establish the route.

Behavior: Given trunk declared up to Yui-chan's claim, then her `s1`, another
developer's `o1`, Mina-chan's `prep.md`, her merge of side work with ordered
parents, `o2` and her `s2`, and her worktree on `claude/story-a` at trunk's
head stating agent Yui-chan with untracked `notes.md` (or nothing published
and a declared unpublished `u1`) — the own-changes and older-Git reviews list
the same files, published counts, context line and explanations; `u1` after
opening and the older-Git reset stay actions. A workspace's `agent` fact is
materialized through `configureAgentAuthorship`; `trunkModeStory` becomes
named descriptions and consumers read named revisions. One attribution loop;
15 active minutes, commands excluded.

### 2. Read rewritten-line flags from declared history
Type: Behavior
Status: planned
Proof: Second consumer row; S3 establishes the route.

Behavior: Given the declared `s1 more`, `s2` and another developer's `o3`
rewriting `src/c.ts`'s third line before opening, the file is flagged from
`o2`'s named tree with `+2 −2` and the same diff; with one commit published
when the review opens, publishing `s2` and `o3` stays the scenario's action
and the flag appears on Refresh. Remove the declared-only parts of
`publishRewrittenLine`, `publishLater` and helpers in
`storyReviewTrunkCommits.ts` no action still uses. One flag loop; 15 active
minutes, commands excluded.

### 3. Hold a description's workspace facts in their own module
Type: Structure
Status: planned
Proof: Builder row, and slice 1's spec files rerun unchanged.

Structure: Move `withWorkspace`, `withUnpublishedRevision` and the workspace
typedefs and checks out of `repositoryTestData.mjs` into a cohesive module
beside it, with the builder's public chain and every description unchanged.
Enables slice 4's several workspaces without passing the 250-line check. 15
active minutes, commands excluded.

### 4. Read worktree ambiguity from declared agent worktrees
Type: Behavior
Status: planned
Proof: Third and fourth consumer rows and the builder row; S4 establishes the route.

Behavior: Given the declared claim of Story A on trunk, Yui-chan's `trunk-a`
with one declared slice, and declared agent-authored worktrees — one at trunk
before the claim with an untracked file, one with her unpublished claim of
Story B, one with Akiho-chan's unpublished claim of Story A — the review reads
`trunk-a` alone; with a second worktree `trunk-b` at the claim, the review is
unavailable, names both and the boundary refuses both reads with 409. The
description holds several workspaces in slice 3's module; the real-start
spec stays and passes. Update the guide and finish this story's candidate audit. One
ambiguity loop; 15 active minutes, commands excluded.

## Verification and execution gates

Apply [AGENTS.md](../../../AGENTS.md#test-automation), installed MakeMe and
browser page-object selection before test edits. Builders follow consuming
tests; Git/files/environment/cleanup remain harness work. Keep default test
timeouts; never `test.slow()` or suite/file/group/hook timeout overrides.

Local gates: complete affected spec files and their traced consumers above,
`npm run typecheck:dashboard`, changed-file lint, the `node --test` repository
tests above when the description or materializer changes, and
`native-import-closure.test.mjs` when MakeMe's runtime closure changes.
Broaden to the affected group only when the trace shows a shared change
reaches it.

Before expensive proof inspect load/memory and competing runs; start focused.
Use the maintained [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
fully awake on AC under `caffeinate -s -i`; on battery, lid open and fully
awake under `caffeinate -i`, then inspect the sleep log. Follow the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written for every local/CI failure, carrying this link into every
delegation and repair handoff. Execution retains its required final CI
ownership.

## Current decisions and concern review

- A worktree's agent is a declared workspace fact applied through the real
  `configureAgentAuthorship`, never a second spelling of its config keys.
- A story commit Yui-chan published is a trunk revision she authored; her
  worktree after a rebase is a workspace at trunk's last revision. Unpublished
  commits are workspace revisions applied before local state.
- The real terminal start stays only in `story-review-trunk-worktree.spec.ts`,
  whose promise is the review of what that start leaves.
- Plan 709 also composes the start-origin workspace; no dependency, since
  neither needs the other's outcome. Start from fetched trunk and rebase onto
  whichever lands first.
- Slice-plan refinement was not needed: three independently observable review
  outcomes, each one bounded migration/proof loop, and the file-size
  reorganization placed immediately before the Behavior it enables; four
  slices, within the slice limit.
- No remaining slice-specific concern was identified in this review.
- No pre-Take human decision, trunk-only operation or execution authorization.

## Learnings

- Slice 1: `configureDeclaredAgentAuthorship` is the shared seam for a
  workspace's declared `agent` (repository-history and start-origin). D1 with
  the agent omitted still fails attribution (published story files absent from
  All changes); restore re-passes.
- Slice 1 removed the unused `trunkModeRepository` export after consumers
  moved to `trunkModeStory`. Slice 4 must restore a claim-only description
  (`trunkModeClaim().please()` or equivalent) for the ambiguity cases; do not
  reintroduce the old name without callers.
- Accepted slice-1 proof: own-changes + older-git (3), flagged setup compat
  (2), builder suite (10), typecheck; evidence under the checkout's
  `open-dough/evidence/slice-1/`.
