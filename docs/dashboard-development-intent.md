# Development and Intent

Part of the [Dashboard navigation guidance](dashboard-navigation.md), under the
[Dashboard UX/UI North Star](dashboard-ux-ui-north-star.md). Its authority, scope,
and revision policy apply here.

Development is the first-visit default perspective: the stories or agent
roster, near-future direction, Start session and published-state
qualifications. Intent replaces that content with the project's Purpose and
Proof reading surface. When the selected project's
`.planning/open-dough.json` publishes `intent.locations` of kind `gherkin`,
Intent lists each location's nested `.feature` files in a collapsible tree.
Locations and folders share separate caret and name controls: a caret toggles
expansion without changing the selection or the reading pane (Purpose, Proof,
or summary); clicking an unselected name selects that location or folder and
shows its summary without changing expansion; clicking the selected name
toggles expansion and keeps the selection and summary. Locations still allow
only one open at a time via caret (or a selected name's toggle); selecting a
closed location's name leaves it closed and leaves any other open location
open. Both controls are keyboard-operable, and a selected location or folder
reads as pressed. Selecting a file still reads its exact published text with
line numbers and Gherkin syntax styling at the observed revision. A location or
folder summary names the selection by path and how many matching files it
holds. For Gherkin it also reads each contained feature's published text at
the observed revision (with bounded concurrency and "N of M files read"
progress), counts scenarios and outline rows from successfully read files,
and, when the location declares proof, shows one aggregate count line over
those rows (rows without successful proof counted explicitly) plus a breakdown
by immediate child in the browser's order. Scenario totals and Proof count lines
are labelled _Partial_ with contributing-file coverage while any contained
file is still reading or could not be read, for the selection and each
affected child; fully read siblings stay complete. An unread file is named
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
successful observations. A final unsuccessful scenario clears its earlier
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
the installed reference for configuring deliberate generation; other kinds say Proof is read only for
Gherkin files so far. The selected perspective choice names the page, so
Intent shows no heading of its own. Below the banner the page does not
scroll: the location tree fills the remaining height against the left edge,
and it and the reading pane each scroll independently. Directly under the
banner, a strip of three Intent reading modes, **Intent**, **Optimization
Candidates** and **CI status**, chooses what that content shows; it belongs
to Intent and is not another perspective, and arrow keys, Home and End move
between its tabs. **Intent** shows the location tree, which holds only
Purpose locations, beside Purpose and Proof; it is the tab a project's Intent
first shows.
**Optimization Candidates** shows the project's published Test Optimization
Candidates record at the observed revision across the content area without
the location tree; the record is read the first time that tab is chosen.
Choosing a location an entry names selects **Intent** with that file's
Purpose and Proof, and choosing **Optimization Candidates** again returns to
that entry without reading the record again. **CI status** shows, across the
content area without the location tree, the selected check's judgment of the
project's configured trunk (`main` here), or, while a story is selected on
Development's board, of that story's published story branch: the branch its
single agent profile records in Story Branch Mode. It is judged by the same
rule as the
[base-CI check before an execution start](../dashboard/LAUNCH-BASE-CI.md): the
newest result of the configured `ciWorkflow` (or `ciAdapter` discover) at the
branch head or its nearest ancestor that has one; for a story branch, a run
on the trunk for a commit in the branch's history counts as that commit's
result, and the run's branch is named (for example "run on `main`"). A
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
passed. It is read each time the tab is shown, when the judged branch
changes, again when the page's
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
Structure and Purpose/Proof layout switching are not offered yet. The perspective is disposable
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
