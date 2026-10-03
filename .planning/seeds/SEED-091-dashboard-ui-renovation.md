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

<a id="dashboard-frame-renovation"></a>

### Modernize and streamline the dashboard frame

**Identity:** SEED-091#dashboard-frame-renovation

**Goal:** A developer can navigate and use a visually polished, modern dashboard
frame with clear controls, consistent styling, and easy access to system settings.

**Scope:**

- Renovate the whole dashboard frame: every UI element outside the session
  blocks that needs improvement belongs to this single story. Review the frame
  as a complete experience rather than limiting the work to a few controls.
- Introduce Lucide icons (interpreting the requested "Lucida icons" as Lucide)
  with consistent sizing, placement, and meaning.
- Modernize and beautify typography, colour, spacing, alignment, visual hierarchy,
  navigation, and controls; streamline interactions and reduce visual clutter.
- Include the system settings experience. Present its entry control as a
  sprocket/gear icon at the far upper-right corner of the dashboard frame.
- Keep controls understandable and usable, including accessible names for icon
  controls, visible focus, and readable contrast.

**Key examples:**

- On opening the dashboard, the developer sees a coherent frame with consistent
  icons and styling across its navigation and controls.
- The developer finds the settings sprocket at the far upper right, opens system
  settings, and can understand and use the settings in the renovated presentation.
- Reviewing the full frame identifies and improves remaining inconsistent or
  awkward UI elements, while the session blocks retain their existing appearance.

**Boundary:** Session blocks and their contents are excluded. The story tag/card
  redesign is the second story below. This story changes presentation and user
  interactions without adding unrelated product capabilities.

**Refinement questions:** Inventory the current frame's surfaces and agree on
  representative visual examples before implementation. Capture the full frame
  scope within this one story rather than creating a separate story per element.

<a id="story-card-information-radiator"></a>

### Make story cards modern, compact information radiators

**Identity:** SEED-091#story-card-information-radiator

**Goal:** A developer scanning story tags/cards can quickly understand the story
and its current state, find relevant actions, and see more stories with less
vertical clutter.

**Scope:**

- Modernize and beautify the story tag/card presentation so it serves as a clear
  information radiator, with a strong hierarchy for the important information.
- Hide excessive secondary detail from the default view while keeping it
  available when the developer needs it.
- Arrange similar or related buttons together on one line to reduce vertical
  space, allowing wrapping where the available width requires it.
- Align the cards' visual language with the renovated dashboard frame.

**Key examples:**

- A developer scans several cards and can readily identify each story and its
  current state without reading all of its supporting detail.
- Secondary detail does not dominate the card; the developer can reveal or reach
  it when needed.
- Similar actions share a horizontal row instead of consuming a separate row
  each, making the card more compact while keeping actions clear and usable.

**Boundary:** This is one story for the story tag/card experience. It does not
  redesign session blocks or change the underlying story lifecycle or facts.

**Refinement questions:** Confirm which current card details are essential for
  scanning, which should be hidden initially, and how they remain available.
  Identify related action groups and review representative card states and widths.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- Terry's 2026-10-03 request: capture the frame renovation as the first queued
  item and the story tag improvement as the second; work directly on main and
  sync with origin. These are captured stories awaiting refinement and planning.
