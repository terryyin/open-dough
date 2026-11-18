# Source review

Launch: one fresh general-purpose reviewer on 2026-11-18, without conversation
inheritance, given only the selected story's heading, Goal, Scope, Scope
limits, Key examples and Architecture, told to read no project file and change
nothing. Its return numbered P1–P21; the returned source text is retained per
row.

Unnumbered source context as returned: the reasons for 12rem and 18rem; ADR
0008 for one name per control and disposable browser storage; the reuse of the
shared divider, room calculation and kept preferences, with a leading-side area
and a 16rem default as the new cases; no server state; why the divider always
has a range; the scope limits (no height divider, Intent's locations column
keeps its width, no cross-browser sharing, fitting deferred, no wrapping or
shortening); the long-file-name framing. The reviewer noted as ambiguous: the
step size; what makes a kept value unusable versus clamped; the stacking width
as a number; the Panel divider's usage wording; that P15 is visible only in
storage; whether a no-effect key at a bound or a room-limited drag stores a
preference; and treated Goal and Scope's "every review" as one promise (P11).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P1 | While the file sidebar and the diff sit side by side, a divider appears between them. Scope: Files divider; Key example: Drag. | slice 2 |observed: dashboard/frontend-tests/review/story-review-files-divider.spec.ts first step (separator present, sideBySide measured) |
| P2 | Dragging the divider changes both widths as the pointer moves; the sidebar widens and the diff narrows by the same amount. Scope: Files divider; Key example: Drag. | slice 2 |observed: dashboard/frontend-tests/review/story-review-files-divider.spec.ts "dragging rightward widens the sidebar and narrows the diff by the same width" |
| P3 | The divider takes keyboard focus, and Right makes the sidebar one step wider. Scope: Files divider; Key example: Keyboard; Architecture. | slice 2 |observed: dashboard/frontend-tests/review/story-review-files-divider.spec.ts "Right widens it one step and Left narrows it back" |
| P4 | Left makes the sidebar one step narrower, returning it to its width before Right. Scope: Files divider; Key example: Keyboard. | slice 2 |observed: dashboard/frontend-tests/review/story-review-files-divider.spec.ts "Right widens it one step and Left narrows it back" |
| P5 | The divider's accessible name is "Files divider", which no other control uses. Scope: Files divider (ADR 0008). | slice 2 |observed: dashboard/frontend-tests/review/story-review-files-divider.spec.ts first step (one separator named Files divider) |
| P6 | The divider reports the sidebar's current width and bounds, and updates after a change. Scope: Files divider; Key examples: Keyboard, More room from the panel. | slice 2 |observed: dashboard/frontend-tests/review/story-review-files-divider.spec.ts first step and showsSidebarWidth (aria-valuenow, -valuemin, -valuemax, -valuetext) |
| P7 | The divider explains how to use it, the same way the Panel divider does. Scope: Files divider. | slice 2 |observed: dashboard/frontend-tests/review/story-review-files-divider.spec.ts first step (title in the Panel divider's form) |
| P8 | The sidebar is never narrower than 12rem, whether dragged, keyed or preferred. Scope: Both panes stay usable; Key example: Bounds. | slice 2 |observed: dashboard/frontend-tests/review/story-review-files-divider.spec.ts "neither pane goes below its minimum" (drag and Left at 12rem) |
| P9 | The diff is never narrower than 18rem; the sidebar's upper limit is where the diff reaches it, under drag, key or preference. Scope: Both panes stay usable; Key example: Bounds. | slice 2 |observed: dashboard/frontend-tests/review/story-review-files-divider.spec.ts "neither pane goes below its minimum" (drag and Right at the maximum, diff at the room less it) |
| P10 | Widening or maximizing the Side panel raises the divider's upper bound, so the sidebar can be dragged wider. Scope: Both panes stay usable; Key example: More room from the panel. | slice 3 | |
| P11 | A chosen width is kept for every later review in the same browser, after closing and opening another story's or session's review. Scope: One preferred width; Key example: Drag; Goal. | slice 2 |observed: dashboard/frontend-tests/review/story-review-files-divider-kept.spec.ts "another story's review opens at the chosen width" |
| P12 | A chosen width survives a page reload. Scope: One preferred width; Key example: Reload. | slice 2 |observed: dashboard/frontend-tests/review/story-review-files-divider-kept.spec.ts "a reload keeps the chosen width" |
| P13 | With no kept preference, the sidebar opens at 16rem. Scope: One preferred width; Key example: No choice yet; Architecture. | slice 2 |observed: dashboard/frontend-tests/review/story-review-files-divider-kept.spec.ts opening at 16rem with nothing kept |
| P14 | With an unusable kept preference, the sidebar falls back to 16rem. Scope: One preferred width. | slice 3 | |
| P15 | Nothing is stored until the reviewer chooses a width; opening a review writes no preference. Architecture; Scope: One preferred width. | slice 2 |observed: dashboard/frontend-tests/review/story-review-files-divider-kept.spec.ts and dashboard/frontend-tests/review/story-review-files-divider.spec.ts first step (kept width null after opening) |
| P16 | When the room cannot fit the preferred width, the sidebar shows as wide as the diff's minimum allows, both panes usable. Scope: A limit the room sets; Key example: Temporary limit. | slice 3 | |
| P17 | A room limit does not change the stored preference; more room brings the preferred width back without choosing again. Scope: A limit the room sets; Key example: Temporary limit. | slice 3 | |
| P18 | When the review body is too narrow for both panes, files sit above the diff at today's stacking width, with no width divider. Scope; Key example: Narrow panel; Architecture. | slice 3 | |
| P19 | Widening out of the stacked layout brings the divider back with the sidebar at the preferred width. Key example: Narrow panel. | slice 3 | |
| P20 | While the sidebar is hidden, the diff takes the whole width and there is no divider. Scope: Files divider; Key example: Hidden sidebar. | slice 2 |observed: dashboard/frontend-tests/review/story-review-files-divider.spec.ts "hiding the files removes the divider…" (no divider, diff spans the work area) |
| P21 | Showing the files again restores the sidebar and the divider at the preferred width. Scope; Key example: Hidden sidebar. | slice 2 |observed: dashboard/frontend-tests/review/story-review-files-divider.spec.ts "…showing returns both at the chosen width" |
