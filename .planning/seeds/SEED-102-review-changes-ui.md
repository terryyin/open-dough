---
id: SEED-102
status: active
planted: 2026-10-05
planted_during: Terry's request to make the Review changes panel compact and full-height
trigger_when: A developer reviews story changes and needs more space for file navigation and the code diff
scope: unestimated
---

# SEED-102: Review changes UI improvement

## Why This Matters

A developer reviewing a story needs the panel's available height for navigating
changed files and reading code. Compact context and independent scrolling let
them move through a large review without losing their place or repeatedly
scrolling past basic information.

## Story

<a id="full-height-review-changes"></a>

### Review changes in a full-height panel with compact context and independent file navigation

**Identity:** SEED-102#full-height-review-changes
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/247-full-height-review-changes/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c2666fd20f9329229d2f8ac880d72eaf04ea03608c01d71fc08fca2194d2dbc4","plan":"deb910aeb1870e2646083b012dbb5d66f50e4eab8579b370bc959aa945fd2081"}}
```

**Goal:** A developer reviewing a story's changes in the dashboard's Review
changes panel can spend the panel's height on browsing changed files and
reading a diff. The review's context stays in view as one compact line, the
file browser and the diff scroll independently, and moving from file to file
never loses their place, so a large review reads without scrolling past the
same information again.

**Scope:**

Required behavior:

- **Fixed top.** The panel's header stays as it is: story title, identity,
  Refresh, Maximize/Restore, and Close. Directly beneath it, one context line
  of the review's own stays in view: branch, baseline (short revision and the
  `<remote>/<target>` it meets), worktree, and the Hide files / Show files
  control. The line never wraps. The header is shared with the terminal and
  already holds the title, so the context does not move into it.
- **Long values.** Values that do not fit are shortened. Activating the
  context line, by pointer or keyboard, shows every value in full (worktree
  path, branch, the whole baseline revision and where it meets trunk), and
  activating it again returns to the one line. Assistive technology reads the
  full values in either state.
- **Read-only explanation.** The sentence explaining that the review is
  read-only no longer takes a visible line; it remains the review's accessible
  description.
- **Full-height work area.** Beneath the fixed top, the file browser and the
  diff share all remaining height, and the review's body no longer scrolls as
  a whole. The file browser is a full-height sidebar that scrolls vertically on
  its own, and sideways for long names. In the diff pane the selected file's
  kind and path stay fixed above its code, and the code scrolls vertically and
  sideways within the pane.
- **Selecting a file** shows its diff from the top and leaves the file browser
  where it was scrolled.
- **Open on the first file.** A review with changes opens with the first file
  in the browser's order selected, so the diff pane is never empty. A refresh
  that no longer lists the selected file selects the first file.
- **Previous and next file.** Controls beside the diff's file heading move the
  selection through the files in the browser's order. Moving to a file inside a
  collapsed folder expands that folder, and the newly selected row is brought
  into view in the browser. Previous is unavailable on the first file and Next
  on the last.
- **Line numbers.** Each diff line shows its line number in the old file, the
  new file, or both, as Git's hunk positions give them.
- **Line counts per file.** Each file's row in the browser shows how many
  lines the snapshot adds to and removes from it, and the file's control says
  them in words. A file with no textual diff, such as a binary or mode-only
  change, shows no counts. A collapsed folder's count stays its number of
  changed files.
- **Feedback.** Reading, refreshing, refreshed, and problem messages appear in
  the fixed top area and stay announced. A refresh keeps the browser's scroll
  position and collapsed folders.
- **Narrow panel.** Where the panel is too narrow for the browser beside the
  diff, the browser sits above the diff with a bounded share of the height;
  each still scrolls on its own, and Hide files gives the diff all of it.
- **No panes without files.** A review with no changes, or one that is
  unavailable, shows its explanation beneath the fixed top without the browser
  or diff pane.
- **Kept as it is.** Folder collapse and its counts, how a file's kind is
  styled and named, where the keyboard goes on opening and closing, and
  Maximize/Restore and edge resizing keeping the snapshot and selection, as
  the [dashboard story review](../../dashboard/AGENT-LAUNCH-REVIEW.md)
  describes. Maximize/Restore and resizing also keep both scroll positions.

Deferred promises:

- Marking files as viewed or reviewed. The story review's Mark reviewed
  marks a whole snapshot, as the
  [dashboard story review](../../dashboard/AGENT-LAUNCH-REVIEW.md) describes.
- Filtering or searching the file browser, and resizing its width.
- Side-by-side diff, all files in one continuous scroll, and syntax
  highlighting.
- Keyboard shortcuts for Previous and Next file beyond their controls.

**Key examples:**

- A story with changed files → the developer opens Review changes → beneath
  the header one context line shows branch, baseline, and worktree; the first
  file is selected; the browser and that file's diff fill the rest of the
  panel's height.
- More changed files than the browser's height holds → the developer scrolls
  the browser → the diff stays at its position and the header and context
  line stay in view.
- A diff longer than the pane → the developer scrolls the code → the browser
  stays at its position, and the context line and the file's kind and path
  stay in view above the code.
- The browser scrolled down its list, the diff scrolled to its middle → the
  developer selects another file → its diff shows from the top and the browser
  has not moved.
- The selected file is the last one before a collapsed folder → Next → the
  folder expands, its first file is selected and in view in the browser, and
  its diff shows from the top.
- A worktree path longer than the context line → the line shows it shortened
  on one line → the developer activates the line with the keyboard → the whole
  path, branch, and baseline revision are shown → activating it again returns
  to one line.
- A hunk headed `@@ -10,3 +10,4 @@` with one added line → that line shows only
  a new-file number, and the unchanged lines around it show both numbers.
- A modified file whose diff adds four lines and removes one, beside a changed
  image → the first row shows 4 added and 1 removed, and the image's row shows
  no counts.
- The browser scrolled, two folders collapsed → Refresh → “Review refreshed”
  is shown and announced in the fixed top area; the folders stay collapsed and
  the browser keeps its position.
- A panel narrowed until the panes no longer fit side by side → the browser
  sits above the diff, each scrolling on its own → Hide files → the diff takes
  the whole work area.
- A worktree that matches its baseline → the context line and “No changes” are
  shown, with no browser or diff pane.

**UI:** The panes follow a mail client's message list and reading pane: the
list keeps its place while the reading pane starts each selected item from the
top, and Previous/Next moves through the list without returning to it. Changed
files take the role of messages, the diff of the reading pane, and the context
line of the mailbox name. The analogy stops at read and unread marks, which a
mail list is organized around: a review here is one snapshot with no kept
reading state, so viewed marks stay deferred. A mail list is also flat, so
Previous/Next here follows the browser's folder order and opens a collapsed
folder it enters. From code review tools: one file's diff at a time with
Previous/Next and line numbers, as IntelliJ's diff review; a file heading that
stays above its code and per-file line counts, as GitHub's changed files.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Current dashboard story review](../../dashboard/AGENT-LAUNCH-REVIEW.md).
- [Other story review capabilities](SEED-088-dashboard-story-code-review.md).
- Terry's 2026-10-05 request: capture this UI improvement as the highest-priority
  queued story; use a full-height panel, fixed compact single-line basic context,
  and a full-height folder/file sidebar with independent vertical scrolling;
  include general review UX/UI design improvements inspired by common tools.
