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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer scanning the story cards can tell what each card action
does and what state it is in from the control alone, and reads the explanation
only when they want it, so cards are shorter and easier to scan.

**Scope:**

- **Start execution** and **Start refinement** each carry a fitting
  `lucide-react` icon through the dashboard's shared `Icon` component.
- A launch action's state stays in its style (for example the dashed border of
  an execution start not marked Ready for execution). Its state note, such as
  “not marked Ready for execution” or “Being prepared”, is no longer shown as
  text on the card; it becomes the button's tooltip on hover and keyboard
  focus, and remains the button's accessible description.
- **Inspect story** is redesigned so it reads as expanding the card's detail in
  place (a disclosure affordance) rather than a plain command button.
- **Review changes** stays a button with an SVG icon and a right-pointing
  arrow, indicating the review opens in the panel on the right.
- To be refined: the exact icons, whether disabled-start reasons (an open
  session) also move into the tooltip, and the touch-device equivalent of hover.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dashboard story cards](../../dashboard/README.md) and
  [look and controls](../../dashboard/README.md#look-and-controls).
- [Launch actions and notes](../../dashboard/AGENT-LAUNCH.md) and
  [story review](../../dashboard/AGENT-LAUNCH-REVIEW.md).
- Terry's 2026-10-04 request: capture this story at the top of the backlog.
