# Review a completed story including its merge changes

**Identity:** SEED-253#review-delivered-merge-changes
**Source:** [Review a completed story including its merge changes](../../seeds/SEED-253-review-delivered-merge-changes.md#review-delivered-merge-changes)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Allow a developer opening **Review changes** or selecting a completed story in
Intent to inspect its delivered changes, including changes made during its
merges and landing, even after the story branch, workspace, or local launch
record is gone, and even after later merges carry the story's existing done
record onto a different first-parent path.

Included:

- Anchor a completed story's `completion` revision in
  `dashboard/server/storyPublishedEndpoints.ts` to the story's own delivery:
  the newest trunk-first owning merge that integrates the commit where its done
  record was added (`--diff-filter=A`), or that done-record commit itself when
  there is no such trunk-first owning merge (Trunk Mode, fast-forward Story
  Branch landing, or completion committed on trunk after an earlier merge).
- Bound agent and execution-claim recovery so claims must be ancestors of the
  done-record creation commit, preventing later claims or later story merges
  from hijacking the completed story's endpoint recovery.
- Remove the merge-attribution refusals in
  `dashboard/server/storyCompletedCommits.ts` (`"Published execution history
  contains merge resolutions whose story changes cannot be attributed safely"`
  and `"Published execution history contains merge resolutions affecting this
  story's files whose changes cannot be attributed safely"`).
- Decompose each 2-parent owning or completion merge `M(P1, P2)` in
  `dashboard/server/storyCompletedCommits.ts`:
  - Ignore `git merge-tree` directory-rename false positives on paths in
    `automatic.inseparable ∪ resolved` that the story branch
    (`merge-base(P1, P2) -> storyParent`) did not change and that `M` kept
    identical to `trunkParent` (such as another active agent's profile in
    `.planning/agents/`).
  - Mark genuine conflict paths (`automatic.inseparable` excluding untouched
    directory-rename paths) in `resolutions` with `storyStart` so `listedFrom`
    exposes them with `includesTrunkFrom` (“includes trunk's changes”).
  - Construct `preMergeEditTree` (equal to `automatic.tree` on non-conflicted
    paths and `M^{tree}` on `automatic.inseparable` and untouched
    directory-rename paths) and, when `preMergeEditTree !== M^{tree}`, include
    `{ commit: M, parent: preMergeEditTree }` at `M`'s topological position in
    the commits passed to `trunkLess` so non-conflicted merge and landing edits
    are subtracted from `less.tree` and appear with their diffs in the review.
- Pass `less.tree` as `keptFrom` to `listedFrom` in
  `dashboard/server/storyReviewPublished.ts` and filter `restated` in
  `dashboard/server/storyReviewComparison.ts` against `differed` as well as
  `origins.keys()` so renamed inseparable files do not leave a duplicate
  old-path entry.
- Update the boundary and Intent specs that previously asserted
  merge-attribution refusals and update maintained documentation
  (`dashboard/AGENT-LAUNCH-REVIEW.md`, `docs/dashboard-development-intent.md`).

Excluded:

- Changing live workspace review, review marks, or captured landed-run storage.
- Sub-file line-by-line blame UI inside a single conflicted file beyond the
  existing `includesTrunkFrom` comparison base and diff presentation.

## Existing solution and decisions

- Reuse the shared endpoint and claim recovery walk in
  `dashboard/server/storyPublishedEndpoints.ts`,
  `dashboard/server/storyPublishedEndpointDerived.ts`, and
  `dashboard/server/storyPublishedEvidence.ts`, and the tree-restatement and
  mixed-file listing pipeline in `dashboard/server/storyPublishedCommits.ts`,
  `dashboard/server/storyCompletedCommits.ts`,
  `dashboard/server/storyReviewComparison.ts`, and
  `dashboard/server/storyReviewPublished.ts`.
- Construct `preMergeEditTree` using a temporary `GIT_INDEX_FILE` (`git
  read-tree`, `git ls-tree -z`, `git update-index`, `git write-tree`) so the
  configured repository's own index, worktree, and refs remain untouched.
- Follow [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  (durable state on `origin`, distinguishing mixed or missing evidence from a
  blanket refusal) and
  [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  No ADR conflict or new North Star topic exists.

## Premises and baseline

| Premise | Consuming observation | Result and remainder |
| --- | --- | --- |
| `git log --first-parent -1` on a done record returns a later story's merge when that later branch (branched before the completion) merges `main` as its second parent and fast-forwards `main` | Ran `git log --first-parent -1 --format=%H origin/main -- .planning/done/<file>` vs `git log -1 --diff-filter=A --format=%H origin/main -- .planning/done/<file>` and `publishedStoryEvidence` across all 268 done records in `/Users/terryyin/git/open-dough` at `d5a7afe0bfbf2dcc0e9fe38cd58afcea3ea3c2db` | 26 of 268 done records (including `SEED-248` at `e6948bfce` -> `199a61b8d`, `SEED-241` at `c9a142ac3` -> `342754ce7`, and `SEED-118` at `52cf8772d` -> `811b9a1ce`) had `--first-parent` rewritten to a later merge. Selecting the newest trunk-first owning merge of `added` (215 stories) else `added` (53 stories) recovered the exact completion revision for all 268 stories (40 of the newest 40 verified end-to-end with 0 failures). |
| `git merge-tree` directory-rename heuristics report false conflicts on another active agent's `.planning/agents/<other>.json`, while owning merges with non-conflicted edits (`SEED-249` `199a61b8d`, `SEED-243` `342754ce7`, `own-conflict-extra`) are currently refused | Ran `merge-tree --write-tree --name-only -z` and prototype merge-inclusive attribution via `node --experimental-transform-types` on `SEED-249`, `SEED-248`, `SEED-246`, `SEED-245`, `SEED-243`, `SEED-241`, `SEED-239`, and `SEED-238` in `/Users/terryyin/git/open-dough` at `d5a7afe0bfbf2dcc0e9fe38cd58afcea3ea3c2db` | All 8 previously refused stories resolved to `kind: "published"` with their delivered files and mixed-file flags (`SEED-246`: 20 files, 0 mixed, `.planning/agents/d.kanai-chan.json` excluded; `SEED-248`: 33 files at `e6948bfce`; `SEED-249`: 877 files at `328b316e9` including test files moved in `199a61b8d`). |
| Dashboard typecheck and completed-story review boundary specs run and pass at baseline in this checkout | `npm run --silent typecheck:dashboard && npx playwright test --config dashboard/playwright.config.ts dashboard/backend-tests/story-review-completed-conflicts.spec.ts dashboard/backend-tests/story-review-completed-driver.spec.ts` in `/Users/terryyin/git/open-dough/.worktrees/review-a-completed-story-including-its-merge-cha` at `d5a7afe0bfbf2dcc0e9fe38cd58afcea3ea3c2db` | Exited 0 in 28.3 s (10 passed). Note: `SEED-251` (`811b9a1ce`) on `origin/main` moved `dashboard/backend-tests/story-review-completed*.spec.ts` to `dashboard/backend-tests/review/story-review-completed*.spec.ts`; use the checkout's path after execution start. |
| Consumer trace identifies all specs and docs referencing the retired merge-attribution refusal strings | Grep across `dashboard/` and `docs/` at `d5a7afe0bfbf2dcc0e9fe38cd58afcea3ea3c2db` | Matches in `dashboard/server/storyCompletedCommits.ts`, `dashboard/backend-tests/(review/)?story-review-completed-conflicts.spec.ts`, `dashboard/backend-tests/(review/)?story-review-completed-driver.spec.ts`, `dashboard/tests/intent/intent-ci-comparison.spec.ts`, `dashboard/tests/intent/intent-summary-story-comparison.spec.ts`, `dashboard/tests/intent/intent-summary-story-comparison-file.spec.ts`, `dashboard/AGENT-LAUNCH-REVIEW.md`, and `docs/dashboard-development-intent.md`. |

## Outside-in proof and ownership

- **Slice 1** owns keeping a completed story's `completion` revision tied to its
  own delivery (`storyPublishedEndpoints.ts`,
  `storyPublishedEndpointDerived.ts`, `storyPublishedEvidence.ts`) when a later
  story branch (branched before that completion) merges `main` as its second
  parent and fast-forwards `main`, proved through `story-review-completed.spec.ts`
  and `intent-ci-comparison-fast-forward.spec.ts` (plus preserving
  `story-review-completed-agent-recovery.spec.ts` and `story-review-completed-gaps.spec.ts`).
- **Slice 2** owns removing the merge-attribution refusals, including
  non-conflicted merge and landing edits in `trunkLess`, ignoring `merge-tree`
  directory-rename false positives on untouched trunk paths, marking inseparable
  conflict resolutions with `includesTrunkFrom`, and updating the affected
  boundary and Intent specs (`story-review-completed-conflicts.spec.ts`,
  `story-review-completed-driver.spec.ts`, `intent-ci-comparison.spec.ts`,
  `intent-summary-story-comparison.spec.ts`,
  `intent-summary-story-comparison-file.spec.ts`) and maintained documentation
  (`dashboard/AGENT-LAUNCH-REVIEW.md`, `docs/dashboard-development-intent.md`).
- **Local gates**: `npm run lint`, `npm run --silent typecheck:dashboard`, and
  focused Playwright execution of the affected completed-review boundary specs
  and Intent completed-story comparison specs under the maintained macOS sleep
  guard ([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos):
  fully awake on observed AC with `caffeinate -s -i`, or the lid-open
  `caffeinate -i` procedure on battery with sleep-log inspection).
- **Failure policy**: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
  applies as written.

## Ordered slices

### 1. Keep completed-story endpoints tied to the story's own delivery across later merges
Type: Behavior
Status: done
Proof: `npx playwright test --config dashboard/playwright.config.ts` on
`story-review-completed.spec.ts`, `story-review-completed-agent-recovery.spec.ts`,
`story-review-completed-gaps.spec.ts`, and
`dashboard/tests/intent/intent-ci-comparison-fast-forward.spec.ts`, plus
`npm run --silent typecheck:dashboard`.

Behavior: A story completes (via trunk-first landing merge or on trunk) while a
second story branch that started before that completion is already open; the
second story merges `origin/main` as its second parent (bringing the first
story's existing done record onto a new first-parent path) and fast-forwards
`origin/main` → opening **Review changes** or selecting the first story in
Intent still resolves the first story's own `completion` revision and shows its
own delivered files and diffs, while agent recovery and shallow-history gap
explanations remain intact.

### 2. Include merge and landing edits in completed-story review and mark mixed changes
Type: Behavior
Status: done
Proof: `npx playwright test --config dashboard/playwright.config.ts` on
`story-review-completed-conflicts.spec.ts`,
`story-review-completed-driver.spec.ts`,
`story-review-completed-attribution.spec.ts`,
`dashboard/tests/review/story-review-completed.spec.ts`,
`dashboard/tests/intent/intent-story-completed.spec.ts`,
`dashboard/tests/intent/intent-ci-comparison.spec.ts`,
`dashboard/tests/intent/intent-summary-story-comparison.spec.ts`, and
`dashboard/tests/intent/intent-summary-story-comparison-file.spec.ts`, plus
`npm run --silent typecheck:dashboard` and `npm run lint`.

Behavior: A completed story's owning merge or landing merge resolves a conflict
on `shared.txt`, edits or adds a path Git did not flag as conflicted (such as
`merge-resolution.txt`), or restores an untouched trunk file (such as another
agent's `.planning/agents/<other>.json` moved by `merge-tree` directory-rename
heuristics), or another story's non-owning merge resolves a conflict on a file
this story also modified → **Review changes** and Intent's selected-story
overlay open with `kind: "published"` showing the story's delivered files and
diffs (including `merge-resolution.txt` and landing edits), marking inseparable
files (`shared.txt`) with `includesTrunkFrom` (“includes trunk's changes”),
excluding untouched trunk files, and overlaying changed test files in Intent's
entry, folder, and file Purpose/Proof views.

### 3. Show merge edits in Intent and stop refusing other stories' octopus merges
Type: Behavior
Status: done
Proof: `npx playwright test --config dashboard/playwright.config.ts` on
`dashboard/tests/intent/intent-summary-story-comparison.spec.ts`,
`dashboard/tests/intent/intent-summary-story-comparison-file.spec.ts`,
`dashboard/backend-tests/review/story-review-completed-driver.spec.ts`,
`dashboard/backend-tests/review/story-review-completed-conflicts.spec.ts`,
`dashboard/backend-tests/review/story-review-completed-gaps.spec.ts`, plus
`npm run --silent typecheck:dashboard`.

Behavior: Added after the execution retrospective found that slice 2's Intent
proof never reached a merge edit (every fixture merge edit lies outside
Intent's `dashboard/tests` location, so the merge variants asserted the same
rows as the plain story) and that a non-owning octopus merge still refused the
whole comparison. A completed story whose integration merge edits or renames a
test file inside Intent's location → Intent's selected-story overlay shows that
merge edit's row and diff (commitments 3.3 and K1.2). Another story's merge
with more than two parents between the story start and its completion → the
review stays published; only an owning or completion merge with more than two
parents explains the gap. The `merge-edit` driver variant asserts
`merge-resolution.txt` with `+integration edit`. An unsupported `git
merge-tree` (a `PATH` shim exiting 129) explains the resolution-evidence gap
with no files (commitment 6.1e), durably. Drop Intent merge variants that only
duplicate the plain journey once one variant observes the merge edit.

### 4. Remove slice 1 and 2 residue in completed-story attribution
Type: Structure
Status: planned
Proof: reuse slice 3's focused set plus
`dashboard/backend-tests/review/story-review-completed.spec.ts`,
`dashboard/backend-tests/review/story-review-completed-attribution.spec.ts`,
`dashboard/tests/intent/intent-ci-comparison*.spec.ts`, and
`npm run --silent typecheck:dashboard`.

Structure: Delete the uncalled `completedStoryCommits` and its re-export and
make `doneRecordAdded` required; drop the unreachable `merge !== completion`
clause and its "different publisher" comment; rename `keptFromTrunk` to what
it holds; when the story side of an owning merge is unknown, do not apply the
untouched-trunk exclusion; drop the redundant `unrelated-merge` driver variant
and fold the `own-conflict` conflicts variant into the `own-conflict-extra`
test; correct `dashboard/AGENT-LAUNCH-REVIEW.md` (owning or completion octopus
merge, the `trunkLess` diff-tree command, completion requires a merge authored
by the claiming agent).

## Refinement review

Refinement was not needed: the two Behavior slices cleanly separate completion
endpoint recovery from merge-change attribution and consumer updates, each with
direct outside-in proof and no remaining slice-specific concern.

## Current decisions

- Execute in Story Branch Mode or Trunk Mode as started; Note that `SEED-251`
  (`811b9a1ce`) on `origin/main` relocated
  `dashboard/backend-tests/story-review-completed*.spec.ts` to
  `dashboard/backend-tests/review/story-review-completed*.spec.ts`.
- Slice 1 accepted: `deliveredCompletion` (`dashboard/server/storyPublishedEndpointDerived.ts`)
  selects the completion from `doneRecordAdded`; the shared private
  `trunkFirstOwningMerges` walk now serves both it and `landingOf`; `isAncestor`
  lives in `dashboard/server/gitRunner.ts`; `completedStoryClaimEvidence` takes
  an optional `doneRecordAdded` claim bound. The later-merge fixture is
  `laterBranchMergesTrunkAndFastForwards` in
  `dashboard/tests/support/laterStoryMergesTrunk.ts`. Accepted proof: 59
  focused Playwright tests (completed-review backend, Review, Intent completed,
  CI comparison and summary comparison specs) plus typecheck; the new specs
  failed on `dc81df37b`. Real history at `34e6b696f`: SEED-248 -> `e6948bfce`,
  SEED-241 -> `c9a142ac3`, SEED-249 -> `328b316e9`, 0.15–0.4 s per story.
- Learning for slice 2: on base, Story Branch Mode's Intent Landed was already
  chosen from owning merges, so only Trunk Mode exposed the hijacked completion
  in Intent; slice 2 specs still assert the merge-attribution refusals and
  pass unchanged after slice 1.
- Slice 2 accepted: `owningMergeEdits` (`dashboard/server/storyCompletedMergeEdits.ts`)
  decomposes each owning or completion merge using the exported `storySideOf`;
  both merge-attribution refusals are deleted; `trunkLess` diffs with
  `--no-renames` and accepts a pre-edit merge tree as parent; `listedFrom`
  keeps from `less.tree` and drops restated old paths already differed.
  Fixture variants: `own-conflict-extra` covers key example 1 (conflict,
  integration edit, renamed test, restored `agents/other.json`), `merge-edit`
  replaces `ambiguous-merge`, `non-owning-story-file` overlaps in Trunk Mode.
  Accepted proof: 207 focused Playwright tests over completed and live review,
  Intent overlay, CI comparison and summary comparison specs, plus typecheck;
  new scenarios failed on `5cdb4f04d`. Real history: SEED-246 20 files 0 mixed
  (no agent profile), SEED-248 33 files 5 mixed at `e6948bfce`, SEED-249 877
  files 2 mixed, about 1 s each. Unsupported `merge-tree` observed only through
  a coordinator real-history probe with a `git` shim; no durable spec forces it.


- Execution retrospective after slice 2 (read-only review of
  `dc81df37b..f496a5137`) reopened the plan with slices 3 and 4: slice 2's
  Intent merge variants asserted the plain story's rows because every fixture
  merge edit lies outside Intent's location, so commitments 3.3 and K1.2 were
  accepted without an Intent observation (G1); a non-owning octopus merge
  still refuses (G3); unsupported `merge-tree` lacks durable proof (G2); plus
  dead `completedStoryCommits`, an unreachable completion clause, the
  misleading `keptFromTrunk`, an unknown-side exclusion edge, redundant driver
  and conflicts variants, and stale `AGENT-LAUNCH-REVIEW.md` details.
  Product advice: no change. A Story Branch landing that merges trunk after the
  done-record commit and then fast-forwards keeps the done-record commit as its
  completion, so edits in that later merge stay outside review; the only real
  instance (SEED-234 `8d9b41498` then `66d144b2c`) made no edits. Revisit only
  if such a merge carries edits.

- Slice 3 accepted: the `own-conflict-extra` Intent variant's integration
  merge edits `dashboard/tests/folder/nested/c.spec.ts` through the new
  `integrate` hook of `completedPublishedStory`; Intent's `non-owning-story-file`
  variants were dropped as duplicates of the plain journey (the backend
  conflicts spec keeps that case). `foreign-octopus` and `own-octopus` variants
  live in `story-review-completed-attribution.spec.ts`; the unsupported
  `merge-tree` spec uses the `pathPrefix` fixture with a `git` shim. Accepted
  proof: 193-test consumer surface plus typecheck; the foreign octopus test
  failed on `f496a5137`, and a mutation without merge-edit subtraction failed
  the Intent and driver merge-edit assertions.

## Story obligations

### G1. Intent overlay never observed a merge edit (first reported in slice 2)
Reported: slice 3 — "Intent's location is dashboard/tests, so none of them appear there."
Story clause: "selected-story overlay open with the delivered files and diffs"
Disposition: proved by slice 3: dashboard/tests/intent/intent-summary-story-comparison.spec.ts own-conflict-extra: nested row "c.spec.ts modified" (mergeEditedNestedComparisonRows) where the plain variant reads "c.spec.ts"; dashboard/tests/intent/intent-summary-story-comparison-file.spec.ts step "a test file only the integration merge edited shows that edit and keeps Proof": Purpose diff contains "merge edit", Proof row modified

### G2. Unsupported merge-tree gap lacks durable proof (first reported in slice 2)
Reported: slice 3 — "no durable test forces an unsupported git merge-tree"
Story clause: "explain that specific gap"
Disposition: proved by slice 3: dashboard/backend-tests/review/story-review-completed-merge-tree.spec.ts (pathPrefix git shim exiting 129 for merge-tree: toEqual unavailable with the resolution-evidence explanation, no files)

### G3. Non-owning octopus merge still refuses the comparison (retrospective)
Reported: slice 3 — "any octopus merge still refuses the whole review, including another story's"
Story clause: "Remove the merge-attribution refusals that rejected the whole comparison"
Disposition: proved by slice 3: dashboard/backend-tests/review/story-review-completed-attribution.spec.ts "another story's octopus merge leaves the completed review published" (published, octopus files absent; red on f496a5137)
