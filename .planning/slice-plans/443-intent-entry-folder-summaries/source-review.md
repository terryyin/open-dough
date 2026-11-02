# Source review — SEED-217#intent-entry-folder-summaries

## Launch and input

- Reviewer: fresh general-purpose agent `441a1ec7-bcfa-47f6-b6c4-926681141cd2`
- Input: revised story section only (SEED-217#intent-entry-folder-summaries after Terry follow-up at `272f7c29`), including Goal, Scope, key examples, exclusions, and UI
- Constraints: use only those inputs; read no other project files; change nothing; derive promises not slice ownership
- Returned: numbered commitments 1–76, qualifications Q1–Q6, journey examples E1–E20, exclusions X1–X7

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Developers reviewing project intent can see how a whole configured location stands (statistics and summarized Proof) without opening every file. | slice 2 |  |
| 2 | Developers reviewing project intent can see how a whole folder of tests stands (statistics and summarized Proof) without opening every file. | slice 2 |  |
| 3 | Developers can select folders for review while still controlling which folders are open. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts folder caret vs name steps; selection independent of expansion |
| 4 | In Intent's file browser, selecting a configured location's name shows that location's summary page. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts closed location name → Summary with path |
| 5 | A folder inside a configured location can be selected to show the folder's summary page. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries-folders.spec.ts jobs/reports folder name → Summary |
| 6 | Locations and folders use the same separate caret and name controls. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts location+folder caret/name controls; IntentLocationGroup + StoryReviewFileTree |
| 7 | Opening or closing the tree with a caret preserves the current selection and reader. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries-folders.spec.ts E10 caret preserves Purpose/Proof; keyboard caret keeps Summary |
| 8 | A summary gives the selection's statistics. | slice 2 |  |
| 9 | A summary gives the selection's Proof summarized across every contained test. | slice 2 |  |
| 10 | Missing evidence is kept explicit in a summary. | slice 2 |  |
| 11 | A developer can see where intent is unproven or failing before drilling into a file. | slice 2 |  |
| 12 | A caret toggles its location or folder open or closed without changing the selection or reader. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts+dashboard/tests/intent-entry-folder-summaries-folders.spec.ts location/folder caret toggles without moving selection/reader |
| 13 | Clicking an unselected name selects that location or folder. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts unselected location/folder name selects |
| 14 | Clicking an unselected name shows that location or folder's summary page. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts unselected name shows Summary |
| 15 | Clicking an unselected name keeps that location or folder's open or closed state. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts closed packaged name stays collapsed; open jobs stays open |
| 16 | Clicking the selected name toggles it open or closed. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts+dashboard/tests/intent-entry-folder-summaries-folders.spec.ts selected location/folder name toggles expansion |
| 17 | Clicking the selected name keeps the selection and summary. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts+dashboard/tests/intent-entry-folder-summaries-folders.spec.ts selected name keeps Summary |
| 18 | Locations allow only one open at a time: opening one closes the previous one without moving selection. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts selected-name open closes other location; groups exclusive expand |
| 19 | Selecting a closed location's name leaves it closed. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts closed location name select leaves aria-expanded=false |
| 20 | Selecting a closed location's name leaves any other open location open. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts closed name select leaves other location open |
| 21 | Both caret and name controls are reachable from the keyboard. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries-folders.spec.ts keyboard step focuses caret and name |
| 22 | Both caret and name controls are operable from the keyboard. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries-folders.spec.ts Enter/Space on caret and name |
| 23 | The selected location or folder reads as selected the way a selected file does. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts aria-pressed on selected location/folder name |
| 24 | Collapsing a location by caret keeps a selected file's Purpose and Proof. | slice 1 | observed: dashboard/tests/intent-gherkin-groups.spec.ts select file, collapse its group: Purpose keeps it; dashboard/tests/intent-entry-folder-summaries.spec.ts collapse via caret |
| 25 | Opening another location by caret keeps a selected file's Purpose and Proof. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries-folders.spec.ts E10 packaged caret while file selected: Purpose/Proof stay |
| 26 | Review changes, which shares the folder rows, keeps its folders as disclosures only. | slice 1 | observed: dashboard/tests/story-review-tree-collapse.spec.ts + story-review-tree.spec.ts button.story-review-folder disclosure only |
| 27 | A location, a folder, and a file share Intent's one selection. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts location/folder/file selection mutual; intentWorkspaceSelection scope |
| 28 | Selecting a location, folder, or file replaces the others' selection. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts selecting folder clears location pressed; file clears folder |
| 29 | Selecting a file shows Purpose and Proof exactly as today. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries-folders.spec.ts+dashboard/tests/intent-gherkin-groups.spec.ts file Purpose and Proof; keep-Purpose |
| 30 | The summary page names the selected location or folder by path. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts Summary contains selection path |
| 31 | Statistics show how many matching files the selection holds. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts Summary file counts 3/4/2/1 files |
| 32 | For Gherkin, statistics show how many scenarios those files run. | slice 2 |  |
| 33 | For Gherkin, statistics show how many outline rows those files run. | slice 2 |  |
| 34 | Scenario and outline-row counts are read from each file's published text as the file Proof already reads them. | slice 2 |  |
| 35 | The file count covers every matching file. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts Summary file count matches fixture inventory |
| 36 | While any contained file is still being read, scenario totals are explicitly labelled Partial. | slice 2 |  |
| 37 | While any contained file could not be read, scenario totals are explicitly labelled Partial. | slice 2 |  |
| 38 | Partial scenario totals say how many files contributed out of that file count. | slice 2 |  |
| 39 | Unknown scenarios are not presented as a complete total. | slice 2 |  |
| 40 | Unknown scenarios are not presented as zero. | slice 2 |  |
| 41 | Summarized Proof (Gherkin with declared proof) shows one count line of the latest outcomes over every scenario and outline row the selection contains. | slice 2 |  |
| 42 | That count line uses the file Proof's categories and order. | slice 2 |  |
| 43 | Rows never observed are counted as Not observed. | slice 2 |  |
| 44 | Summarized Proof then lists each immediate subfolder with its own scenario count and count line. | slice 2 |  |
| 45 | Summarized Proof then lists each immediate file with its own scenario count and count line. | slice 2 |  |
| 46 | Immediate-child rows appear in the browser's order. | slice 2 |  |
| 47 | The summary lets the reader see where failures and unobserved scenarios are. | slice 2 |  |
| 48 | A summary is never a suite verdict: a summary where some rows are unobserved or not passing must not read as validated. | slice 2 |  |
| 49 | Proof count lines say Partial with their contributing file count whenever any contained file is pending or unread. | slice 2 |  |
| 50 | The Partial Proof-count-line rule applies to the selection. | slice 2 |  |
| 51 | The Partial Proof-count-line rule applies to each affected immediate-child row. | slice 2 |  |
| 52 | Fully read children can show complete totals even while their parent is partial. | slice 2 |  |
| 53 | Without declared proof, the summary keeps the statistics it can give. | slice 2 |  |
| 54 | For a non-Gherkin kind, the summary keeps the statistics it can give. | slice 1 | observed: dashboard/tests/intent-entry-folder-summary-explanations.spec.ts typescript location: file count + Gherkin-only Proof wording |
| 55 | For an unusable location, the summary keeps the statistics it can give. | slice 1 | observed: dashboard/tests/intent-gherkin-unusable.spec.ts commitment 55/57 name→Summary for no_such_dir/empty_features/frontend/src/scripts |
| 56 | For a proof read failure, the summary keeps the statistics it can give. | slice 1 | observed: dashboard/tests/intent-entry-folder-summary-explanations.spec.ts commitments 56/58: Summary keeps files with unreadable proof |
| 57 | In those cases, the summary says why Proof is absent with the same explanations that file Proof uses. | slice 1 | observed: dashboard/tests/intent-entry-folder-summary-explanations.spec.ts NotRecorded + dashboard/tests/intent-gherkin-unusable.spec.ts location explanations + ProofProblem |
| 58 | In those cases, the summary offers the same retry that file Proof uses. | slice 1 | observed: dashboard/tests/intent-entry-folder-summary-explanations.spec.ts commitments 56/58 Retry button |
| 59 | A summary needs the published text of every Gherkin file it contains. | slice 2 |  |
| 60 | While those files are read, the summary says how many of how many files are read. | slice 2 |  |
| 61 | A file that could not be read is named. | slice 2 |  |
| 62 | A retry for unread/failed files reads only the failed files. | slice 2 |  |
| 63 | A file that could not be read is never counted as passed. | slice 2 |  |
| 64 | A file that could not be read is never counted as unobserved scenarios. | slice 2 |  |
| 65 | A successful retry replaces partial totals with complete totals only when every contained file has been read. | slice 2 |  |
| 66 | When a nonempty selection has no readable files, its scenario total is unavailable, not zero. | slice 2 |  |
| 67 | Each read goes through the existing authenticated read boundary at the observed revision. | slice 2 |  |
| 68 | Each such read is retained like any other pinned contents read. | slice 2 |  |
| 69 | GitHub requests states the added cost. | slice 2 |  |
| 70 | Every location and folder row has a caret disclosure control (expanded state). | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts location/folder caret aria-expanded controls |
| 71 | Every location and folder row has a selectable name control (pressed when selected). | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts location/folder name aria-pressed controls |
| 72 | Caret clicks only change expansion. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts caret clicks preserve Summary/Purpose |
| 73 | Unselected-name clicks only select. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts unselected name selects without expanding |
| 74 | Selected-name clicks toggle expansion while keeping selection. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts selected name toggles expansion keeping selection |
| 75 | The summary replaces Purpose and Proof in the reading pane for a location or folder selection. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts Summary replaces Purpose; E11 Purpose count 0 |
| 76 | A folder has no Purpose source of its own. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts folder Summary has no Purpose region |
| Q1 | This story is the first increment of the North Star's hierarchical Proof report (Runtime proof and hierarchy). | slice 2 |  |
| Q2 | Summarized Proof as specified applies to Gherkin with declared proof. | slice 2 |  |
| Q3 | Missing evidence kept explicit is a North Star alignment for partial parent vs complete fully-read children. | slice 2 |  |
| Q4 | The partial-statistics rule also applies to Gherkin locations without declared proof. | slice 2 |  |
| Q5 | Absent-Proof explanations and retry match those file Proof already uses (alternatives covered: without declared proof \\| non-Gherkin kind \\| unusable location \\| proof read failure). | slice 1 | observed: dashboard/tests/intent-entry-folder-summary-explanations.spec.ts NotRecorded/ProofProblem + dashboard/tests/intent-gherkin-unusable.spec.ts locationExplanation |
| Q6 | Scope limits below are deferred promises, not rejections. | slice 1 | observed: SEED-217 Scope limits (deferred promises, not rejections); dispositions X1–X7 |
| E1 | Pygardon's Intent, nothing selected and all locations closed: click the e2e_test/features name → it stays closed and its summary appears: 41 files, their scenario and outline-row total, one count line such as N scenarios: … passed, … failed, … not observed, then a row for jobs and for each top-level .feature file with its own count line. | slice 2 |  |
| E2 | From that selected closed location: click the location's caret → it opens and keeps that summary selected. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts location caret opens keeping Summary selected |
| E3 | Click the selected location name → it closes and keeps the summary; click the name again → it opens and keeps the summary. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries.spec.ts selected location name toggles keeping Summary |
| E4 | Click the jobs folder's caret → it closes; the location summary stays selected. Click the caret again → it opens. Selection never moves. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries-folders.spec.ts jobs folder caret toggles; location Summary stays |
| E5 | Click the unselected jobs name while it is open → it becomes selected, stays open, and the summary shows only the files under jobs. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries-folders.spec.ts unselected jobs name selects open folder Summary |
| E6 | With jobs selected: click the jobs name again → it closes, stays selected, the summary stays; click again → it opens. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries-folders.spec.ts selected jobs name toggles keeping Summary |
| E7 | With jobs selected, click jobs/stooq_refresh.feature → the file is selected and Purpose and Proof show it as today; jobs is no longer selected. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries-folders.spec.ts file select shows Purpose/Proof; folder not pressed |
| E8 | Select a different folder → the selection and summary move to it. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries-folders.spec.ts E8 reports folder name moves Summary |
| E9 | With jobs/stooq_refresh.feature selected, click the open e2e_test/features caret → the location closes and the file's Purpose and Proof stay. | slice 1 | observed: dashboard/tests/intent-gherkin-groups.spec.ts collapse keeps Purpose; dashboard/tests/intent-entry-folder-summaries.spec.ts caret collapse with file |
| E10 | Open a different location by caret → the file remains selected and readable. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries-folders.spec.ts E10 packaged caret keeps Stooq Purpose/Proof |
| E11 | With a file selected and another location open, click the closed e2e_test/features name → its summary replaces the file's Purpose and Proof, it stays closed, and the other location stays open. | slice 1 | observed: dashboard/tests/intent-entry-folder-summaries-folders.spec.ts E11 closed features name → Summary; packaged stays open |
| E12 | A folder where two scenarios were observed passing and three never observed: the count line says 5 scenarios: 2 passed, 3 not observed, not a passing summary. | slice 2 |  |
| E13 | A folder contains 9 files; while only 8 have been read, its scenario total and Proof count line say Partial and 23 scenarios across 8 of 9 files, with the remaining file shown as reading. | slice 2 |  |
| E14 | If that remaining file cannot be read, the labels stay partial, say 1 file unread, and name it with retry. | slice 2 |  |
| E15 | That unread file's affected child row is also partial; fully read sibling rows remain complete. | slice 2 |  |
| E16 | Retry reads only that file; after success, totals include its scenarios and the partial labels disappear. | slice 2 |  |
| E17 | A nonempty folder with no readable files says its scenario total is unavailable, not 0 scenarios. | slice 2 |  |
| E18 | Doughnut's e2e_test/features (Gherkin, no proof declared): the summary gives file and scenario counts and says Proof is not recorded, naming the reference, as file Proof does. | slice 2 |  |
| E19 | Open Dough's dashboard/tests (typescript): the summary gives its file count and says Intent reads Proof only for Gherkin feature files so far. | slice 1 | observed: dashboard/tests/intent-entry-folder-summary-explanations.spec.ts typescript dashboard/tests Summary |
| E20 | Review changes: clicking a folder row there still only opens or closes it. | slice 1 | observed: dashboard/tests/story-review-tree-collapse.spec.ts folder disclosure only |
| X1 | Durations or run times in a summary. |  | X1 |
| X2 | Counting tests for non-Gherkin kinds. |  | X2 |
| X3 | Proof for non-Gherkin kinds. |  | X3 |
| X4 | Opening a child from a summary row. |  | X4 |
| X5 | Keeping the selection on the URL. |  | X5 |
| X6 | A project-wide summary above all locations. |  | X6 |
| X7 | Observed-on-earlier-file-version counts in a summary. |  | X7 |
