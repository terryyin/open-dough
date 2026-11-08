---
id: SEED-275
status: active
planted: 2026-11-08
scope: story
---

# Review a selected story in Intent tabs

<a id="story-intent-tabs"></a>

### Review a selected story in Intent tabs

**Identity:** SEED-275#story-intent-tabs
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-275#story-intent-tabs","dependencies":[{"supplier":{"identity":"SEED-271#compact-intent-sidebar","href":"seeds/SEED-271-compact-intent-sidebar.md#compact-intent-sidebar"},"implementation":"Reuse the delivered sidebar visibility control and kept reading state when moving Hide files and Show files into the Changed tests tab row. Carry the compact outside-locations action into the persistent story header.","rationale":"The active supplier owns implementation and proof for the same sidebar visibility control and reading place. Shared design does not supply that verified behavior. Waiting for delivery lets the new story compose the existing sidebar contract once and keeps concurrent work from implementing the same behavior or its title fallback twice.","condition":"The sidebar story is complete and accepted on trunk with the shared keyboard-operable Hide files and Show files control, restored reading state, full-width location headers, and compact outside-locations action.","state":"satisfied","resolution":{"revision":"1609b010d377eb7fda82067149aa5eef470f3b3d","path":".planning/seeds/SEED-271-compact-intent-sidebar.md#compact-intent-sidebar","summary":"Accepted on trunk at afac3936 (CI success on 1609b010, run 42469376466). Delivered: the shared FileBrowserToggle (dashboard/src/FileBrowserToggle.tsx) as Intent's keyboard-operable Hide files / Show files with aria-expanded, the choice kept in useKeptReading('filesShown') with the column hidden not unmounted so selection, open folders, Selected story only, disclosure and tree scroll return (intent-sidebar-toggle.spec.ts); full-width bold location headers (intent-gherkin-groups, intent-story-changes, intent-story-ci-cues header assertions); and the compact icon-and-count outside-locations action on the summary title line (expectOutsideCount in intent-story-changes specs). No mode-bar story-title fallback was built, per the amendment that moved the persistent header to this consumer.\nCondition satisfied: The sidebar story is complete and accepted on trunk with the shared keyboard-operable Hide files and Show files control, restored reading state, full-width location headers, and compact outside-locations action.\nAccepted integration: afac3936fc8869689142871d05ac94faa3f8ddd2 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer reviewing a selected story can read its CI comparison
immediately, browse its changed tests, and find its Intent Coverage report
from the same story header. Each destination has room for its own evidence.
Project-wide optimization candidates have a separate entry in Intent.

**Design reference.** Implement the approved interactive mockup with high
fidelity. Use its hierarchy, spacing, tabs, and CI timing treatment as the
visual target. The story and build figures in the preview are examples.
[Approved Story tabs mockup](SEED-275-story-intent-tabs/intent-story-tabs.html)

**Scope.**

- Give the selected story one persistent, non-collapsible header above
  **CI comparison**, **Changed tests**, and **Intent coverage**, in that order.
  **CI comparison** opens on story selection. Put the compact outside-locations
  count with the story title and preserve its Review changes action. The tabs
  are the story destinations. The header stays visible when files are hidden.
- Render the existing story CI summary, build endpoint table, and sortable
  entry timing table directly in **CI comparison**. Keep the existing build
  selection, proof and comparison states, counts, attribution context, and
  recovery actions. Keep measured wall time and CI time without runner waits in
  the build table. Show a single signed time delta in the summary and in the
  Branch and Landed comparison cells, with measured Baseline time in its own
  column. The comparison cells sort by the displayed delta. New entries show
  their measured time, and entries with missing timing evidence retain the
  applicable unavailable state.
- Show relative change with a small diverging bar on a common scale across the
  comparison. Faster extends left and slower right from a visible zero mark.
  Keep the signed time delta readable independently of color. **Show %** starts
  off and reveals the numeric percentages together. Handle zero change and an
  absent or zero baseline without implying a percentage where none can be
  calculated. The shared scale must also represent changes larger than the
  sample values.
- Put **Hide files** / **Show files** at the trailing end of the story tab
  row, scoped to **Changed tests**. Reuse the delivered sidebar toggle and
  kept reading state. Preserve file and folder selection, open folders, the
  story filter, Purpose and Proof, and the restored sidebar scroll. Keep
  controls reachable at narrow widths and by keyboard.
- Give saved **Intent coverage** its own reading pane. Show the full stored
  report as text and keep an unavailable reason distinguishable from an older
  completion with no saved assessment. For a story still in progress, explain
  that the assessment runs during feature story wrap-up. Changes to report
  generation or report formatting belong to a later story.
- Put **Optimization Candidates** in **Project Intent**, alongside the
  project's CI status. Preserve the candidate's route to its test and back.
  Keep project test browsing available, with project CI status as the landing
  when no story is selected. Returning to the selected story restores the
  prior tab and reading place.

**Key examples.**

- Select a completed story with CI proof. Its title appears once. The first
  tab immediately shows the CI summary, endpoint table, and sortable entry
  table. An entry with a baseline of 4 minutes and a branch duration of
  4 minutes 30 seconds shows `4 min` in Baseline and `+30 s` with a rightward
  mark in Branch. **Show %** adds `+13%` at the existing display precision.
  A 2-minute entry that lands at 1 minute shows `−1 min` with a longer
  leftward mark. A new entry with 30 seconds of execution time shows `30 s`
  without a change mark. The build table still shows its measured durations.
- Open a changed test, switch to Proof, and hide the files. The reader takes
  the available width and the same story header stays above it. Visit
  **Intent coverage** and return to **Changed tests**. **Show files** restores
  the selected test, Proof, open folders, and scroll. There is no second story
  title in the mode bar.
- A completed story with a saved report exposes it directly under **Intent
  coverage**. A completion with an unavailable reason shows that reason and a
  legacy completion with no assessment shows that state. A comparison that is
  pending, unavailable, or using provisional proof keeps its existing meaning
  on the default tab.
- From a selected story, open **Project Intent**, inspect an optimization
  candidate and its test, and go back. The project view is labeled separately
  and returning to the story restores the tab and reading position.

**Visual acceptance.** Compare the implementation against the approved mockup
in light and dark themes at desktop and narrow widths. Review the default CI
tab with percentages off and on, the file pane with the sidebar shown and
hidden, and the coverage tab. Verify keyboard navigation and state restoration
through the dashboard's normal entry points.
