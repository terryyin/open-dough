# Planning background for selected commit review

Supporting context for [the executable plan](PLAN.md).

## Published baseline and integration context

Origin was inspected at the fetched `origin/main` on 2026-10-08 (this
workspace is at its tip, `60e5ec79`). Plans 274 and 275 are allocated and
unexecuted; neither touches the story review. 276 was free immediately before
this write; after this plan was written and before it was published, trunk took 276 for a
correction, so this plan is 277. The review's current behavior is documented in
[AGENT-LAUNCH-REVIEW.md](../../../dashboard/AGENT-LAUNCH-REVIEW.md), which
every Behavior slice below keeps current.

## Existing solutions and selected approach

PFE across the dashboard review:

| Need | Finding |
| --- | --- |
| Leaving trunk out of a comparison whose ends have different baselines | **Modularize** `dashboard/server/storyReviewSince.ts`: `changesSinceReview` restates one _from_ point, the mark's `{tree, baseline}`, on the snapshot's baseline and compares with the snapshot tree. A range is the same operation with the oldest item's first-parent tree and that parent's baseline as the _from_ point and the newest item's tree and baseline as the _to_ point; the mark and the snapshot are one such pair. One restatement, two callers; no second implementation. |
| The two comparisons of one snapshot | **Change** `dashboard/src/StoryReviewPanel.tsx` and `StoryReviewComparison.tsx`: `ShownComparison` gains `commits`; the panel's `comparison` comes from the range read instead of the snapshot when Commits is shown. `SnapshotView` already takes any `ReviewComparison` and a `tree`; the range's _to_ tree is passed as that `tree`. |
| Reading one file's diff from any two trees | **Reuse** `storyReviewFileEndpoint` and `fileDiffRequest` (`storyReviewAdmission.ts`): they already admit any hexadecimal `baseline` and `tree`. `FileDiff` receives the range's _to_ tree where it receives `snapshot.tree` today. |
| Listing the story's commits | **Gap:** nothing lists commits. Add to the snapshot (`storyReviewSnapshot.ts`) a `git log --first-parent -z` read from the baseline to the head, each item with its object ID, short revision, subject, committer time, whether it is a merge, its tree, and its _from_ point: its first parent's tree and that parent's baseline (`git merge-base <parent> <remote>/<target>`). A non-merge commit's baseline is its first parent's, so only merges and the oldest commit need `merge-base`; execution may take that shortcut or call `merge-base` per item. |
| Admitting a range request | **Reuse** the admission pattern of `fileDiffRequest`: exact query, `objectIdSchema` for every object ID, the workspace from `reviewWorkspaceOf`, never a path. The request names the project, the work identity, the _from_ point (`fromTree`, `fromBaseline`) and the _to_ point (`tree`, `baseline`); the server confirms the repository holds them with `rev-parse --verify --quiet` as `holdsMark` does. |
| Where the list and the range sit in the panel | **Change** `StoryReviewMark.tsx`'s `MarkingControls`, which owns the switch and the since-the-review heading: the switch is offered when `since` exists or the list is non-empty, and a range heading takes the since heading's place while Commits is shown. The list itself is a new component in the review's body beside the browser; its exact placement is execution's. |
| Proof harness | **Reuse** `dashboard/tests/support/storyReviewWorktree.ts` (`storyWorktree`: three story commits, a `--no-ff` trunk merge, later trunk, and staged, unstaged, and untracked files) and `storyReviewTrunk.ts` (`markedWorktree`, `integrateTrunk` with a settled conflict), with `openReview`, `reopenReview`, `nextSnapshot`, `markReviewed`, `treeRows`, and the older-Git `pathPrefix` fixture of `story-review-since-trunk.spec.ts`. |

Established structure and Accepted decisions support the work (ADR 0000:
feature-local design kept in the seed and this plan; ADR 0002: one
representation of the restatement). No North Star topic is needed; the
Proposed ADRs 0008 and 0009 inform the first-parent boundary and bind nothing.

## Decisive premises and observations

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Restating a pre-merge tree on the merged trunk and diffing against the merge's tree leaves only the story's own changes | Slices 3 and 4's approach | On this repository: `git merge-tree --write-tree --name-only -z --merge-base=459959ff 9af4215e 56e7b894`, then `git diff --name-status <restated> b5b7de82` (2026-10-08, Git 2.50.1) | Exit 1, one file, `DearDough.md`, whose conflict the merge resolved; the plain diff from `9af4215e` to `b5b7de82` lists 118 files |
| A merge driver's standard output lands in `merge-tree`'s output before the tree | Slice 2 | Throwaway repository with `merge.noisy.driver` printing a line: `git merge-tree --write-tree --name-only -z --merge-base=<base> <story> <trunk>` | Exit 0 output is `driver says hello\n<tree>\0`: the first NUL field is not an object ID. On this repository the product-backlog driver did the same on exit 1 |
| The existing parser requires the first NUL field to be the tree | Slice 2's change | `dashboard/server/storyReviewSince.ts:64-79` | On exit 1 a non-ID first field answers `not-restated`; on exit 0 the first field is used as the tree unchecked |
| `fileDiffRequest` admits any hexadecimal `baseline` and `tree` | Slices 1 and 4's file diffs | `storyReviewAdmission.ts:97-130`, `objectIdSchema` | Confirmed; `FileDiff` takes `from` and `tree` props (`StoryReviewFileDiff.tsx`, `StoryReviewSnapshotView.tsx:189-194`) |
| `SnapshotView` renders any `ReviewComparison` and selects from `comparison.files` | Slice 1 | `StoryReviewSnapshotView.tsx:98-120` | Confirmed; `sinceReview` only chooses the empty message |
| The switch is rendered only when `snapshot.since` exists | Slice 1's switch change | `StoryReviewMark.tsx:134-137`; `StoryReviewComparison.tsx` lists `["since", "all"]` | Confirmed |
| `git log --first-parent` names merges by their parent count and the line can be read NUL-separated | Slice 1's list read | `git log --first-parent --format='%H%x1f%h%x1f%P%x1f%cI%x1f%s' 459959ff..b5b7de82` | Two merges with two parents each, one plain commit; `%cI` is ISO time |
| `storyWorktree` holds three story commits, a `--no-ff` trunk merge, and uncommitted files, so one fixture covers the list, a range across a merge, and Uncommitted changes | Slices 1, 3, 4 | `tests/support/storyReviewWorktree.ts:67-123` | Confirmed; `merged` is the baseline after the merge, and the three commits before it have the earlier trunk commit as baseline |
| The since-trunk proof, its older-Git fixture included, runs here | Named proof command | `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts dashboard/tests/story-review-since-trunk.spec.ts --workers=2 --reporter=line` after `env -u NODE_ENV npm ci` (2026-10-08) | 5 passed in 25.1 s |

No decisive premise needs a paid or state-changing observation; no probe
slice is required.

## Preparation review

Cumulative design: one restatement with two callers, one comparison type for
all three views, one admission pattern, and one list read beside the snapshot;
the examples exercise one rule, a comparison of two points of the story's
line, with Uncommitted changes as one more point. Refinement was not needed:
no slice fragments one result or combines independent outcomes, slice 2's
independence is a correction the mechanism depends on, and every promise has
an owner.

## Verification, delivery and sizing

All proof enters the existing Playwright Chromium suite on real bare origins
and worktrees; no credentialed or paid dependency. Run from the execution
checkout with inherited variables unset:

```sh
env -u NODE_ENV npm ci
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- --workers=2 <owning-and-affected-specs>
env -u NODE_ENV npm run typecheck:dashboard
```

Affected consumers: every `story-review-*.spec.ts` that opens the switch or
reads `snapshot.since` (`story-review-since*.spec.ts`,
`story-review-mark.spec.ts`, `story-review-comparison*.spec.ts`,
`story-review-refresh.spec.ts`, `story-review-nothing.spec.ts`); before
changing a message, search its exact words in `dashboard/tests` and
`dashboard/tests/support`. Slice 2 changes no message.

Authorized execution applies its existing proof, refactoring, and delivery
gates, including post-change refactoring. Planning grants no Take,
implementation, commit, push, landing, or workspace retirement.

No numeric slice target or hard limit was supplied. Slice 1 is the largest:
one list read, one request with admission, one switch option, and one
journey; slice 4 adds the two-ended choice and the restated case to the
mechanism slice 3 prepared. Slices 2 and 5 each add cases to existing specs.

## Accepted execution evidence

1. Slice 1: first-parent rows, newest default, parent-to-commit files/diff,
   rename/Hide, empty/unchanged/interim merge, and strict range admission
   observed in `story-review-commits.spec.ts`; switch consumers updated.
   After independent refactoring, `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR
   npm run test:dashboard -- --workers=2 'dashboard/tests/story-review*.spec.ts'`
   and `env -u NODE_ENV npm run typecheck:dashboard` passed.
   Panel selection/feedback and commit CSS extracted; source/server proof preserved.

2. Slice 2: printing-driver clean/conflicted cases in
   `story-review-since-trunk.spec.ts` observe increased driver calls during review,
   no unavailable mark, empty clean comparison, and flagged conflict counts/diff.
   Full story-review command above and typecheck passed; after unchanged older-Git
   fixture extraction, the same command restricted to
   `dashboard/tests/story-review-since-trunk.spec.ts` and typecheck passed.
   Isolated `18a159ee` baseline with its own npm ci failed both new printing cases
   (clean: no snapshot; conflict: not-restated), proving the parser correction.
   Initial clean setup failure was a second commit after an automatic merge;
   returning after successful merge corrected the fixture.

Published increment: slice 1 `18a159ee44760f09561fc6a6552aef51ded4ab13`;
CI reused `/tmp/dough-ci-501/watch-XlowzV`, target the remote execution branch.
Independent refactor thread reused after host refused a fresh thread.

3. Slice 3: explicit two-point comparison, file listing, and point-object rules
   shared by snapshot/mark/range; unchanged mark failure mapping and temporary
   cross-baseline restriction. Full story-review command and typecheck above
   passed (since-trunk clean/conflict/original/baseline/printing/older-Git,
   since/mark/switch/refresh, and commit rename assertions). Independent refactor
   found no candidate and reused proof without rerunning tests.

Published increment: slice 2 `6217c1402647e2fa638087840dab69d0466b9e4d`,
accepted on the remote execution branch with the same observer reused.

### Slice 4 comparison reassessment

The unchanged conflicted-range assertion in `story-review-commit-trunk.spec.ts`
failed: before-range tree c 5 restates cleanly onto c trunk even though the
selected merge's parent c story conflicts. This invalidated the assumption that
two outer points alone expose every integration conflict. A disposable real-Git
probe also found forward and reverse outer restatements both clean when the
conflict resolves back to c 5; the selected merge's parent still reports c.ts.
Clean disjoint same-file edits report no conflict. Reverse restatement alone
therefore cannot satisfy the flag promise.

PFE search across dashboard and source guidance found one suitable mechanism:
`storyReviewComparison.ts` owns restatement and inseparable paths; the snapshot
already supplies each merge's parent point and destination baseline. Modularize
that same mechanism to union selected integrations' paths, carrying only those
object IDs in the range request. No new conflict engine, file paths from callers,
marking behavior, persistence, story scope, or ADR decision. Source promises stay
unchanged; slice 4 adds original-content resolution and clean disjoint-line proof,
and slice 5's virtual item uses the same range contract.

A bounded real-browser rename regression also failed: c.ts renamed to d.ts
before the conflicted integration and to e.ts afterward produced unflagged e.ts
instead of the required flagged rename. The fixture asserts the actual conflict
and first-parent commits. Integration conflict names must follow Git's rename
records to both outer trees; filtering complete rename-aware file records keeps
oldPath/kind/counts coherent, whereas limiting a destination-only pathspec can
lose the old side. Reuse `changedFrom` for that mapping and for the existing
original-tree / baseline comparisons. This is the same moves/flag/diff promise.


4. Slice 4: both-direction ranges, reset and comparison retention, clean and
   conflicted integrations, original-content resolutions, clean disjoint edits,
   older Git, strict integration admission, stale-answer suppression, and
   conflicts across renames pass real-Git browser proof. The full story-review
   command and typecheck above passed after freezing conflict sets and filtering
   full rename-aware records. Independent refactoring removed an unused paths
   parameter without changing Git arguments; typecheck passed again.

Published increment: slice 3 `f5ebc9d05f091bc3f1082301cc946669ab5aef80`,
accepted on the remote execution branch with the same observer reused.

5. Slice 5: staged/unstaged/untracked virtual-item files and diffs, ignored-file
   exclusion, whole-range equality with All changes, uncommitted-only snapshots,
   default timing/anchoring, retained and vanished endpoints, refreshed virtual
   points, no vanished-range resurrection, chosen-range announcements, and
   whole-snapshot marking/reopening pass the real-Git browser journeys in
   `story-review-commit-worktree.spec.ts` and `story-review-commit-refresh.spec.ts`.
   The stale-response proof now holds a real virtual-item answer. After independent
   label/availability consolidation and feedback/documentation extraction, the
   full story-review command and typecheck above passed. All changed files fit
   the formatted 250-line limit.

Published increment: slice 4 `bf1f48f076a5473814409b58f1f3da06be32d943`,
accepted on the remote execution branch with the same observer reused.

Published increment: slice 5 `c3d8bf677b75e0b55aa486d9c928a6374d8d01c1`,
accepted on the remote execution branch with the same observer reused.

## Automatic execution retrospective

Reviewed the five accepted implementation revisions recorded above, in order,
from the claim `ed43663b` to `c3d8bf67`; the claim is planning/ownership provenance.
The contiguous net diff contains no sibling implementation. Original story
examples and plan, changed decisions with real-Git evidence, whole review
responsibilities, new and retained browser proof, and current North Star direction
were checked. Shared point comparison and transient UI selection agree with
Accepted ADRs 0000/0002; no architecture conflict or product correction found.
E2E assertions exposed parser, range-conflict and rename errors and retain real
Git/server/browser integration. No demonstrated suite-cost or obsolete-branch
finding warrants a correction. Follow-up planning remains unchanged.

Process: reused independent workers after the host thread cap, preserving distinct
implementation/refactor ownership. Record the partial-journey planning observation
as one new occurrence of existing ODF-110 in `DearDough.md`; existing SEED-108
already owns its response. The log reaches 1,000 physical lines (500-line warning).
Product advice: preserve the sibling uncommitted-view and Trunk Mode priorities.
At review, CI remains pending for this branch; execution owns the completion wait
covering the subsequent records commit.
