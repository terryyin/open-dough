# Review the combined changes of selected story commits

**Identity:** SEED-088#review-selected-commits
**Source:** [refined story](../../seeds/SEED-088-dashboard-story-code-review.md#review-selected-commits).
**Prepared:** 2026-10-08, planning only, in the established preparation
workspace `/Users/terryyin/git/open-dough/.worktrees/review-the-combined-changes-of-selected-story-co`
on `claude/review-the-combined-changes-of-selected-story-co`, under the
preparation assignment for `juacompe-chan`. Publication target: `origin/main`;
integration checkout: `/Users/terryyin/git/open-dough`.

## Goal and boundaries

A developer reviewing a story in the dashboard chooses a stretch of the
story's own commits by its two ends and sees their combined changes in the
review's file browser and diff view, with the trunk changes integrated
meanwhile left out, so one part of a long story can be examined without the
rest of the diff.

Include the story's required behavior: the snapshot's first-parent commit
list with Uncommitted changes on top while there are any; the **Commits**
comparison beside Since the review and All changes; a contiguous range by two
ends, one item being a range of one; the restatement of the range's _from_
tree across a trunk integration, with inseparable files flagged; the file
browser, counts, diffs, moves, and Hide files on the range; Refresh keeping a
range both of whose ends are still listed; the empty-range message; the
older-Git limit; and Mark reviewed marking the whole snapshot whichever
comparison is shown. The draft defaults from refinement are taken as written:
the newest item alone is the default range, the heading names the range's
count and ends, and merge commits stay listed.

Keep the story's exclusions: a non-contiguous set of commits (Terry deferred
it on 2026-10-08), per-commit diffs within a range, authors and bodies,
remembering a range across openings, relating commits to slices, commits
already on trunk, and the Trunk Mode uncommitted-only view and the full
review's check, which stay with the sibling stories.

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

## Current decisions

- **Points, not commits, cross the boundary.** The range request names two
  `{tree, baseline}` points the snapshot's list supplied, so the server's
  comparison is the restatement's own contract and the Uncommitted changes
  item is simply the point `{snapshot.tree, snapshot.baseline}` with the head's
  tree as its _from_. The server never recomputes what the list said.
- **The range answer is a `ReviewComparison`** (`from`, `files` with
  `includesTrunkFrom`) plus the _to_ tree and whether trunk was integrated
  within the range (`fromBaseline !== baseline`), read through `useReviewRead`
  like the snapshot; a new read for each range, keyed by its points, and a
  read still pending for an earlier range never answers a later one.
- **Choosing ends.** Activating an item while a range of one is shown
  extends the range to it, in either direction; activating an item while a
  range of two or more is shown starts a new range of one at it. Each item is
  a button that says whether it is in the range; the heading names the
  range: how many commits, and its oldest and newest ends by short revision
  and subject, or Uncommitted changes.
- **Empty and unavailable ranges.** No file listed says “The chosen commits
  changed nothing.”; a range the older Git cannot restate across an
  integration says so in the feedback region and lists no files, with the
  wording of the existing `not-restated` statement adapted to the range.
- **The merge-driver fix** (slice 2) reads the tree as the first field that
  parses as an object ID after splitting on NUL and newline, on exit 0 and
  exit 1 alike, and still treats any other exit as not restated.
- **Documentation** follows each Behavior slice in `AGENT-LAUNCH-REVIEW.md`,
  with the request shape in `storyReviewAdmission.ts`'s header comment.

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

## Outside-in proof ownership

| Promise (story example) | Owning slice | Observable proof |
| --- | --- | --- |
| 1. Commits lists the first-parent line newest first; the newest item alone is the default range; its files and heading | 1 | New `story-review-commits.spec.ts` on `storyWorktree` |
| 9. No commit and nothing uncommitted: Commits not offered, “No changes” as today | 1 | `unchangedWorktree` case in the same spec |
| Merge-driver output no longer fails or misreports a restatement | 2 | `story-review-since-trunk.spec.ts` case with a printing driver configured on the fixture's `src/a.ts` |
| Since-the-review unchanged after the restatement takes two points | 3 | `story-review-since*.spec.ts`, `story-review-mark.spec.ts`, `story-review-comparison*.spec.ts` green |
| 2. Two ends give three commits diffed from the oldest's parent tree | 4 | `story-review-commits.spec.ts`: files and one diff |
| 3. A range across the merge lists only the story's files, says trunk was integrated, flags an inseparable file | 4 | `markedWorktree` + `integrateTrunk(…, "c story and trunk")` without a mark, range from the first commit to the merge |
| 4. The merge alone: changed nothing, or only the resolved file flagged | 4 | Same spec, the merge as a range of one in both fixtures |
| 6. Older Git: a range across the integration says why and lists none; one below it shows | 4 | The older-Git `pathPrefix` fixture |
| 8. Uncommitted changes on top; alone it lists the staged, unstaged, and untracked files; with the oldest commit it equals All changes | 5 | `storyWorktree`'s three uncommitted files |
| 5. Refresh keeps a range both of whose ends are listed; otherwise the default | 5 | Commit in the worktree, Refresh; then commit the uncommitted files while Uncommitted changes is an end |
| 7. A marked story opens on Since the review, offers Commits, and Mark reviewed there marks the whole snapshot | 5 | `markStoryReview`, switch to Commits, mark, reopen |
| Documentation describes the list, the range, and the request | 1, 4, 5 | `AGENT-LAUNCH-REVIEW.md` wording |

## Ordered slices

### 1. Commits lists the story's commits and shows one commit's changes
Type: Behavior
Status: planned
Proof: Add `story-review-commits.spec.ts` on `storyWorktree`: Commits
offered, the list's rows, the default range, its files, and one file diff;
`unchangedWorktree` offers no Commits. Keep `story-review.spec.ts`,
`story-review-mark.spec.ts`, and `story-review-comparison.spec.ts` green.

Behavior: A story's review opens on a snapshot with commits after the
baseline → the developer chooses Commits → the first-parent commits are listed
newest first, each by short revision, subject, and time, the merge saying it
integrated trunk; the newest commit is the range, the heading names it, and
the browser lists the files changed from its parent tree to its tree, each
diff read from those trees. A snapshot with no commit and nothing uncommitted
offers no Commits.

Add the list to the snapshot answer with each item's _to_ and _from_ points;
add the range request and its admission; compare the two points directly
when their baselines are equal, which every single non-merge commit's range
is. The switch is offered to an unmarked story. Uncommitted changes is not
listed yet, and the merge chosen alone is not yet meaningful; both are
slice 5's and slice 4's.

Interim behavior: a range whose points have different baselines is not yet
offered; the list allows only a range of one until slice 4.

Safe stopping point: a developer can read any one commit of a story in the
review.

### 2. A restatement is read even when a merge driver prints
Type: Behavior
Status: planned
Proof: Add to `story-review-since-trunk.spec.ts` a case whose fixture
configures a merge driver that prints a line for `src/a.ts` (git config in
the project plus a `.gitattributes` entry) before `integrateTrunk`; the
changes since the review are listed as in the existing case, on the clean and
on the conflicted merge.

Behavior: A marked story merged trunk, and a merge driver configured for a
file both sides changed prints to standard output → the review opens on the
changes since the review as usual; nothing says the earlier review cannot be
compared, and the review is not failed.

Read the tree as the first field that parses as an object ID after splitting
on NUL and newline, on exit 0 and 1; the conflicted names still follow it up
to the empty field. This corrects today's behavior in any project with the
product-backlog merge driver, this one included.

Safe stopping point: since-the-review is reliable where the backlog driver
runs.

### 3. The restatement compares any two points
Type: Structure
Status: planned
Proof: `story-review-since*.spec.ts`, `story-review-mark.spec.ts`,
`story-review-comparison*.spec.ts`, and slice 1's spec stay green;
`env -u NODE_ENV npm run typecheck:dashboard`.

Internal change: `changesSinceReview` becomes a comparison of a _from_ point
with a _to_ point (tree and baseline each), restating the _from_ tree on the
_to_ baseline when they differ and flagging inseparable files from the _from_
tree or the _to_ baseline; the mark and the snapshot call it as one pair, and
`markUncomparable` keeps its meaning for the mark. `changedFrom` takes the
_to_ tree instead of closing over the snapshot's. Enables slice 4 without a
second restatement.

### 4. A range by two ends, across a trunk integration, leaves trunk out
Type: Behavior
Status: planned
Proof: Extend `story-review-commits.spec.ts`: a three-commit range's files
and a diff; on `markedWorktree` with `integrateTrunk(…, "c story and trunk")`
and no mark, the range from the first commit to the merge; the merge alone on
both fixtures; the older-Git fixture for a range across the integration and
one below it. Keep slice 1's cases green.

Behavior: The list is shown → the developer activates an item while a range
of one is shown → the range extends to it, in either direction, and the
heading names its count and ends; activating an item while a range of two or
more is shown starts a range of one there. A range whose ends have different
baselines → the oldest item's parent tree is restated on the newest item's
baseline; only the story's files are listed, the heading says trunk was
integrated within the range, and a file both changed inseparably is flagged
and diffed from the parent tree. The merge alone → “The chosen commits
changed nothing.”, or only the file whose conflict it resolved, flagged. An
older Git → a range across the integration says this machine's Git cannot
leave trunk's changes out across it and lists no files; a range below it
shows.

Safe stopping point: the story's promise is delivered for committed work.

### 5. Uncommitted changes is the newest item; Refresh and the mark fit the range
Type: Behavior
Status: planned
Proof: Extend `story-review-commits.spec.ts` on `storyWorktree`: Uncommitted
changes alone and with the oldest commit; a commit in the worktree then
Refresh; committing the uncommitted files while Uncommitted changes is an
end, then Refresh; `markStoryReview`, Commits, Mark reviewed, reopen. Keep
`story-review-refresh.spec.ts` and `story-review-mark.spec.ts` green.

Behavior: The snapshot's tree differs from the head's → Uncommitted changes
is listed above the commits; alone, it lists the staged, unstaged, and
untracked files from the head's tree to the snapshot's; with the oldest
commit, it lists what All changes lists. The agent commits → Refresh lists the
new commit on top and keeps the chosen range; an end no longer listed →
Refresh shows the default range. A marked story → opens on Since the review,
offers Commits with the other two, and Mark reviewed while Commits is shown
marks the whole snapshot, which the next opening compares with.

Safe stopping point: the list accounts for the whole snapshot, and the story
is complete.

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

## Preparation review

Cumulative design: one restatement with two callers, one comparison type for
all three views, one admission pattern, and one list read beside the snapshot;
the examples exercise one rule, a comparison of two points of the story's
line, with Uncommitted changes as one more point. Refinement was not needed:
no slice fragments one result or combines independent outcomes, slice 2's
independence is a correction the mechanism depends on, and every promise has
an owner.
