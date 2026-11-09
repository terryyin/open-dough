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
absent), then a table with one row per declared Intent location `path`, in
declaration order, under the columns **Entry**, **Counts** (passed, failed
and other with the runner's unit, tests or checks), **Test execution time**
(the entry's summed durations: measured, a measured zero reading `0 ms`;
partial as short gap labels joined by commas, such as `Part 2 untimed`,
`Part 3 missing` or `4 tests untimed`; or `No timings` for a summary without
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
status shows none. Its heading gives the actual count and dates of the
measured builds it holds (`1 measured build · Nov 5`, or
`6 measured builds · Nov 1–Nov 5`), then says the history is collected from
dashboard-recorded landings and gives the latest measured build's CI wall
time in whole seconds (`6 min 5 s`), as the
[CI timing comparison](dashboard-development-intent-ci-comparison.md) words
a build's. An image named “CI wall time by build date”, drawn in the page
without a chart library, places each measured build once at its date and CI
wall time and joins them in date order, against whole-step time words; its
words keep their size at phone width. **Builds and evidence**, a disclosure
reached by Tab, lists each build in words: its date, CI wall time,
`exact revision` with the short revision, and its run attempt
(`Run 41 · attempt 1`, or an adapter's `Attempt <attemptId>`) linked to its
run, so a keyboard, a screen reader and a phone get the same evidence
without colour. With no measured build, as for a project with no recorded
landing, it says “No dashboard-recorded landings have been measured yet.”
and draws nothing. The current judgment, its Proof and **Check again** keep
their own reading. The history is read again with each trunk judgment
(when Project Intent shows, when an observed trunk advance refreshes it, and
on **Check again**), never on time alone, and reads only the collected local
history, so it asks CI nothing, before or after a restart.

A production dashboard collects that history in the background
(`dashboard/server/landedCiCollection.ts`) whether or not a page is open:
recording an accepted landing (see
[Landed run records](../dashboard/STORY-REVIEW-LANDED-RUNS.md)) starts a pass
over this machine's recorded landings onto each configured project's ref,
newest first, until 20 measured builds are held for the project. Each
landing resolves through the CI timing comparison's Story Branch Landed rule
at its accepted revision, over the project's CI read: the `ciWorkflow` runs
at that revision, or the `ciAdapter`'s discovery. A measured build is the
landed revision's own passed build whose attempt has both a start and a
completion; its CI wall time follows the comparison's definition. A final
resolution is kept by the landing's receipt, with each build kept once by
its run and attempt, in `~/.open-dough/dashboard/landed-ci-history.json`, and
never resolved again; a landing whose CI is still running or could not be
read is resolved again by the pass the next recorded landing starts. A
development dashboard collects nothing and reads the same history. The file
is derived local evidence: deleting it loses only the requests to rebuild it
and evidence CI no longer keeps.
