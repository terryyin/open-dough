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

<a id="story-card-information-radiator"></a>

### Make story cards modern, compact information radiators

**Identity:** SEED-091#story-card-information-radiator
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/231-story-card-information-radiator/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f4335db9e46251d95788fd3580c12e338f6fb13cd3c67b2a9af557778bf569e5","plan":"068e42f16cd7fc9331b1ede3d3b28071c204f2ada5567da012039d2a79ba30e5"}}
```

**Slice plan:** [Compact story-card reading and actions](../slice-plans/231-story-card-information-radiator/PLAN.md).

**Goal:** A developer monitoring and directing story work can scan Backlog and
Taken cards to identify the story, its published preparation or execution state,
and the next available action, then inspect its supporting evidence when needed.
Compact, visually coherent cards let the developer compare more stories without
secondary metadata dominating the overview.

**Scope:**

- Modernize story cards in both existing stages, including their collapsed and
  inspected states. Align typography, colour, spacing, emphasis, and controls
  with the renovated dashboard frame. The story title leads the reading order;
  ordinary metadata and decoration do not compete with warnings or actions.
- Make the default view compact by reducing repeated explanatory text and
  moving secondary facts into inspection, rather than shrinking text or
  concealing meaningful state. The default/detail split is recorded under UI
  below.
- Keep preparation and readiness distinct, including Planless, Not recorded,
  Not ready, Changed since readiness review, and evidence-conflict or
  unavailable states when present. Keep Preparing an assignment annotation,
  and Taken a published claim rather than an indication of live activity.
- Keep Taken progress interpretable: the recorded slice count, current-slice
  clock or execution-complete/awaiting-wrap-up state, and any uncertainty remain
  apparent. Progress read from a story branch still says it is not in trunk;
  a trunk copy with unknown execution branch remains qualified. Full branch
  names and revisions can be secondary detail. Counts never imply percentage
  of effort or independently verified completion.
- Keep dependency blocking, missing or conflicting evidence, startup progress,
  launch failures, and reasons an action is unavailable apparent beside the
  affected fact or action. Longer explanations and supporting records may be
  inspected. Ordinary absence, loading, unavailable evidence, and recorded
  zero completion must remain distinguishable.
- Arrange related actions together on one line when width permits, allowing
  wrapping: Start execution and Start refinement form the launch group;
  Inspect story/Hide detail and Review changes form the inspection group when
  offered. Keep their names, availability rules, effects, and recovery behavior.
  A Not ready badge does not itself disable Start execution; dependencies and
  open sessions retain their existing rules.
- Retain access to every existing card fact and source link. Inspection reveals
  already-loaded facts, preserves the story's stage and surrounding context,
  and can be closed with useful focus return. The existing agent-portrait
  route to the roster remains available. During protected startup, facts and
  source links remain readable even though Inspect story and other card actions
  are unavailable; compacting cannot strand evidence behind a disabled action.
- Keep titles readable, text meanings alongside colour or symbols, named
  controls, visible keyboard focus, and a usable scan-to-detail-to-source path
  at narrow widths and browser zoom. Existing selection, shown-in-terminal,
  and startup marks remain distinguishable without relying on colour alone.

**Key examples:**

- Several ordinary Backlog cards with no open sessions are shown at 1440px
  viewport width → the developer scans them → full titles, priorities,
  preparation/readiness, and launch actions are easy to compare, with less
  vertical space devoted to supporting metadata than today. Start execution
  and Start refinement share a line when the card width permits.
- A queued story has a published preparation assignment → the developer scans
  it → Preparing and its assigned developer are apparent alongside the
  existing priority and badges, without implying that an agent is running.
- A Taken story has two of five slices recorded complete on a story branch →
  the developer scans and then inspects it → the count and current-slice clock
  are visible, the progress is qualified as not in trunk, and inspection reaches
  the exact branch/revision, slice evidence, and source links. A completion
  record instead shows execution complete, awaiting wrap-up; it does not move
  the card or imply closure.
- A story has a blocking dependency, Changed since readiness review, or an
  unreadable plan → the developer scans it → the relevant warning is visible
  before inspection, and inspection explains the reason and available evidence.
  An unreadable plan does not appear as zero slices completed.
- A developer needs the purpose, full identity, assignment metadata, or source
  records → they activate Inspect story by pointer or keyboard → those facts
  are available with their existing distinctions and links; Hide detail returns
  them to the same story with useful focus. A portrait still opens its agent's
  roster entry and supports returning to the card.
- A local launch is starting or its answer fails → the developer looks at the
  card → startup or failure feedback stays visible with the existing recovery
  route. While startup protects the card, its actions stay unavailable and
  described, but source links remain readable without activating Inspect story.
- At 420px viewport width or 200% browser zoom → the developer reads a long
  title and navigates the action groups and detail → text and actions wrap in
  reading order without clipping, horizontal loss, or hover-only access to
  essential facts. Cards with sessions keep the existing session entries and
  attention feedback usable; this story promises no fixed card height.

**UI:** Describe two levels of reading within the existing story-card journey;
no particular layout, component, or technology is selected here.

- **Scan view:** full story title, backlog priority, assigned or
  preparing developer and roster access, preparation/readiness badges,
  dependency summary and evidence warnings, Taken slice count/clock or
  awaiting-wrap-up state, available action groups, and local startup/failure
  feedback. Keep the existing session blocks and attention indications.
- **Secondary detail:** full identity, host/model, mode and exact
  branch, credited human assignment detail, purpose, expanded preparation and
  dependency explanations, source revisions and links, slice evidence, and
  product advice. Existing unknown/conflicting states remain explicit; a short
  warning stays visible in the scan view when its explanation is secondary.
- **Evidence exceptions:** a short progress-source qualification remains beside
  the count whenever it is not plainly trunk. Source links stay readable during
  protected startup, regardless of whether they normally sit in inspection.
- **Density:** remove redundant supporting lines and align related actions;
  preserve readable type, useful action targets, and space separating different
  meanings. Compare equivalent ordinary cards before and after, using the same
  facts and session state, rather than imposing a height that would cut off
  warnings, long titles, or sessions. Follow the frame's light visual direction.

**Boundary:** This is one story for the existing story tag/card experience and
its inspection. Session blocks (including Working/Needs input entries and
Recent sessions), the dashboard frame, roster content, launch/review dialog
content, and terminal contents retain their existing responsibilities. No
story lifecycle, authoritative facts, launch policy, or source-read behavior is
changed. Presentation changes may touch the product parts needed for this
outcome; these boundaries are not implementation-file restrictions.

**Deferred promises:** New filtering, sorting, search, card movement or zoom,
new status or progress facts, new launch/review capabilities, a dark theme,
and a session-block redesign. These are not product rejection rules.

**Decision:** On 2026-10-03 Terry accepted the scan-first split above for the
default card, over keeping mode/branch and source links visible or moving
assignment into detail. The progress-source and protected-startup exceptions
apply.

**Refinement evidence:** Current card information and interactions were read in
`dashboard/src/WorkCard.tsx`, `PreparationCard.tsx`, `AgentAssignmentFacts.tsx`,
`DependenciesCard.tsx`, `SliceProgress.tsx`, `StoryDetail.tsx`, and
`CardLaunches.tsx`. Published/local distinctions and startup safeguards follow
the [UX/UI North Star](../../docs/dashboard-ux-ui-north-star.md) and
[agent launch contract](../../dashboard/AGENT-LAUNCH.md). This was source
inspection for refinement, not an observation of rendered cards or a visual
acceptance review.

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

<a id="side-panel-review-reopen-and-close-alignment"></a>

### Align the side panel's same-review opening, report close shortcut, and proof

**Identity:** SEED-091#side-panel-review-reopen-and-close-alignment
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/241-side-panel-alignment-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f680f33ac1e451c95261d8c6ee76ac3f65681a1aad13495f49819e9e7cb77eb3","plan":"78bcb4c04b643f562c49f77ff74b417a51566ff0098a5f79b542163a4b83ec75"}}
```

**Slice plan:** [Side panel alignment correction](../slice-plans/241-side-panel-alignment-correction/PLAN.md).

**Goal:** A developer using the shared side panel gets feedback when activating
Review changes for the review already shown, and maintainers read one accurate
account of the panel's review opening and Close shortcut, with proof that pays
for its cost. This bounded correction follows the retrospective of
[the shared side panel](#review-and-terminal-share-side-panel).

**Scope:** focus the review already shown when its Review changes control is
activated again, keeping its fixed snapshot until Refresh; align the
maintained review contract and the page-frame comment with that behavior;
state in the UX/UI North Star that the side panel is multi-purpose and holds
one item at a time, leaving review details to the review contract;
give the final report's Command+Shift+Escape one shared owner with the review
and terminal; remove the tautological header-look test and trim repeated
malformed-width rounds. No new feature promise, report chrome redesign, or
change to snapshot, width, or session semantics.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- Terry's 2026-10-03 request: capture the frame renovation as the first queued
  item and the story tag improvement as the second; work directly on main and
  sync with origin. These are captured stories awaiting refinement and planning.
- Terry's 2026-10-03 request: capture moving the story review from its dialog
  into the terminal's right side panel, exclusive with the terminal and
  resizable by dragging for both, as the fourth backlog priority; work directly
  on main and sync with origin.
