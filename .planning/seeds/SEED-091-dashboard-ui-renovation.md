---
id: SEED-091
status: active
planted: 2026-10-03
planted_during: Terry's request for two dashboard UX/UI renovation stories
trigger_when: A developer wants a polished dashboard frame and compact story information radiators
scope: unestimated
---

# SEED-091: Renovate the dashboard frame and story cards

## Why This Matters

A developer monitoring and directing story work needs a dashboard that looks
modern, feels coherent, and makes important information and actions easy to find.
Terry requested two stories, queued first and second respectively: renovate the
dashboard frame, then improve the story tag/card as an information radiator.

## Stories

<a id="review-and-terminal-share-side-panel"></a>

### Show story review and terminal in one resizable side panel

**Identity:** SEED-091#review-and-terminal-share-side-panel
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/240-review-terminal-side-panel/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e324fbaa7251dd56ba26d2c1136259303d19be8319ede18b9ce42d59c6338ae4","plan":"9a40a1920e52a11d17b022f748a27190f91de584a2566b163b6278c5a00448a9"}}
```

**Slice plan:** [Review and terminal in one resizable side panel](../slice-plans/240-review-terminal-side-panel/PLAN.md).

**Goal:** A developer reviewing a story's changes or working in a session
terminal uses one cohesive right-side panel for either, while keeping the
dashboard available beside it. They can adjust its width by mouse or keyboard
to suit the task and recover that preferred width later, reducing interruption
when moving between review and session work.

**Scope:**

- Show the [story review](../../dashboard/AGENT-LAUNCH.md#story-review) in the
  existing right-side panel. In the normal split, the dashboard remains
  readable and interactive, without a modal backdrop or focus trap.
- The panel shows one item at a time. Opening a review replaces an open
  terminal or another review; opening a terminal replaces an open review.
  Replacing or closing a terminal detaches it without ending or marking its
  session done. Existing read-only final reports continue to occupy this same
  exclusive region, with their current access and lifecycle meanings.
- One panel design for both: header and controls share styling and use the
  Lucide icons introduced by the
  [frame renovation](https://github.com/terryyin/open-dough/blob/3c6e5e1002217db658f05c280b6362f3f08d2968/.planning/seeds/SEED-091-dashboard-ui-renovation.md#dashboard-frame-renovation) for Close and the other panel
  controls. Identify the shown story or session, give icon controls accessible
  names and visible keyboard focus, and retain content-specific controls such
  as review Refresh and terminal Mark as done where currently offered.
- Review and terminal both offer Maximize/Restore and Close. Maximize uses the
  dashboard column's room; Restore recovers the preferred split width within
  the current bounds. Switching to different panel content returns to the
  normal split. Close also works through the existing terminal shortcut,
  Command+Shift+Escape, respecting open dialogs and system settings; ordinary
  terminal Escape continues to reach the session. Closing returns focus to the
  invoking control, or a useful dashboard control if it is no longer present.
- In the normal side-by-side view, drag the panel's left edge to resize it.
  The same edge is keyboard reachable: Left enlarges the right panel and Right
  narrows it, with visible focus and an accessible current width. Resizing
  changes the available content area immediately; the terminal fits that area
  without losing its attachment, and review keeps its snapshot and selection.
- Remember one shared preferred split width in this browser across content
  changes, closing/reopening, and page reloads. Without a saved preference,
  begin at half the available space. Width is a disposable local display
  preference, not a published project fact.
- Clamp resizing and restored preferences before either the dashboard or
  panel becomes unusably narrow: their text, controls, and navigation remain
  reachable. When there is insufficient room for the usable split, retain the
  existing narrow-screen arrangement with the panel above the dashboard;
  horizontal resizing is unavailable there and while maximized. A temporary
  viewport limit does not erase the preferred split width.
- Preserve the existing review contract: each newly opened review, including
  after replacement or Close, reads a fresh snapshot; files and diffs stay on
  that snapshot until Refresh. Resizing and maximizing do not reread it.
  Keep workspace/baseline evidence, file navigation, loading and refresh
  feedback, no-change and unavailable states, and recovery available. Switching
  stories while a read is pending must not show the earlier story's answer in
  the new review.

**Key examples:**

- A terminal is attached beside the dashboard → the developer chooses Review
  changes on a story → its fresh review replaces the terminal, the dashboard
  remains usable, and the session continues without being marked done. Choosing
  that session again replaces the review and attaches to the same session.
- Story A's review is reading → the developer opens story B's review → the
  panel identifies B and shows B's loading/result state; A's late answer cannot
  replace it. Closing and reopening B reads a fresh snapshot. An empty or
  unavailable review still offers Close and the existing recovery controls.
- Either review or terminal is shown in a wide window → the developer drags
  its edge left or right → its content width changes, the dashboard keeps
  usable room, and dragging past a supported bound stops there. The terminal
  stays attached; review keeps its selected file and snapshot. Opening the
  other content, reopening the panel, or reloading uses that shared width.
- A keyboard user focuses the resize edge → Left/Right changes the width
  within the same bounds and exposes the new width accessibly → focus stays
  on the edge and terminal input is unaffected. They can reach Maximize,
  Restore, Refresh where offered, and Close without a mouse.
- A review or terminal has a chosen split width → Maximize expands it,
  Restore recovers that width, and switching content returns to the normal
  split. Close or Command+Shift+Escape closes the shown content and returns
  focus usefully; ordinary Escape in the terminal is still session input.
- At 420px viewport width or 200% browser zoom, a remembered wide split no
  longer fits → the panel uses the narrow arrangement above the dashboard,
  with reachable header controls, evidence, and content navigation. Code or
  terminal content can scroll within its own area without making the whole
  page scroll sideways. Widening the viewport recovers the preferred split
  within the available bounds.

**UI:** Describe the shared panel journey, retaining the right-side placement
already requested; select no further layout, component, or technology here.
The header makes the current story/session and available actions apparent.
The resize edge communicates that it can be dragged and supports the same
change by keyboard. Opening a review places focus in its named content without
trapping it; closing restores focus to its origin. Width changes preserve
content reading state. Maximize/Restore makes the temporary use of dashboard
space explicit, while the normal split leaves dashboard actions available.

**Boundary:** This story changes panel presentation, selection, and width
control. The existing review workspace selection and snapshot/diff semantics,
session access and lifecycle actions, published story facts, and Sessions
sidebar retain their responsibilities. The terminal's saved theme still
applies to its content. Necessary changes to support the shared region and
narrow-screen reading are within scope; these are not file restrictions.

**Deferred promises:** Showing review and terminal simultaneously, tabs or a
history of panel contents, separate widths for each content type, remembering
maximized state across reloads, a final-report redesign, new review filters or
comparison modes, and new session actions. These are delivery exclusions,
not product rejection rules.

**Decision:** On 2026-10-03 Terry accepted all recommended UX/UI choices:
replacement in both directions without ending sessions; review Maximize/Restore
with switching returning to the split; fresh snapshots on reopening; one
browser-persisted shared width with usable bounds and the existing narrow
arrangement; and keyboard resizing with visible focus and accessible width.

**Refinement evidence:** Current presentation and behavior were read in
`dashboard/src/TerminalSplit.tsx`, `TerminalPanel.tsx`, `pageSessionPanel.ts`,
`SessionResultPanel.tsx`, `StoryReviewAction.tsx`, `StoryReviewSnapshotView.tsx`,
`useReviewRead.ts`, `pageShortcuts.ts`, `agent-terminal.css`, and
`story-review.css`, alongside the [story-review contract](../../dashboard/AGENT-LAUNCH.md#story-review),
[terminal contract](../../dashboard/AGENT-LAUNCH-TERMINALS.md), and
[UX/UI North Star](../../docs/dashboard-ux-ui-north-star.md). This was source
inspection for refinement, not a rendered observation or visual acceptance
review.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- Terry's 2026-10-03 request: capture the frame renovation as the first queued
  item and the story tag improvement as the second; work directly on main and
  sync with origin. These are captured stories awaiting refinement and planning.
- Terry's 2026-10-03 request: capture moving the story review from its dialog
  into the terminal's right side panel, exclusive with the terminal and
  resizable by dragging for both, as the fourth backlog priority; work directly
  on main and sync with origin.
