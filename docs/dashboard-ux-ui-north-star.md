# Dashboard UX/UI North Star

Temporary interface direction that is not implemented yet. Shipped Board,
launch, session, and Intent behavior lives in the dashboard's code and tests.

[Accepted ADR 0008](adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
defines the dashboard domain and architectural boundaries. This page cannot
override it.

Still ahead:

- Zoom and a movable viewport, in
  [Dashboard spatial-reading direction](dashboard-spatial-reading.md).
- Whether **Start session** stays in Development or becomes a project-level
  action visible across perspectives.
- The Structure perspective. It is deferred; its later interface is separate
  design work.

## Review in Intent

**Review changes** opens Intent at the selected story's cumulative diff.

- **Scope.** The banner bookmark is the one scope chooser. Its menu offers
  **Whole project** to clear the story and recent stories to select. On
  mobile, only the bookmark icon occupies the banner. Its accessible name
  identifies the selection. The [Board interaction](dashboard-board-interaction.md#touch-browsing-and-selection)
  defines when a click first reveals an offscreen selection.
- **Sessions and Compare.** A story opens as a whole. Choose individual
  refinements, execution sessions or follow-ups, including several together.
  **All changes** reads their net contribution. **Landed runs** uses captured
  landings, grouped under the same sessions picker. Explain a missing or
  inseparable comparison in place.
  In Story Branch Mode, **Include merged changes** widens the comparison to
  include incoming trunk changes. With it off, retain the branch's own merge
  edits and flag mixed resolutions. Direct trunk work uses its recorded ranges.
- **Files.** A toolbar button shows or hides the file sidebar. The first
  sidebar row holds the **Home** icon, **Intent only**, and **Changes only**,
  in that order, together on mobile. Intent only shows the configured Intent
  locations and their tests. Changes only shows paths changed in the active
  comparison. Both on shows their intersection, both off the repository
  inventory at the selected revision, including comparison paths for deletions
  and renames. Tree and folder file lists use the same filters.
- **Home and Proof.** Home returns to the existing project CI overview or the
  selected story's overview with its comparison and sessions intact. File
  filters affect browsing. A failing unchanged test still appears in overview
  proof. Opening a file's Proof and returning to its diff restores the path,
  line and comparison. Code and CI can have different evidence available:
  name the measured build, and explain a missing matching baseline.

Open choices that are not interface direction stay in
[project visibility requirements](project-visibility-requirements.md#questions-retained-for-later-design).
Delete a topic here once it is implemented.
