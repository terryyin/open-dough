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
a selected location or folder reads as pressed. Every location header reads
as a section header: it spans the locations column edge to edge in its own
band colour, in light and dark themes alike, with its toggle and bold label
padded inside, while the folders and files beneath it read as rows without
that colour. The band colour stays apart from the selected background, the
change mark, the CI cues and the background of folders containing changes. A
selected location's header takes the selected background
across its whole width, toggle included (or an accent border when a CI
duration tint would be hidden by that fill — see
[CI timing comparison](dashboard-development-intent-ci-comparison.md)), and
expansion shows only in the toggle. With a story comparison, file rows and
location headers whose path is a compared entry show the same count-border
and duration-tint cues, with Proof's words in their accessible names; folder
rows do not. Selecting a file still reads its exact published text with line
numbers and Gherkin syntax styling at Intent's reading revision. A location
may instead declare `sources` entries, each with `include` patterns and an
optional `syntax` hint ([project configuration](../dashboard/PROJECT-CONFIGURATION.md)):
a file any entry's pattern matches is listed, with no extension filter, and
styled by the hint of the first matching entry in declaration order; one with
no hint, or a hint Intent has no grammar for, reads as plain text. That
location's header names its patterns without a kind. The same selection
places a selected story's changed files and admits a file's read. A location or
folder summary names the selection by path and how many matching files the
tree lists (a selected story's overlaid files included), gives an unusable
location's explanation, and shows the CI proof that **CI status** shows, never
local proof. With no story selected, it names
that evidence once as a strip of short labels, each beside an icon. A
screen reader hears each label from its own content: what the icon stands
for where the short words leave it out (`Revision`, `Branch`), the short
words, then any full words; those added words are not seen, and the full
words are the label's hover text: a judgment previously retrieved rather than newly
verified (`Previously retrieved at …`, as **CI status** says it) and any
failed refresh (`Refresh failed`, its failure announced), the linked run and
attempt (`Run 41 · attempt 2`), revision (`abc1234`), judged branch (`main`,
described as a selected story's branch), `Completed ancestor` for a running
result, and, when the tree shows another revision,
`Tree at def5678 — newer files unproved here` (a file added or changed since
has no CI result here, or an earlier one). The selection's own figures stand
as a labelled group above the table with **Counts**, **Test execution time**
and **Parts**. An entry's counts and timing match its homepage row, including
checks outside the tree. A table with **Scope**,
**Counts** and **Test execution time** then holds one row per immediate folder
(named with a trailing `/`) and file in the browser's order, each summing the
CI evidence published under its path, and, when the selection's figures hold
files no child row covers (files the tree does not list) or results CI could
not place in a file, a **Not in the rows above** row, its contents labelled
after the table (`1 file not in the tree`, `Unplaced results`,
`Part 2 no breakdown`; the files in full on hover, a part as
"part 2 of 3 has no file breakdown").
The table's headers sort it as **CI status** Proof's do, **Scope** by the
child's name; until one is activated the rows keep the browser's order, and
**Not in the rows above** stays last under any sort while the group above
does not move. The sort is kept in memory with Intent's reading place, never
on the URL or in storage: drilling down or switching to Development and
back keeps it, and a sorted column the next
Summary table lacks (a timing column or **Change** between one run's figures
and a story comparison) gives way to the browser's order there without being
lost: a later table with that column, such as the comparison once it is read,
is sorted by it again. With a story selected, the same Summary labels that story's CI timing
comparison the same way: `Provisional` while the story is Taken; **Baseline**,
**Branch** and **Landed**, each with the requested revision's status word
(`Skipped`, `Cancelled`, `No build`) before the short revision whose proof is
used, or a gap's word (`Not applicable`, `Not landed yet`), its full status as
its full words; and `Observed, not attributed` for the observed-not-attributed
statement; its group
and table use **Baseline**, **Branch** and **Landed** for precise times with signed
differences, shows counted-results differences in **Counts** (a gap endpoint
shows its gap, not a difference), names each child's story change in a
**Change** column after **Scope** (`added`, `modified`, `removed` or
`renamed`, empty when unchanged; a rename takes its baseline from its old
path, which its **Baseline** cell names) that sorts by kind in that order
with unchanged rows last in either direction, explains per-row gaps, and shows the same
count-border and duration-tint cues as the homepage entry table (see
[CI timing comparison](dashboard-development-intent-ci-comparison.md)). The
group's **Parts** shows completeness for the chosen build (landed, else
branch, else baseline), and that build's proof labels what **Not in the rows
above** holds and an entry it does not break down by file as one run's
Summary does, `No file breakdown` naming it ("The Landed CI proof summary
does not break tests down by file").
Each result counts in one row: an unlisted file
under a listed folder is in that folder's row, and outside only in that
folder's own summary. Execution time is precise enough to compare sub-minute
scopes (`340 ms`, `12.5 s`, `4 min 5 s`); a measured zero is `0 ms`. A file
CI has no result for says **no CI result**; a scope with an untimed test, a
missing or ambiguous part, or a part with no file breakdown
has partial timing shown as short gap labels (`Part 3 missing`,
`Part 2 no breakdown`, `1 test untimed`), in the group as in the rows; an entry-only summary keeps the entry's totals
and is labelled `No file breakdown`. Without usable proof, the rows
stay for drilling down, the group and rows say why in a word or two
(`checking`, `no CI proof`), and one line says why, as the homepage does. The
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
(judged-run results, or a story's baseline / branch / landed comparison),
under the Summary's evidence labels.
Directly activating the **Intent** tab (click, Enter or Space), even while already
chosen, returns home: selection clears and CI status shows for the same story;
expansion and reading choices stay. No separate return control.
While **Intent** shows the location tree, the strip also offers Review
changes' **Hide files** / **Show files** toggle, reached by Tab after the
tabs and stating whether the locations column is shown. Hiding removes the
whole column (story summary and tree) and gives the reading pane the full
width, or on a narrow screen, where the tree sits above it, the full height;
it changes no selection or reading. While the column is hidden the strip
shows nothing from the summary: no story title, comparison state, **Retry**
or outside count. **Show files** returns the column as it
was: summary disclosure, selection, open location and folders, **Selected
story only** and the tree's scroll. The choice is kept with Intent's reading
place across selections, **Optimization Candidates** and back, Development
and back and new revisions; a project change shows the column again. It is
not on the URL or in storage and is not remembered across reloads; the
explanation shown in place of the tree offers no toggle.
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
**CI status** homepage judgment, Proof evidence, and a selected story's
[CI timing comparison](dashboard-development-intent-ci-comparison.md) follow
[Intent CI status](dashboard-development-intent-ci-status.md). The chosen tab
is kept while the page stays on the project, across switches to Development
and back and across new revisions, where **Optimization Candidates** reads
the record at the new revision once **Show latest** moves the reading there;
a project change starts again on **Intent**. The choice is disposable page
state, not on the URL or in storage. The reading place is kept the same way,
in memory only:
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
Changed files no location selects by either path are counted at the end of
the summary's title line, expanded or not, as one compact button: an icon and
the number, whose accessible name and hover text explain it (for example "2
changed files outside Intent locations — open Review changes"). It is absent
when no changed file is outside the locations. Activating it opens Review
changes on Intent's comparison (All changes, uncommitted included) even for a
story with a review mark, without toggling the disclosure. A changed
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
covering panel stays open. When the change hides the content holding the
keyboard, the keyboard moves to the selected perspective's choice.
