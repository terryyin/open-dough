# Review changes in a full-height panel with compact context and independent file navigation

**Identity:** SEED-102#full-height-review-changes
**Source:** [refined story](../../seeds/SEED-102-review-changes-ui.md#full-height-review-changes).
**Prepared:** 2026-10-05. Planning only, in the established preparation workspace.

## Goal and boundaries

A developer reviewing a story's changes spends the Review changes panel's
height on browsing changed files and reading a diff. The review's context stays
in view as one compact line, the file browser and the diff scroll
independently, and moving from file to file never loses their place.

Scope, decisions, and key examples are those of the source story. Material
exclusions, as the story defers them:

- Marking files as viewed or reviewed.
- Filtering or searching the file browser, and resizing its width.
- Side-by-side diff, all files in one continuous scroll, and syntax
  highlighting.
- Keyboard shortcuts for Previous and Next file beyond their controls.

## Direction and PFE

Established structure supports the work; no
[North Star](../../NORTH-STAR.md) topic governs the story review and none is
added. [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
applies: “context line”, “file browser”, “Previous file”, and “Next file” each
keep one meaning in code, wording, and `dashboard/AGENT-LAUNCH-REVIEW.md`.
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
applies: each slice is a verifiable increment.
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
is Proposed and binds nothing.

PFE findings and choices:

- **Panel frame.** Reuse the shared side panel (`side-panel.css`,
  `PanelControls.tsx`, `SidePanelEdge.tsx`) unchanged. It is already pinned to
  the window's height; only the review's body layout changes.
- **Context line.** Change `StoryReviewSnapshotView.tsx`, which already owns
  the worktree, branch, and baseline facts and the Hide files / Show files
  control. The line replaces its three-row facts list; it is not a second
  representation beside it.
- **Feedback.** Keep the one `role="status"` region in `StoryReviewPanel.tsx`;
  it moves into the fixed top with the context line.
- **Browser order.** `reviewFileTree.ts` already decides the order rows show
  in. Opening on the first file and Previous/Next read one flattened order
  from that tree; add no second ordering rule.
- **Line numbers.** Extend `unifiedDiff.ts`, which already parses each hunk
  and keeps its `@@ -old +new @@` header. The page derives numbers from that
  header; the file-diff endpoint is unchanged.
- **Line counts.** Extend the snapshot (`server/storyReviewSnapshot.ts`) and
  `reviewedFileSchema` (`src/storyReview.ts`) with each file's counts, read
  from the same baseline-to-tree comparison that lists the files. Add no
  per-file request.
- **Proof entry.** Extend the existing review journeys under
  `dashboard/tests/story-review*.spec.ts` and their real-worktree fixtures
  (`tests/support/storyReviewWorktree.ts`); add no new harness.

## Premises and observations

| Premise consumed by the plan | Literal observation and result |
| --- | --- |
| The panel already has the window's height, and the review's body scrolls as one (slices 1–2) | Read `dashboard/src/side-panel.css`: `.side-panel { position: sticky; height: 100dvh; display: flex; flex-direction: column }`. Read `src/story-review.css`: `.story-review-body { flex: 1; min-height: 0; overflow-y: auto }`, with the facts list, Hide files, browser, and diff all inside it. |
| The existing review journeys pass and are the outside-in entry (all slices) | In the integration checkout at `e3196862`, whose review code matches this branch (`git diff --stat HEAD...origin/main` lists no review source file): `env -u NODE_ENV npx playwright test --config dashboard/playwright.config.ts story-review.spec.ts story-review-refresh.spec.ts story-review-nothing.spec.ts story-review-diff.spec.ts` → no output from the quiet reporter, 12 s. |
| Existing journeys assert presentation this story changes | Read the specs: `story-review.spec.ts` asserts the three `definition` values with the whole baseline revision and that `.story-review-body` holds the keyboard; `story-review-refresh.spec.ts` asserts a fresh opening has nothing selected (`aria-pressed="false"`) and reads `getByRole("status").first()`; `story-review-nothing.spec.ts` asserts no Hide files and the unavailable wording. Each is updated by the slice that changes it, not left failing. |
| At the journeys' window the panes sit side by side (slice 2) | `playwright.config.ts` uses `devices["Desktop Chrome"]` (1280×720); the panel takes half the room; the browser's 16rem and the diff's 18rem bases fit, and the existing “hiding the file browser” step measures the diff growing by more than 200px. |
| No existing fixture overflows either pane vertically (slice 2) | Read `storyReviewWorktree.ts`: `storyWorktree` has 7 files of about 12 lines; `nestedWorktree` a handful of nested files; `wideLine` overflows only sideways. Slice 2 adds a worktree with many files and a long diff. |
| A refresh keeps the snapshot view mounted, so its state survives (slices 1, 3) | Read `StoryReviewPanel.tsx`: while reading again `review` stays the earlier snapshot and `<SnapshotView>` stays rendered; `selectedPath` and `collapsed` live in it. `FileDiff` is keyed by `snapshot.tree` and path, so a changed tree re-reads the diff. |
| A selection whose path a refresh no longer lists is empty today (slice 3) | Read `StoryReviewSnapshotView.tsx`: `selected = snapshot.files.find(path === selectedPath)`; undefined shows “Select a file to read its diff.” |
| Line numbers need no server change (slice 5) | Read `unifiedDiff.ts`: each hunk keeps its header and ordered lines with kinds; `story-review-diff.spec.ts` proves the parser as a pure contract. |
| Journeys read each diff line's text exactly (slice 5) | `story-review.spec.ts` `expectLines` compares `allTextContents()` of the hunk's list items with `" unstaged 2"`, `"+unstaged five"`. Numbers must stay outside the line's own text. |
| Git gives per-file counts for the same comparison, with renames, binaries, and mode-only changes distinguishable (slice 6) | In a scratch repository, Git 2.50.1: `git diff --numstat -M -z HEAD~1 HEAD \| tr '\0' '\|'` → `0	0	empty.txt\|-	-	image.png\|1	0	m.txt\|1	0	\|old.txt\|new.txt\|0	0	run.sh\|`. A rename prints an empty path then old and new; a binary prints `-`; a mode-only change and an empty file print `0 0`. |
| Another planned story changes the same panel | `git show origin/main:.planning/slice-plans/245-review-changes-since-last-review/PLAN.md`: every slice `Status: planned`; it adds a mark control, a comparison switch, and a second comparison to `StoryReview`. Not taken. See Current decisions. |
| Next free plan number | `git ls-tree --name-only origin/main .planning/slice-plans/` ends at `246-confirm-mark-as-done`; local ends at 224. Allocated 247. |

## Outside-in proof

Each promise is proved through the page, in a review journey over a real
worktree, unless marked as a pure contract.

| Promise | Slice |
| --- | --- |
| One context line beneath the unchanged header: branch, baseline, worktree, Hide files / Show files; never wraps | 1 |
| Long values shortened; activating the line shows all in full and again collapses; full values read by assistive technology in either state | 1 |
| Read-only explanation is the review's accessible description, not a visible line | 1 |
| Reading, refreshing, refreshed, and problem messages in the fixed top, announced | 1 |
| No changes or unavailable: explanation beneath the fixed top, no browser or diff pane | 1 |
| Browser and diff share all remaining height; the body does not scroll as a whole | 2 |
| Browser scrolls on its own; diff code scrolls on its own; file kind and path fixed above the code | 2 |
| Selecting a file shows its diff from the top and leaves the browser's scroll | 2 |
| Refresh keeps the browser's scroll and collapsed folders | 2 |
| Narrow panel: browser above diff with bounded height, each scrolling; Hide files gives the diff all of it | 2 |
| Maximize/Restore and resizing keep snapshot, selection, and both scroll positions | 2 |
| Opens with the first file in browser order selected; a refresh that drops the selected file selects the first | 3 |
| Previous/Next in browser order, expanding a collapsed folder entered, row brought into view, unavailable at the ends | 4 |
| Old and new line numbers per diff line | 5 |
| Added and removed line counts per file row, said in words; none for a file with no textual diff; folder counts unchanged | 6 |
| Folder collapse, kind styling and naming, keyboard on open and close stay as documented | every slice keeps the existing journeys green |

Local checks: the focused Playwright specs each slice names, and
`npm run typecheck:dashboard`. Run them with `NODE_ENV` unset. The tracked
pre-commit hook (`.githooks/pre-commit`) applies as for any commit. The whole
dashboard suite runs in hosted CI after publication.

## Ordered slices

### 1. Keep the review's context in one fixed line
Type: Behavior
Status: done
Accepted proof: `env -u NODE_ENV npx playwright test --config
dashboard/playwright.config.ts story-review story-panel side-panel-width` and
`npm run typecheck:dashboard` pass. Observed in
`story-review-context-line.spec.ts` (one line, keyboard expand/collapse,
fixed while the body scrolls), `story-review.spec.ts` (accessible full
values and description, Hide files in the line), `story-review-refresh.spec.ts`
(feedback in `.story-review-top`), and `story-review-nothing.spec.ts`.
An unavailable review's explanation stays in the announced status region at
the top, so a Refresh still announces it; the body beneath is empty.
Proof: `story-review.spec.ts` (context line values, shortened and expanded by
keyboard, accessible full values and description, Hide files in the line),
`story-review-refresh.spec.ts` (messages in the fixed top), and
`story-review-nothing.spec.ts` (no changes and unavailable) pass with these
assertions. In each, the context line's box stays at the same position after
the content below it is scrolled.

Behavior: A story with changed files, its worktree path longer than the line →
the developer opens Review changes → beneath the unchanged header one
non-wrapping line shows branch, short baseline with `<remote>/<target>`,
worktree shortened, and Hide files. Activating the line with the keyboard
shows every value in full, and activating it again returns to one line.
Reading, refreshed, and problem messages show in that fixed area and are
announced. The read-only sentence is the review's accessible description. A
review without changes shows the line and “No changes”; an unavailable one
shows its explanation; neither shows panes.

Interim: beneath the fixed top the body still scrolls as one, as today.
Slice 2 replaces that.

Update `dashboard/AGENT-LAUNCH-REVIEW.md` for the context line and feedback.

### 2. Fill the height with a browser and a diff that scroll on their own
Type: Behavior
Status: done
Accepted proof: `env -u NODE_ENV npx playwright test --config
dashboard/playwright.config.ts story-review story-panel side-panel` and
`npm run typecheck:dashboard` pass. Observed in `story-review-panes.spec.ts`
over `largeWorktree` (opened by `openLargeReview` in
`tests/support/reviewPanes.ts`): each pane's `scrollTop` and the fixed boxes
across browser scroll, code scroll by keyboard, selection, Refresh,
Maximize/Restore, and edge resize; the body never overflows; the narrow
window stacks the browser (at most 40%) above the diff and Hide files gives
the diff the work area. Fixed-top checks now scroll a pane
(`expectFixedWhileScrolled`).
Proof: a new journey over a worktree with more files than the browser holds
and a diff longer than the pane (fixture added to `storyReviewWorktree.ts`).
It observes each pane's `scrollTop` and the fixed elements' boxes: scrolling
the browser leaves the diff and the top; scrolling the code leaves the browser,
the top, and the file's kind and path; selecting another file puts the diff at
the top and leaves the browser; Refresh, Maximize/Restore, and an edge resize
leave both positions. The review's body has no vertical overflow. A narrow
window, as in `side-panel-width-stacking.spec.ts`, shows the browser above the
diff with bounded height, each scrolling, and Hide files gives the diff the
work area. Existing review journeys stay green.

Behavior: The developer opens a large review → the browser and the selected
file's diff fill the panel beneath the fixed top; each scrolls vertically
without moving the other or the top; the diff's file heading stays above its
code; long names and long code lines scroll sideways inside their pane.

Keep the keyboard able to scroll each pane: the place the keyboard lands on
opening stays in the review's named content, and the code region stays
focusable.

Update `dashboard/AGENT-LAUNCH-REVIEW.md` and the `story-review.css` header
comment for the layout.

### 3. Open the review on its first file
Type: Behavior
Status: done
Accepted proof: `env -u NODE_ENV npx playwright test --config
dashboard/playwright.config.ts story-review story-panel side-panel` and
`npm run typecheck:dashboard` pass. Observed in `story-review.spec.ts` (first
file inside `fresh/` pressed, its diff shown), `story-review-tree.spec.ts`
step "the review opens on the first file in the browser's order", and
`story-review-refresh.spec.ts` (fresh opening; Refresh after the selected
file is reverted selects the first file). The browser's order is
`reviewFileOrder` in `reviewFileTree.ts`.
Proof: `story-review.spec.ts` and `story-review-tree.spec.ts`: on opening, the
first file in the browser's order (inside the first folder when a folder comes
first) is pressed and its diff shown. `story-review-refresh.spec.ts`: a fresh
opening selects the first file, replacing the “nothing selected” assertion;
after the selected file leaves the worktree, Refresh selects the first file.

Behavior: A review with changes → the developer opens it → the first file in
the browser's order is selected and its diff shows. The selected file is
reverted in the worktree → Refresh → the first file is selected.

The browser's order is one flattened reading of `reviewFileTree`'s rows,
exposed where slice 4 can use it. Remove the “Select a file to read its diff.”
state, which nothing reaches any more. Update `AGENT-LAUNCH-REVIEW.md`.

### 4. Move to the previous and next file from the diff
Type: Behavior
Status: planned
Proof: a journey over `nestedWorktree`: Next from the opening file walks the
files in the browser's order to the last; Previous is unavailable on the first
file and Next on the last, each still focusable; with a folder collapsed, Next
from the file before it expands the folder, selects its first file, and that
row is within the browser's visible box; each move shows the diff from the
top. With the large fixture of slice 2, Next to a file below the browser's
fold brings its row into view.

Behavior: The selected file is the last one before a collapsed folder → the
developer activates Next file beside the diff's heading → the folder expands,
its first file is selected and in view in the browser, and its diff shows from
the top.

Name the controls “Previous file” and “Next file”, as icon controls like the
panel's others. Update `AGENT-LAUNCH-REVIEW.md`.

### 5. Number the diff's lines
Type: Behavior
Status: planned
Proof: pure contract in `story-review-diff.spec.ts`: for
`@@ -10,3 +10,4 @@` with one added line, unchanged lines carry old and new
numbers and the added line only a new one; a removed line only an old one; a
second hunk restarts from its own header; a no-newline note takes no number.
Journey in `story-review.spec.ts`: the rename's hunk shows those numbers, and
`expectLines` still reads each line's text exactly as before.

Behavior: The developer selects a file whose hunk is headed
`@@ -10,3 +10,4 @@` → each unchanged line shows its old and new line numbers
and the added line only its new one.

Numbers sit beside the line, outside its own text, so selecting and copying
code does not take them. Update `AGENT-LAUNCH-REVIEW.md`.

### 6. Show each file's added and removed line counts
Type: Behavior
Status: planned
Proof: `story-review.spec.ts` over `storyWorktree`: `unstaged.txt`'s row shows
2 added and 1 removed and its control says so in words; the deleted file shows
3 removed; the renamed file 1 added; `image.png` shows no counts. A mode-only
change added to the fixture shows none. `story-review-tree-collapse.spec.ts`
stays green: a collapsed folder's count is still its changed files.
`story-review-refusal.spec.ts` stays green: requests name no more than before.

Behavior: A modified file whose diff adds four lines and removes one, beside a
changed image → the developer opens the review → the first row shows 4 added
and 1 removed, and the image's row shows no counts.

The snapshot reads counts with `--numstat -M -z` over the same baseline and
tree as the file list and joins them by path. A file shows counts only when it
has at least one added or removed line. Update `AGENT-LAUNCH-REVIEW.md`.

## Current decisions

- The context line and status region are fixed in slice 1 while the body
  beneath still scrolls as one; slice 2 replaces that interim.
- Line numbers and counts are presentation of data Git already gives; neither
  adds a request, and requests still name no filesystem path.
- Plan 245 (`SEED-088#review-changes-since-last-review`) plans a mark control
  and comparison switch in this same panel. Neither plan depends on the
  other. Whichever is delivered second places its controls in the layout it
  finds: plan 245's controls belong in the context line's fixed area, and
  this story's counts and first-file selection apply to whichever comparison
  is shown.

## Learnings

- Slice 1: unchanged diff lines were kind `"context"` (class
  `story-review-context`), clashing with the context line under ADR 0001.
  They are now kind `"unchanged"` (`story-review-unchanged`); slice 5 uses
  that word.
- Slice 1: each file diff has its own `role="status"`; tests read the
  review's feedback through `reviewFeedback`, scoped to `.story-review-top`.
- Slice 1: shortening the worktree from its start with `direction: rtl`
  rendered badly in Chromium; the line uses a plain end ellipsis.
- Slice 2: the review body is an inline-size container; below 34.75rem
  (both pane bases plus the gap) the browser stacks above the diff. Its 40%
  bound needs `box-sizing: border-box`. The browser's row styles now live in
  `story-review-files.css` and the diff pane's column in
  `story-review-diff.css`.
- Slice 3: the narrow-panel step must wait for the panel's ResizeObserver
  to re-lay it out after `setViewportSize` before measuring.
  `reviewFileOrder` ignores collapsed folders; slice 4 expands the folder a
  move enters through `collapsed` in `SnapshotView`.
