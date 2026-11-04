# Development and Intent

Part of the [Dashboard navigation guidance](dashboard-navigation.md), under the
[Dashboard UX/UI North Star](dashboard-ux-ui-north-star.md). Its authority, scope,
and revision policy apply here.

Development is the first-visit default perspective: the stories or agent
roster, near-future direction, Start session and published-state
qualifications. Intent replaces that content with the project's Purpose and
Proof reading surface. When the selected project's
`.planning/open-dough.json` publishes `intent.locations` of kind `gherkin`,
Intent lists each location's nested `.feature` files in a collapsible tree,
whose folders start collapsed.
Locations and folders share separate toggle and name controls: a toggle, shown
as an open or closed folder icon, opens or closes expansion without changing the selection or the reading pane (Purpose, Proof,
or summary); clicking an unselected name selects that location or folder and
shows its summary without changing expansion; clicking the selected name
toggles expansion and keeps the selection and summary. Locations still allow
only one open at a time via toggle (or a selected name's toggle); selecting a
closed location's name leaves it closed and leaves any other open location
open. Both controls are keyboard-operable, and a selected location or folder
reads as pressed. Every location header has its own background, distinct
from the folder and file rows beneath it; a selected location's header takes
the selected background across its whole width, toggle included, and
expansion shows only in the toggle. Selecting a file still reads its exact published text with
line numbers and Gherkin syntax styling at the observed revision. A location or
folder summary names the selection by path and how many matching files it
holds. For Gherkin, and for `python` with pytest's words described below, it
also reads each contained file's published text at the observed revision
(with bounded concurrency and "N of M files read" progress), counts scenarios and outline rows from successfully read files,
and, when the location declares proof, shows one aggregate count line over
those rows (rows without successful proof counted explicitly) plus a breakdown
by immediate child in the browser's order. Under the count line, a summed
duration line adds the last successful proof durations of the rows that have
one (a retried row's total across attempts included) and says how many of the
rows that covers, for example "Summed duration of last successful proof:
23.5 s over 6 of 15 scenarios", with a note that it is a sum of separate
observations and not a run's elapsed time, and when those observations
finished, oldest to newest in UTC, from which commit or how many commits. A
"Slowest scenarios" list then gives up to ten of those rows from anywhere in
the selection, slowest first (equal durations in tree, then source order),
each naming the scenario with its example cells and its file relative to the
selection, with the same outcome-with-attempts, duration, time since, commit,
and file-version cells as file Proof; a selection without successful proof
shows no list. Each
child row adds its own sum and covered count, or says its summed duration is
unknown when none of its rows has successful proof, never zero; children keep
tree order. The summary drills down: a child's name selects that folder or
file exactly as its tree name does (a folder shows its own summary, a file its
Purpose and Proof), and a slowest row's scenario name opens its file with
Purpose positioned on that row's line, as an Optimization Candidates case
opens. Either reveals the target in the tree, opening its location and
expanding any collapsed folders above it; both are keyboard-operable buttons. The figures are derived in the browser from the texts and proof the
summary already reads and are not stored. Scenario totals, Proof count lines
and summed duration lines are labelled _Partial_ with contributing-file
coverage while any contained file is still reading or could not be read, for
the selection and each affected child; fully read siblings stay complete. An unread file is named
with a retry that reads only the failed files, and is never counted as
passed or without successful proof. A nonempty selection with no readable files
says its scenario total is unavailable, not zero. Non-Gherkin kinds, undeclared proof,
and unusable locations reuse the same Proof-absent or location explanations
as a file; without declared proof a Gherkin summary still gives the
statistics it can. When the location also declares a `proof` directory of
committed Cucumber proof (the
[Cucumber proof reference](../src/skills/dough-test-optimization/references/cucumber-proof.md)),
a selected file's Proof lists the file's scenarios and outline rows in source
order, each with its **Last successful proof** (retry-assisted passes marked
with attempt counts), duration, time since, commit, and whether it was observed
on this file version, or _No successful proof_, under a count line of those
successful observations. A `python` location that declares committed pytest
proof (the
[pytest proof reference](../src/skills/dough-test-optimization/references/pytest-proof.md))
reads the same way in pytest's words: a selected file's Proof lists, under a
**Test case** header, its module-level `def test_*` and `async def test_*`
functions and the `test_*` methods of its `Test*` classes in definition
order, a function with observed parameter ids as one row per observed id
(for example "test_rounding Parameters: up") and any other function as one
row; observations the published file no longer defines are not listed, and
the count line counts test cases. Its location and folder summaries give the
Gherkin figures with an inventory of test functions and count, summed
duration and **Slowest test cases** lines over test cases. A final
unsuccessful scenario clears its earlier
proof during an explicit recording run; a later explicit pass restores it,
while unexecuted scenarios keep their proof. Normal test runs leave proof
untouched, including on failure. Proof is a published snapshot whose
observations can come from different deliberate runs, not a claim about
present product health. On every proof-bearing location,
`proofGeneration` declares exactly one nonempty `command` string, run from
the repository root, or `skill` string naming a project-owned invocation.
File Proof and location/folder summaries show that instruction as text for
generating or refreshing proof; the dashboard does not execute it. Missing or
invalid instructions explain the setting on that location in
`.planning/open-dough.json` without hiding readable historical proof.
Legacy proof is reduced to the latest result before retaining successes, so
an older pass cannot reappear behind a later failure. Proof files are read
once with the locations at that revision. A file with no successful proof
in that directory says so. A proof file that could not be read, or is not valid
proof, is reported by name as a read
failure with retry, never as _No successful proof_, and the retry reads the
locations again without changing the selection or Purpose. Without a
declared directory, Proof says it is not recorded for the project and names
the installed reference for configuring deliberate generation; other kinds say Proof is read for
Gherkin feature files and pytest files so far. The selected perspective choice names the page, so
Intent shows no heading of its own. Below the banner the page does not
scroll: the location tree fills the remaining height against the left edge,
and it and the reading pane each scroll independently. Directly under the
banner, a strip of three Intent reading modes, **Intent**, **Optimization
Candidates** and **CI status**, chooses what that content shows; it belongs
to Intent and is not another perspective, and arrow keys, Home and End move
between its tabs. **Intent** shows the location tree, which holds only
Purpose locations, beside the reading pane; it is the tab a project's Intent
first shows. With a
file selected, or nothing selected yet, the reading pane offers **Purpose**
and **Proof** tabs that stay in sight at its top; the chosen tab fills the
pane, **Purpose** when Intent opens. The chosen tab stays while other files
are selected and is page state of the reader, so leaving Intent or reloading
starts on **Purpose**. The tabs use the same Arrow, Home and End keys as the
mode strip, which never reach project cycling. Switching tabs reads nothing
again and keeps the selection, a positioned case, the reading mode and where
each tab was read in that file; a location or folder summary has no tabs.
A **Side by side** toggle beside the tabs shows Purpose and Proof together
instead, each named by its heading and scrolling on its own, both following
the selection; where the reading pane is too narrow for two columns,
including whenever the location tree sits above it, Purpose stacks above
Proof with the toggle still on. Turning it off brings back the tab chosen
before. Like the dashboard's other view preferences, this browser keeps the
layout as one disposable choice for every project, across perspective
switches, reloads and later visits; the chosen tab is not kept. Where the
browser keeps none, refuses storage, or keeps an unusable value, Intent starts
with tabs and a layout chosen lasts for the page. Switching the layout reads
nothing again and keeps the selection, the reading mode, the selected story and the line
Purpose was read at, so a positioned case stays in view. Opening a file at a
case side by side, from a summary's slowest row or an Optimization Candidates
entry, also brings that case's Proof row into view beside it; with tabs,
Proof keeps its own place.
**Optimization Candidates** shows the project's published Test Optimization
Candidates record at the observed revision across the content area without
the location tree; the record is read the first time that tab is chosen.
Choosing a location an entry names selects **Intent** with that file's
**Purpose** chosen, or shown side by side, positioned on the entry's case
where that names one line, with its location and the folders holding it
opened so the file shows selected in the tree, and choosing **Optimization Candidates** again returns to
that entry without reading the record again. **CI status** shows, across the
content area without the location tree, the selected check's judgment of the
project's configured trunk (`main` here), or, while the page has a selected
story (chosen on its card or through its content in the Side panel), of that
story's published story branch: the branch its
single agent profile records in Story Branch Mode. It is judged by the same
rule as the
[base-CI check before an execution start](../dashboard/LAUNCH-BASE-CI.md): the
newest result of the configured `ciWorkflow` (or `ciAdapter` discover) at the
branch head or its nearest ancestor that has one. For a story branch, the
selected check's results on the trunk are read too (the `ciWorkflow`'s push
runs on the trunk, or the `ciAdapter`'s discover for the trunk): a trunk
result for a commit in the branch's history counts as that commit's result,
and the run's branch is named (for example "run on `main`"); a trunk result
for a commit not in its history never counts. The nearest commit with a
result decides, by its newest result, so a nearer or newer failed or running
result still decides, and a trunk read that fails leaves the judgment **Could
not be read**. A
selected story with no published story branch (queued or being prepared,
Trunk Mode, or Recently done) is named with that explanation; one whose agent
profiles cannot be read, or that more than one profile names, says its branch
is unknown and why; a recorded name the dashboard cannot use is that story's
gap; and a recorded branch GitHub no longer publishes is said so by name.
None of these shows a status, and no other branch's judgment stands in. A
changed selection replaces the judgment, never showing one read for an
earlier selection, and clearing it returns to the trunk. It names the branch and
states **Passed**, **Failed** (including cancelled or timed out),
**Running** or **Could not be read** with the reason, with the judged short
SHA and subject, how many later commits have no result of their own, the run
link when given, while running the nearest completed ancestor, and when it
was checked; a history with no result is **Could not be read**, never
passed, and so is a trunk whose history GitHub answers `404` for, with
GitHub's reason: only a story branch is called no longer published. It is
read each time the tab is shown, when the judged branch changes, again when
the page's
revision check finds the judged branch's head moved while it is shown (a new
trunk revision, or a new head of a story branch it watches because the story's
progress is read there; a story branch without a counted plan is not watched
and is re-read on **Check again**), and on **Check again**, with no timed
polling, and it is offered whether Intent locations are
configured, absent, or unreadable: the strip stands above those
explanations, which **Intent** and **Optimization Candidates** show when
there is no location tree. The chosen tab is kept while the page stays on
the project, across switches to Development and back and across new
revisions, where **Optimization Candidates** reads the record at the new
revision; a project change starts again on **Intent**. The choice is
disposable page state, not on the URL or in storage. A location that is
missing, holds no `.feature` files, or names an unsupported kind says so
by path or kind while other locations stay usable; a failed file read says so
and offers retry. When that setting is absent, Intent says no intent locations
are configured and names the setting and file; it shows no empty tree. An
unreadable or malformed settings file is a distinct explanation from absence.
With a story selected on the page, the **Intent** reading mode names it in
one compact summary at the top of the locations column, or above the
explanation shown in place of the tree; the mode strip stays directly under
the banner, and Optimization Candidates and CI status show no summary.
Compact, the summary gives the story's title on one line (the full title on
hover) and says briefly while the comparison is reading, unavailable or
failed, with **Retry** for a failure; a disclosure, collapsed at first and
not kept across reloads, reveals the full title, the identity, and the revisions its
default Review changes comparison runs between or the full explanation,
without changing the selection, the reading pane, the tree's expansion or
**Selected story only**. Intent overlays that comparison's changed files on
the published tree: each is styled by its
change kind, added files are inserted, deleted files stay, and a rename sits
at its new path where a location selects it, else at its old path. A
completed story is named by its done record's title and compared through its
published completion, whose revisions need not be the published revision
Intent and its Proof describe. Folders
containing changes share one background; a location containing changes keeps
its header's location background and carries a change mark on its leading
edge instead. The first time Intent
has the comparison, those folders and the first changed location open and
everything else collapses. **Selected story only**, off at first, leaves
just the changed files and the locations and folders holding them, or says no
test file in a location changed; turning it on or off opens the same folders
again and collapses the rest. Changed files no location selects by either
path are counted in the summary with a way to Review changes, which opens on
Intent's comparison (All changes, uncommitted changes included) even for a story with a review
mark. A changed file's Purpose is Review changes' diff of it, and its Proof
says it describes the published revision.
A story without a comparison, and a failed read with retry, each say so while
the published tree stays usable; clearing the selected story removes the
summary.
The story is a lens on Intent, not a separate definition of it, and its
changed files are an initial view of its impact: they do not by themselves
establish every affected behavior or the regression proof it needs.
Structure is not offered yet. The perspective is disposable
presentation state on the URL (`perspective=intent`), independent of
Development's stories/roster view, which Intent keeps to return to. Choosing
a perspective adds one history entry and never selects another project;
changing projects keeps the perspective, and Back/Forward, reload and System
settings restore it. Story URLs, story references and choosing a Sessions
sidebar entry open Development's stories, including from the same project's
Intent. Changing perspective neither starts, stops, completes nor reattaches
a session: the mounted Board, Sessions sidebar and Side panel (terminal,
final report or story review) stay as they were, and a covering panel stays
open. When the change hides the content holding the keyboard, the keyboard
moves to the selected perspective's choice.
