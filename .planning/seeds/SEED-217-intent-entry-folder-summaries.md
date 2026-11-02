---
id: SEED-217
status: active
planted: 2026-11-02
planted_during: Terry Yin's request for Intent entry and folder summaries
trigger_when: Developers open Intent or select folders in its file browser
scope: story
---

# Show summaries when selecting Intent entries and folders

<a id="intent-entry-folder-summaries"></a>

### Show summaries when selecting Intent entries and folders

**Identity:** SEED-217#intent-entry-folder-summaries
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/443-intent-entry-folder-summaries/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d2590342feae9888260b86c82ae9d4412de8d9de18e2ca5156933892483f61a9","plan":"ae64612f9290136e77a03a05f738f65037c74fac44421c84ffb2b0d27422dc01"}}
```

**For / why:** Developers reviewing project intent can see how a whole
configured location or folder of tests stands, its statistics and summarized
Proof, without opening every file, and can select folders for review while
still controlling which folders are open.

**Goal:** In Intent's file browser, clicking a configured location's entry (its
header, such as `e2e_test/features gherkin`) also shows that location's summary
page, and a folder inside it can be selected to show the folder's summary page.
A summary gives the selection's statistics and its Proof summarized across
every contained test, with missing evidence kept explicit, so a developer can
see where intent is unproven or failing before drilling into a file. This is
the first increment of the North Star's hierarchical Proof report
([Runtime proof and hierarchy](../../docs/dashboard-ux-ui-north-star.md#runtime-proof-and-hierarchy)).

**Scope:**

- **Location entry click.** Clicking a location's entry keeps toggling it open
  or closed as today, one location open at a time, and also selects the
  location and shows its summary page. Clicking the selected location's entry
  toggles it and keeps its selection and summary. This replaces today's
  behavior where collapsing a location, or opening another, keeps a selected
  file's Purpose: the clicked location's summary now replaces it.
- **Folder caret and row are separate controls.** A folder's caret toggles it
  open or closed without changing the selection. Clicking an unselected
  folder's row selects it, shows its summary page, and keeps its open or closed
  state. Clicking the selected folder's row toggles it open or closed and keeps
  the selection and summary. Both controls are reachable and operable from the
  keyboard, and the selected folder reads as selected the way a selected file
  does. Review changes, which shares the folder rows, keeps its folders as
  disclosures only.
- **One selection.** A location, a folder, and a file share Intent's one
  selection: selecting any of them replaces the others' selection. Selecting a
  file shows Purpose and Proof exactly as today.
- **Summary page.** Names the selected location or folder by path and shows:
  - **Statistics:** how many matching files it holds and, for Gherkin, how many
    scenarios and outline rows those files run, read from each file's
    published text as the file Proof already reads them.
  - **Summarized Proof** (Gherkin with declared proof): one count line of the
    latest outcomes over every scenario and outline row it contains, in the
    file Proof's categories and order, rows never observed counted as
    _Not observed_; then each immediate subfolder and file with its own
    scenario count and count line, in the browser's order, so the reader sees
    where failures and unobserved scenarios are. It is never a suite verdict:
    a summary where some rows are unobserved or not passing must not read as
    validated ([North Star](../../docs/dashboard-ux-ui-north-star.md#runtime-proof-and-hierarchy):
    missing evidence explicit).
  - Without declared proof, a non-Gherkin kind, an unusable location, or a
    proof read failure, the summary keeps the statistics it can give and says
    why Proof is absent with the same explanations, and the same retry, that
    file Proof uses.
- **Reading feedback.** A summary needs the published text of every Gherkin
  file it contains. While those are read it says how many of how many files are
  read; a file that could not be read is named, with a retry that reads only
  the failed files, and is never counted as passed or as unobserved
  scenarios. Each read goes through the existing authenticated read boundary at
  the observed revision and is retained like any other pinned contents read.
  [GitHub requests](../../dashboard/GITHUB-REQUESTS.md) states the added cost.

**Scope limits (deferred promises, not rejections):**

- Durations or run times in a summary (the North Star requires distinguishing
  run wall time from summed case durations first).
- Counting tests for non-Gherkin kinds, and Proof for them.
- Opening a child from a summary row, and keeping the selection on the URL.
- A project-wide summary above all locations.
- Observed-on-earlier-file-version counts in a summary.

**Key examples:**

- Pygardon's Intent, nothing selected: click the `e2e_test/features` entry. It
  opens and its summary appears: 41 files, their scenario and outline-row
  total, one count line such as "N scenarios: … passed, … failed, …
  not observed", then a row for `jobs` and for each top-level `.feature` file
  with its own count line.
- Click the `jobs` folder's caret: it closes; the location summary stays
  selected. Click the caret again: it opens. Selection never moves.
- Click the unselected `jobs` row while it is open: it becomes selected, stays
  open, and the summary shows only the files under `jobs`. Click the `jobs` row
  again: it closes, stays selected, the summary stays. Again: it opens.
- With `jobs` selected, click `jobs/stooq_refresh.feature`: the file is
  selected and Purpose and Proof show it as today; `jobs` is no longer
  selected.
- Select a different folder: the selection and summary move to it.
- `jobs/stooq_refresh.feature` selected, click the open `e2e_test/features`
  entry: the location closes and its summary replaces the file's Purpose and
  Proof.
- A folder where two scenarios were observed passing and three never observed:
  the count line says "5 scenarios: 2 passed, 3 not observed", not a passing
  summary.
- One of a folder's files cannot be read: the summary names that file with a
  retry and counts the rest; retry reads only that file.
- Doughnut's `e2e_test/features` (Gherkin, no proof declared): the summary gives
  file and scenario counts and says Proof is not recorded, naming the
  reference, as file Proof does.
- Open Dough's `dashboard/tests` (typescript): the summary gives its file count
  and says Intent reads Proof only for Gherkin feature files so far.
- Review changes: clicking a folder row there still only opens or closes it.

**UI:** The folder row becomes two controls: a caret disclosure (expanded
state) and a selectable name (pressed when selected). The location entry stays
one control that both toggles and selects. The summary replaces Purpose and
Proof in the reading pane for a location or folder selection; a folder has no
Purpose source of its own.

**Architecture:** No Accepted decision conflicts. Selection stays disposable
page state ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md));
the summary is derived from published text and committed proof at the observed
revision, never stored. Two consequences shape planning: Intent's selection
grows from a file path to a location, folder, or file, owned by the Intent
workspace selection; and the shared folder tree gains an opt-in selectable
folder that Review changes does not use. Reading a summary costs up to one
contents read per contained Gherkin file not already pinned (Pygardon's
largest location: 41; Doughnut's: 93), retained across reloads and unchanged
blobs, under the existing read boundary that refuses paths outside configured
locations.

**Request evidence:** Terry's 2026-11-02 request specifies Intent-entry summary
content and the separate caret, first-selection, and selected-folder click
behaviors.

**Priority:** Terry requested this as the first queued product-backlog item,
ahead of the separate Optimization Candidates tab story.
