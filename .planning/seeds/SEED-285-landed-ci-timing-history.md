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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer in Project Intent can see whether CI wall time on dashboard-recorded trunk landings is rising, falling, or variable.
- **Evaluation.** After a dashboard execution reports Done with a recorded landing, the build is collected when its result becomes available. Project Intent shows a date-ordered line of recent measured builds, with the actual sample count and visible gaps for pending or missing timing. Opening the chart uses the collected history, including after a dashboard restart.
- **Boundary.** Start with up to 20 distinct builds as a proposed display window. For a confirmed skip, show a cached equivalent first-parent build as reused timing, with its source identified. A missing equivalent timing stays a gap. Several skips reusing one build contribute one measurement.
- **Value / learning.** Check whether the dashboard observes enough landings to make the trend useful and whether developers can distinguish actual measurements from gaps.
- **Effort driver.** Collection after Done and the states between landing and available CI evidence are the main uncertainties.
- **Depends on.** Recorded dashboard landing and CI timing evidence, both existing product concepts.
- **Safe stopping point.** Developers have a readable project trend with explicit coverage and provenance.

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
