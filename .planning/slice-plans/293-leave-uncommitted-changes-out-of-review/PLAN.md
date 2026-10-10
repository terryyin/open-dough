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
Status: done
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

Accepted proof (Story Branch Mode, branch
`claude/review-only-a-story-s-uncommitted-changes`):
`npm run test:dashboard -- dashboard/tests/story-review-uncommitted-check.spec.ts --reporter=list`
(5 passed) observes the first six proof rows on `storyWorktree` with
`story.txt` edited again uncommitted, `nestedWorktree`, and
`unchangedWorktree` with an untracked file. Every panel-opening spec
(`story-review*`, `recently-done-one-shot-review`, `story-panel-*`,
`side-panel-width*`, `one-shot-landing-recovery*`) passed, 99 tests, and
`npm run typecheck:dashboard` is clean.

Learning: the check's state is panel state, so it already survives Refresh and
comparison switches and already resets on Close and reopen. Slice 2 builds
only what that leaves: the reset to on when a snapshot answers no `committed`,
the Refresh announcement, the doc rules, and the proof.

### 2. The check keeps its state across Refresh and comparison switches
Type: Behavior
Status: done
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

Change: the state already lasts through snapshots that answer `committed`;
drop it to on when one does not, in the same place slice 1 holds it; extend
the Refresh announcement (`StoryReviewFeedback.tsx`) to the comparison shown.
Complete the doc paragraph with these rules. Carry the story obligations
below that name this slice.

Safe stopping point: the story's outcome is delivered.

Accepted proof: `dashboard/tests/story-review-uncommitted-check-refresh.spec.ts`
(3 tests on `storyWorktree`) observes the Refresh and switching proof rows and
obligations G1 to G4; the panel-opening suite passed, 102 tests, with
`npm run typecheck:dashboard` clean. Reverting the reset or the announcement
each failed the Refresh test.

Learning: the reset reads the snapshot's own `committed`; the comparison
hook's is scoped to All changes and would reset the check on every switch.

CI repair: run 38091599194 on slice 1's revision lost a Mark as done press in
`session-workspace-retirement-claude.spec.ts`, the defect trunk repaired in
`8df6248b` and rebalanced for in `3b2b446a`. The branch merged trunk at
`2783ca92` instead of repeating those repairs.

CI repair: run 38092275056 on that merge timed out the dev launch mode case
of `authenticated-project-overview.spec.ts` at the 30-second default. Its
trace shows every step passed with the journey still running; the case takes
19 to 28 seconds on passing CI runs and this runner was about 1.4 times
slower. The dev case now has a 60-second budget; a CPU-throttled local run
failed at 30 seconds before the change and passed with it.

## Story obligations

### G1. File moves are unasserted with the check off
Reported: slice 1 — "Previous file / Next file and collapsed-folder counts with the check off. They read `comparison` unchanged; only the list and total are asserted."
Story clause: "Turned off, the file browser, counts, total, diffs and file moves compare the baseline with the head's tree"
Disposition: proved by slice 2: `story-review-uncommitted-check-refresh.spec.ts`, “with the check off the file moves stay within the committed files…”: Previous file and Next file end, disabled, at the first and last committed file

### G2. Refresh announces the whole snapshot's count with the check off
Reported: slice 1 — "with the check off, Refresh still announces the whole snapshot's count"
Story clause: "Refresh keeps its state while the new snapshot still holds uncommitted changes"
Disposition: proved by slice 2: `story-review-uncommitted-check-refresh.spec.ts`, “Refresh keeps the check off while uncommitted changes remain…”: the feedback announces 5 changed files while the snapshot holds 7

### G3. The check's absence outside All changes is unasserted
Reported: slice 1 — "that the check is absent in Since the review, Commits or a landed comparison"
Story clause: "shown only for All changes"
Disposition: proved by slice 2: `story-review-uncommitted-check-refresh.spec.ts`, “Since the review and Commits offer no check…”: no checkbox in either

### G4. A binary file's committed-only diff is unasserted
Reported: slice 1 — "a binary or renamed file's committed-only diff; only `story.txt`'s text diff is"
Story clause: "file diffs use the existing file read"
Disposition: proved by slice 2: `story-review-uncommitted-check-refresh.spec.ts`, “with the check off the file moves stay within the committed files…”: the `image.png` file read names `committed.tree` and shows the binary notice

### G5. The check's appearance was not looked at
Reported: slice 1 — "the check's visual appearance in a browser; the CSS is small and unreviewed by eye"
Story clause: "The check belongs with the review's marking controls in its fixed top"
Disposition: proved by slice 2: screenshots of the fixed top with the check on, off, focused and after Mark reviewed, read by the implementation agent and the coordinator: the check and its line sit above Mark reviewed, aligned with the comparison radios; no defect found; the dashboard has no dark scheme

### G6. Collapsed-folder counts are unasserted with the check off
Reported: slice 2 — "this second half of slice 1's G1 note is still unasserted. The committed fixture has no folders"
Story clause: "Turned off, the file browser, counts, total, diffs and file moves compare the baseline with the head's tree"
Disposition: no user cost "can leave its uncommitted changes (staged, unstaged and untracked) out of the full review": a folder's counts are summed by the file browser from the files it lists, whichever comparison supplies them, and the committed list and its per-file counts are asserted.

### G7. A renamed file's committed-only diff is unasserted
Reported: slice 2 — "`Renamed old.txt → new.txt` is only selected via Next file"
Story clause: "file diffs use the existing file read"
Disposition: no user cost "can leave its uncommitted changes (staged, unstaged and untracked) out of the full review": the committed-only diff is the existing file read with the head's tree, observed for a text and a binary file; that read's rename handling is unchanged and takes any tree.

### G8. An unreadable refreshed snapshot leaves the check's state as it is
Reported: slice 2 — "If Refresh fails or the workspace becomes unavailable, the state is left as is. That case is untested."
Story clause: "Refresh keeps its state while the new snapshot still holds uncommitted changes"
Disposition: no user cost "can leave its uncommitted changes (staged, unstaged and untracked) out of the full review": a review that cannot be read shows no files and no check, and the next readable snapshot either still holds uncommitted changes, where the kept state and its line show, or holds none, where the state resets.

### G9. The check's absence on a landed comparison is unasserted
Reported: slice 2 — "the check's absence there is untested"
Story clause: "the check in Since the review or on a landed comparison"
Disposition: excluded "the check in Since the review or on a landed comparison"
