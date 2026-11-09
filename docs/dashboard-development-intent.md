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
is sorted by it again. A selected story's Summary and file Proof share the
[CI comparison](dashboard-development-intent-ci-comparison.md) heading,
observed-build framing, active endpoints and unused-Landed explanation.
Short labels keep `Provisional` while Taken and **Baseline**, **Branch** and
**Landed** with each requested revision's status and the short revision whose
proof is used, or the endpoint's gap explanation. **Baseline** shows measured
time; **Branch** and **Landed** show signed changes from it, preserving precise
sub-second differences. Relative marks and the story's shared **Show %**
preference use one scale for the displayed figures and immediate rows.
Baseline sorts by measured time; Branch/Landed sort by signed change, with
uncomparable rows last in either direction and ties in supplied order.
**Counts** keeps counted-results differences and preserves gap endpoints;
**Change** after **Scope** names `added`, `modified`, `removed` or `renamed` (empty when unchanged),
sorting in that order with unchanged last in either direction. A rename uses
its old Baseline path, named in that cell. The group's **Parts** keeps the
chosen build's completeness (landed, else branch, else baseline); that build
labels **Not in the rows above** and `No file breakdown`, as one run's Summary
does. Comparison figures and tables use signed words and relative marks;
location and file tree cues retain their count-border/duration-tint meaning.
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
Intent uses one page implementation for **Project Intent**, the project's own
evidence, and [a selected story's views](dashboard-development-intent-story.md).
Both contexts keep the story view's persistent header, tab row and reading
area in the same order. The revision notice and **Show latest** update
Project Intent's browser; a Done story's three views have neither and retain
their published result's locations, inventory and source through later project
revisions. With no story selected, the header says
**No story selected** and the page offers the project's **CI status** and
**Optimization Candidates** views. With a story selected, its title, actions and
applicable views use that same arrangement. The active context identifies whose
evidence is shown.
**Project Intent** leading the story's header visits the project's own evidence;
its header says **Project Intent** and offers **Back to selected story**. The
story stays selected, and going either way moves the keyboard to the control
that comes back. Clearing the selection returns to project **CI status** with
**No story selected** in the persistent header.
Below the header, views and revision notice, the page does not scroll: the
location tree fills the remaining height against the left edge, and it and the
reading pane each scroll independently. Project Intent's two views, **CI status**
and **Optimization Candidates**, choose what that content shows; they belong to
Intent and are not another perspective. Arrow keys, Home and End move between
its tabs and only choose the view, so returning to **CI status** that way
keeps what it was reading.
**CI status** shows the location tree (Purpose locations only) beside the
reading pane; it is the view a project's Intent first shows. With nothing
selected the reading pane is Intent's homepage, the trunk's **CI status**,
whatever story is selected; with a file selected it offers **Purpose** and
**Proof** tabs (Purpose first; kept across file selections in the same Intent
visit), and with a location or folder its summary. Purpose is the published
source or, in a selected story's **Changed tests**, its source diff; Proof is
that file's published CI evidence from the view's evidence owner: judged-run
results, or the story's shared signed comparison, under Summary's evidence
labels.
Directly activating the **CI status** tab (click, Enter or Space), even while
already chosen, returns home: the selection clears and CI status shows.
Expansion and reading choices stay. No separate return control.
Project Intent and the selected story's views keep separate reading places:
browsing a project test never replaces the story's file, its Purpose or Proof,
or its scroll, and a project test the story changed shows its published text
in Project Intent. A visit to Project Intent and back restores the story's
chosen view and reading place.
While a location tree shows, Review changes' **Hide files** / **Show files**
toggle states whether the locations column is shown. It ends the common view
row on project **CI status** or a story's **Changed tests**, reached by Tab
after the tabs. Hiding removes the column and gives the reading pane the full
width, or on a narrow screen, where the tree sits above it, the full height; it
changes no selection or reading, and the persistent header stays above it.
**Show files** returns the column as it was: selection, open location and
folders, **Selected story only** and the tree's scroll. Each reading place
keeps its own choice across selections, the story's other views,
**Optimization Candidates** and back, a visit to the other reading place,
Development and back and new revisions; a project change shows the column
again. It is not on the URL or in storage and is not remembered across
reloads; the explanation shown in place of the tree offers no toggle.
**Optimization Candidates** shows the project's published Test Optimization
Candidates record at Intent's reading revision across the content area without
the location tree; the record is read the first time that tab is chosen.
Choosing a location an entry names, an opening rather than a return home,
selects **CI status** with that file's **Purpose** positioned on the entry's
case where that names one line, with its location and folders opened so the
file shows selected, and choosing **Optimization Candidates** again returns to
that entry without reading the record again; activating the tab directly
gives the entry the keyboard.
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
and back, visits from a selected story and new revisions, where
**Optimization Candidates** reads the record at the new revision once **Show
latest** moves the reading there; a project change, a new selection or
clearing the selected story starts again on **CI status**. The choice is disposable page
state, not on the URL or in storage. The reading place is kept the same way,
in memory only:
the selection, the open location and folders, **Selected story only** and the
reading pane's scroll show again after Development and back without reading
the locations or the selected file again. Project Intent reads one published
revision, the observed one when the project's Intent first opens. The persistent
**Test browser at** label names accepted locations even without a file selection;
it advances after accepted updates and stays during updating or failure. A newer
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
distinct explanation from absence. With a story selected, Intent shows that
story's views, as
[Intent for a selected story](dashboard-development-intent-story.md)
describes. Structure is not offered yet. The perspective is disposable presentation state on the URL
(`perspective=intent`), independent of Development's stories/roster view,
which Intent keeps to return to. Choosing a perspective adds one history
entry and never selects another project; changing projects keeps the
perspective, and Back/Forward, reload and System settings restore it. Story
URLs, story references, choosing an open Sessions sidebar entry and a
Recently done sessions row's Open open Development's stories, including from
the same project's Intent. Choosing a Recently done sessions row only selects
it and keeps the perspective and Side panel: a row whose project publishes
its done story recently makes that story the Selected story in its project,
so Intent shows it there; any other row selects its retained session and
keeps the project, story and reading in Intent. In Development the row's
project's stories show instead, with its done story card or selected session
brought into view, as far down Recently done as it stands. An unread or failed done catalog is
said on the row, apart from a confirmed miss, and leaves the reading as it
was. Changing
perspective neither starts, stops, completes nor reattaches a session: the
mounted Board, Sessions sidebar and Side panel stay as they were, and a
covering panel stays open. When the change hides the content holding the
keyboard, the keyboard moves to the selected perspective's choice.
