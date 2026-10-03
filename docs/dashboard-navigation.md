# Dashboard navigation

Part of the [Dashboard UX/UI North Star](dashboard-ux-ui-north-star.md).
Its authority, scope, and revision policy apply to this guidance.

## Connected stages and spatial navigation

Keep one story overview with an always-visible banner pinned to the viewport top.
Start the banner with a **Sessions** button that opens and closes the Sessions
sidebar, which lists the open agent sessions of every project beside the page
([Agent launch](../dashboard/AGENT-LAUNCH.md)). Command+B toggles it
page-wide, while browsing stories or the agent roster and from inside the
terminal, where Ctrl+B still goes to the session; the page takes Command+B from
the browser, except inside an open modal dialog, which keeps its own keyboard,
as it does for the project arrows below. Toggling leaves the keyboard where it
is, except that closing the sidebar while the keyboard is inside it returns
the keyboard to the Sessions button. The sidebar stays open or closed as left
across project switches, views, the terminal, and reloads; it is disposable
per-browser state and starts closed when none is kept. Opening a sidebar entry
shows its project's stories through the same project selection and URL
history as a project choice, as one history entry, opens its session in the
terminal with the keyboard there, or opens the read-only final report when a
Codex saved workspace is missing or cannot be established, and brings its story's card into view once
that project's stories are read. Command+Shift+Escape closes the terminal
or final-report
panel as its Close control does, page-wide and from inside the terminal,
maximized or not, where plain Escape still goes to the session; the page takes
it from the browser, except inside an open modal dialog, and with no panel it
does nothing. Command+Escape is not used: Chrome and Safari on macOS never
deliver it to the page.
Show the selected project's name as the banner's Source evidence disclosure.
Show the three project choices as tab-shaped radio controls, with the selected
project highlighted. Unmodified Left and Right arrow keys cycle the three
projects page-wide in displayed catalog order (Open Dough, Doughnut, Pygardon),
wrapping at both ends, while browsing stories or the agent roster; each step
uses the same project selection, URL history, and published-data read as a
pointer choice. When a project radio holds focus, native arrow-key switching
consumes that step once and keeps useful focus on the selected control.
Elsewhere, the page-wide shortcut selects the adjacent project; controls that
survive the switch keep focus, and when focused project content disappears,
focus moves to the selected project radio. Editable fields, other
arrow-operated controls, already-handled key events, modified shortcuts, and
an open modal help dialog keep their own keyboard behavior and do not change
the project. Keep manual refresh in this banner. Keep repository/ref, full
source revision, and retrieval time available through the Source evidence
disclosure, so detailed metadata does not fill the viewport at browser zoom.
Render refresh as an SVG icon with the accessible name Refresh, changing to
Retry after a failed read; preserve its focus and guarded behavior during
reads. Keep readable loading and source problems near the source context. Make
the header wrap without covering focused content or consuming the usable
reading area at narrow widths or browser zoom.

The global **System settings** control opens a dedicated machine configuration
view, including when no projects are configured. Its **Projects** section lists
configured names, GitHub repositories and local paths, with **Add project** and a
**Remove project** action for each row. Project management belongs here; the
banner retains selection and observation controls. Removing an unselected row
preserves selection; removing the selected row selects its next neighbor or the
first remaining project. Settings remains available after the last removal.
**Back to dashboard** and browser Back/Forward restore the preceding valid
project and story/roster view with useful focus. Opening settings preserves the
mounted session sidebar and terminal context. Project arrows leave settings
controls and forms alone. Facts and actions wrap in reading order at narrow
widths and browser zoom.

Below the banner, show **Near-future direction** as an initially collapsed
disclosure. Activation reveals its full published text or the existing
no-direction explanation; activation again collapses it. Preserve the choice
across same-project refreshes and start collapsed on project changes. Replace
the expanded **Preparation badges** legend with a compact question-mark help
control on the same line, opposite the direction disclosure, named Preparation
badge legend. Open the existing legend in a titled modal above the banner; provide a visible Close
control and Escape, contain focus inside, and return focus to the launcher.
Keep the actual story badges and their textual meanings visible on cards.
Direction and help are transient UI state and cause no source read. Keep
direction, evidence, refresh, and view controls outside any zooming surface.

Use one navigable stage containing connected regions for work stages. Initially,
show **Backlog → Taken**, with work cards placed inside their recorded region.
The connector means “work can be taken from the backlog,” not a dependency
between stories, a required sequence of all lifecycle steps, or evidence that
a particular story moved during this observation. Label that relationship.
Taken includes claimed work, not a claim of live execution. These visual stages
are separate from the two delivery stages in the requirements.

Use stable story identity to preserve orientation across refreshes. Preserve
source order within each region, with visible backlog priority; do not sort by
title, owner, or inferred activity. Do not add Refined, Planned, Running, or
Done stages to fill out a pipeline before their meaning and evidence are
selected. Later refinement and planning facts may be independent annotations,
not exclusive destinations. A missing entry is not proof of completion.
Show **Preparing** and its assigned developer as such an annotation on a queued
card while a published preparation assignment names that story. The card keeps
its region, priority, and badges; Preparing is not a stage every story passes
through or evidence that an agent is running. The badge legend explains it.

The initial layout hypothesis is a left-to-right flow with a visible connector,
clear region boundaries, and story cards that stay attached to their stage as
the user navigates. Reflow to a vertical connection on narrow screens if useful.
The relationship between stages should be apparent, rather than presenting
unrelated lists. A movable viewport is a later option when ordinary layout and
scrolling stop serving the work. Exact geometry and styling can evolve.

As density or richer evidence justifies zoom, support two useful levels of
reading from the same snapshot:

- **Overview:** fit the connected stages, their names, and entry counts into
  view. Work remains visibly distributed across the stages; compact cards or
  marks may stand in for full titles when fitting every title would be illegible.
  Counts describe recorded entries, not completion percentages.
- **Focused work:** selecting a work item brings it into readable view and
  reveals its full title, identity, group/priority, and existing source links.
  Zoom reveals existing information; it does not fetch new story or plan facts
  in the first story. Keep the containing stage apparent and provide a clear
  route back to the overview.

When zoom is introduced, include named Zoom in, Zoom out, and Fit overview
controls, with bounded zoom and pan so work cannot be lost indefinitely
offscreen. Provide pointer pan on
the background and a keyboard-equivalent way to reach offscreen work; keyboard
focus brings a work card into view. Focused reading and Fit overview must also
work on touch screens without precise gestures. Preserve browser page zoom and
normal page scrolling; gestures may supplement, not replace, explicit controls.
Do not require a minimap, physics simulation, freely draggable cards, or custom
graph editor. Panning changes the view, never backlog order or membership.

Illustrative compact overview; placeholders are not observed project data:

```text
┌──────────────── pinned viewport-top banner ──────────────┐
│ ▸ <selected project> [Open Dough] [Doughnut] [Pygardon] [↻] │
└──────────────────────────────────────────────────────────┘
▸ Near-future direction                                [?]

┌──────────────────── connected stage ──────────────────────┐
│  BACKLOG                         TAKEN                    │
│  ┌──────────────────┐            ┌───────────────────┐    │
│  │ 1 · <work card>  │ ── take ─▶ │ <work card>       │    │
│  │ 2 · <work card>  │            │ <work card>       │    │
│  │ …               │            │                   │    │
│  └──────────────────┘            └───────────────────┘    │
└──────────────────────────────────────────────────────────┘

Each work card → readable title, identity, stage/priority, source links
```

Do not hide already-readable entry information just to create a zoom interaction.
The first story can use ordinary layout, wrapping, and scrolling; if a small
focus or fit control materially helps, add it within that reading journey.
Do not prebuild a viewport framework for future feature or structural views.

As later stories deliver richer evidence, focused work can expose purpose,
assignment/mode, independent refinement/planning facts, and named slices with
completion evidence. Source revision and uncertainty stay attached to each
fact. A readable anchored panel is an option for dense detail; it complements
the stage rather than replacing spatial navigation with a list-and-detail app.
Stories outside the backlog must become reachable when their discovery is in
scope. Search or filtering can follow actual navigation needs.
