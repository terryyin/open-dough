# Review only what changed since the last review

**Identity:** SEED-088#review-changes-since-last-review
**Source:** [refined story](../../seeds/SEED-088-dashboard-story-code-review.md#review-changes-since-last-review).
**Prepared:** 2026-10-05. Planning only, in the established preparation workspace.

## Goal and boundaries

A developer marks the story review snapshot they have read. The next review
opens on what changed since that mark, leaves out what came only from trunk,
and never hides a change the developer has not marked as seen.

Scope, decisions, and key examples are those of the source story. Material
exclusions, as the story defers them:

- Per-file viewed marks.
- Clearing a mark without replacing it.
- A card indication that changes are waiting since the review.
- A history of earlier marks.
- Sharing a mark between developers or machines.

## Direction and PFE

Established structure supports the work; no [North Star](../../NORTH-STAR.md)
topic governs the story review and none is added.
[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) applies:
“mark”, “marked snapshot”, and “since the review” each keep one meaning in
code, wording, and `dashboard/AGENT-LAUNCH-REVIEW.md`.
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
is Proposed and binds nothing.

PFE findings and choices:

- **One comparison model.** Today's review is a comparison from a *from* tree
  (the baseline) to the snapshot tree. Since-the-review is the same comparison
  with another *from* tree: the marked snapshot restated on the current
  baseline. Extend `storyReviewSnapshot.ts` and the `StoryReview` shape
  (`src/storyReview.ts`) with that second comparison of the same snapshot. Add
  no second snapshot routine, file browser, or diff view.
- **File diffs.** Reuse `/__agent-launch/review/file` unchanged. It already
  takes the two object IDs it compares (`baseline`, `tree`), and Git diffs two
  trees the same way, so the page names the *from* tree of the comparison
  shown.
- **The mark.** A new machine-local document under `~/.open-dough/dashboard/`
  through `machineJsonStore.ts`, keyed by project and work identity, holding
  the marked tree, its baseline, and the time. It is not a launch record: a
  mark belongs to the story, whichever launch's workspace the review reads.
- **Keeping the marked tree.** The snapshot tree is an unreachable object, so
  Git's housekeeping may prune it. The mark also sets a ref under
  `refs/open-dough/reviewed/` in the story's repository to that tree, replaced
  with the mark. The ref touches no tracked file, index, or status.
- **Marking request.** A same-origin POST admitted like the done mark
  (`src/doneMark.ts`, the endpoint table in `agentLaunchAdmission.ts`), naming
  the project, the work identity, and the shown snapshot's `tree` and
  `baseline`, never a path. The workspace comes from `reviewWorkspaceOf` as
  for the review.
- **Reading.** `useReviewRead` and `StoryReviewPanel.tsx` keep taking one
  snapshot per opening or Refresh. The answer carries both comparisons, so
  switching between them reads nothing.
- **Fixtures.** Extend `tests/support/storyReviewWorktree.ts` (real worktrees
  off a bare origin) with marked-then-changed worktrees.

The restatement rule, used for every since-the-review comparison:

```text
git merge-tree --write-tree --name-only -z \
  --merge-base=<marked baseline> <marked tree> <current baseline>
```

Its first field is the restated tree. The names after it are files it could
not merge: each is flagged, and its kind and diff run from the marked tree to
the snapshot tree. Every other file is listed and diffed from the restated
tree to the snapshot tree. Trunk was integrated since the mark exactly when
the two baselines differ.

## Premises and observations

| Premise consumed by the plan | Literal observation and result |
| --- | --- |
| The restated tree leaves trunk-only changes out and names files it cannot separate (slice 4) | Throwaway repository, Git 2.50.1. The command above, with trunk changing `f.txt`, `trunk.txt`, and the same lines of `overlap.txt` as the story: plain `git diff --name-status <marked> <current>` listed `f.txt`, `trunk.txt`, `story2.txt`; the restated diff listed only `overlap.txt` and `story2.txt`. Exit 1, and `overlap.txt` is the one name in the conflicted-file section of the `-z` output. |
| With an unchanged baseline the restated tree is the marked tree, so slice 2's direct comparison is the same rule (slices 2, 4) | Same command with `<current baseline>` = `<marked baseline>` printed the marked tree's own ID. |
| A story slice that landed on trunk after the mark drops out without a conflict (slice 4) | Marked tree holding `landed.txt`, uncommitted `wip.txt`; trunk then gained the commit adding `landed.txt`. `git diff --name-status <current baseline> <restated>` listed `wip.txt` and the overlap file, not `landed.txt`. |
| A ref keeps a bare tree through housekeeping, under a name that may carry a work identity (slice 1) | `git update-ref refs/open-dough/reviewed/x <tree>`; `git gc -q --prune=now`; `git cat-file -t <tree>` → `tree`. `git check-ref-format "refs/open-dough/reviewed/SEED-088#review-changes-since-last-review"` succeeded. |
| The file diff endpoint's Git call accepts two trees (slices 2–4) | `git --literal-pathspecs diff --no-color -M <tree> <tree> -- overlap.txt` printed a unified diff. `fileDiffQuerySchema` admits any hexadecimal object ID for `baseline` and `tree`. |
| The existing review journey and its Git fixtures run locally (all slices) | `unset NODE_ENV; npm ci`; `npx playwright test --config dashboard/playwright.config.ts --reporter=list story-review-landed story-review-refresh` → 2 passed (4.6s). |
| The review has one server routine and one client reader to extend | Read `server/storyReviewSnapshot.ts` (`storyReviewSnapshot`, `storyReviewFileResponse`), `server/storyReviewAdmission.ts`, `server/launchBoundaryAnswer.ts` (`review`, `review-file` cases), `src/StoryReviewPanel.tsx`, `src/StoryReviewSnapshotView.tsx`, `src/useReviewRead.ts`. |
| Next free plan number | `git log --all --diff-filter=A --name-only -- '.planning/slice-plans/*/PLAN.md'` ends at `244-story-card-actions-read-at-a-glance`. Allocated 245; the path was free. |

## Outside-in proof

Proof is Playwright journeys in `dashboard/tests/` against real worktrees, run
as `npx playwright test --config dashboard/playwright.config.ts <spec>` with
`NODE_ENV` unset. Each slice also runs the existing `story-review*` specs it
touches and `npm run typecheck:dashboard`, because the journeys do not
typecheck the sources. Each slice updates `dashboard/AGENT-LAUNCH-REVIEW.md`
for the behavior it lands.

| Story promise | Slice |
| --- | --- |
| Mark reviewed marks the snapshot shown; later agent writes stay unmarked | 1 (mark), 2 (the later write is listed) |
| Opening, closing, refreshing, or replacing marks nothing | 1 |
| One mark per story; marking again replaces it; the review says it is marked and when | 1 |
| The mark outlives a restart and Git's housekeeping, and stays out of tracked files, index, status | 1 |
| With a mark, the review opens on since-the-review, headed by what it compares and when | 2 |
| Nothing changed since the review, with all changes still offered | 2 (message), 3 (the switch) |
| Marking in since-the-review marks the whole current snapshot | 2 |
| Switch to all changes and back within one snapshot; every opening starts on since-the-review; Refresh keeps the comparison | 3 |
| Trunk-only changes stay out; the review says trunk was integrated | 4 |
| An inseparable file is listed, flagged, and diffed from the marked snapshot | 4 |
| An unreadable marked snapshot is said, all changes are shown, and marking starts again | 5 |

## Ordered slices

### 1. Mark the snapshot shown as reviewed
Type: Behavior
Status: done
Accepted proof: `story-review-mark.spec.ts` (5 tests: a–f plus refusal of a
path, malformed object, or absent tree), `story-review story-panel
side-panel-width` (35), session admission specs after the refactor moved
done/read/delete admission into `sessionAdmission.ts`, and
`typecheck:dashboard`. The mark lives in `server/storyReviewMarks.ts`
(`review-marks.json`, `refs/open-dough/reviewed/<identity>`, identity
characters outside `[A-Za-z0-9#_-]` written as `%XX`); the snapshot answer
carries an optional `mark`; test helpers are in
`tests/support/storyReviewMark.ts`.
Proof: New `story-review-mark.spec.ts`. (a) Open a review, choose Mark
reviewed: the review says the snapshot is marked, with a `<time>` for when.
(b) Change the worktree after the snapshot, mark without Refresh, then
`git gc --prune=now` in the project: the mark's tree is still a tree and
equals the snapshot shown, not the worktree's new state. (c) Restart the
dashboard and reopen: the review still says when it was marked. (d) Open,
close, Refresh, and replace a review of an unmarked story: no mark is said
and the store holds none. (e) Mark twice: one mark, with the later tree, and
one ref. (f) `observed(workspace)` (status and staged names) is unchanged by
marking.

Behavior: A review shows a snapshot → the developer chooses Mark reviewed →
that snapshot is the story's one mark on this machine, the review says so and
when, and nothing else marks.

Interim: a marked story still opens on all changes; slice 2 replaces that.

### 2. Open a marked story on the changes since the review
Type: Behavior
Status: done
Accepted proof: `story-review-since.spec.ts` (5 tests, a–e) with
`story-review-mark.spec.ts` (10 together), `story-review story-panel
side-panel-width` (41), and `typecheck:dashboard`. The snapshot answer
carries an optional `since: {from, files}` beside `files`; the *from* tree is
still the marked tree directly (slice 4 restates it). `FileDiff` takes
`from`/`tree`, `SnapshotView` takes `comparison`/`sinceReview`, and the mark
UI lives in `src/StoryReviewMark.tsx`. Until slice 3, a review whose answer
carries `since` always shows it.
Proof: New `story-review-since.spec.ts`, baseline unchanged throughout. (a)
12 changed files, mark, then change 2 and add 1: Review changes lists 3 files
under a heading that says changes since the review and its time, and a
selected file's diff holds only the later edit. (b) A file written after the
snapshot and before the mark is listed. (c) No later change: the review says
nothing changed since the review. (d) Mark while since-the-review is shown,
change one file, reopen: one file. (e) An unmarked story opens as
`story-review.spec.ts` already proves.

Behavior: A story has a mark → Review changes → the review compares the
marked snapshot with a fresh one in the same browser and diff view, and says
what it compares and when the mark was made.

Interim: trunk integrated since the mark shows trunk's changes as the
story's; slice 4 replaces the *from* tree with the restated one. An
unreadable marked tree answers the existing “could not be read”; slice 5
replaces that.

### 3. Switch between since-the-review and all changes
Type: Behavior
Status: planned
Proof: New `story-review-comparison.spec.ts`. (a) Since-the-review shows 3
files; switch to all changes: 13 files against the baseline, with no new
snapshot read (the worktree changed meanwhile and the list does not); switch
back: 3. (b) On all changes, Refresh: still all changes, of a new snapshot.
(c) Close and reopen: since-the-review. (d) The nothing-changed review offers
the same switch. (e) An unmarked story shows no switch. The switch is a named
control that says which comparison is shown.

Behavior: A marked story's review is open → the developer switches the
comparison → the same snapshot is shown against trunk or against the mark,
and each opening starts on since-the-review.

### 4. Leave trunk's changes out after trunk was integrated
Type: Behavior
Status: planned
Proof: New `story-review-since-trunk.spec.ts`. After the mark, trunk changes
`README.md` and `src/a.ts` and the same lines of `src/c.ts` as the story;
the story merges trunk and changes `src/b.ts`. (a) Since-the-review lists
`src/b.ts` and `src/c.ts` only and says trunk was integrated since the mark.
(b) `src/c.ts` is flagged, in its control's name and its diff heading, as
including trunk's changes, and its diff runs from the marked snapshot. (c)
`src/b.ts`'s diff holds only the story's edit. (d) A story slice landed on
trunk after the mark is not listed. (e) Slice 2's spec stays green.

Behavior: Trunk was merged into a marked story → Review changes → only the
story's changes since the mark are listed; a file that cannot be separated is
flagged and shown from the marked snapshot.

### 5. Say when the marked snapshot cannot be read
Type: Behavior
Status: planned
Proof: Added to `story-review-since.spec.ts`. A mark whose tree the
repository does not hold (the store names an absent object): the review says
the earlier review cannot be compared, shows all changes with no switch, and
Mark reviewed then makes since-the-review work again on the next opening.

Behavior: A story's marked snapshot is gone → Review changes → the review
says so, shows all changes, and marking starts again from there.

## Current decisions

- The mark is the snapshot's `tree` and `baseline`, not a commit, so it
  covers uncommitted files and survives a rebased or reset branch.
- The mark's time is shown through a `<time>` element; proofs assert its
  presence and `datetime`, not a formatted clock string.
- A replaced mark's ref is replaced with it. Refs of stories that later land
  are left in the repository; removing them is not in this story.
