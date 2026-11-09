# Source-only review — SEED-285#see-landed-ci-wall-time-history

**Launch.** On 2026-11-09 the execution coordinator (agent jacked-chan,
claude-opus-5-5) launched a fresh general-purpose subagent with no inherited
conversation, fork or resume, before the first implementation delegation.

**Input.** One file holding only lines 49–156 of
`.planning/seeds/SEED-285-landed-ci-timing-history.md` at `56f6d1221`: the
story's Goal, Scope (with its Deferred promises and Boundary assumptions) and
Key examples, sha256
`d30ec5235d32b5d96d185c29ffb3319b36b75e306828b447ff4e384c1adec0dc`. The
reviewer was told to read only that file, read no project files, change
nothing, and return numbered commitments with compound items split, kinds
(promise, qualification, example, exclusion, boundary assumption) and the
examples linked to the promises they illustrate. It received no plan, product,
proof or slice scope.

**Return.** 145 numbered commitments, kept as returned below with
their kind and example links, plus the reviewer's ambiguity notes. The
Commitments table allocates each id to the slice that completes it.

## Reviewer return

```text
| Id | Source commitment | Kind | Illustrated by / illustrates |
|---|---|---|---|
| 1 | "A developer reading Project Intent's **CI status** can see whether CI wall time on the project's dashboard-recorded trunk landings is rising, falling or variable" | promise | Not directly illustrated (no example states a trend reading); see 1.1–1.3 |
| 1.1 | Trend alternative: "rising" | promise (alternative) | Not directly illustrated |
| 1.2 | Trend alternative: "falling" | promise (alternative) | Not directly illustrated |
| 1.3 | Trend alternative: "variable" | promise (alternative) | Not directly illustrated |
| 2 | "and can tell measured builds from gaps" | promise | 49.2, 50.1, 53.2, 55.1 |
| 3 | "without assembling CI runs by hand" | qualification/constraint (on 1, 2) | 49.1 |
| 4 | "The story also tests whether the dashboard observes enough landings to make such a trend useful." | promise (learning question) | Not directly illustrated; related 29–31 |
| 5 | "The broader aim of tracing and flagging slowdowns belongs to the later stories in this seed." | exclusion | Related 43; see 5.1, 5.2 |
| 5.1 | Tracing slowdowns ("later stories in this seed") | exclusion | — |
| 5.2 | Flagging slowdowns ("later stories in this seed") | exclusion | — |
| 6 | **Cohort.** "Every trunk landing the dashboard recorded for the project, whatever workflow landed it" | promise | See 6.1–6.3; qualified by 7 |
| 6.1 | Landing workflow "refinement" | promise | 52.1, 53.1 |
| 6.2 | Landing workflow "execution" | promise | 49.1, 54.1 |
| 6.3 | Landing workflow "ad hoc" | promise | Not directly illustrated |
| 7 | "within the retained history" | qualification/constraint (on 6) | Not directly illustrated; related 47, 48 |
| 8 | **Collection.** "Once a Done report with an accepted landing is recorded, the landed revision's CI result is collected" | promise | 49.1, 58 |
| 9 | "through the project's existing CI read boundary" | qualification/constraint (on 8) | 58 |
| 10 | "for both `ciWorkflow` (GitHub Actions) and `ciAdapter` projects" | promise | See 10.1, 10.2 |
| 10.1 | `ciWorkflow` (GitHub Actions) projects | promise | Not directly illustrated |
| 10.2 | `ciAdapter` projects | promise | 58 |
| 11 | "Collection does not depend on Intent being open." | promise | 49.1 |
| 12 | "It waits while CI is queued or running" | promise | See 12.1, 12.2 |
| 12.1 | Waits while CI is "queued" | promise | Not directly illustrated |
| 12.2 | Waits while CI is "running" | promise | 50.1, 51.1 |
| 13 | "and takes the result when it completes" | promise | 49.1, 50.2, 51.1 |
| 14 | "A dashboard restart, a repeated Done report or a second dashboard process on the machine resumes collection" | promise | See 14.1–14.3 |
| 14.1 | "A dashboard restart" resumes collection | promise | 51.1 |
| 14.2 | "a repeated Done report" resumes collection | promise | Not directly illustrated |
| 14.3 | "a second dashboard process on the machine" resumes collection | promise | Not directly illustrated |
| 15 | "and does not duplicate a measurement" (same three events as 14) | promise | See 15.1–15.3 |
| 15.1 | A dashboard restart does not duplicate a measurement | promise | 51.1 |
| 15.2 | A repeated Done report does not duplicate a measurement | promise | 51.2 |
| 15.3 | A second dashboard process on the machine does not duplicate a measurement | promise | Not directly illustrated |
| 16 | "Landings already recorded when the capability arrives are collected by the same rebuild." | promise | Not directly illustrated |
| 17 | **Which build measures a landing.** "Use the CI timing comparison's Landed rule (Terry, 2026-11-09)" | qualification/constraint (who decided; governs 17.1–17.4) | See 17.1–17.4 |
| 17.1 | "The exact landed revision's completed build is measured." | promise | 49.2 |
| 17.2 | "A confirmed skip reuses the equivalent first-parent build" | promise | 52.1, 53.1 |
| 17.2.1 | "labelled as reused with that build's identity" | promise | 53.1 |
| 17.2.2 | "If the equivalent build has no timing, the landing is a gap." | promise | 53.2 |
| 17.3 | "A cancelled landing build is measured by the nearest later trunk build that has timing." | promise | 54.1, 54.2 |
| 17.3.1 | "The point is labelled a later trunk build" | promise | 54.1 |
| 17.3.2 | "and that build is counted once" | promise | 54.2 |
| 17.4 | "A failed build is a labelled **Failed** gap" (Terry, 2026-11-09; the decision covers 17.4.1–17.4.2) | promise | 55.1 |
| 17.4.1 | "with its build link" | promise | 55.1 |
| 17.4.2 | "and no plotted time" | promise | 55.2 |
| 17.4.3 | Rationale: "A failed run can stop early, so its wall time is not the CI duration." | qualification/constraint (rationale for 17.4.2) | 55.2 |
| 18 | "The measured attempt and **CI wall time** follow the existing definitions in Intent CI timing comparison (../../docs/dashboard-development-intent-ci-comparison.md)." | qualification/constraint (which definitions apply; on 1, 17, 32.2) | See 18.1, 18.2 |
| 18.1 | "The measured attempt" follows the existing definition | qualification/constraint | 58 |
| 18.2 | "**CI wall time**" follows the existing definition | qualification/constraint | Not directly illustrated |
| 19 | **One point per build.** "Several landings that resolve to the same build make one point" | promise | 52.1, 54.2 |
| 20 | "that names the landings it represents" | promise | 52.1, 53.1, 54.1 |
| 21 | **Gaps.** "A landing whose CI is still pending, whose build failed, or whose timing is unavailable (no build, unreadable, expired, no equivalent)" is a gap (22–24 apply to each case) | promise | See 21.1–21.3 |
| 21.1 | "whose CI is still pending" | promise | 50.1 |
| 21.2 | "whose build failed" | promise | 55.1 |
| 21.3 | "whose timing is unavailable" | promise | 53.2 |
| 21.3.1 | Unavailable: "no build" | promise | Not directly illustrated |
| 21.3.2 | Unavailable: "unreadable" | promise | Not directly illustrated |
| 21.3.3 | Unavailable: "expired" | promise | Not directly illustrated |
| 21.3.4 | Unavailable: "no equivalent" | promise | Not directly illustrated (see note on 53.2) |
| 22 | Such a landing "breaks the line" | promise | 50.1, 55.1; contrast 54.2 |
| 23 | "and is listed" | promise | 55.1 |
| 24 | "with a short reason distinct for each case" | promise | 50.1, 53.2, 55.1 |
| 25 | "The line and listing never show a zero or invented time." | qualification/constraint | See 25.1, 25.2 |
| 25.1 | The line never shows a zero or invented time | qualification/constraint | 55.2 |
| 25.2 | The listing never shows a zero or invented time | qualification/constraint | Not directly illustrated |
| 26 | **Window.** "The newest 20 distinct measured builds" | promise | 52.2, 56.1 |
| 27 | "in trunk order" | qualification/constraint (on 26) | Not directly illustrated |
| 28 | "with the gaps that fall among or after them" | promise | See 28.1, 28.2 |
| 28.1 | Gaps that fall "among" the measured builds | promise | Not directly illustrated |
| 28.2 | Gaps that fall "after" them | promise | 50.1 |
| 29 | "The heading states the actual measured count" | promise | 52.2, 56.1, 56.2 |
| 30 | "and date span" | promise | 56.1 |
| 31 | "Recent Open Dough and Pygardon activity fills 20 builds in about 2–3 days, and Doughnut in about a week." | boundary assumption (stated under Window) | Related 4; see 31.1–31.3 |
| 31.1 | Open Dough: about 2–3 days | boundary assumption | — |
| 31.2 | Pygardon: about 2–3 days | boundary assumption | — |
| 31.3 | Doughnut: about a week | boundary assumption | — |
| 32 | **Readable evidence.** "Beside the chart, a list gives each point and gap" its evidence (32.1–32.4) | promise | 49.2, 55.1 |
| 32.1 | "its date" | promise | Not directly illustrated |
| 32.2 | "wall time or gap reason" (alternatives) | promise | 49.2, 55.1 |
| 32.3 | "provenance (exact, reused equivalent, later trunk build)" | promise | See 32.3.1–32.3.3 |
| 32.3.1 | Provenance alternative "exact" | promise (alternative) | 49.2 |
| 32.3.2 | Provenance alternative "reused equivalent" | promise (alternative) | 53.1 |
| 32.3.3 | Provenance alternative "later trunk build" | promise (alternative) | 54.1 |
| 32.4 | "and build link" | promise | 49.2, 55.1 |
| 33 | "A keyboard or screen-reader user and a phone reader get the same evidence" | promise | See 33.1–33.3 |
| 33.1 | A keyboard user gets the same evidence | promise | Not directly illustrated |
| 33.2 | A screen-reader user gets the same evidence | promise | Not directly illustrated |
| 33.3 | A phone reader gets the same evidence | promise | Not directly illustrated |
| 34 | "without relying on colour" | qualification/constraint (on 32, 33) | Not directly illustrated |
| 35 | **Reading.** "Opening or refreshing **CI status** reads only the collected local history." | qualification/constraint | 49.2 |
| 35.1 | Opening CI status reads only the collected local history | qualification/constraint | Not directly illustrated |
| 35.2 | Refreshing CI status reads only the collected local history | qualification/constraint | Not directly illustrated |
| 36 | "It acquires no CI data" | qualification/constraint | Not directly illustrated |
| 36.1 | "including after a restart" | qualification/constraint (on 36) | Not directly illustrated |
| 37 | "The chart is read again whenever **CI status** refreshes its trunk reading" | promise | 50.2 |
| 38 | "with no timed polling" | qualification/constraint (on 37) | Not directly illustrated |
| 39 | "Current CI status and its **Check again** keep their own lifecycle." | qualification/constraint | See 39.1, 39.2 |
| 39.1 | Current CI status keeps its own lifecycle | qualification/constraint | 57.2 |
| 39.2 | Its **Check again** keeps its own lifecycle | qualification/constraint | Not directly illustrated |
| 40 | **Empty and early states.** "A project with no recorded landings, or none measured yet, says so in words" | promise | See 40.1, 40.2 |
| 40.1 | "no recorded landings" | promise | 57.1 |
| 40.2 | "none measured yet" | promise | Not directly illustrated |
| 41 | "instead of drawing an empty chart" | qualification/constraint (on 40) | 57.1 |
| 42 | Deferred: "moving average and the difference from it, and excluded-point marks" | exclusion | See 42.1–42.3 |
| 42.1 | "moving average" | exclusion | — |
| 42.2 | "the difference from it" (from the moving average) | exclusion | — |
| 42.3 | "excluded-point marks" | exclusion | — |
| 43 | Deferred: "a Done story's position in the history and test-scope histories (the later stories in this seed)" | exclusion | Related 5; see 43.1, 43.2 |
| 43.1 | "a Done story's position in the history" | exclusion | — |
| 43.2 | "test-scope histories" | exclusion | — |
| 44 | Deferred: "a time-span window or a user-chosen window" | exclusion | Contrast 26; see 44.1, 44.2 |
| 44.1 | "a time-span window" | exclusion | — |
| 44.2 | "a user-chosen window" | exclusion | — |
| 45 | Deferred: "trunk builds the dashboard did not record as landings" | exclusion | Contrast 53.1 (c3 plotted as R3's reused equivalent), 54.1 (d6 point measures F) |
| 46 | "the landing record keeps the accepted revision, as Landed run records (../../dashboard/STORY-REVIEW-LANDED-RUNS.md) describe" | boundary assumption | Underpins 8, 17.1 |
| 47 | "Done records expire after 30 days" | boundary assumption | Grounds 48 |
| 48 | "so the history keeps its own landing references for the window" | promise | Not directly illustrated; related 7, 26 |
| 49 | Key example 1, **Exact build**: "Open Dough lands execution E at `a1`. CI on `a1` succeeds in 6m 05s" | trigger/journey example | See 49.1, 49.2 |
| 49.1 | "→ the dashboard collects it without Intent open" | trigger/journey example | Illustrates 3, 6.2, 8, 11, 13 |
| 49.2 | "and the next **CI status** read shows an `a1` point at 6m 05s, labelled exact, in the list with its run link" | trigger/journey example | Illustrates 2, 17.1, 32, 32.2, 32.3.1, 32.4, 35 |
| 50 | Key example 2, **Pending, then measured**: "Landing at `b2` is recorded while CI is running." | trigger/journey example | See 50.1, 50.2 |
| 50.1 | "**CI status** shows a pending gap at the end of the line." | trigger/journey example | Illustrates 2, 12.2, 21.1, 22, 24, 28.2 |
| 50.2 | "CI completes, the trunk reading refreshes, and the point appears." | trigger/journey example | Illustrates 13, 37 |
| 51 | Key example 3, **Restart while pending** | trigger/journey example | See 51.1, 51.2 |
| 51.1 | "The dashboard stops while `b2` is still running and starts after it completes → collection resumes and `b2` is measured once." | trigger/journey example | Illustrates 12.2, 13, 14.1, 15.1 |
| 51.2 | "A repeated Done report for `b2` adds no second point." | trigger/journey example | Illustrates 15.2 |
| 52 | Key example 4, **Confirmed skip reusing a build that is already a point**: "Refinement landings R1 and R2 change only planning files, and their equivalent build is `a1`" | trigger/journey example | See 52.1, 52.2 |
| 52.1 | "→ `a1` remains one point that names E, R1 and R2." | trigger/journey example | Illustrates 6.1, 17.2, 19, 20 |
| 52.2 | "The measured count does not change." | trigger/journey example | Illustrates 26, 29 |
| 53 | Key example 5, **Confirmed skip reusing a build that is not a point yet**: "Refinement R3's equivalent is `c3`, a trunk build no recorded landing measured" | trigger/journey example | See 53.1, 53.2 |
| 53.1 | "→ a point at `c3` labelled as reused equivalent timing for R3 with `c3`'s identity." | trigger/journey example | Illustrates 6.1, 17.2, 17.2.1, 20, 32.3.2 |
| 53.2 | "If `c3` has no timing, R3 is a gap: 'equivalent timing unavailable'." | trigger/journey example | Illustrates 2, 17.2.2, 21.3, 24 |
| 54 | Key example 6, **Cancelled landing**: "Execution F's build at `d4` was cancelled by a later push, and the next trunk build `d6` succeeds in 7m 10s" | trigger/journey example | See 54.1, 54.2 |
| 54.1 | "→ F joins the `d6` point, labelled as a later trunk build." | trigger/journey example | Illustrates 6.2, 17.3, 17.3.1, 20, 32.3.3 |
| 54.2 | "A recorded landing at `d6` uses the same point, and there is no break in the line." | trigger/journey example | Illustrates 17.3, 17.3.2, 19 |
| 55 | Key example 7, **Failed landing**: "G's build at `e5` failed after 2m" | trigger/journey example | See 55.1, 55.2 |
| 55.1 | "→ the line breaks at G with **Failed** and a run link." | trigger/journey example | Illustrates 2, 17.4, 17.4.1, 21.2, 22, 23, 24, 32, 32.2, 32.4 |
| 55.2 | "No 2m point is drawn." | trigger/journey example | Illustrates 17.4.2, 17.4.3, 25.1 |
| 56 | Key example 8, **Window** | trigger/journey example | See 56.1, 56.2 |
| 56.1 | "35 measured builds collected → the chart shows the newest 20 and says '20 measured builds' with their date span." | trigger/journey example | Illustrates 26, 29, 30 |
| 56.2 | "A project with 4 measured builds says '4 measured builds'." | trigger/journey example | Illustrates 29 |
| 57 | Key example 9, **No history yet**: "A newly configured project with no recorded landing" | trigger/journey example | See 57.1, 57.2 |
| 57.1 | "→ **CI status** says that no dashboard-recorded landings have been measured yet" | trigger/journey example | Illustrates 40, 40.1, 41 |
| 57.2 | "and the current CI judgment is unchanged" | trigger/journey example | Illustrates 39.1 |
| 58 | Key example 10, **Adapter project**: "Pygardon (a `ciAdapter` project) lands at `p7` → the adapter's attempt timing is collected and plotted the same way." | trigger/journey example | Illustrates 8, 9, 10.2, 18.1 |

Ambiguous: "collected by the same rebuild" (the source defines no rebuild anywhere else); "a short reason distinct for each case" (unclear whether that means one reason per gap kind or one per listed unavailable reason); "each point and gap its date, wall time or gap reason, provenance ... and build link" (unclear whether a "no build" gap has provenance and a link); "a Done story's position in the history and test-scope histories" (could be one deferred item or two; split here as 43.1/43.2); Key example 5's "equivalent timing unavailable" (unclear whether this is the "no equivalent" reason or another listed one); "Recent Open Dough and Pygardon activity fills 20 builds..." (listed under Required behavior but reads as an observation; recorded as boundary assumption 31); "within the retained history" (no retention length given beyond "Done records expire after 30 days"); the examples' "run link" versus the scope's "build link" (treated here as the same link).
```

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | "A developer reading Project Intent's **CI status** can see whether CI wall time on the project's dashboard-recorded trunk landings is rising, falling or variable" (promise) | slice 3 | |
| 1.1 | Trend alternative: "rising" (promise (alternative)) | slice 3 | |
| 1.2 | Trend alternative: "falling" (promise (alternative)) | slice 3 | |
| 1.3 | Trend alternative: "variable" (promise (alternative)) | slice 3 | |
| 2 | "and can tell measured builds from gaps" (promise) | slice 3 | |
| 3 | "without assembling CI runs by hand" (qualification/constraint (on 1, 2)) | slice 3 | |
| 4 | "The story also tests whether the dashboard observes enough landings to make such a trend useful." (promise (learning question)) | slice 3 | |
| 5 | "The broader aim of tracing and flagging slowdowns belongs to the later stories in this seed." (exclusion) | slice 3 | |
| 5.1 | Tracing slowdowns ("later stories in this seed") (exclusion) | slice 3 | |
| 5.2 | Flagging slowdowns ("later stories in this seed") (exclusion) | slice 3 | |
| 6 | **Cohort.** "Every trunk landing the dashboard recorded for the project, whatever workflow landed it" (promise) | slice 3 | |
| 6.1 | Landing workflow "refinement" (promise) | slice 3 | |
| 6.2 | Landing workflow "execution" (promise) | slice 1 | observed: dashboard/backend-tests/intent/landed-ci-history-collection.spec.ts 'a server that collects': a Story Branch execution integration (claimedLaunchWithStoryCommit, integrated()) records the landing, receipt identity equals the execution identity, and its exact build is collected as a point |
| 6.3 | Landing workflow "ad hoc" (promise) | slice 3 | |
| 7 | "within the retained history" (qualification/constraint (on 6)) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts 'landings recorded before collection starts…': the expired landing, whose Done record expired before any server started, is never collected (store kinds exclude it, no run 40 point) |
| 8 | **Collection.** "Once a Done report with an accepted landing is recorded, the landed revision's CI result is collected" (promise) | slice 1 | observed: dashboard/backend-tests/intent/landed-ci-history-collection.spec.ts 'a server that collects': once the accepted landing is recorded the history read polls to the exact point; replacing landedCi.nudge() fails it (s1-mutation-nudge.log) |
| 9 | "through the project's existing CI read boundary" (qualification/constraint (on 8)) | slice 1 | observed: dashboard/backend-tests/intent/landed-ci-history-collection.spec.ts 'a server that collects': exactly one head_sha runs listing at the landed revision, made by lookupResultBuild over the project's ciWorkflow read (landedCiResolution.ts landingResolution()) |
| 10 | "for both `ciWorkflow` (GitHub Actions) and `ciAdapter` projects" (promise) | slice 3 | |
| 10.1 | `ciWorkflow` (GitHub Actions) projects (promise) | slice 1 | observed: dashboard/backend-tests/intent/landed-ci-history-collection.spec.ts 'a server that collects': the default ci.yml Actions push run of the GitHub Actions project is collected |
| 10.2 | `ciAdapter` projects (promise) | slice 3 | |
| 11 | "Collection does not depend on Intent being open." (promise) | slice 1 | observed: dashboard/backend-tests/intent/landed-ci-history-collection.spec.ts 'a server that collects' runs with serverMode boundary and no page; dashboard/tests/intent/intent-ci-wall-time-history.spec.ts 'a collected landing's exact build is a point…' waits for collection before any page opens |
| 12 | "It waits while CI is queued or running" (promise) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts 'landings recorded before collection starts…', dashboard/backend-tests/intent/landed-ci-history-pending.spec.ts 'a landing recorded before its trunk run exists…' and dashboard/tests/intent/intent-ci-wall-time-history-pending.spec.ts 'checking pending landings again': landings wait as pending gaps while their CI is queued or running |
| 12.1 | Waits while CI is "queued" (promise) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-pending.spec.ts 'a landing recorded before its trunk run exists…': a queued run 52 answers a pending gap waiting for its build, with Run 52 |
| 12.2 | Waits while CI is "running" (promise) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts 'landings recorded before collection starts…': in-progress run 43 answers a pending gap waiting for its build; dashboard/tests/intent/intent-ci-wall-time-history-pending.spec.ts 'checking pending landings again' lists Pending · CI queued or running · Run 42 · attempt 1 |
| 13 | "and takes the result when it completes" (promise) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-pending.spec.ts 'a landing recorded before its trunk run exists…': run 52 completing becomes the exact point; dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts 'landings recorded before collection starts…': run 43 is measured once CI completes; dashboard/tests/intent/intent-ci-wall-time-history-pending.spec.ts 'checking pending landings again': the point appears |
| 14 | "A dashboard restart, a repeated Done report or a second dashboard process on the machine resumes collection" (promise) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts 'landings recorded before collection starts…' and dashboard/backend-tests/intent/landed-ci-history-pending.spec.ts 'a landing recorded before its trunk run exists…': restart, repeated report and a second collecting process each resume collection |
| 14.1 | "A dashboard restart" resumes collection (promise) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts 'landings recorded before collection starts…': the first server stops while run 43 runs, and the restarted server measures it |
| 14.2 | "a repeated Done report" resumes collection (promise) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-pending.spec.ts 'a landing recorded before its trunk run exists…': a repeated POST of the same landing returns the same receipt and collection still reaches its point |
| 14.3 | "a second dashboard process on the machine" resumes collection (promise) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts 'landings recorded before collection starts…': two production servers started together collect, and a development server reads the same history |
| 15 | "and does not duplicate a measurement" (same three events as 14) (promise) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts 'landings recorded before collection starts…' and dashboard/backend-tests/intent/landed-ci-history-pending.spec.ts 'a landing recorded before its trunk run exists…': one observation per landing and one build per run after each event |
| 15.1 | A dashboard restart does not duplicate a measurement (promise) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts 'landings recorded before collection starts…': after the restart the store holds three landings and only builds run/41/1 and run/43/1 |
| 15.2 | A repeated Done report does not duplicate a measurement (promise) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-pending.spec.ts 'a landing recorded before its trunk run exists…': after the repeated report the store keeps one landing and only run/52/1 |
| 15.3 | A second dashboard process on the machine does not duplicate a measurement (promise) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts 'landings recorded before collection starts…': two collecting processes leave one observation per landing and one build per run |
| 16 | "Landings already recorded when the capability arrives are collected by the same rebuild." (promise) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts 'landings recorded before collection starts…': landings in agent-launches.json before any server started are collected by the first pass, with no landing report |
| 17 | **Which build measures a landing.** "Use the CI timing comparison's Landed rule (Terry, 2026-11-09)" (qualification/constraint (who decided; governs 17.1–17.4)) | slice 3 | |
| 17.1 | "The exact landed revision's completed build is measured." (promise) | slice 1 | observed: dashboard/backend-tests/intent/landed-ci-history-collection.spec.ts 'a server that collects': the point's revision equals the landing receipt revision, provenance exact, from successful run 41 attempt 1 |
| 17.2 | "A confirmed skip reuses the equivalent first-parent build" (promise) | slice 3 | |
| 17.2.1 | "labelled as reused with that build's identity" (promise) | slice 3 | |
| 17.2.2 | "If the equivalent build has no timing, the landing is a gap." (promise) | slice 3 | |
| 17.3 | "A cancelled landing build is measured by the nearest later trunk build that has timing." (promise) | slice 3 | |
| 17.3.1 | "The point is labelled a later trunk build" (promise) | slice 3 | |
| 17.3.2 | "and that build is counted once" (promise) | slice 3 | |
| 17.4 | "A failed build is a labelled **Failed** gap" (Terry, 2026-11-09; the decision covers 17.4.1–17.4.2) (promise) | slice 3 | |
| 17.4.1 | "with its build link" (promise) | slice 3 | |
| 17.4.2 | "and no plotted time" (promise) | slice 3 | |
| 17.4.3 | Rationale: "A failed run can stop early, so its wall time is not the CI duration." (qualification/constraint (rationale for 17.4.2)) | slice 3 | |
| 18 | "The measured attempt and **CI wall time** follow the existing definitions in Intent CI timing comparison (../../docs/dashboard-development-intent-ci-comparison.md)." (qualification/constraint (which definitions apply; on 1, 17, 32.2)) | slice 3 | |
| 18.1 | "The measured attempt" follows the existing definition (qualification/constraint) | slice 3 | |
| 18.2 | "**CI wall time**" follows the existing definition (qualification/constraint) | slice 1 | observed: dashboard/backend-tests/intent/landed-ci-history-collection.spec.ts 'a server that collects': the point carries the attempt start 10:00:00Z and completion 10:06:05Z from the shared Landed lookup slot; dashboard/tests/intent/intent-ci-wall-time-history.spec.ts 'a collected landing's exact build is a point…' words it 6 min 5 s through wallTimeMs and wholeSecondWords, as the CI timing comparison does |
| 19 | **One point per build.** "Several landings that resolve to the same build make one point" (promise) | slice 3 | |
| 20 | "that names the landings it represents" (promise) | slice 3 | |
| 21 | **Gaps.** "A landing whose CI is still pending, whose build failed, or whose timing is unavailable (no build, unreadable, expired, no equivalent)" is a gap (22–24 apply to each case) (promise) | slice 3 | |
| 21.1 | "whose CI is still pending" (promise) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts 'landings recorded before collection starts…', dashboard/backend-tests/intent/landed-ci-history-pending.spec.ts 'a landing recorded before its trunk run exists…', dashboard/backend-tests/intent/landed-ci-history-pending.spec.ts 'a landing whose push never gets a run…', dashboard/backend-tests/intent/landed-ci-history-pending.spec.ts 'a landing whose CI could not be read…' and dashboard/tests/intent/intent-ci-wall-time-history-pending.spec.ts 'checking pending landings again': a landing whose CI is not final is answered and listed as a pending gap |
| 21.2 | "whose build failed" (promise) | slice 3 | |
| 21.3 | "whose timing is unavailable" (promise) | slice 3 | |
| 21.3.1 | Unavailable: "no build" (promise) | slice 3 | |
| 21.3.2 | Unavailable: "unreadable" (promise) | slice 3 | |
| 21.3.3 | Unavailable: "expired" (promise) | slice 3 | |
| 21.3.4 | Unavailable: "no equivalent" (promise) | slice 3 | |
| 22 | Such a landing "breaks the line" (promise) | slice 3 | |
| 23 | "and is listed" (promise) | slice 3 | |
| 24 | "with a short reason distinct for each case" (promise) | slice 3 | |
| 25 | "The line and listing never show a zero or invented time." (qualification/constraint) | slice 3 | |
| 25.1 | The line never shows a zero or invented time (qualification/constraint) | slice 3 | |
| 25.2 | The listing never shows a zero or invented time (qualification/constraint) | slice 3 | |
| 26 | **Window.** "The newest 20 distinct measured builds" (promise) | slice 3 | |
| 27 | "in trunk order" (qualification/constraint (on 26)) | slice 3 | |
| 28 | "with the gaps that fall among or after them" (promise) | slice 3 | |
| 28.1 | Gaps that fall "among" the measured builds (promise) | slice 3 | |
| 28.2 | Gaps that fall "after" them (promise) | slice 3 | |
| 29 | "The heading states the actual measured count" (promise) | slice 3 | |
| 30 | "and date span" (promise) | slice 3 | |
| 31 | "Recent Open Dough and Pygardon activity fills 20 builds in about 2–3 days, and Doughnut in about a week." (boundary assumption (stated under Window)) | slice 3 | |
| 31.1 | Open Dough: about 2–3 days (boundary assumption) | slice 3 | |
| 31.2 | Pygardon: about 2–3 days (boundary assumption) | slice 3 | |
| 31.3 | Doughnut: about a week (boundary assumption) | slice 3 | |
| 32 | **Readable evidence.** "Beside the chart, a list gives each point and gap" its evidence (32.1–32.4) (promise) | slice 3 | |
| 32.1 | "its date" (promise) | slice 3 | |
| 32.2 | "wall time or gap reason" (alternatives) (promise) | slice 3 | |
| 32.3 | "provenance (exact, reused equivalent, later trunk build)" (promise) | slice 3 | |
| 32.3.1 | Provenance alternative "exact" (promise (alternative)) | slice 1 | observed: dashboard/tests/intent/intent-ci-wall-time-history.spec.ts 'a collected landing's exact build is a point…': the Builds and evidence item reads Nov 5 · 6 min 5 s · exact revision <sha> · Run 41 · attempt 1 |
| 32.3.2 | Provenance alternative "reused equivalent" (promise (alternative)) | slice 3 | |
| 32.3.3 | Provenance alternative "later trunk build" (promise (alternative)) | slice 3 | |
| 32.4 | "and build link" (promise) | slice 3 | |
| 33 | "A keyboard or screen-reader user and a phone reader get the same evidence" (promise) | slice 3 | |
| 33.1 | A keyboard user gets the same evidence (promise) | slice 3 | |
| 33.2 | A screen-reader user gets the same evidence (promise) | slice 3 | |
| 33.3 | A phone reader gets the same evidence (promise) | slice 3 | |
| 34 | "without relying on colour" (qualification/constraint (on 32, 33)) | slice 3 | |
| 35 | **Reading.** "Opening or refreshing **CI status** reads only the collected local history." (qualification/constraint) | slice 1 | observed: dashboard/backend-tests/intent/landed-ci-history-collection.spec.ts 'a server that collects': a second history read adds no gh call; performIntentCiHistoryRead answers from the local store through landedCiMeasuredBuilds.ts only |
| 35.1 | Opening CI status reads only the collected local history (qualification/constraint) | slice 1 | observed: dashboard/backend-tests/intent/landed-ci-history-collection.spec.ts 'a server that collects': the history read before and after collection answers from the store, and the re-read adds no gh call; the page opens the read in dashboard/tests/intent/intent-ci-wall-time-history.spec.ts 'a collected landing's exact build is a point…' |
| 35.2 | Refreshing CI status reads only the collected local history (qualification/constraint) | slice 2 | observed: dashboard/tests/intent/intent-ci-wall-time-history-pending.spec.ts 'checking pending landings again': trunk refresh and Check again re-read the history from the server's local store; dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts 'landings recorded before collection starts…': the development server's history reads make no Actions request to its GitHub |
| 36 | "It acquires no CI data" (qualification/constraint) | slice 1 | observed: dashboard/backend-tests/intent/landed-ci-history-collection.spec.ts 'a server that collects': github.calls after the history re-read is empty; intentCiHistoryRead.ts reads only the local store and landedCiMeasuredBuilds.ts, neither of which asks CI |
| 36.1 | "including after a restart" (qualification/constraint (on 36)) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts 'landings recorded before collection starts…': after the restart the development server's history reads leave its GitHub with no Actions call |
| 37 | "The chart is read again whenever **CI status** refreshes its trunk reading" (promise) | slice 2 | observed: dashboard/tests/intent/intent-ci-wall-time-history-pending.spec.ts 'checking pending landings again' step 'the trunk moves on': reads go from judgment 1 and history 1 to 2 and 2, and the point appears |
| 38 | "with no timed polling" (qualification/constraint (on 37)) | slice 2 | observed: dashboard/tests/intent/intent-ci-wall-time-history-pending.spec.ts 'checking pending landings again' step 'time alone…' with the page clock paused and advanced: reads stay 1 and 1 and the pending item stays, though the server already holds the point |
| 39 | "Current CI status and its **Check again** keep their own lifecycle." (qualification/constraint) | slice 2 | observed: dashboard/tests/intent/intent-ci-wall-time-history-pending.spec.ts 'checking pending landings again': collection finishing refreshes nothing on the page; Check again reads judgment and history together (3 and 3) and re-enables |
| 39.1 | Current CI status keeps its own lifecycle (qualification/constraint) | slice 1 | observed: dashboard/tests/intent/intent-ci-wall-time-history.spec.ts 'a collected landing's exact build is a point…' and dashboard/tests/intent/intent-ci-wall-time-history.spec.ts 'a project with no recorded landing…' assert the status line and Proof labels unchanged; consumer runs a (intent-ci-status and proof journeys, 42 passed) and c (Intent request accounting, 22 passed) |
| 39.2 | Its **Check again** keeps its own lifecycle (qualification/constraint) | slice 2 | observed: dashboard/tests/intent/intent-ci-wall-time-history-pending.spec.ts 'checking pending landings again' step 'Check again reads the judgment and the history again, together' |
| 40 | **Empty and early states.** "A project with no recorded landings, or none measured yet, says so in words" (promise) | slice 3 | |
| 40.1 | "no recorded landings" (promise) | slice 1 | observed: dashboard/tests/intent/intent-ci-wall-time-history.spec.ts 'a project with no recorded landing…': says No dashboard-recorded landings have been measured yet., with no image and no Builds and evidence |
| 40.2 | "none measured yet" (promise) | slice 3 | |
| 41 | "instead of drawing an empty chart" (qualification/constraint (on 40)) | slice 3 | |
| 42 | Deferred: "moving average and the difference from it, and excluded-point marks" (exclusion) | slice 3 | |
| 42.1 | "moving average" (exclusion) | slice 3 | |
| 42.2 | "the difference from it" (from the moving average) (exclusion) | slice 3 | |
| 42.3 | "excluded-point marks" (exclusion) | slice 3 | |
| 43 | Deferred: "a Done story's position in the history and test-scope histories (the later stories in this seed)" (exclusion) | slice 3 | |
| 43.1 | "a Done story's position in the history" (exclusion) | slice 3 | |
| 43.2 | "test-scope histories" (exclusion) | slice 3 | |
| 44 | Deferred: "a time-span window or a user-chosen window" (exclusion) | slice 3 | |
| 44.1 | "a time-span window" (exclusion) | slice 3 | |
| 44.2 | "a user-chosen window" (exclusion) | slice 3 | |
| 45 | Deferred: "trunk builds the dashboard did not record as landings" (exclusion) | slice 3 | |
| 46 | "the landing record keeps the accepted revision, as Landed run records (../../dashboard/STORY-REVIEW-LANDED-RUNS.md) describe" (boundary assumption) | slice 1 | observed: landedCiCollection.ts trunkLandings and landedCiResolution.ts landingResolution() consume the landing's revision; dashboard/backend-tests/intent/landed-ci-history-collection.spec.ts 'a server that collects' asserts the point revision equals landing.receipt.revision |
| 47 | "Done records expire after 30 days" (boundary assumption) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts 'landings recorded before collection starts…': every Done record is rewritten as expired (31 days) before the restart, so readable launch records no longer hold them |
| 48 | "so the history keeps its own landing references for the window" (promise) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts 'landings recorded before collection starts…': the pending landing is measured from the history's own reference after its Done record expired |
| 49 | Key example 1, **Exact build**: "Open Dough lands execution E at `a1`. CI on `a1` succeeds in 6m 05s" (trigger/journey example) | slice 1 | observed: dashboard/backend-tests/intent/landed-ci-history-collection.spec.ts 'a server that collects' with dashboard/tests/intent/intent-ci-wall-time-history.spec.ts 'a collected landing's exact build is a point…' |
| 49.1 | "→ the dashboard collects it without Intent open" (trigger/journey example) | slice 1 | observed: dashboard/backend-tests/intent/landed-ci-history-collection.spec.ts 'a server that collects': collected with no page open |
| 49.2 | "and the next **CI status** read shows an `a1` point at 6m 05s, labelled exact, in the list with its run link" (trigger/journey example) | slice 1 | observed: dashboard/tests/intent/intent-ci-wall-time-history.spec.ts 'a collected landing's exact build is a point…': image CI wall time by build date, heading CI wall time history 1 measured build · Nov 5, item with 6 min 5 s, exact revision and the run link href https://ci.invalid/runs/41 |
| 50 | Key example 2, **Pending, then measured**: "Landing at `b2` is recorded while CI is running." (trigger/journey example) | slice 2 | observed: dashboard/tests/intent/intent-ci-wall-time-history-pending.spec.ts 'checking pending landings again': the second landing is recorded while its run 42 is in progress |
| 50.1 | "**CI status** shows a pending gap at the end of the line." (trigger/journey example) | slice 2 | observed: dashboard/tests/intent/intent-ci-wall-time-history-pending.spec.ts 'checking pending landings again': the pending gap is listed after the last point, 1 measured build · Nov 5 |
| 50.2 | "CI completes, the trunk reading refreshes, and the point appears." (trigger/journey example) | slice 2 | observed: dashboard/tests/intent/intent-ci-wall-time-history-pending.spec.ts 'checking pending landings again': once CI completes and the trunk moves, the item reads Nov 5 · 7 min 10 s … Run 42 and the heading says 2 measured builds |
| 51 | Key example 3, **Restart while pending** (trigger/journey example) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts 'landings recorded before collection starts…' |
| 51.1 | "The dashboard stops while `b2` is still running and starts after it completes → collection resumes and `b2` is measured once." (trigger/journey example) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts 'landings recorded before collection starts…': run 43 still running at stop, completed before the restart, measured once |
| 51.2 | "A repeated Done report for `b2` adds no second point." (trigger/journey example) | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-pending.spec.ts 'a landing recorded before its trunk run exists…': the repeated report adds no second landing, build or point |
| 52 | Key example 4, **Confirmed skip reusing a build that is already a point**: "Refinement landings R1 and R2 change only planning files, and their equivalent build is `a1`" (trigger/journey example) | slice 3 | |
| 52.1 | "→ `a1` remains one point that names E, R1 and R2." (trigger/journey example) | slice 3 | |
| 52.2 | "The measured count does not change." (trigger/journey example) | slice 3 | |
| 53 | Key example 5, **Confirmed skip reusing a build that is not a point yet**: "Refinement R3's equivalent is `c3`, a trunk build no recorded landing measured" (trigger/journey example) | slice 3 | |
| 53.1 | "→ a point at `c3` labelled as reused equivalent timing for R3 with `c3`'s identity." (trigger/journey example) | slice 3 | |
| 53.2 | "If `c3` has no timing, R3 is a gap: 'equivalent timing unavailable'." (trigger/journey example) | slice 3 | |
| 54 | Key example 6, **Cancelled landing**: "Execution F's build at `d4` was cancelled by a later push, and the next trunk build `d6` succeeds in 7m 10s" (trigger/journey example) | slice 3 | |
| 54.1 | "→ F joins the `d6` point, labelled as a later trunk build." (trigger/journey example) | slice 3 | |
| 54.2 | "A recorded landing at `d6` uses the same point, and there is no break in the line." (trigger/journey example) | slice 3 | |
| 55 | Key example 7, **Failed landing**: "G's build at `e5` failed after 2m" (trigger/journey example) | slice 3 | |
| 55.1 | "→ the line breaks at G with **Failed** and a run link." (trigger/journey example) | slice 3 | |
| 55.2 | "No 2m point is drawn." (trigger/journey example) | slice 3 | |
| 56 | Key example 8, **Window** (trigger/journey example) | slice 3 | |
| 56.1 | "35 measured builds collected → the chart shows the newest 20 and says '20 measured builds' with their date span." (trigger/journey example) | slice 3 | |
| 56.2 | "A project with 4 measured builds says '4 measured builds'." (trigger/journey example) | slice 3 | |
| 57 | Key example 9, **No history yet**: "A newly configured project with no recorded landing" (trigger/journey example) | slice 1 | observed: dashboard/tests/intent/intent-ci-wall-time-history.spec.ts 'a project with no recorded landing…': a project with no recorded landing |
| 57.1 | "→ **CI status** says that no dashboard-recorded landings have been measured yet" (trigger/journey example) | slice 1 | observed: dashboard/tests/intent/intent-ci-wall-time-history.spec.ts 'a project with no recorded landing…': No dashboard-recorded landings have been measured yet. |
| 57.2 | "and the current CI judgment is unchanged" (trigger/journey example) | slice 1 | observed: dashboard/tests/intent/intent-ci-wall-time-history.spec.ts 'a project with no recorded landing…': the status line Passed at <sha> (<subject>) and Proof labels Run 7 · attempt 1, Revision, CI wall time 3 min are intact |
| 58 | Key example 10, **Adapter project**: "Pygardon (a `ciAdapter` project) lands at `p7` → the adapter's attempt timing is collected and plotted the same way." (trigger/journey example) | slice 3 | |
