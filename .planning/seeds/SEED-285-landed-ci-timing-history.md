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

<a id="trace-landed-proof-timing"></a>

### Trace a Done story’s timing history into test Proof

**Identity:** SEED-285#trace-landed-proof-timing
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/554-trace-landed-proof-timing/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"add5affdc66bf85ed75441610e06f38ed3f05fa271ef3f833c90dfda7359a8eb","plan":"93dcdf1cbcfce5e15b98bbba87e1779c0af7ab97651ae6dd64db4fd68ea42e42"}}
```

#### Goal

A developer reviewing a Done story can follow timing changes into a test entry,
folder or file and inspect the collected evidence behind them. The history helps
locate changes hidden by overall CI wall time and shows how much comparable
historical proof is actually available. It describes observed builds; it does
not attribute a timing change to the selected story.

#### Scope

Required behavior:

- **Reading journey.** With a Done story selected, its test entry or folder
  **Summary**, or a test file's **Proof**, shows that scope's dated test execution
  time history beside its existing evidence. The selected landing is identified
  in words and in the series. Existing comparison, navigation, Purpose and Proof
  reading remain available; the history does not require another CI read.
- **Collected evidence.** Extend the landed-build history's background
  collection to retain the measured attempt's validated proof summary, including
  file breakdown when published, or its unavailable reason. Use the existing
  GitHub Actions artifact and CI adapter proof readers and their identity checks.
  Collect independently of Intent being open; resume after restart or repeated
  Done reports without duplicating a measurement. Keep available proof for the
  same bounded retained cohort as the project history. Older collected landings
  can acquire proof while it remains available; expired or missed evidence is a
  gap, not an invented reconstruction.
- **Cohort and endpoint.** Read the retained dashboard-recorded landing cohort
  through the selected story's landing, omitting subsequent unrelated landings.
  Use that Done result's published landing revision to identify the endpoint;
  another preparation, execution or later publication with the same story
  identity is not its substitute. If no retained observation matches that
  landing, show its collection gap beside available preceding history.
  Reuse the project history's Landed resolution and one-point-per-build rule.
  Identify the represented landing separately from the measured revision and
  attempt. A confirmed skip may use an equivalent first-parent build; a
  cancelled landing may use a later trunk build, visibly labelled with its real
  date and revision and the fact that it includes later changes. Several
  represented landings sharing that attempt still make one point. Show the
  actual measured count and date span. A selected story outside the retained
  cohort gets an explicit history-unavailable explanation.
- **Measure and scope.** Each point is cumulative test execution time from that
  attempt's proof, using the existing entry and scope timing rules. An entry can
  have a measured total without a file breakdown. Folder and file readings need
  supporting breakdown; folder totals use every published file at or below the
  path, including results outside the visible tree. A measured zero is a value.
  Project CI wall time remains a different measure.
- **Supported matching.** Match the repository scope path, owning test entry and
  counted unit supported by each historical summary. An entry/path/unit change
  that does not support the same scope leaves an explained gap; do not infer a
  rename chain or persistent file identity. A folder's membership may change
  between builds: label the reading as the scope observed at each build, not a
  fixed set of tests. Existing story comparison rename handling remains useful
  within its own evidence boundary. If the selected landing has no usable proof
  or unit, keep earlier supported segments, naming their observed units and
  breaking the line at unsupported ownership/unit changes. The landing stays
  a terminal gap; current trunk supplies no missing identity.
- **Gaps and readable evidence.** Pending or failed builds, missing/unreadable/
  expired proof, no matching scope, no file breakdown and partial or untimed
  measurements keep distinct reasons. They break the line and show no numeric
  substitute or partial lower bound. Beside the chart, readable dates, measured
  values or reasons, provenance and build links provide the same evidence with
  a keyboard, on a phone and without colour. No retained points or no measured
  points is an explained state rather than an empty graph.
- **Local reading and recovery.** Opening, drilling into or revisiting history
  reads only collected local evidence, including after restart. A failed local
  read has its own feedback and retry without replacing the selected story or
  other available proof. A collection gap states what was unavailable; it does
  not start upstream acquisition from the browser. Existing live CI refresh and
  recovery keep their own lifecycle.

Required restrictions: never substitute current trunk's scopes or another
attempt's proof for unavailable historical evidence, join unsupported identities,
or plot partial/missing timing as complete. Each would misrepresent the evidence
the developer is reviewing. History browsing acquires no upstream CI data,
following the seed's established collection/reading boundary.

Deferred promises: moving averages, time/percentage differences from a historical
reference, outlier exclusions, automatic reruns and slowdown indicators belong to
the later stories. This story does not add historical rename discovery, a fixed
test-membership cohort, recovery of evicted history, a new user-chosen window,
test-case histories, or a separate story-level CI wall-time chart.

#### Key examples

1. **Entry to file.** Three collected landed attempts have complete proof for
   `dashboard/tests`, its `intent` folder and `intent/ci-status.spec.ts` → select
   the middle landing's Done story and open those scopes → each shows its own
   cumulative test time through that landing, with the landing marked and build
   links. The newest unrelated landing is absent. Switching to Purpose and back
   keeps the story and file; drilling adds no provider request.
2. **Breakdown and partial evidence.** One earlier attempt publishes only entry
   totals, another omits a part, and the landing measures a file at 0 ms → entry
   history can use the complete entry-only total; folder/file history explains
   the missing breakdown, all affected scopes explain the missing part, and the
   measured zero appears as 0 ms. Lines break at the gaps.
3. **Identity and membership.** An older summary uses a different owning entry or
   unit, or only the file's former path, with no evidence of continuity → the
   history shows an unsupported-match gap. A matching folder that gains another
   published file includes its time, even when the visible tree omits that file;
   it remains a reading of the folder at that build.
4. **Provenance.** A selected skipped landing shares an equivalent build with an
   earlier landing → one point names the represented landing and source build.
   A selected cancelled landing uses a later trunk build → the terminal point
   names that later measurement and later changes; it does not pull subsequent
   unrelated landing points into the selected story's history.
5. **Collection and restart.** Done arrives with Intent closed → the background
   collector retains the attempt's proof; after restart and a duplicate report,
   opening a Summary or Proof shows the same one measurement without another
   browsing-triggered CI request. A CI adapter's validated proof follows the
   same history rules. Missing or expired historical proof remains an explained
   gap beside available observations.
6. **Unavailable reading.** A selected story has no retained landing history, or
   its local history read fails → the view names the missing history or failed
   read and the supported retry, while preserving the story, existing comparison
   and available proof. It shows no substitute from today's trunk.
7. **Same story, several landings.** Preparation P, completed execution E and a
   later publication R share a story identity → select its Done result at E →
   history ends at E, not P or R. If E has no matching collected observation or
   usable proof, mark E as a gap and keep earlier supported scope segments with
   their units named; do not infer E's unit from current trunk.

#### UX/UI and architecture

The existing Intent frame and scope path remain the journey. The scope panels in
the [timing mockups](../slice-plans/551-see-landed-ci-wall-time-history/intent-landed-ci-mockups.html)
illustrate the dated line and evidence list; the average, differences and
slowdown follow-up are outside this story. No new layout or technology choice
is needed.

| Interaction choice | Meaning for the developer and consequence for the system |
| --- | --- |
| Stay in the Done story's landing context | Later trunk does not replace the reviewed scope; reuse the historical source/tree owner and keep measured CI provenance separate. |
| Read only collected evidence | Browsing works from retained observations and explains gaps; extend the background collector/store with validated proof rather than fetching on navigation. |
| Use the same measure at every scope | Summary and Proof agree about complete, zero and partial time; reuse the existing aggregation and timing classification. |
| Match only evidenced scopes | A rename or changed entry/unit may interrupt the line; preserve path-based evidence without inventing continuity or implying causation. |

Retain one validated summary per measured attempt and derive scope histories from
it. The existing wall-time collector/store is the place to extend; its supplier
story does not already promise retained proof payloads. The local history is
derived and rebuildable from retained landings and available CI evidence, not a
second workflow authority. Follow
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
[ADR 0001 — Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002 — whole-product focus and reuse](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
and the existing [Architectural North Star](../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence).
The ADR index and relevant Accepted records agree; no conflict or exception was
identified.

#### Exploration and investigation

The existing Baseline/Branch/Landed comparison is the strongest smaller option:
it answers a single comparison, but leaves the developer assembling timing over
time. Retaining a summary once and deriving its scoped readings is recommended.
Precomputing separate histories for every scope could meet the same goal, but
duplicates aggregation and identity rules. Fetching historical proof on demand
would break the established local-reading boundary.

A longitudinal measurement notebook is a useful borrowed mechanism: a build
attempt is a sample, its proof holds measured items and completeness, and a scope
selects a rollup. Record the sample once; leave missing readings blank. The limit
is changing path meaning and folder membership. The strongest challenge is false
continuity or attribution: a plausible line could imply the same tests or a
story-caused slowdown where the evidence supports neither. Explicit scope,
provenance and gaps preserve the selected purpose without adding causal claims.

Local observations on 2026-11-09 at `ecd07dc8a` found proof summaries remembered
only in process memory, not retained across restart. A read-only scan found no
proof-summary payload among 8,449 retained-answer envelopes. A MakeMe-based
consuming probe returned 1200 ms for a complete entry/folder, measured 0 ms for a
file, a missing-part partial result, and distinct no-breakdown and absent-path
results. These facts support the existing scope. Historical continuity beyond
the supplied path/entry/unit evidence remains unproved and is not promised.
Reproducible observations and executable proof ownership belong in this story's
plan.

<a id="compare-landed-timing-with-recent-builds"></a>

### Compare landed timing with a filtered moving average

**Identity:** SEED-285#compare-landed-timing-with-recent-builds
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/555-compare-landed-timing-with-recent-builds/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"21713f28921cc1677194344fcb70cc0a5b515363cfef66fa3b7206e687437c0b","plan":"29f8cfc7b8dcd259bf21f622de27ca9230c1192b3d43d973f08a3c87af57c46e"}}
```

#### Goal

A developer reading Intent can judge whether the latest recorded landing, a
Done story's landed build, or the test scope they are viewing took more or less
time than recent comparable builds. The comparison exposes its reference and
exclusions so the developer can assess whether it represents normal timing
before deciding whether to investigate or rerun anything.

#### Scope

Required behavior:

- **Reading locations.** Add the prior-build average and difference to the
  project **CI status** wall-time history, using its latest represented landing,
  and to a Done story's landed wall-time comparison. Entry and folder
  **Summary**, and file **Proof**, show the same comparison for their collected
  test-execution-time history through the selected Done landing. Keep existing
  Baseline/Branch/Landed comparisons and navigation available. Project wall time
  and cumulative test execution time remain separate measures.
- **Historical boundary.** Use only the existing retained dashboard-recorded
  landing cohort, in trunk order. Candidates come from represented landings
  before the comparison's exact landing endpoint, with at most 20 retained
  distinct prior measured builds. Do not extend retention or fetch older builds
  to replace excluded samples. Deduplicate by measured build attempt, excluding
  the selected attempt wherever it occurs. A measured build at or after the
  represented endpoint cannot supply prior evidence, even if an earlier
  cancelled landing resolves to it. Use the shared landing/revision ordering,
  not completion timestamps or story identity alone.
- **Provenance.** Reuse the histories' exact, equivalent first-parent and later
  trunk build resolution. Several landings sharing one attempt supply one
  sample. A selected skipped landing may use its equivalent build; a selected
  cancelled landing may use its labelled later build, including the warning
  about later changes. Neither permits self-comparison or future evidence in
  its baseline. A Done result outside retained history gets an explanation,
  not a comparison against today's trunk. As retention evicts older samples,
  a retained Done result's reference may change or become insufficient; explain
  the currently retained sample rather than implying a frozen baseline.
- **Comparable and complete evidence.** A wall-time candidate is a successful
  measured attempt with valid start/completion bounds and a validated, nonempty
  proof summary whose declared parts are all present and unambiguous. Entry-only
  proof is sufficient; cumulative test durations and file breakdown are not
  needed to establish wall time. This checks completeness of published declared
  proof, not whether every possible test or undeclared workflow job ran.
  Scoped candidates use the histories' supported owning entry, repository path
  and counted unit, with complete measured timing for that scope. Entry-only
  totals can measure an entry; folders/files need supporting breakdown. An
  unrelated entry's gap does not invalidate an otherwise complete scope.
  Derive the comparison signature from the selected landing's evidenced owning
  entry/path/unit, even if its timing is partial. If that identity is missing,
  retain the supported historical segments but explain that no comparable
  reference can be established. Never pool different signatures or choose one
  from current trunk. Changed folder membership remains the scope observed at
  each build, not a fixed test cohort. Failed, pending, missing, partial, ambiguous or unsupported
  evidence keeps its specific reason and supplies no numeric substitute.
- **Initial baseline rule.** Among comparable candidates, calculate the median
  once (mean of the middle pair for an even count). Exclude values strictly
  greater than 115% of that median, then take the arithmetic mean of the
  remaining values. Calculate without display rounding and without iterative
  re-filtering. Keep complete fast measurements, including measured zero; speed
  alone is not evidence of incomplete execution. Require at least five retained
  samples after filtering before displaying an average or difference. These
  are the initial calibration choices for reviewing normal timing: the upper
  filter limits unusually slow samples' influence, while the minimum avoids
  presenting one or two runs as a stable reference. They are not a validated
  statistical confidence interval or a slowdown judgment.
- **Reading the result.** Show the landed value, average, signed elapsed
  difference and percentage relative to a positive average, plus the number of
  prior builds used and their date span. A zero average still permits an
  elapsed difference, with percentage explicitly unavailable. Under the same
  rule a zero median excludes positive candidates and retains zeros. With
  fewer than five samples, explain insufficient comparable history and show
  the available timings and counts without an invented average. If the
  selected measurement or its completeness is unavailable, keep any usable
  prior reference visible but explain why no difference can be calculated.
- **Explain exclusions.** Keep observed points and existing gaps visible.
  The chart's reference line represents the displayed endpoint's prior average;
  it is recomputed as the endpoint/history changes, not a separate retrospective
  curve. The evidence list identifies included samples, slow-outlier exclusions,
  completeness/matching exclusions and the selected measurement separately,
  with dates, values or reasons, provenance and build links. State the median
  and 15% rule so the excluded set is inspectable. Use words and marks as well
  as colour; keyboard, screen-reader and phone readers get the same evidence.
- **Local reading.** Derive the comparison only from collected local evidence,
  including after restart. Opening, drilling, refreshing or revisiting history
  acquires no upstream CI data. Preserve the history's own failure/retry feedback
  and selection, and the existing independent CI refresh lifecycle.

Required restrictions: no selected-attempt or future-build leakage into the
prior reference, no mixing measures or unsupported scope identities, no partial
values presented as complete, and no upstream acquisition caused by browsing.
Each would misrepresent the reviewed evidence or break the established
collection/reading boundary. The initial filter and minimum have the bounded
normal-timing purpose stated above; excluded measurements remain inspectable.

Deferred promises: automatic reruns, slowdown flags or causal attribution,
user-configurable thresholds/windows, additional retention/backfill, inferred
historical renames, and a separate Done-story wall-time chart. This increment
adds the reference to existing reading surfaces. Future rerun attempts and their
eligibility are the later story's decision; this story uses the existing
history's selected measured attempt, without adding an attempt-selection rule.

#### Key examples

1. **Explainable reference.** Retained prior complete wall times are 100, 100,
   100, 100, 115 and 116 seconds. The selected landing is 120 seconds → the
   median is 100 seconds; 115 stays and 116 is visibly excluded; the five-build
   mean is 103 seconds. Show 120 seconds, average 103 seconds, +17 seconds and
   the rounded percentage from 17/103. The 116-second point remains visible.
2. **Fast and incomplete are different.** A complete fast scope reading remains
   in the average. Another build has a missing part or untimed scope result →
   that scope is excluded with its reason. A successful build whose declared
   proof parts are present but omit test durations can still supply wall time;
   it cannot supply an unmeasured test-execution-time value.
3. **Shared and future builds.** A prior landing and the selected skipped
   landing both resolve to attempt R → R supplies the selected value only.
   An earlier cancelled landing resolves to a build after the selected endpoint
   → that later build supplies no baseline sample. The selected cancelled
   landing can still show its own labelled later measurement.
4. **Selected Done result.** Preparation, execution and a later publication
   share one story identity → select the execution's Done result → use its
   published endpoint and preceding retained history. Later unrelated landings
   and the later publication never enter its baseline. The reference stays the
   same while its preceding retained evidence stays the same; eviction can
   reduce or change it, with the current count/span and insufficient-history
   reason shown. Outside retention, explain historical unavailability.
5. **Window and minimum.** In a retained 20-build history including the selected
   build, at most 19 builds precede it. After completeness and slow-run filtering,
   four remain → show their evidence and insufficient comparable history;
   do not fetch older runs to fill the sample or draw an average. Five remaining
   builds are enough. Gaps never count as zero samples.
6. **One rule at each scope.** Select an entry, then a folder and file in its
   Done story → each uses its own complete, matching execution times. A folder
   includes a published file outside the visible tree. Changed entry/unit or
   absent breakdown is explained; the wall-time mean is never reused for a
   scope. With missing terminal identity and earlier segments in different
   units/owners, keep those labelled readings but give no combined reference.
   Existing Purpose/Proof navigation preserves the landing selection.
7. **Zero and missing landing.** Five retained complete zero readings give a
   zero median and average → a measured 1200 ms landing shows +1.2 s with no
   percentage. If the landing instead lacks usable proof, keep the prior
   reference and explain that the difference is unavailable.
8. **Reading without acquisition.** Background history has settled; open the
   project history and selected Done comparison, drill to a file, revisit after
   restart, and retry a failed local history read → the same evidence and rule
   remain readable without new provider requests. At phone width and by
   keyboard, included/excluded reasons and build links remain available.

#### UX/UI and architecture

Follow the existing [timing mockups](../slice-plans/551-see-landed-ci-wall-time-history/intent-landed-ci-mockups.html)
for the reference line, metrics, legend and evidence list; replace their
illustrative fixed sample set with the rule above. Omit the future rerun and
slowdown panels. A Done story's overall wall-time comparison uses a compact
reference beside its current comparison rather than adding a new chart. Label
it **Prior-build average** so it cannot be confused with the story's existing
**Baseline** endpoint. Keep execution-time differences precise at small scopes.

Reuse the history's collector/store, landing endpoint and provenance, validated
proof, scope matching and timing classification. Calculate one deterministic
reference from those observations; do not persist a second aggregate authority
or acquire evidence from the browser. Follow
[ADR 0001 — Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002 — whole-product focus and reuse](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
and [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
under the existing [North Star](../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence).
The index and relevant Accepted records agree; no conflict or exception was found.

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

Trace real historical proof before relying on scoped comparisons. The moving average is useful on its own and gives
developers a chance to judge its exclusions before enabling reruns. Defer the
automatic rerun first if scope shrinks. The two histories remain useful if the
moving-average rule also needs more observation. Open Dough has no calibrated
S/M/L bands, so these candidates carry effort drivers and leave bands open.

## Open Decisions

- The comparison story records its initial window, minimum, completeness and exclusion rules. Review their usefulness before enabling automatic reruns; the later story's proposed 5% rerun trigger remains a separate hypothesis.
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
