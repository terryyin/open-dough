# Dashboard spatial-reading direction

Part of the [Dashboard navigation guidance](dashboard-navigation.md), under the
[Dashboard UX/UI North Star](dashboard-ux-ui-north-star.md). Its authority, scope,
and revision policy apply here. These are design directions for richer spatial
reading when ordinary layout and scrolling no longer serve the work.

The initial layout hypothesis is a left-to-right flow with a visible connector,
clear region boundaries, and story cards that stay attached to their Column as
the user navigates. Reflow to a vertical connection on narrow screens if useful.
The relationship between Columns should be apparent, rather than presenting
unrelated lists. A movable viewport is a later option when ordinary layout and
scrolling stop serving the work. Exact geometry and styling can evolve.

As density or richer evidence justifies zoom, support two useful levels of
reading from the same snapshot:

- **Overview:** fit the connected Columns, their names, and entry counts into
  view. Work remains visibly distributed across the Columns; compact cards or
  marks may stand in for full titles when fitting every title would be illegible.
  Counts describe recorded entries, not completion percentages.
- **Focused work:** selecting a work item brings it into readable view and
  reveals its full title, identity, group/priority, and existing source links.
  Zoom reveals existing information; it does not fetch new story or plan facts
  in the first story. Keep the containing Column apparent and provide a clear
  route back to the overview.

When zoom is introduced, include named Zoom in, Zoom out, and Fit overview
controls, with bounded zoom and pan so work cannot be lost indefinitely
offscreen. Provide pointer pan on
the background and a keyboard-equivalent way to reach offscreen work; keyboard
focus brings a Story card into view. Focused reading and Fit overview must also
work on touch screens without precise gestures. Preserve browser page zoom and
normal page scrolling; gestures may supplement, not replace, explicit controls.
Do not require a minimap, physics simulation, freely draggable cards, or custom
graph editor. Panning changes the view, never backlog order or membership.

Illustrative compact overview; placeholders are not observed project data:

```text
┌──────────────── pinned viewport-top banner ──────────────┐
│ [≡] ▸ <project>  [Open Dough|Doughnut|Pygardon] [↻] [⚙]  │
└──────────────────────────────────────────────────────────┘
▸ Near-future direction                                [?]

┌──────────────────── Board ────────────────────────────────┐
│  BACKLOG                         TAKEN                    │
│  ┌──────────────────┐            ┌───────────────────┐    │
│  │ 1 · <Story card>  │ ── take ─▶ │ <Story card>       │    │
│  │ 2 · <Story card>  │            │ <Story card>       │    │
│  │ …               │            │                   │    │
│  └──────────────────┘            └───────────────────┘    │
└──────────────────────────────────────────────────────────┘

Each Story card → readable title, Column/priority, developer, badges, warnings;
Inspect story → identity, assignment records, evidence, source links
```

Do not hide already-readable entry information just to create a zoom interaction.
The first story can use ordinary layout, wrapping, and scrolling; if a small
focus or fit control materially helps, add it within that reading journey.
Do not prebuild a viewport framework for future feature or structural views.

As later stories deliver richer evidence, focused work can expose purpose,
assignment/mode, independent refinement/planning facts, and named slices with
completion evidence. Source revision and uncertainty stay attached to each
fact. A readable anchored panel is an option for dense detail; it complements
the Board rather than replacing spatial navigation with a list-and-detail app.
Stories outside the backlog must become reachable when their discovery is in
scope. Search or filtering can follow actual navigation needs.
