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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/531-review-story-intent-tabs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a0853c3ca9dbcac21445c89c6facc54d92fc96709687109d01ae926241e28ed2","plan":"b945931d36e12f60cb1faafc6e3dffa0d462981570a2c458c874eae16f51ef27"}}
```

**Goal.** A developer reviewing a selected story can see the available CI
evidence first, then inspect the changed tests and the saved Intent Coverage
assessment without losing their place. A developer can also visit project CI
and optimization candidates and return to the same story evidence.

**Design reference.** Use the approved interactive mockup for the hierarchy,
spacing, tabs, and timing treatment. The sample story, build figures, and
report excerpt illustrate the interaction. Use the real evidence and states
described below.
[Approved Story tabs mockup](SEED-275-story-intent-tabs/intent-story-tabs.html)

**Scope.**

- Show one persistent, non-collapsible story header above **CI comparison**,
  **Changed tests**, and **Intent coverage**, in that order. Open **CI
  comparison** on a new story selection. Keep the header visible with the
  files hidden. When changes outside Intent locations are known, keep their
  compact count and **Review changes** action beside the title.
- Show the selected story's existing CI summary, build table, and sortable
  entry timing table directly. CI can appear while file locations are still
  loading or unavailable. Preserve the existing build selection, evidence
  sources, measured wall time and time without runner waits in the build
  table, counts, attribution context, provisional and missing evidence, and
  recovery actions.
- In the CI summary and in Branch and Landed entry cells, show one signed
  elapsed-time delta when both timings are measured. Keep the measured
  Baseline time in its own column. Sort Branch and Landed by their numeric
  delta, keeping entries without comparable timings after measured deltas.
  A new entry shows its measured time. Preserve the existing explanation
  when timing evidence is missing.
- Show the relative change with a visible zero mark and a shared scale across
  comparable timings. Faster extends left and slower right. Keep the elapsed
  delta readable independently of color. **Show %** starts off and reveals
  the numeric percentages together. Zero change stays at the center. An
  absent or zero baseline supplies no relative change. A measured zero
  baseline can still supply an elapsed delta. The shared scale accommodates
  values beyond those in the mockup.
- In **Changed tests**, put **Hide files** / **Show files** at the trailing end
  of the tab row and reuse the existing control and kept reading place.
  Preserve file and folder selection, open folders, **Selected story only**,
  Purpose and Proof, and scroll. Keep the tree and comparison recovery usable
  when the changes could not be read. Keep controls reachable at narrow
  widths and by keyboard. File Proof offers the mockup's direct return to
  **CI comparison**.
- Give **Intent coverage** its own reading pane. Show the full saved report
  as text. Distinguish a saved unavailable reason, a successfully read older
  completion without an assessment, and a completion whose record is still
  being read or could not be read. Keep the existing retry where available.
  For an unfinished story, explain that the assessment runs during feature
  story wrap-up. Report generation and formatting are deferred.
- Put **Optimization Candidates** alongside **CI status** in **Project
  Intent**. Project CI shows trunk proof even during a visit from a selected
  story. Preserve project test browsing and the candidate's route to its
  project test and back. With no story selected, project CI status is the
  landing. A visit to Project Intent preserves the selected story, its
  current tab, and its reading place. Use the dashboard's existing published
  revision and update behavior for project test browsing.

**Key examples.**

- Select a completed story with CI proof while locations are still reading.
  The title appears once and the default tab shows the comparison as soon
  as CI is available. An entry with a baseline of 4 minutes and a branch
  duration of 4 minutes 30 seconds shows `4 min` and `+30 s` with a rightward
  mark. **Show %** adds `+13%` at existing precision. A 2-minute entry that
  lands at 1 minute shows `−1 min` with a longer leftward mark. A new entry
  measured at 30 seconds shows `30 s` without a change mark. Sorting by a
  comparison column orders comparable entries by signed elapsed change.
  The build table still shows its measured durations.
- Open a changed test, switch to Proof, and hide the files. The reader uses
  the available width and the header stays above it. Visit **Intent coverage**
  and return to **Changed tests**. **Show files** restores the selected test,
  Proof, open folders, and scroll. Select another story and its CI comparison
  opens.
- A completed story with a saved assessment shows the whole report. A saved
  unavailable reason and an older completion without an assessment have
  different messages. A failed completion read offers its recovery without
  implying an assessment was never saved. An active story gives the wrap-up
  explanation. Pending or provisional CI remains recognizable on the default
  tab.
- From a story's file Proof, open **Project Intent**, inspect project CI
  and open a candidate's test that the selected story also changes. The test
  shows project-published content. Return to the same candidate and then to
  the selected story. Its tab, file, Proof, and reading position are restored.
  Clear the story selection and see project CI status.

**Architecture.** Keep the dashboard's one page-owned Selected story. A
visit to Project Intent changes the evidence and reading context while leaving
that selection intact. That lets the developer compare project and story
evidence without borrowing the story's diff or file selection for project
browsing. Keep both reading places as disposable page state and derive CI
and coverage from their existing published evidence. [ADR 0008 — Project
dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)

**Visual acceptance.** Compare the implementation against the mockup in the
light theme at desktop and narrow widths. The dashboard has no dark theme;
Terry deferred the dark comparison on 2026-11-08 to
[Give the dashboard a dark theme](SEED-277-dashboard-dark-theme.md#dashboard-dark-theme). Review the default CI tab with
percentages off and on, the file pane with the sidebar shown and hidden, and
the coverage tab. Verify keyboard navigation and state restoration through
the dashboard's normal entry points.

<a id="align-story-tabs-records"></a>

### Align story tab cost records, Taken heading, and wording

**Identity:** SEED-275#align-story-tabs-records
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/537-align-story-tabs-records/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"cf279f3766b9da423203912f24762da70a487805f0d565c0f59daf1c5f1eae48","plan":"2dbfcaf1fdc952e42bc91dd4016d003524f10c4967a36b4456899cd3ef4eafc9"}}
```

**Goal.** Maintainers and developers reading Intent's request-cost contract,
its tests, and a Taken story's CI tab get an accurate account of the delivered
story tabs. The correction is bounded to the retrospective findings for
SEED-275#story-intent-tabs.

**Scope.** Make the request docs state that hidden story and trunk CI stay
followed, and protect that cost with request counts in the Project Intent
visit journey. Stop a Taken story's CI status from repeating its title under the
persistent header. Correct stale homepage, segmented-strip, and Intent-tab
wording in the touched comments and test titles. Behavior other than the
Taken heading line is unchanged.
[Plan](../slice-plans/537-align-story-tabs-records/PLAN.md)
