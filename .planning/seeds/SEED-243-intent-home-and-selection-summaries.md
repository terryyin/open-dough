---
id: SEED-243
status: active
planted: 2026-11-05
planted_during: Terry Yin's request to improve Intent's homepage, navigation, and entry and folder summaries
trigger_when: A developer reviews CI proof on Intent's homepage or selects an Intent entry, folder, or test file
scope: story
---

# SEED-243: Improve Intent home and selection summaries

<a id="improve-intent-home-and-selection-summaries"></a>

### Improve Intent home and selection summaries

**Identity:** SEED-243#improve-intent-home-and-selection-summaries
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary and goal.** A developer reviewing product intent can compare
entries and their CI proof in tables, drill into entry and folder summaries
that include running time, and return to Intent's CI status homepage by
clicking the Intent tab again.

**Requested behavior.**

- **Homepage proof table.** Keep the Proof section and its existing CI wall
  time. Show the Intent entries currently listed beneath it as a table, with
  each entry's name/path, proof counts, test execution time, and completeness
  or gaps readable in aligned columns.
- **Return home through Intent.** Remove the **Return to CI status** button
  when an entry/section, folder, or test file is selected. Clicking the
  **Intent** reading tab again clears any selected entry, folder, or file and
  shows CI status, which is Intent's homepage. This also works when Intent
  is already the active tab. Clearing the browsing selection does not clear
  the selected story that determines which branch's CI status is shown.
- **Entry summary.** Selecting an Intent entry (the configured location or
  section) shows its overall/root summary, including running time, in the
  same style as the CI homepage's summaries. Also show a table of summaries
  for its immediate subfolders so the developer can compare them and drill
  down. Files directly in the entry remain visible and selectable.
- **Folder summary.** Selecting a folder shows that folder's summary,
  including running time, and a similar table with one summary row for every
  immediate child file and folder. A child folder's row summarizes that
  folder's contents; deeper descendants appear after drilling into it,
  rather than flattening the whole subtree into this table.
- **Consistent proof meaning.** Use the CI homepage's proof vocabulary and
  timing semantics for these summaries. Keep the run's CI wall time distinct
  from cumulative test execution time. Identify unavailable or partial proof
  and timing rather than treating missing evidence as zero or complete.
  Entry and folder rows must describe the selected scope and name the CI
  evidence they summarize.
- **Drill-down.** Child names in summary tables select the corresponding
  folder or file, retaining the existing tree navigation and file reading.

**Key examples.**

1. Open Intent with nothing selected. CI status is the homepage; its Proof
   section still shows CI wall time. Several Intent entries appear as table
   rows with comparable counts, execution time, and proof completeness.
2. Select an entry such as `dashboard/tests`. Its overall summary includes
   running time, and its immediate subfolder summaries appear in a table.
   Files directly in `dashboard/tests` can still be opened.
3. Select a folder containing two files and a nested folder. Its own summary
   includes running time, and the table lists those three immediate children
   with their summaries. Selecting the nested folder shows its own immediate
   children; selecting a file opens that file's reading.
4. With an entry, a nested folder, or a test file selected, there is no
   **Return to CI status** button. Click the already-active **Intent** tab:
   the browsing selection clears and the CI status homepage returns. A
   selected story continues to determine the judged branch.
5. A folder has no recorded timing, or some of its CI evidence is missing.
   Its summary explains that absence or incompleteness consistently with
   the homepage, without showing an invented zero or a complete result.

**Refinement context.** The existing homepage proof has entry-level CI
summaries. Determine during refinement which maintained CI evidence can
supply the requested folder/file breakdowns and how to obtain any missing
granularity. The requested outcome is CI-backed summaries; this does not
request restoring the removed local-proof feature. Reconcile navigation with
the in-progress
[Intent loading and reading-state story](SEED-241-intent-loading-and-traffic.md#load-intent-without-disruption-or-bulk-source-transfer):
an explicit click on Intent returns home, while background observations
should retain the reading place. Shared files alone establish no blocking
story dependency.

**Priority and scope.** Terry requested this as the first queued backlog
item, captured directly on `main` and synchronized with `origin`.
Implementation planning and UI changes are future work under this story.
