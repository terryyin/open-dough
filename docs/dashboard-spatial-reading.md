# Dashboard spatial-reading direction

Unimplemented interface direction. Ordinary Board layout and scrolling are
already in the dashboard. This page keeps only the zoom and movable viewport
that are still ahead.

As density or richer evidence justifies zoom, support two useful levels of
reading from the same snapshot:

- **Whole Board:** fit the connected Columns, their names, and entry counts into
  view. Work remains visibly distributed across the Columns; compact cards or
  marks may stand in for full titles when fitting every title would be illegible.
  Counts describe recorded entries, not completion percentages.
- **Focused work:** selecting a work item brings it into readable view and
  reveals its full title, identity, group/priority, and existing source links.
  Zoom reveals existing information. Keep the containing Column apparent and
  provide a clear route back to the whole Board.

When zoom is introduced, include named Zoom in, Zoom out, and Fit Board
controls, with bounded zoom and pan so work cannot be lost indefinitely
offscreen. Provide pointer pan on the background and a keyboard-equivalent way
to reach offscreen work; keyboard focus brings a Story card into view. Focused
reading and Fit Board must also work on touch screens without precise gestures.
Preserve browser page zoom and native Board scrolling; gestures may supplement
explicit controls. Do not require a minimap, physics simulation, freely
draggable cards, or a custom graph editor. Panning changes the view, never
backlog order or membership.

A movable viewport is a later option when ordinary layout and scrolling stop
serving the work. When spatial navigation is introduced, animate viewport
movement when focusing work or returning to the whole Board, using short,
interruptible transitions. Honor reduced-motion preferences with immediate
placement. All meaning and navigation must remain available without animation.

Delete this page when that direction is implemented.
