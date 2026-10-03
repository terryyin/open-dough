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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer reviewing a story's changes or working in a session
terminal uses one cohesive right-side panel for either, and can drag its edge to
give the review or terminal the width the task needs, so reviewing no longer
covers the dashboard in a dialog and both panels look and behave the same.

**Scope:**

- Show the [story review](../../dashboard/AGENT-LAUNCH.md#story-review) in the
  right side panel where the terminal shows today, instead of a modal dialog.
- The review and the terminal are exclusive in that panel: opening a review
  closes the terminal, and only one review shows at a time. The developer
  closes the review the same way as the terminal.
- One panel design for both: header and controls share styling and use the
  Lucide icons introduced by the
  [frame renovation](https://github.com/terryyin/open-dough/blob/3c6e5e1002217db658f05c280b6362f3f08d2968/.planning/seeds/SEED-091-dashboard-ui-renovation.md#dashboard-frame-renovation) for Close and the other panel
  controls.
- New for both review and terminal: the developer drags the panel's edge with
  the mouse to resize it.
- To be refined: what opening a terminal does to an open review, whether the
  chosen width is remembered, width limits, maximize behavior for the review,
  and keyboard access to resizing.

<a id="card-renovation-alignment"></a>

### Align product guidance, shared styles, and tests with the renovated cards

**Identity:** SEED-091#card-renovation-alignment
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/241-card-renovation-alignment/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"6307a4352f88882d3a2217b2985147eadab3d31e72e23afcb66af14c9c0582e5","plan":"5e28c4c3174c43caf0b950d3ed72b2e6651f26891369a5bb7470921c311695e0"}}
```

**Slice plan:** [Card renovation alignment](../slice-plans/241-card-renovation-alignment/PLAN.md).

**Goal:** A maintainer reading the dashboard's guidance, or changing the
renovated story cards later, finds documentation that says where each card
fact is actually shown, roster and session identity lines laid out as before
the card renovation, and card tests that open detail explicitly and prove each
focus walk once. This bounded retrospective correction of
[the story-card renovation](#story-card-information-radiator) adds no product
promise.

**Scope:**

- Correct the dashboard guidance and code comment that misplace the
  dependency explanation, assignment metadata, and human-developer and field
  gaps relative to the card's scan view and inspected detail.
- Restore the shared story-identity spacing outside the card while keeping the
  inspected detail as delivered.
- Move story-detail opening out of the whole-snapshot check into explicit
  steps, and remove duplicated focus-return walks from the action-group tests.
- Excludes the remaining launch-answer waits under load, which belong to their
  own recorded finding, and any change to card behavior or presentation.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- Terry's 2026-10-03 request: capture the frame renovation as the first queued
  item and the story tag improvement as the second; work directly on main and
  sync with origin. These are captured stories awaiting refinement and planning.
- Terry's 2026-10-03 request: capture moving the story review from its dialog
  into the terminal's right side panel, exclusive with the terminal and
  resizable by dragging for both, as the fourth backlog priority; work directly
  on main and sync with origin.
