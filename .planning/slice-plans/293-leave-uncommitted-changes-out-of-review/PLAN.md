# The full story review can leave uncommitted changes out

**Identity:** SEED-088#review-uncommitted-changes
**Source:** [story](../../seeds/SEED-088-dashboard-story-code-review.md#review-uncommitted-changes),
refined 2026-10-10. Planning only; this plan grants no Take, execution, or
publication.

## Goal and boundaries

A developer reviewing a Story Branch Mode story's worktree from the dashboard
can leave its uncommitted changes (staged, unstaged and untracked) out of All
changes with one check, “Include uncommitted changes”, and read the committed
work alone from the same snapshot.

Preserved: the snapshot and its one fetch; All changes with the check on,
exactly as today; Since the review, Commits and its Uncommitted changes item;
Mark reviewed marking the whole snapshot; every opening's first comparison.

Excluded, as the story records: marking only committed work; the check in
Since the review, Commits or a landed comparison; remembering the check
across openings or stories; naming a Trunk Mode story's worktree, which the
[sibling story](../../seeds/SEED-088-dashboard-story-code-review.md#review-trunk-mode-story-worktree)
owns.

## Architecture

The committed work is one more comparison of the snapshot shown, carried the
way `since` already is. When the snapshot's tree differs from the head's tree,
`storyReviewSnapshot` also answers `committed`: the files from `baseline` to
the head's tree, read by the same `changedFrom` as `files`, with that tree as
its destination. The page shows it in place of `files` while the check is
off, and its file diffs go through the existing file read with the head's
tree as `tree`. Nothing new is admitted, no request is added, and toggling
reads nothing.

Considered and set aside: answering the check through the range read
(`/__agent-launch/review/range`). It needs no schema change, but each toggle
would be a pending read with its own feedback and stale-answer handling, for
a comparison the snapshot can compute once with one more `git diff`.
`useStoryReviewComparison` stays the owner of which comparison and
destination tree are shown; the check's state lives beside the panel's other
view state and resets with each opening, as collapsed folders do.

No Accepted ADR constrains this, and no North Star topic is needed: the
change extends built design that `dashboard/AGENT-LAUNCH-REVIEW.md` records.
The Taken plan
[292](../292-landed-story-branch-review/PLAN.md) edits the same panel's
selector words (“Landed one-shot runs” → “Landed runs”) and
`StoryReviewComparison.tsx`; this plan touches neither the selector's options
nor those words, so the two integrate as ordinary text merges.

## Current decisions

- **Words.** The check is a native checkbox named “Include uncommitted
  changes”. While it is off, one visible line, also the check's accessible
  description, reads “Uncommitted changes are left out. Mark reviewed still
  marks the whole snapshot.” With no story commit, the body reads “Nothing is
  committed yet: every change in this worktree is uncommitted.”
- **Where it shows.** In the review's fixed top with the marking controls,
  only while All changes is shown and the snapshot answers `committed`. The
  mark's own statement (“This snapshot is marked reviewed…”) is unchanged.
- **Total and moves.** The browser heading's total, Hide files, Previous file
  and Next file follow the comparison shown without special cases, because
  they already read `comparison`.
- **Refresh announcement.** Refresh announces the file count of the
  comparison shown, as it does for Commits, so with the check off it
  announces the committed count.

## Observed premises

Observed on 2026-10-10 at `df1a9010` in this worktree with Node 24.21.0 after
`node scripts/setup-native.mjs npm`, `browser` and `check`; the scratch spec
was removed afterwards and no product file changed.

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| The existing file read answers a diff from the baseline to the head's tree, and an empty one for a file changed only in uncommitted work | Slice 1's file diffs with the check off | Scratch Playwright spec on `storyWorktree`: after `openReview`, re-issued the page's own `/__agent-launch/review/file` request with `tree` set to `snapshot.uncommitted.fromTree`, for `story.txt` and `unstaged.txt` | 200 `kind: "diff"` with `+story` for `story.txt`; 200 `kind: "diff"`, `printed: ""` for `unstaged.txt` |
| The snapshot already knows the head's tree and when it differs from the snapshot's | Slice 1's `committed` | Same run: `snapshot.uncommitted` present with `fromTree` `4dae9d36…` ≠ `tree` `b218ed22…`; `storyReviewSnapshot.ts` computes `headTree` beside `files` | Present; `committed` is one more `changedFrom(baseline, headTree, call)` |
| `storyWorktree` gives both kinds of change, so one fixture distinguishes the check's states | Slices 1 and 2 specs | Same run: `snapshot.files` lists seven paths, three of them (`fresh/new.txt`, `staged.txt`, `unstaged.txt`) uncommitted only; four commits | Check on: 7 files. Check off must list `gone.txt`, `image.png`, `new.txt`, `story.txt` |
| A single review spec runs in this checkout through the project command | Every slice's proof | `npm run test:dashboard -- dashboard/tests/zz-scratch-premise.spec.ts` | Passed in 17 s including the build |

Not observed, and not relied on: how the review reads a Trunk Mode worktree.

## Outside-in proof ownership

| Promise | Owner and observable proof |
| --- | --- |
| With uncommitted changes, All changes offers the check, on at opening, listing the whole snapshot | Slice 1 spec: checkbox “Include uncommitted changes” checked; “7 changed files” |
| Off: committed files only, committed lines and counts only, total to match, the left-out line shown; on again restores the whole snapshot without a read | Slice 1 spec: four rows; a file changed in both a commit and uncommitted work shows only its committed lines and counts; no request to the review, range or mark endpoints between toggles |
| Selection stays on a file both comparisons list, otherwise moves to the first file | Slice 1 spec: select `story.txt`, toggle off, still selected; select `staged.txt`, toggle off, first row selected |
| No uncommitted changes: no check | Slice 1 spec on `unchangedWorktree` plus a commit, or `landedWorktree`: no checkbox |
| Only uncommitted work: off says nothing is committed yet, lists no files, the check remains | Slice 1 spec on a worktree with an untracked file and no commit |
| Mark reviewed with the check off marks the whole snapshot, and the review says so | Slice 1 spec: the POST's `tree` equals `snapshot.tree`; the line is visible before and after |
| Refresh keeps the check's state while uncommitted changes remain; it goes when they are all committed and All changes shows the whole snapshot | Slice 2 spec: commit one file and edit another, Refresh, still off with the new committed list; commit everything, Refresh, no checkbox and every file listed |
| Switching comparison and back keeps the state; closing and opening starts with it on | Slice 2 spec |
| Existing review behavior unchanged | Each slice: every `dashboard/tests/story-review*.spec.ts` and `recently-done-one-shot-review.spec.ts` green, since the check renders into the fixed top those specs read; `npm run typecheck:dashboard` clean |

## Ordered slices

### 1. All changes can leave uncommitted changes out
Type: Behavior
Status: planned
Proof: New spec `dashboard/tests/story-review-uncommitted-check.spec.ts`
covering the first six rows of the proof table on `storyWorktree` and two
small worktrees; the story-review spec suite named above; typecheck and
`npm run lint`.

Behavior: A Story Branch Mode story's worktree holds commits and staged,
unstaged and untracked changes → the developer opens Review changes on All
changes → the check “Include uncommitted changes” is offered, on, and every
changed file is listed. Turning it off lists the files changed from the
baseline to the head's tree with their committed lines and counts, shows the
left-out line, keeps the selected file when still listed and otherwise
selects the first, and reads nothing; turning it on restores the whole
snapshot. A snapshot without uncommitted changes offers no check. A worktree
with no story commit, check off, says nothing is committed yet and keeps the
check. Mark reviewed marks the whole snapshot in either state.

Change: `storyReviewSchema`'s snapshot gains optional `committed` (a
comparison with its destination tree); `storyReviewSnapshot.ts` answers it
when the tree differs from the head's; `useStoryReviewComparison` takes the
check's state and returns `committed` and its tree for All changes; the
panel holds the state and renders the check and line in the fixed top; the
no-files message gains the nothing-committed case. Add a fixture for the
commit-less worktree to `tests/support/storyReviewWorktree.ts` if none fits.
`dashboard/AGENT-LAUNCH-REVIEW.md` describes the check where it describes the
Comparison switch, and `STORY-REVIEW-COMMITS.md` is unchanged.

Interim behavior: until slice 2, Refresh and comparison switches are not
promised to keep the check's state.

Safe stopping point: the check works within one snapshot.

### 2. The check keeps its state across Refresh and comparison switches
Type: Behavior
Status: planned
Proof: New cases in `story-review-uncommitted-check.spec.ts` (or a sibling
`story-review-uncommitted-check-refresh.spec.ts` if the file grows past its
neighbours' size) for the Refresh and switching rows of the proof table; the
story-review spec suite; typecheck and lint.

Behavior: The check is off → the agent commits one file and keeps editing
another → Refresh → the check is still off and the newly committed file is
listed; Refresh announces the committed file count. The agent commits
everything → Refresh → no check, and All changes lists the whole snapshot;
uncommitted work appearing again later offers the check on. Switching to
Commits or Since the review and back to All changes keeps the state. Close
and Review changes again starts with the check on.

Change: keep the state through snapshots that answer `committed` and drop it
to on when one does not, in the same place slice 1 holds it; extend the
Refresh announcement to the comparison shown. Complete the doc paragraph with
these rules.

Safe stopping point: the story's outcome is delivered.
