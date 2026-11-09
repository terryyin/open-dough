# Intent CI status

Part of [Development and Intent](dashboard-development-intent.md).

**CI status** judges configured trunk (`main` here) in Project Intent, even
while a story is selected, or, in a selected story's **CI comparison**, the
published branch of a Taken story selected by card or Side panel. The story's single Story Branch
Mode agent profile records that branch. Judgment follows the same rule as the
[base-CI check](../dashboard/LAUNCH-BASE-CI.md). The newest
`ciWorkflow` or `ciAdapter` result at the head or nearest ancestor decides.
Trunk results for the same check count on a story branch when the commit is
in its history, and the view names the run's branch, for example "run on
`main`". A failed trunk read leaves **Could not be read**.
A selected **Done** or **Taken** story's
[CI timing comparison](dashboard-development-intent-ci-comparison.md)
owns Baseline / Branch / Landed selection, compact Build source cues,
decluttering, timings, entry cells, and Taken provisional comparisons.
Missing or unusable branch publication is named and shows no status.
Selection replaces the judgment, and clearing it returns to trunk. Judgment
names the branch, **Passed**, **Failed** (including cancelled or timed out),
**Running** or **Could not be read** with the reason, the judged short SHA
and subject, the number of later commits without results, any run link, the
nearest completed ancestor while running, and when it was checked. History
without a result and trunk history GitHub answers `404` for are **Could not
be read** with the reason. Only story branches can be called no longer
published. Below the judgment, **Proof** shows the CI proof of that run (for
a running result, the completed ancestor's) once as short labels, heard and
hovered as a Summary's are: the linked run and attempt
(`Run 41 · attempt 2`, or a `ciAdapter` attempt's `Attempt <attemptId>`), the
revision, `Completed ancestor` for a running result, and that attempt's
**CI wall time** from its start and completion (`CI wall time 3 min`, or
`CI wall time not recorded` with why as its full words when either is
absent), then a table with one row per declared Intent location `path` and
unit of results it reports (test cases, test files, or legacy test results
whose publisher declared no unit; never added together), in declaration
order, under the columns **Entry**, **Counts** (passed, failed and other
naming that unit, `nothing counted as test files` for a declared unit no
part reported), **Test execution time**
(that unit's summed durations: measured, a measured zero reading `0 ms`;
partial as short gap labels joined by commas, such as `Part 2 untimed`,
`Part 3 missing` or `4 test cases untimed`; or `No timings` for a summary without
durations; never zero for absence, no lower bound for partial timing, and
never the attempt's wall time; a gap label's full explanation, such as
“Partial: part 2 of 3 has no duration”, is the cell's hover text and
accessible description). Each column header is a button,
reached by Tab and activated by click, Enter or Space: the first activation
sorts the rows ascending by that column's figures, the next descending, and
the sorted header carries `aria-sort` and a direction arrow. **Entry** sorts
by path name, **Counts** by the number of counted results with failed
results first among equal totals, and **Test execution time** by measured time.
A row without a measured figure for the column (partial, `No timings`)
follows the measured rows in either direction,
and those rows and ties keep declaration order. The sort is kept in memory
while **CI status** stays shown, never on the URL or in storage; the table
has no totals row. A path wraps after its `/`
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
or CI attempt. Proof is read again with each judgment — when Intent opens,
the judged branch changes, the page's revision check finds that followed head
moved, and on **Check again**, with no timed polling. After Project Intent first
shows, its trunk CI stays followed while Intent is open, including when the story
shows. A selected story's CI stays followed during Project Intent visits. Going
between them reads neither judgment again; an observed trunk advance refreshes only
the trunk reading, and an observed watched story-branch advance refreshes only the
story reading (a story branch without a counted plan is not watched and is re-read
on **Check again**). Proof is shown whether Intent locations are configured, absent,
or unreadable: Project Intent's **CI status** shows it beside the
explanation in place of the location tree, and its strip stands above those
explanations, which **Optimization Candidates** also shows.

Project Intent's **CI status** of trunk also shows the **CI wall time
history** after **Proof** and before **Check again**; a story branch's CI
status shows none. It shows a window of the project's dashboard-recorded trunk
landings: the newest 20 distinct measured builds, in trunk order, with the
gaps among and after them. Its heading gives the actual count and dates of
the measured builds it shows (`1 measured build · Nov 5`, or
`20 measured builds · Oct 16–Nov 4`), then says the history is collected from
dashboard-recorded landings and gives the latest measured build's CI wall
time in whole seconds (`6 min 5 s`), as the
[CI timing comparison](dashboard-development-intent-ci-comparison.md) words
a build's. An image named “CI wall time by build date”, drawn in the page
without a chart library, places each measured build once at its date and CI
wall time, higher for a longer time, and joins them in date order, against
whole-step time words, so a rising, falling or varying line reads at a
glance; its words keep their size at phone width. Each gap stands at the
date the dashboard recorded its landing; the line breaks there and draws
nothing for it, so a failed build has no point and a gap after the last
point leaves the line ended before it. **Builds and evidence**, a disclosure
reached by Tab, lists each point and gap in that order, in words. A landing
is named by its landed revision's short form and, when it landed for a
story, that story's identity: `a1b2c3d (SEED-9#e)`.

One build is one point, however many landings it measures. A point gives
its date, CI wall time, each landing it stands for and how, with the build's
revision -- `exact revision a1b2c3d (SEED-9#e)` for the landed revision's own
build, `reused equivalent a1b2c3d for b2c3d4e (SEED-9#r1)` for a confirmed
skip's equivalent build, `later trunk build d6e7f8a for d4e5f6a (SEED-9#f)`
for the later build a cancelled landing joins -- and its run attempt
(`Run 41 · attempt 1`, or an adapter's `Attempt <attemptId>`) linked to its
run. A landing a later build stands for is in that build's point, so it
breaks nothing, and a build counts once in the heading.

A gap is one landing with no CI wall time. It gives the date its landing was
recorded and why, said as _not yet_ while it may still be measured:
`Pending` and what it waits for, `no CI run yet`, `CI queued or running`,
`waiting for a later trunk build` (its own build was cancelled),
`CI proof not read yet` (GitHub has not answered the read of the CI proof of
the build that would stand for it) or `CI not read yet`, then
`landed revision` and the landing, and the run attempt it waits on, linked
to its run, when there is one. Once it never will be measured, it says why,
and names the build the Landed rule named for it as a point names one, with
its run linked: `Failed` (the build that measures it failed; a failed run
can stop early, so its time is never drawn); `Cancelled` (its own build was
cancelled or timed out, and no later trunk build stands for it: that build,
`exact revision d4e5f6a (SEED-9#f)`); `No build` (CI did not build its
revision and no skip was confirmed; no build is named);
`Equivalent timing unavailable` (a confirmed skip has no equivalent build,
or its equivalent build has no timing); `No CI proof summary` (the
equivalent or later trunk build that would stand for it has its timing but
published no CI proof summary, as a CI adapter's never does, so the Landed
rule does not use it); `CI proof expired` or `CI proof unreadable` (that
build's CI proof expired, or GitHub's answer could not be opened or used);
or `CI wall time not recorded` (its build passed, but its attempt names no
start, or no completion after its start; it is never shown as a zero). A run
link that is not a web address is left out, keeping the run attempt's words.
So a keyboard, a screen reader and a phone get the same evidence without
colour. With no measured build it says “No dashboard-recorded landings have
been measured yet.” and draws nothing, still listing any gap. The current
judgment, its Proof and **Check again** keep their own reading: collection
finishing refreshes nothing on the page. The history is read again with each
trunk judgment (when Project Intent shows, when an observed trunk advance
refreshes it, and on **Check again**), never on time alone, and reads only
the collected local history, so it asks CI nothing, before or after a
restart, in a development or a production dashboard alike.

A production dashboard collects that history in the background
(`dashboard/server/landedCiCollection.ts`) whether or not a page is open. A
pass runs when the dashboard starts, so landings recorded before it started,
or before collection existed, are collected by the same rebuild; when it
records an accepted landing (see
[Landed run records](../dashboard/STORY-REVIEW-LANDED-RUNS.md)); and every
two minutes, so a pending landing is checked again until it is final. Passes
never overlap. A pass walks this machine's recorded landings onto each
configured project's ref, with the landings the history keeps itself, newest
first, until 20 measured builds are held for the project. Each landing not
final yet resolves through the CI timing comparison's Story Branch Landed
rule at its accepted revision, over the project's CI read: the `ciWorkflow`
runs at that revision, or the `ciAdapter`'s discovery. That rule measures a
landing by its landed revision's own build; a confirmed skip by its
equivalent build, the nearest earlier first-parent build, when that build
has usable CI proof; and a cancelled landing by the nearest later trunk build
with usable CI proof. A CI adapter's skip or cancelled landing has neither,
so it is a gap. A measured build is such a build that passed, whose attempt
has a start and a later completion; its CI wall time is the comparison's,
from the one definition both read (`wallTimeMs` in
`dashboard/src/ciProofTimeWords.ts`).

A landing is pending while that rule's answer may still change: its build is
queued or running; its cancelled build awaits a later trunk build; the CI
could not be read (the pass then leaves that project until the next one);
GitHub has not answered the read of the CI proof of the build that would
stand for it; or the rule found no build that CI may still make. That last
case covers a landing recorded before GitHub created its push's run: with no
run at the landed revision and no confirmed skip, it waits for a run there
until CI moves past it, that is, until a later first-parent trunk revision
(up to the project folder's `origin/<ref>`, within 30 revisions) has a run,
and for at most an hour after the landing was recorded, since GitHub creates
a push's run within moments; and a landing whose skip rests on the nearest
earlier build waits while that build is queued or running. Once CI ran at the landed
revision, built past it without building it, or never ran for it within that
hour, the gap is final. Only GitHub's answer settles the CI proof of the
equivalent or later trunk build that would stand for a landing. While GitHub
leaves that read unanswered (a wait it directed, a request that failed, or
an artifact listing that is not one), the landing is pending as
`CI proof not read yet` and is read again at each pass, however long ago it
was recorded, for as long as it stays in the history's window; unlike CI
that could not be read, it does not stop the pass, which goes on to the
older landings. Once GitHub answers that the proof is missing, expired, or
an archive that cannot be opened or is not that run's usable summary, the
gap is final, since a run attempt's artifact does not change.

Done story comparison memory uses that same judgment on the selected Landed
slot, before comparison projection omits internal proof-read details.
Pending evidence can recover through Check again or story reselection in the
same dashboard process; completed answers and answered artifact gaps retain
final-answer reuse. Collection still owns its background acquisition cycle,
and reading local history itself asks CI nothing.

Comparison uses a locally recorded receipt age only when its project, target,
story and published Landed revision match. The earliest matching capture fixes
the one-hour deadline, including after its launch record disappears and only
retained history names it. History retains the actual target; legacy references
without that target cannot establish matching age. Missing or unreadable local
capture leaves published comparison available, with unknown age. Completion
and commit times never replace the receipt, nor does a fresh read start a new
wait. Later first-parent CI and the existing walk limit remain independent
ways to settle a no-run gap.

Each landing is kept by its receipt, with its own reference (revision, when
it was recorded, its story), and each build once by its run and attempt, in
`~/.open-dough/dashboard/landed-ci-history.json`. A final resolution is never
resolved or replaced again; a pending one is replaced by what the landing
resolves to next. So a restart, a repeated landing report, or a second
production dashboard on the machine resumes collection and keeps one
observation per landing and one entry per build, and a pending landing whose
Done record has expired (after 30 days) is still resolved from the history's
own reference. The file keeps only each project's window: its landings,
newest first, up to the one that brings the 20th measured build, with any
older landing one of those builds also measures, and the builds they name.
An older landing, pending or not, is dropped and never asked about again. A
development dashboard collects nothing and reads the same history. The file
is derived local evidence: deleting it loses only the requests to rebuild it
and evidence CI no longer keeps.
