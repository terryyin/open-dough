# Development and Intent

Part of the [Dashboard navigation guidance](dashboard-navigation.md), under the
[Dashboard UX/UI North Star](dashboard-ux-ui-north-star.md). Its authority, scope,
and revision policy apply here.

Development is the first-visit default perspective: the stories or agent
roster, near-future direction, Start session and published-state
qualifications. Intent replaces that content with the project's Purpose and
Proof reading surface. When the selected project's
`.planning/open-dough.json` publishes `intent.locations` of kind `gherkin`,
Intent lists each location's nested `.feature` files in a collapsible tree
whose folders start collapsed. Locations and folders share separate toggle
and name controls: a toggle (open/closed book for a location, folder for a
folder) expands without changing the selection or reading pane; an
unselected name selects that location or folder and shows its summary; the
selected name toggles expansion and keeps the selection and summary.
Locations still allow only one open at a time via toggle (or a selected
name's toggle); selecting a closed location's name leaves it closed and
leaves any other open location open. Both controls are keyboard-operable, and
a selected location or folder reads as pressed. Every location header has its
own background; a selected location's header takes the selected background
across its whole width, toggle included, and expansion shows only in the
toggle. Selecting a file still reads its exact published text with line
numbers and Gherkin syntax styling at the observed revision. A location or
folder summary names the selection by path and how many matching files it
holds. For Gherkin, pytest, and a `typescript`/`javascript` location whose
declared `runner` Intent reads (Vitest or Playwright words below), it also
reads each contained file's published text at the observed revision (with
bounded concurrency and "N of M files read" progress), counts scenarios and
outline rows from successfully read files, and, when the location declares
proof, shows one aggregate count line over those rows (rows without
successful proof counted explicitly) plus a breakdown by immediate child in
the browser's order. Under the count line, a summed duration line adds the
last successful proof durations of the rows that have one (a retried row's
total across attempts included) and says how many of the rows that covers,
for example "Summed duration of last successful proof: 23.5 s over 6 of 15
scenarios", noting it is a sum of separate observations and not a run's
elapsed time, and when those observations finished, oldest to newest in UTC,
from which commit or how many commits. A "Slowest scenarios" list gives up to
ten of those rows from anywhere in the selection, slowest first (equal
durations in tree, then source order), each naming the scenario with its
example cells and its file relative to the selection, with the same
outcome-with-attempts, duration, time since, commit, and file-version cells
as file Proof; a selection without successful proof shows no list. Each child
row adds its own sum and covered count, or says its summed duration is
unknown when none of its rows has successful proof, never zero; children keep
tree order. The summary drills down: a child's name selects that folder or
file as its tree name does, and a slowest row's scenario name opens its file
with Purpose positioned on that row's line, as an Optimization Candidates
case opens. Either reveals the target in the tree; both are
keyboard-operable. The figures are derived in the browser from the texts and
proof the summary already reads and are not stored. Scenario totals, Proof
count lines and summed duration lines are labelled _Partial_ with
contributing-file coverage while any contained file is still reading or could
not be read; fully read siblings stay complete. An unread file is named with
a retry that reads only the failed files, and is never counted as passed or
without successful proof. A nonempty selection with no readable files says
its scenario total is unavailable, not zero. Kinds Intent reads no proof for
and unusable locations reuse the same Proof-absent or location explanations
as a file; without declared proof a Gherkin or pytest summary, or a Vitest or
Playwright one whose location declares its `runner`, still gives the
statistics it can. When the location
also declares a `proof` directory of committed Cucumber proof (the
[Cucumber proof reference](../src/skills/dough-test-optimization/references/cucumber-proof.md)),
a selected file's Proof lists the file's scenarios and outline rows in source
order, each with its **Last successful proof** (retry-assisted passes marked
with attempt counts), duration, time since, commit, and whether it was
observed on this file version, or _No successful proof_, under a count line
of those successful observations. A `python` location that declares committed
pytest proof (the
[pytest proof reference](../src/skills/dough-test-optimization/references/pytest-proof.md))
reads the same way in pytest's words: a selected file's Proof lists, under a
**Test case** header, its module-level `def test_*` and `async def test_*`
functions and the `test_*` methods of its `Test*` classes in definition
order, a function with observed parameter ids as one row per observed id in
parameter id order, whatever order the snapshot holds them in (for example
"test_rounding Parameters: even" before "Parameters: up"), and any other
function as one row; observations the published file no longer defines are
not listed, and the count line counts test cases. Its location and folder
summaries give the Gherkin figures with an inventory of test functions and
count, summed duration and **Slowest test cases** lines over test cases. A
`typescript` or `javascript` location's kind does not imply its proof format:
one that declares `proof` also declares `runner`, `"vitest"` (the
[Vitest proof reference](../src/skills/dough-test-optimization/references/vitest-proof.md))
or `"playwright"` (the
[Playwright proof reference](../src/skills/dough-test-optimization/references/playwright-proof.md)),
and reads in that runner's words: under **Test case**, every `it`/`test`
call — bare or as a member of `test` (`test.describe` / `test.it`), with or
without modifiers such as `.each`, `.skip`, `.skipIf(…)`, `.serial`,
`.parallel`, `.fixme` or `.fail` — whose name and enclosing `describe`/
`suite` names are string or unsubstituted template literals, in definition
order, named by the whole `describe` path as the runner names it (Vitest
"renderTitleFromPattern > …" or Playwright "touch reading > …"); an anonymous
`test.describe(fn)` adds no path segment; `.each`/`.for` placeholders and
multi-project observations expand to one row each in code-point order of the
observed name or project; any other test as one row. Non-literal names
(including loop-generated Playwright titles) and stale observations are not
listed; the count line counts test cases. Summaries use the Gherkin figures
with test inventory and **Slowest test cases** wording. A location declaring
`proof` without a usable `runner` explains that setting in
`.planning/open-dough.json` instead of reading proof, while its files stay
readable. A final unsuccessful scenario clears its earlier proof during an
explicit recording run; a later explicit pass restores it; unexecuted
scenarios keep theirs. Normal runs leave proof untouched. Proof is a
published snapshot from deliberate runs, not present health. Every
proof-bearing location's `proofGeneration` declares one nonempty `command`
(from the repository root) or `skill`; File Proof and summaries show it as
text and never execute it. Missing or invalid instructions explain the
setting without hiding readable proof. Legacy proof reduces to the latest
result before retaining successes. Proof files are read once with the
locations at that revision. A file with no successful proof says so; an
unreadable or invalid proof file is a named read failure with retry, never
_No successful proof_. Without a declared directory, Proof says it is not
recorded and names the installed reference (for `typescript`/`javascript`,
the declared runner's reference when Intent reads it, otherwise every such
runner's); other kinds say Proof is read for Gherkin feature files, pytest
files, Vitest tests and Playwright tests so far. Open Dough's own
`dashboard/tests` Playwright location lists on the order of seven hundred
spec files; opening that location's Purpose or Proof summary reads each
listed file at the pinned revision after the locations answer, so expect a
noticeable first-open cost on a cold read. The selected perspective choice names the page, so Intent shows no heading
of its own. Below the banner the page does not scroll: the location tree
fills the remaining height against the left edge, and it and the reading
pane each scroll independently. Directly under the banner, a strip of three
Intent reading modes, **Intent**, **Optimization Candidates** and **CI
status**, chooses what that content shows; it belongs to Intent and is not
another perspective, and arrow keys, Home and End move between its tabs.
**Intent** shows the location tree (Purpose locations only) beside the
reading pane; it is the tab a project's Intent first shows. With a file
selected, or nothing selected yet, the reading pane offers **Purpose** and
**Proof** tabs at its top; the chosen tab fills the pane, **Purpose** when
Intent opens. The chosen tab stays while other files are selected and is
page state, so leaving Intent or reloading starts on **Purpose**. The tabs
use the same Arrow, Home and End keys as the mode strip, which never reach
project cycling. Switching tabs reads nothing again and keeps the selection,
a positioned case, the reading mode and where each tab was read in that
file; a location or folder summary has no tabs. A **Side by side** toggle
beside the tabs shows Purpose and Proof together, each named by its heading
and scrolling on its own; where the pane is too narrow for two columns
(including when the tree sits above it), Purpose stacks above Proof with the
toggle still on. Turning it off restores the prior tab. Like other view
preferences, this browser keeps the layout as one disposable choice for
every project across perspective switches, reloads and later visits; the
chosen tab is not kept. Where the browser keeps none, refuses storage, or
keeps an unusable value, Intent starts with tabs and a chosen layout lasts
for the page. Switching the layout reads nothing again and keeps the
selection, reading mode, selected story and Purpose line, so a positioned
case stays in view. Opening a file at a case side by side, from a summary's
slowest row or an Optimization Candidates entry, also brings that case's
Proof row into view; with tabs, Proof keeps its own place.
**Optimization Candidates** shows the project's published Test Optimization
Candidates record at the observed revision across the content area without
the location tree; the record is read the first time that tab is chosen.
Choosing a location an entry names selects **Intent** with that file's
**Purpose** chosen, or shown side by side, positioned on the entry's case
where that names one line, with its location and folders opened so the file
shows selected, and choosing **Optimization Candidates** again returns to
that entry without reading the record again.

Intent locations and Optimization Candidates share the page's recovery
schedule. A local boundary that cannot be reached or a failure classified as
transient is read again in place after 15, 30, 60, then 60 seconds while it
remains unanswered. Failures settling during the same wait share its step.
Each reader retains its pending recovery until it answers or its reading
view is replaced. Healing the published observation leaves
Intent's pending recovery in place, and Intent's pending recovery allows the
backlog's regular revision checks. Once every contributor has an answer,
the backoff resets.

A standing GitHub rate limit holds recovery until that limit ends. Hidden
pages wait until they are seen again, then ask once when due. The recovered
answer replaces its problem through the same path as **Retry**. Malformed
settings, access refusals, unexpected answers and unclassified failures keep
their manual actions. Absent or mismatched candidates keep their existing
explanations. Purpose file text and Proof problems offer their own **Retry**.

**CI status** shows, across the
content area without the location tree, the selected check's judgment of the
project's configured trunk (`main` here), or, with a selected story (card or
Side panel), of that story's published story branch — the branch its single
agent profile records in Story Branch Mode — by the same rule as the
[base-CI check before an execution start](../dashboard/LAUNCH-BASE-CI.md):
the newest result of the configured `ciWorkflow` (or `ciAdapter` discover) at
the branch head or its nearest ancestor that has one. For a story branch,
trunk results of the same check also count when the commit is in the branch's
history (the run's branch is named, for example "run on `main`"); a trunk
result for a commit outside that history never counts. The nearest commit
with a result decides by its newest result; a failed trunk read leaves
**Could not be read**. A selected story with no published story branch
(queued or being prepared, Trunk Mode, or Recently done), unreadable or
ambiguous agent profiles, an unusable recorded name, or a branch GitHub no
longer publishes is named with that explanation and shows no status; no other
branch's judgment stands in. A changed selection replaces the judgment;
clearing it returns to the trunk. It names the branch and states **Passed**,
**Failed** (including cancelled or timed out), **Running** or **Could not be
read** with the reason, judged short SHA and subject, how many later commits
lack their own result, the run link when given, while running the nearest
completed ancestor, and when it was checked; a history with no result, and a
trunk whose history GitHub answers `404` for, are **Could not be read** (with
GitHub's reason); only a story branch is called no longer published. Below
the judgment, **Proof** shows the CI proof of that run (for a running result,
the completed ancestor's): revision, link and attempt once, then one row per
declared Intent location `path` with passed, failed and other counts, how
many declared parts are present, and each missing or ambiguous part as an
uncounted gap. A summary is used only when it names the same repository, run,
attempt and revision. Judgment shows first whether proof is shown, checking,
or unavailable; then one line says why (no summary, expired, unreadable,
invalid, wrong run/attempt/revision, `ciAdapter`, or no completed GitHub
Actions run). Proof is read again with each judgment — when the tab is shown,
the judged branch changes, the page's revision check finds that head moved
while shown (new trunk revision, or a watched story-branch head whose story
progress is read there; a story branch without a counted plan is not watched
and is re-read on **Check again**), and on **Check again**, with no timed
polling — and is offered whether Intent locations are configured, absent, or
unreadable: the strip stands above those explanations, which **Intent** and
**Optimization Candidates** show when there is no location tree. The chosen
tab is kept while the page stays on the project, across switches to
Development and back and across new revisions, where **Optimization
Candidates** reads the record at the new revision; a project change starts
again on **Intent**. The choice is disposable page state, not on the URL or
in storage. A location that is missing, holds no `.feature` files, or names
an unsupported kind says so by path or kind while other locations stay
usable; a failed file read says so and offers retry. When that setting is
absent, Intent says no intent locations are configured and names the setting
and file; it shows no empty tree. An unreadable or malformed settings file is
a distinct explanation from absence. With a story selected, the **Intent**
reading mode names it in one compact summary at the top of the locations
column, or above the explanation shown in place of the tree; the mode strip
stays under the banner, and Optimization Candidates and CI status show no
summary. Compact, the summary gives the story's title on one line (full title
on hover) and says briefly while the comparison is reading, unavailable or
failed, with **Retry** for a failure; a disclosure, collapsed at first and
not kept across reloads, reveals the full title, identity, and the revisions
its default Review changes comparison runs between or the full explanation,
without changing the selection, reading pane, tree expansion or **Selected
story only**. Intent overlays that comparison's changed files on the
published tree: styled by change kind, added files inserted, deleted files
kept, a rename at its new path where a location selects it else at its old
path. A completed story is named by its done record's title and compared
through its published completion, whose revisions need not be the published
revision Intent and its Proof describe. Folders containing changes share one
background; a location containing changes keeps its header background and
carries a change mark on its leading edge. The first time Intent has the
comparison, those folders and the first changed location open and everything
else collapses. **Selected story only**, off at first, leaves just the
changed files and the locations and folders holding them, or says no test
file in a location changed; toggling it opens the same folders again and
collapses the rest. Changed files no location selects by either path are
counted in the summary with a way to Review changes, which opens on Intent's
comparison (All changes, uncommitted included) even for a story with a review
mark. A changed file's Purpose is Review changes' diff of it, and its Proof
says it describes the published revision. A story without a comparison, and
a failed read with retry, each say so while the published tree stays usable;
clearing the selected story removes the summary. The story is a lens on
Intent, not a separate definition of it, and its changed files are an initial
view of its impact: they do not by themselves establish every affected
behavior or the regression proof it needs. Structure is not offered yet. The
perspective is disposable presentation state on the URL
(`perspective=intent`), independent of Development's stories/roster view,
which Intent keeps to return to. Choosing a perspective adds one history
entry and never selects another project; changing projects keeps the
perspective, and Back/Forward, reload and System settings restore it. Story
URLs, story references and choosing a Sessions sidebar entry open
Development's stories, including from the same project's Intent. Changing
perspective neither starts, stops, completes nor reattaches a session: the
mounted Board, Sessions sidebar and Side panel (terminal, final report or
story review) stay as they were, and a covering panel stays open. When the
change hides the content holding the keyboard, the keyboard moves to the
selected perspective's choice.
