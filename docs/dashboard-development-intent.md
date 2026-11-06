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
numbers and Gherkin syntax styling at Intent's reading revision. A location or
folder summary names the selection by path and how many matching files the
tree lists (a selected story's overlaid files included), gives an unusable location's explanation, and shows the CI proof
that **CI status** shows, never local proof. With no story selected, it names
that evidence once (attempt and run, revision, judged branch, a selected
story's branch, a running result's completed ancestor), says when that
judgment was previously retrieved rather than newly verified and any failed
refresh, as **CI status** says it, and, when the tree shows another
revision, says a file added or changed since has no CI result here or an
earlier one. One table in the homepage's columns (**Scope**, **Counts**,
**Test execution time**, **Parts**) gives the selection's own row (an entry's
row is its homepage row, checks outside the tree included), then one row per
immediate folder (named with a trailing `/`) and file in the browser's order,
each summing the CI evidence published under its path, and, when the
selection's figures hold files no child row covers (files the tree does not
list) or results CI could not place in a file, a **Not in the rows above**
row with a line naming them. With a story selected, the same Summary names that story's CI timing
comparison (baseline, branch and landed, as **CI status** names them; Taken
labelled provisional) and the observed-not-attributed statement; its table
uses **Baseline**, **Branch** and **Landed** for precise times with signed
differences, shows counted-results differences in **Counts** (a gap endpoint
shows its gap, not a difference), marks story-changed rows (a rename takes
its baseline from its old path), and explains per-row gaps. Parts
completeness stays for the homepage's chosen build (landed, else branch).
Each result counts in one row: an unlisted file
under a listed folder is in that folder's row, and outside only in that
folder's own summary. Execution time is precise enough to compare sub-minute
scopes (`340 ms`, `12.5 s`, `4 min 5 s`); a measured zero is `0 ms`. A file
CI has no result for says **no CI result**; a scope with an untimed test, a
missing or ambiguous part, or a part whose report published no file breakdown
is partial with that named; an entry-only summary keeps the entry's totals
and says the child breakdown is unavailable. Without usable proof, the rows
stay for drilling down and one line says why, as the homepage does. The
summary drills down: a child's name selects that folder or file as its tree
name does and reveals it in the tree, keyboard-operable. A summary reads no
file text and asks CI nothing again: home and every summary share one
judgment, proof and comparison-endpoint read.
The selected perspective choice names the page, so Intent shows no heading of its own. Below
the banner the page does not scroll: the location tree fills the remaining height against
the left edge, and it and the reading pane each scroll independently. Directly under the
banner, a strip of two Intent reading modes, **Intent** and **Optimization Candidates**,
chooses what that content shows; it belongs to Intent and is not another
perspective. Arrow keys, Home and End move between its tabs and only choose
the mode, so returning to **Intent** that way keeps what it was reading.
**Intent** shows the location tree (Purpose locations only) beside the
reading pane; it is the tab a project's Intent first shows. With nothing
selected the reading pane is Intent's homepage, **CI status**; with a file
selected it offers **Purpose** and **Proof** tabs (Purpose first; kept across
file selections in the same Intent visit), and with a location or folder its
summary. Purpose is the published source or selected story's source diff; Proof
is that file's published CI evidence from Intent's one evidence owner
(judged-run results, or a story's baseline / branch / landed comparison).
Directly activating the **Intent** tab (click, Enter or Space), even while already
chosen, returns home: selection clears and CI status shows for the same story;
expansion and reading choices stay. No separate return control.
**Optimization Candidates** shows the project's published Test Optimization
Candidates record at Intent's reading revision across the content area without
the location tree; the record is read the first time that tab is chosen.
Choosing a location an entry names, an opening rather than a return home,
selects **Intent** with that file's **Purpose** positioned on the entry's case where that names one line, with its location and folders opened so the file
shows selected, and choosing **Optimization Candidates** again returns to
that entry without reading the record again.
Intent locations and Optimization Candidates share the page's recovery
schedule. A local boundary that cannot be reached or a failure classified as
transient is read again in place after 15, 30, 60, then 60 seconds while it
remains unanswered. Failures settling during the same wait share its step.
Each reader retains its pending recovery until it answers or its reading
view is replaced. Healing the published observation leaves Intent's pending
recovery in place, and Intent's pending recovery allows the backlog's regular
revision checks. Once every contributor has an answer, the backoff resets.
A standing GitHub rate limit holds recovery until that limit ends. Hidden
pages wait until they are seen again, then ask once when due. The recovered
answer replaces its problem through the same path as **Retry**. Malformed
settings, access refusals, unexpected answers and unclassified failures keep
their manual actions. Absent or mismatched candidates keep their existing
explanations. Purpose file text offers its own **Retry**.
**CI status** shows the selected check's judgment of the project's configured
trunk (`main` here), or, with a selected Taken story (card or Side panel), of
that story's published story branch — the branch its single agent profile
records in Story Branch Mode — by the same rule as the
[base-CI check before an execution start](../dashboard/LAUNCH-BASE-CI.md):
the newest result of the configured `ciWorkflow` (or `ciAdapter` discover) at
the branch head or its nearest ancestor that has one. For a story branch,
trunk results of the same check also count when the commit is in the branch's
history (the run's branch is named, for example "run on `main`"); a trunk
result for a commit outside that history never counts. The nearest commit
with a result decides by its newest result; a failed trunk read leaves
**Could not be read**. A selected **done** story shows a **CI timing
comparison** instead of a live branch judgment: baseline (newest completed
build at or before the story's first claim parent), branch result (final
story-branch revision's build, or not applicable for Trunk Mode), and landed
result (completion revision's build), each named with revision, run, attempt,
state and whether it is exact or a measured ancestor, with CI wall time and
signed whole-second differences framed as observations between single builds
(not attributed to the story), then entry rows with each endpoint's cumulative
test execution time. A selected **Taken** Story Branch story keeps that live
judgment and adds the same comparison against the pre-story baseline, with the
latest completed branch build labelled provisional and Landed saying the story
has not landed yet; a new branch head re-reads it. A selected **Taken** Trunk
Mode story shows that provisional trunk comparison (Branch not applicable,
Landed not yet landed) instead of a no-branch gap. A selected story with no
published story branch (queued or being prepared), unreadable or ambiguous
agent profiles, an unusable recorded name, or a branch GitHub no longer
publishes is named with that explanation and shows no status; no other
branch's judgment stands in. A changed selection replaces the judgment;
clearing it returns to the trunk. It names the branch and states **Passed**,
**Failed** (including cancelled or timed out), **Running** or **Could not be
read** with the reason, judged short SHA and subject, how many later commits
lack their own result, the run link when given, while running the nearest
completed ancestor, and when it was checked; a history with no result, and a
trunk whose history GitHub answers `404` for, are **Could not be read** (with
GitHub's reason); only a story branch is called no longer published. Below
the judgment, **Proof** shows the CI proof of that run (for a running result,
the completed ancestor's): revision, link and attempt once (a `ciAdapter`
attempt named by its `attemptId`) with that attempt's **CI wall time** from
its start and completion (not recorded, with why, when either is absent),
then a table with one row per declared Intent location `path`, in
declaration order, under the columns **Entry**, **Counts** (passed, failed
and other with the runner's unit, tests or checks), **Test execution time**
(the entry's summed durations: complete, partial naming the parts without
one or how many tests or checks recorded none, or not recorded for a summary
without durations, never zero for absence, and never the attempt's wall
time) and **Parts** (how many declared parts are present, then each missing
or ambiguous part as an uncounted gap). A path wraps after its `/`
separators, and within them only in a reading pane too narrow for that, so
the columns fit a phone or zoomed window without sideways scrolling. A
GitHub Actions run's summary is its `ci-proof-summary-attempt-<n>` artifact,
read with `intent=ci-proof` `run`, `attempt` and `revision`
(`dashboard/server/ciProofArtifact.ts`) and used only when it names the same
repository, run, attempt and revision. A `ciAdapter` attempt's summary is
read with `run`, `attempt-id`, `run-branch` (the branch whose discover listed
it) and `revision`, each identity at most 256 characters, by asking the
project's adapter its `proof` operation from the project folder under the
shared adapter limits (`dashboard/server/ciAdapterProof.ts`); it is used only
when valid and naming the same repository, `attemptId` as text and full
revision, and when another attempt the adapter's `discover` answered at that
revision shares that `attemptId` (counted before newest-per-check retention)
no adapter is asked. Judgment shows first whether proof is shown, checking,
or unavailable; then one line says why: for a run, no summary, expired,
unreadable, invalid, or wrong run/attempt/revision; for an adapter attempt,
the adapter's own unavailability reason, its failed answer (timeout,
over-limit answer, nonzero exit with its last stderr line, or an answer that
is neither `summary` nor `unavailable`), invalid, wrong
repository/attempt/revision, or ambiguous; or no completed GitHub Actions run
or CI attempt. Proof is read again with each judgment — when the homepage is
shown, the judged branch changes, the page's revision check finds that head
moved while shown (new trunk revision, or a watched story-branch head whose
story progress is read there; a story branch without a counted plan is not
watched and is re-read on **Check again**), and on **Check again**, with no
timed polling — and is shown whether Intent locations are configured, absent,
or unreadable: **Intent** shows it beside the explanation in place of the
location tree, and the strip stands above those explanations, which
**Optimization Candidates** also shows. The chosen tab is kept while the page
stays on the project, across switches to Development and back and across new
revisions, where **Optimization Candidates** reads the record at the new
revision once **Show latest** moves the reading there; a project change
starts again on **Intent**. The choice is disposable page state, not on the
URL or in storage. The reading place is kept the same way, in memory only:
the selection, the open location and folders, **Selected story only** and the
reading pane's scroll show again after Development and back without reading
the locations or the selected file again. Intent reads one published
revision, the observed one when the project's Intent first opens. A newer
observed revision changes nothing shown and reads nothing: however many
arrive, one polite status beside the reading, which takes no focus, says
"New revision available — showing `<short sha>`" with **Show latest**.
**Show latest** moves the reading to the latest observed revision: the shown
reading stays, marked "Updating…", while that revision's locations are read,
then the selection, the open location and folders and the scroll offset stay
where the selected path still exists, and only an already selected file is
read again, its new text replacing the old in place. A selected path the
revision no longer holds reads "`<path>` is not in revision `<short sha>`" in
**Purpose**, with nothing else selected. If the latest locations cannot be
read, the shown reading stays usable and the notice names the failed revision
beside a **Retry** that applies the update; if the selected file's new text
cannot be read, its earlier text stays under that failure with its own
**Retry**. What this page already read at the shown revision appears at once,
without a reading moment. **CI status** and Development keep following the
observed revision. A story selected while Intent is hidden starts the tree's
arrangement afresh, and a project change starts that project's reading
afresh. A location that is missing, holds no `.feature` files, or names an
unsupported kind says so by path or kind while other locations stay usable; a
failed file read says so and offers retry. When that setting is absent,
Intent says no intent locations are configured and names the setting and
file; it shows no empty tree. An unreadable or malformed settings file is a
distinct explanation from absence. With a story selected, the **Intent**
reading mode names it in one compact summary at the top of the locations
column, or above the explanation shown in place of the tree; the mode strip
stays under the banner, and Optimization Candidates shows no summary.
Compact, the summary gives the story's title on one line (full title on
hover) and says briefly while the comparison is reading, unavailable or
failed, with **Retry** for a failure; a disclosure, collapsed at first and
not kept across reloads, reveals the full title, identity, and the revisions
its default Review changes comparison runs between or the full explanation,
without changing the selection, reading pane, tree expansion or **Selected
story only**. Intent overlays that comparison's changed files on the
published tree: styled by change kind, added files inserted, deleted files
kept, a rename at its new path where a location selects it else at its old
path. A completed story is named by its done record's title and compared
through its published completion, whose revisions need not be the published
revision Intent describes. Folders containing changes share one background; a
location containing changes keeps its header background and carries a change
mark on its leading edge. The first time Intent has the comparison, those
folders and the first changed location open and everything else collapses.
**Selected story only**, off at first, leaves just the changed files and the
locations and folders holding them, or says no test file in a location
changed; toggling it opens the same folders again and collapses the rest.
Changed files no location selects by either path are counted in the summary
with a way to Review changes, which opens on Intent's comparison (All
changes, uncommitted included) even for a story with a review mark. A changed
file's Purpose is Review changes' diff of it, and Proof holds that file's
comparison when available. A story without a comparison, and a failed read
with retry, each say so while the published tree stays usable; clearing the
selected story removes the summary and returns Proof to judged-run evidence.
The story is a lens on Intent, not a separate definition of it, and its
changed files are an initial view of its impact: they do not by themselves
establish every affected behavior or the regression proof it needs. Structure
is not offered yet. The perspective is disposable presentation state on the URL
(`perspective=intent`), independent of Development's stories/roster view,
which Intent keeps to return to. Choosing a perspective adds one history
entry and never selects another project; changing projects keeps the
perspective, and Back/Forward, reload and System settings restore it. Story
URLs, story references and choosing a Sessions sidebar entry open
Development's stories, including from the same project's Intent. Changing
perspective neither starts, stops, completes nor reattaches a session: the
mounted Board, Sessions sidebar and Side panel stay as they were, and a
covering panel stays open. When the change hides the content holding the keyboard, the keyboard moves to the selected perspective's choice.
