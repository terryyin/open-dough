---
id: SEED-098
status: active
planted: 2026-10-04
planted_during: Terry's request to capture a story card UI improvement at the top of the backlog
trigger_when: A developer scanning dashboard story cards finds action notes repeat button styles or cannot tell what an action does before clicking
scope: unestimated
---

# SEED-098: Story card actions read at a glance

## Why This Matters

A developer scanning many story cards should tell each action's purpose and
state from the control itself. Today notes such as “not marked Ready for
execution” repeat what the button's style already shows, and **Inspect story**
and **Review changes** look like ordinary buttons with no hint of where their
result appears.

## Story

<a id="story-card-actions-read-at-a-glance"></a>

### Story card actions show their state by style and explain it on hover

**Identity:** SEED-098#story-card-actions-read-at-a-glance
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/244-story-card-actions-read-at-a-glance/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f18d09914eabce53eff8d047d604201582c6258de54f511c6c1fa34144074c9e","plan":"af2446e4e2feb1fd63978adfc81191845442d1458605bb945d7fef5b198f3043"}}
```

**Goal:** A developer scanning the story cards can tell what each card action
does and what state it is in from the control alone, and reads the explanation
only when they want it, and sees who is working on an engaged story, so
cards are shorter and easier to scan. The notes
removed from view repeat what the card's preparation and readiness badges
already show.

**Scope:**

- **Start execution** and **Start refinement** each carry a leading
  `lucide-react` icon through the dashboard's shared `Icon` component, keeping
  their text labels. Proposed: `Play` for execution and `PencilLine` for
  refinement; the implementer may pick another glyph that reads as the same
  action.
- A launch action's note keeps its current style (the dashed border every
  noted Start already has) and leaves the card's visible text. The note — “Not
  marked Ready for execution”, “Being prepared”, or a kept start's “Started
  here, no session yet” — appears in the dashboard's styled tooltip when the
  button is hovered or holds keyboard focus, and remains the button's
  accessible description, announced once.
- The launch dialog keeps stating the note (“This story is not marked Ready
  for execution.”). That is how a pointer-less or touch user reads it: tapping
  the Start opens the dialog, which already says it. No touch-specific hover
  substitute is added.
- **Inspect story** reads as expanding the card's detail in place: a leading
  chevron that turns when the detail is open, in the manner of the frame's
  existing disclosure control, with “Inspect story” / “Hide detail” and its
  expanded state unchanged.
- **Review changes** keeps its text, gains a leading review icon (proposed
  `GitCompare`) and a trailing right-pointing arrow, showing that the review
  opens in the panel on the right.
- A Taken or Preparing card's scan view again shows, beside each agent's
  portrait and name, its credited human developer, its tool (host, with its
  mark), and its model, as the card did before the scan-view compaction. An
  unrecorded host or model shows as not recorded, and an unknown human keeps
  its short warning. The mode, branch context, and the human's explanation stay
  in **Inspect story**.
- Failed or uncertain launch answers stay visible text on the card: they are
  feedback the developer must act on, not state.
- Deferred: moving disabled-start reasons into a tooltip. A disabled button
  takes no keyboard focus, so a tooltip there would be unreachable by
  keyboard. The open-session reason is already hidden text beside the listed
  open session, and a blocking dependency's problem stays visible because the
  developer must resolve it.

**Key examples:**

- A Backlog card whose story is not marked Ready for execution → the
  developer looks at it → **Start execution** shows its play icon and dashed
  border with no note beside it; hovering or tabbing to it shows “Not marked
  Ready for execution” in a tooltip, and a screen reader announces the name
  then that description.
- A story being prepared by another agent → the card shows its Preparing
  badge and a dashed **Start refinement**; “Being prepared” appears only on
  hover or focus. Clicking it opens the launch dialog, which says “This story
  is being prepared.”
- A Ready, unprepared story → both Starts are solid, with icons, and show no
  tooltip note.
- A Taken story held by Akiho-chan → its card reads, beside the portrait,
  “Akiho-chan · Terry Yin · Claude Code · claude-opus” without opening
  **Inspect story**; a preparing agent's line reads the same after
  **Preparing**.
- A card listing an open session → both Starts are disabled with their icons;
  no tooltip is promised, and the open session line still says why.
- A collapsed card → **Inspect story** shows a chevron pointing right;
  activating it opens the detail, the chevron turns down, and the label reads
  **Hide detail**.
- A card whose story has a launch workspace → **Review changes** shows its
  review icon and a trailing arrow; activating it opens the review in the
  right panel as today.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dashboard story cards](../../dashboard/README.md) and
  [look and controls](../../dashboard/README.md#look-and-controls).
- [Launch actions and notes](../../dashboard/AGENT-LAUNCH.md) and
  [story review](../../dashboard/AGENT-LAUNCH-REVIEW.md).
- Terry's 2026-10-04 request: capture this story at the top of the backlog.
