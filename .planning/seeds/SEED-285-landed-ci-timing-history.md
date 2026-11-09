---
id: SEED-285
status: active
planted: 2026-11-09
planted_during: Terry Yin's request to see landed CI timing history and investigate slow builds
trigger_when: A developer wants to see whether landed CI is getting slower or understand where the time changed
scope: epic
---

# SEED-285 — Understand timing changes in landed CI

## Why This Matters

For a developer reviewing a project or a Done story, today's CI status and
story comparison show individual builds. To see whether timings are drifting,
the developer must piece together previous runs and check their proof. Intent
should show how landed CI time has changed, let the developer trace that change
to a test entry, folder, or file, and surface a possible slowdown that persists
after one repeat measurement.

The history covers landed executions whose Done messages the dashboard received
and whose landing it recorded. Background collection starts from Done and uses
the recorded trunk revision. The history and moving average read only collected
evidence. CI remains the source of observed run outcomes. A retry is a
measurement on the landed revision and the story remains Done during it.
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)

## Alternatives and Decision

Keep today's comparison and manually review or rerun individual CI runs. This
can resolve a particular concern, but requires the developer to assemble the
history each time. The strongest smaller option is the project chart alone.
It shows drift and tests whether the dashboard collects enough comparable
landings, but leaves the developer to locate the change in test proof and
decide whether it survives a repeat. Start with the chart as the first useful
increment. Add automation after the historical reference can be reviewed.

## Story Decomposition

<a id="see-landed-ci-wall-time-history"></a>

### See landed CI wall time change over time

**Identity:** SEED-285#see-landed-ci-wall-time-history
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/551-see-landed-ci-wall-time-history/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"76a1f3673eb0a8b252021aa2b91b63430fc30b362c72510884596851c6814a5a","plan":"7ab31a2658becf7db947e71c987965b90ac7580f63b336fa322e2031f12ac90b"}}
```

#### Goal

A developer reading Project Intent's **CI status** can see whether CI wall time
on the project's dashboard-recorded trunk landings is rising, falling or
variable, and can tell measured builds from gaps without assembling CI runs by
hand. The story also tests whether the dashboard observes enough landings to make
such a trend useful. The broader aim of tracing and flagging slowdowns belongs
to the later stories in this seed.

#### Scope

Required behavior:

- **Cohort.** Every trunk landing the dashboard recorded for the project,
  whatever workflow landed it (refinement, execution, ad hoc), within the
  retained history.
- **Collection.** Once a Done report with an accepted landing is recorded, the
  landed revision's CI result is collected through the project's existing CI
  read boundary, for both `ciWorkflow` (GitHub Actions) and `ciAdapter`
  projects. Collection does not depend on Intent being open. It waits while CI
  is queued or running and takes the result when it completes. A dashboard
  restart, a repeated Done report or a second dashboard process on the machine
  resumes collection and does not duplicate a measurement. Landings already
  recorded when the capability arrives are collected by the same rebuild.
- **Which build measures a landing.** Use the CI timing comparison's Landed rule
  (Terry, 2026-11-09):
  - The exact landed revision's completed build is measured.
  - A confirmed skip reuses the equivalent first-parent build, labelled as
    reused with that build's identity. If the equivalent build has no timing,
    the landing is a gap.
  - A cancelled landing build is measured by the nearest later trunk build that
    has timing. The point is labelled a later trunk build, and that build is
    counted once.
  - A failed build is a labelled **Failed** gap with its build link and no
    plotted time (Terry, 2026-11-09). A failed run can stop early, so its
    wall time is not the CI duration.
  The measured attempt and **CI wall time** follow the existing definitions in
  [Intent CI timing comparison](../../docs/dashboard-development-intent-ci-comparison.md).
- **One point per build.** Several landings that resolve to the same build make
  one point that names the landings it represents.
- **Gaps.** A landing whose CI is still pending, whose build failed, or whose
  timing is unavailable (no build, unreadable, expired, no equivalent) breaks
  the line and is listed with a short reason distinct for each case. The line
  and listing never show a zero or invented time.
- **Window.** The newest 20 distinct measured builds, in trunk order, with the
  gaps that fall among or after them. The heading states the actual measured
  count and date span. Recent Open Dough and Pygardon activity fills 20 builds
  in about 2–3 days, and Doughnut in about a week.
- **Readable evidence.** Beside the chart, a list gives each point and gap its
  date, wall time or gap reason, provenance (exact, reused equivalent, later
  trunk build) and build link. A keyboard or screen-reader user and a phone
  reader get the same evidence, without relying on colour.
- **Reading.** Opening or refreshing **CI status** reads only the collected
  local history. It acquires no CI data, including after a restart. The chart
  is read again whenever **CI status** refreshes its trunk reading, with no
  timed polling. Current CI status and its **Check again** keep their own
  lifecycle.
- **Empty and early states.** A project with no recorded landings, or none
  measured yet, says so in words instead of drawing an empty chart.

Deferred promises:

- moving average and the difference from it, and excluded-point marks;
- a Done story's position in the history and test-scope histories (the later
  stories in this seed);
- a time-span window or a user-chosen window;
- trunk builds the dashboard did not record as landings.

Boundary assumptions: the landing record keeps the accepted revision, as
[Landed run records](../../dashboard/STORY-REVIEW-LANDED-RUNS.md) describe.
Done records expire after 30 days, so the history keeps its own landing
references for the window.

#### Key examples

1. **Exact build.** Open Dough lands execution E at `a1`. CI on `a1` succeeds
   in 6m 05s → the dashboard collects it without Intent open, and the next
   **CI status** read shows an `a1` point at 6m 05s, labelled exact, in the
   list with its run link.
2. **Pending, then measured.** Landing at `b2` is recorded while CI is running.
   **CI status** shows a pending gap at the end of the line. CI completes, the
   trunk reading refreshes, and the point appears.
3. **Restart while pending.** The dashboard stops while `b2` is still running
   and starts after it completes → collection resumes and `b2` is measured
   once. A repeated Done report for `b2` adds no second point.
4. **Confirmed skip reusing a build that is already a point.** Refinement
   landings R1 and R2 change only planning files, and their equivalent build
   is `a1` → `a1` remains one point that names E, R1 and R2. The measured count
   does not change.
5. **Confirmed skip reusing a build that is not a point yet.** Refinement R3's
   equivalent is `c3`, a trunk build no recorded landing measured → a point at
   `c3` labelled as reused equivalent timing for R3 with `c3`'s identity. If
   `c3` has no timing, R3 is a gap: "equivalent timing unavailable".
6. **Cancelled landing.** Execution F's build at `d4` was cancelled by a later
   push, and the next trunk build `d6` succeeds in 7m 10s → F joins the `d6`
   point, labelled as a later trunk build. A recorded landing at `d6` uses the
   same point, and there is no break in the line.
7. **Failed landing.** G's build at `e5` failed after 2m → the line breaks at
   G with **Failed** and a run link. No 2m point is drawn.
8. **Window.** 35 measured builds collected → the chart shows the newest 20
   and says "20 measured builds" with their date span. A project with 4
   measured builds says "4 measured builds".
9. **No history yet.** A newly configured project with no recorded landing →
   **CI status** says that no dashboard-recorded landings have been measured
   yet, and the current CI judgment is unchanged.
10. **Adapter project.** Pygardon (a `ciAdapter` project) lands at `p7` → the
    adapter's attempt timing is collected and plotted the same way.

#### UX/UI

The user is a developer reviewing the project in Project Intent's **CI status**
who wants to know, at a glance, whether CI is getting slower. The history sits
beside the current judgment and Proof. It answers its own question and does not
replace them. Follow the project panel in the
[Intent timing mockups](../slice-plans/551-see-landed-ci-wall-time-history/intent-landed-ci-mockups.html),
without the average, exclusion legend and difference figures, which belong to
the later comparison story. Gap words separate *not yet* (pending) from
*won't be measured* (failed, unavailable), as a lab chart separates an awaited
result from a rejected sample. A reused or later-build point carries its
source's identity, like a carried-forward reading. The analogy breaks where one
build stands for several landings. That case is handled by one point that
names its landings.

#### Architecture

- **New responsibility: background collection.** A collector triggered by a
  recorded landing, and by rebuild at start, joins each landing to its measured
  attempt and keeps the observation. It must be idempotent across duplicate Done
  reports, restarts, and production and development dashboards that share
  `~/.open-dough/dashboard`. Its upstream reads go through the existing CI read
  boundary and its request accounting
  ([GitHub requests](../../dashboard/GITHUB-REQUESTS.md)).
- **Local history store.** A bounded machine-local store of observations and
  landing references, separate from the least-recently-used
  [retained answers](../../dashboard/server/retainedAnswers.ts), which may evict
  evidence. It is derived and rebuildable from recorded landings and CI, so it
  fits [ADR 0008 — durable project state and local operational state](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state):
  no server database, and losing it loses only requests and expired evidence.
- **Shared interpretation.** Landing-to-build resolution reuses the CI timing
  comparison's Landed rule and wall-time definition, so the later Done-story
  comparison reads the same observation. It does not add a second rule.
- No Accepted ADR conflicts. The
  [Architectural North Star](../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence)
  direction applies.

Evidence observed 2026-11-09 from the local launch records and
`gh run list` for Open Dough, Nov 6–9:

- 139 recorded landings. Of the 68 execution landings, 49 were measured at the
  exact revision, 16 were cancelled and 3 failed. Of the 16 cancelled, 10 have a
  later successful build and 6 a later failed one.
- 67 refinement landings were skipped by CI's `paths-ignore`. 60 resolved to a
  successful equivalent build and 7 to a cancelled one.
- Successful runs took 5–14 min.

**Planning reference.** Keep the [Intent timing mockups](../slice-plans/551-see-landed-ci-wall-time-history/intent-landed-ci-mockups.html) with this story’s future plan in the same directory. Treat the mockups as owned planning evidence at wrap-up.

<a id="trace-landed-proof-timing"></a>

### Trace a Done story’s timing history into test Proof

**Identity:** SEED-285#trace-landed-proof-timing
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer reviewing a Done story can see which test scopes changed over time and inspect the evidence at the scope that matters.
- **Evaluation.** With a Done story selected, open an entry or folder Summary or a test file’s Proof. See the test execution times collected from landed CI proof for that scope leading up to and including the story’s landed build, with the landing identified. A file without historical breakdown or a partial measurement shows its gap. Opening the history uses the proof collected after Done.
- **Boundary.** Each scope shows its measured test execution time. The project chart measures overall CI wall time. Match historical scopes only where the available evidence supports the match.
- **Value / learning.** Localize changes hidden by the overall wall time and learn how often historical proof supports comparable entry, folder, and file readings.
- **Effort driver.** File-level evidence gaps and historical scope identity add more uncertainty than the chart presentation.
- **Depends on.** Collected landed-build history and proof for the displayed scope.
- **Safe stopping point.** Developers can inspect timing changes at each available scope even without a calculated reference or an automatic action.

<a id="compare-landed-timing-with-recent-builds"></a>

### Compare landed timing with a filtered moving average

**Identity:** SEED-285#compare-landed-timing-with-recent-builds
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer can judge whether a Done story’s landed build or the test scope they are viewing is slower than recent comparable builds.
- **Evaluation.** Intent shows the landed value, the difference in time and percent, and the number of prior cached builds used. The comparison uses the same measure and scope on both sides and ends before the selected landing. When comparable history is insufficient, the developer sees that state beside the timings that are available.
- **Boundary.** The chart keeps observed points visible. Start the proposed average with successful, comparable historical builds with complete proof. Screen out exceptionally slow historical runs, with more than 15% above a reference as a starting hypothesis. Use a robust reference such as the median of eligible prior measurements to identify unusually slow runs. Unusually fast results merit a completeness check. Whether a complete but very fast result also needs a cutoff remains open. Exclude the build under comparison and count each eligible build once.
- **Value / learning.** Developers can check whether the baseline represents normal timing well enough to support an automatic rerun decision.
- **Effort driver.** Agreeing on comparable measurements and showing exclusions is the main uncertainty. The baseline window and minimum sample count are proposals to settle during refinement.
- **Depends on.** Collected landed timing and evidence that the run was complete. Scoped comparisons also depend on historical Proof for that scope.
- **Safe stopping point.** Developers can use an explainable comparison and decide for themselves whether to rerun CI.

<a id="retry-a-slow-landed-ci-build"></a>

### Repeat a slow landed CI build once and flag a persistent slowdown

**Identity:** SEED-285#retry-a-slow-landed-ci-build
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer reviewing Recently done can see whether an unusually slow build recovered on a repeat or still needs attention.
- **Evaluation.** In a project that enables the behavior, a Done execution has a complete landed CI measurement at least a proposed 5% slower than its displayed moving average. The dashboard requests one full rerun of the same landed workflow run. The Done story card shows **CI rerun in progress** while it runs. If the completed rerun is still at or above the threshold against the same baseline, the card shows a red **Possible CI slowdown** indicator with both timings and the comparison. A rerun below the threshold shows that timing returned to range.
- **Boundary.** The timing rule is deterministic. Use comparable timing on both attempts and the same baseline for the decision and display. The dashboard requests at most one rerun per landing, even if Done is delivered twice or the dashboard restarts. Only a successful, complete measurement of the exact landing with sufficient comparable history can trigger the rerun. A refused, failed, or incomplete rerun is an unverified timing outcome and has its own explanation on the card.
- **Value / learning.** One repeat distinguishes an isolated slow measurement from a possible persistent slowdown at a known landed revision.
- **Effort driver.** The highest operational uncertainty is authorizing the repeat and keeping its in-progress and final states trustworthy across retries and restarts.
- **Depends on.** A usable project-level moving average and a CI provider that can rerun the landed workflow with the project's authorization. GitHub Actions supports a repeat at the original revision. [GitHub Actions reruns](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs)
- **Safe stopping point.** Every automatic attempt has a visible outcome or an explanation, with a firm one-rerun cap and the story still Done.

## Ordering and Scope Reduction

Start with the project chart to validate collection and usefulness of the
dashboard's observed cohort. Then trace real historical proof before relying
on scoped comparisons. The moving average is useful on its own and gives
developers a chance to judge its exclusions before enabling reruns. Defer the
automatic rerun first if scope shrinks. The two histories remain useful if the
moving-average rule also needs more observation. Open Dough has no calibrated
S/M/L bands, so these candidates carry effort drivers and leave bands open.

## Open Decisions

- Choose the average window and minimum usable sample count, the completeness and fast-outlier rules, and how to present an excluded build. Treat the 15% historical outlier cutoff and 5% rerun trigger as separate hypotheses.
- Choose a consistent wall-time basis across first attempts and reruns, and which eligible attempt represents a landing in later averages. Keep both observed attempts available for review.
- Confirm which projects should enable automatic reruns after developers have reviewed the baseline against real landing history.

## When to Surface

When developers want to prioritize historical CI timing in Intent. Refine the
first selected candidate against actual dashboard landings.

## Breadcrumbs

- [Architectural North Star](../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence) and [UX/UI North Star](../../docs/dashboard-ux-ui-north-star.md#read-landed-ci-timing-and-follow-up-from-done)
- [Landed run records](../../dashboard/STORY-REVIEW-LANDED-RUNS.md)
- [Current Intent CI comparison and timing definitions](../../docs/dashboard-development-intent-ci-comparison.md)
- [Keep Done story Intent pinned to the landed result](SEED-283-keep-done-story-intent-pinned.md#keep-done-story-intent-pinned) concerns the historical reading context. This seed concerns the timing series and comparison.
