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

<a id="compare-landed-timing-with-recent-builds"></a>

### Compare landed timing with a filtered moving average

**Identity:** SEED-285#compare-landed-timing-with-recent-builds
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/555-compare-landed-timing-with-recent-builds/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"892ab83ab7c98784f50c70744e09c65797d69dd23090656c04e6d613a44cd50b","plan":"d5262516be3a00f773433d1feabda32f02d87ccfa821c457ac8906217cbb7669"}}
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
  distinct prior measured builds. The delivered window holds 20 measured builds
  total, so a retained measured endpoint leaves at most 19 prior samples and
  older endpoints may leave fewer. It may span only about a day on Open Dough.
  Do not extend retention or fetch older builds
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

Follow the [delivered project history](../../docs/dashboard-development-intent-ci-status.md)
for the existing dated points, gaps and evidence list. Add the prior-build
reference line, metrics and included/excluded evidence using the rule above.
A Done story's overall wall-time comparison uses a compact
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
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-285#retry-a-slow-landed-ci-build","dependencies":[{"supplier":{"identity":"SEED-285#compare-landed-timing-with-recent-builds","href":"seeds/SEED-285-landed-ci-timing-history.md#compare-landed-timing-with-recent-builds"},"implementation":"Collected prior-build wall-time comparison and its explainable comparable sample","rationale":"The automatic follow-up must use the displayed comparable reference and its exclusions. That reference is still Taken and unavailable here; duplicating it in the consumer would create a second comparison authority. Shared architectural direction and ordinary reconciliation alone cannot supply the missing evaluated reference.","condition":"The supplier publishes the usable project and selected Done-landing prior-build wall-time comparison, including sample identities, completeness/exclusion reasons and sufficient-history decision.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/569-retry-a-slow-landed-ci-build/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f4fabe11f5de15ef5c758c2a86fdadfed8a89e9ff58144783ca49433c300587c","plan":"efb679e2f11411bf2204ef0826b0f2b6b5a4ca4c4cfa90561143b28303039fb1"}}
```

#### Goal

A developer reviewing Recently done can distinguish a slow landed CI
measurement that returned to range on one full repeat from one that still
needs investigation. Both measurements and their shared reference make the
result reviewable. **Possible CI slowdown** is a warning about two observed
timings, not proof of a regression or its cause. The story remains Done.

#### Scope

Required behavior:

- Automatic follow-up is off by default. Explicit per-project enablement on
  one designated production dashboard machine applies to newly recorded
  landing receipts only; enabling does not launch a historical batch. The
  allowance follows the original landing, so duplicate delivery or a new
  representation of that same landing does not create another allowance.
  Changing workflow configuration also grants no new allowance; the chosen
  workflow/run stays part of the original request's evidence.
  Development dashboards and other machines have no action authority merely
  because they can read the project. No real project is enabled by preparation.
- An enabled project can request one full repeat of the original
  workflow run at the exact recorded landed revision, after a successful,
  complete measurement is at least 5% slower than a sufficient positive
  comparable prior-build average. This initial threshold is provisional,
  deterministic and visible, not statistically calibrated. A zero reference
  retains its elapsed comparison but supplies no percentage trigger. Reuse
  the preceding comparison story's
  completeness, sample, exclusion and provenance rules. Its implementation is
  still Taken; this story does not assume the comparison has shipped.
- Freeze the actual prior sample, average, timing basis and trigger rule when
  deciding to repeat. Apply that same reference to the original and repeated
  measurement and expose it in the comparison. All baseline samples must use
  the same timing basis too; a consistent pair alone is insufficient. Use the
  provider-reported attempt start through completion for every participating
  measurement, without promising all queue time. Recompute retained samples
  from authoritative bounds where possible or explain their exclusion.
  Keep the original measurement as that landing's sample in later averages;
  the selectively requested repeat is separate evidence, not another sample
  or a replacement chosen for being faster.
- Preserve the original and repeat as distinct attempts with their revision,
  workflow/run identity, timing, proof completeness and build links. A new
  attempt number alone does not prove a full repeat; partial manual reruns
  can carry forward earlier jobs.
- The Done card shows **CI rerun in progress** for an observed queued/running
  repeat. A complete successful repeat still at or above the chosen threshold
  shows a red **Possible CI slowdown** indicator with text and a route to both
  timings and the fixed comparison. A complete repeat below it says timing
  returned to range. Refusal, failure, cancellation, incomplete measurement or
  uncertain request acceptance has a distinct unverified explanation; none
  establishes recovery or persistent slowness.
- Duplicate Done delivery and dashboard restart preserve the one-repeat cap.
  Keep request intent/acceptance distinct from the CI outcome. An unreadable
  allowance record must not be treated as a fresh allowance: forgetting it
  could authorize a duplicate. Atomically consume the allowance before sending
  the request. Never automatically resend after ambiguous acceptance, even
  when a crash may have occurred before submission. Reconcile what CI can
  establish; otherwise retain an unverified outcome. The cap is shared by
  production processes on the designated machine; coordination with another
  machine is outside this increment.
- Background collection owns acquisition and follow-up observation; opening
  cards, Intent or retained history does not itself request another build.
  Done-card and Intent presentation read the same follow-up evidence. Workflow
  publication, story completion and CI's own verdict remain with their owners.
- Deliver GitHub Actions full reruns first. Other providers retain existing
  reading behavior and explain when automatic follow-up is unavailable;
  this does not add a generic adapter mutation contract.

Required restrictions and reasons: only a successful, complete exact landing
can trigger repetition of its own observed workflow run and revision. A
confirmed skip can reuse equivalent evidence but has no such run of its own;
a later build may include later changes.
Missing, mixed-basis or insufficient evidence cannot establish the threshold.
Do not replace an uncertain outcome with an invented success, failure or
elapsed value. These restrictions protect the meaning of the comparison and
the promised request cap, rather than treating omitted examples as rejections.

Deferred promises: causal attribution, a statistical confidence claim,
adaptive multiple repeats, configurable thresholds, new historical backfill,
generic CI-adapter mutation and coordination across machines. Deferring those
capabilities does not prohibit providers' existing reading behavior.

#### Key examples

1. **Confirmed persistence.** A project has enabled automatic follow-up, its
   exact landed attempt passed with complete timing, and the chosen sufficient
   reference is 100 seconds → under the provisional 5% rule, 105 seconds triggers
   one full repeat → a complete successful 106-second repeat shows **Possible
   CI slowdown**, both observations and the unchanged 100-second reference.
   A 104-second original triggers nothing; equality at 105 is eligible.
2. **Recovery against the same reference.** The same triggering observation
   requests a repeat; newer landings subsequently change today's average →
   a complete 104-second repeat is judged against the saved reference and says
   timing returned to range. Neither card nor comparison silently switches to
   today's average.
3. **Unavailable confirmation.** The request is refused, or its repeat fails,
   is cancelled or lacks complete comparable proof → show the particular
   unverified outcome and retain the original evidence. The story stays Done;
   missing evidence is never zero or a recovered timing.
4. **Repeated delivery and restart.** A request allowance has been consumed;
   Done arrives again or the dashboard restarts → preserve that request and
   observe/reconcile its outcome rather than grant another allowance. When
   acceptance cannot be determined, never send again and show an unverified
   request. This remains true if the crash occurred between the durable write
   and submission; the cap takes precedence over guaranteed delivery.
5. **Wrong measurement or insufficient reference.** The landing only reuses
   an equivalent build, resolves to a later trunk build, or has incomplete
   proof/too few comparable samples → retain its existing evidence and reason;
   it does not trigger this landing's automatic repeat. Browsing it issues no
   repeat request.
6. **A timing definition changes.** Retained samples were measured using
   workflow creation, while the chosen rule uses attempt start → recompute
   from retained authoritative bounds where available or exclude unmatched
   samples with an explanation. Do not compare differently measured samples
   merely because both are labelled wall time.
7. **Enablement boundary.** An old landing is retained before the developer
   enables follow-up → it is still readable but requests no repeat. A newly
   recorded landing after enablement can qualify. A second process on the
   designated machine and a duplicate delivery still issue only one request;
   development and disabled projects issue none. Disabling stops new requests
   while existing request evidence remains reviewable.
8. **Original remains the sample.** A 120-second original repeats in 100
   seconds → show recovery against its saved reference, while a subsequent
   landing's average considers the original 120-second observation once under
   the ordinary completeness/filter rule, not the 100-second repeat. Reference
   eviction or newer landings do not rewrite the completed follow-up decision.

#### Alternatives, challenge and borrowed mechanism

| Candidate | Contribution to the goal | Consequential limit |
| --- | --- | --- |
| Existing history plus developer-requested rerun | Smallest existing way to inspect a concern and choose its cost | Does not deliver this story's automatic follow-up or durable card outcome |
| One automatic full repeat with a frozen reference | Directly tests whether the measurement repeats at this landing | Costs one workflow run and needs explicit action authority and trustworthy measurement |
| Wait for subsequent landings | Supplies trend evidence without another run | Measures changed work, so cannot confirm this landing's timing |

Terry accepted the automatic full repeat within the selected story's existing
purpose on 2026-11-10. Borrow confirmatory measurement against a fixed calibration: the
first timing screens for a concern, the repeat checks it, and the frozen prior
sample supplies the calibration reference. Preserve both observations. The
analogy breaks because runners, caches and external dependencies can change
at a fixed revision; it supplies no statistical or causal guarantee.

The strongest doubt is calibration: 5% may be ordinary CI variation, making
two slow readings frequent even with correct implementation. The accepted
first increment keeps the 5% rule provisional and visible, with project
enablement off by default. Do not describe the threshold as validated.

#### Investigation — 2026-11-10

Facts observed at preparation revision
`7ff9a21f86addd3d3bbe47e0b0007f019dbffaba`:

- [The current GitHub selector](../../dashboard/server/baseCiRevisionNearest.ts)
  uses creation time on attempt 1 and start time on later attempts. Therefore
  the existing wall-time definition cannot simply be assumed comparable.
- A read-only exact-attempt query for real GitHub run `42196943419` returned
  attempt 1 creation/start `2026-11-06T09:41:44Z`, completion `09:47:05Z`;
  attempt 2 creation `10:05:20Z`, start `10:05:19Z`, completion `10:10:38Z`.
  The current-run query instead kept the original creation time with attempt
  2's start/completion. The [exact-attempt reader](../../dashboard/server/baseCiGithubRevisionLookup.ts)
  is reusable; the observed one-second inversion does not establish either
  timestamp as an authoritative boundary for every queue phase. Do not use
  original workflow creation or local request submission as rerun enqueue time.
- This machine's retained `landed-ci-history.json` for `open-dough` had 33
  landing references and 21 builds, all attempt 1; 20 had a proof summary.
  Raw wall times ranged from 307 to 744 seconds (median 330 seconds), before
  validating/filtering the comparison cohort. This observes variation, not a
  calibrated false-warning rate or the proposed average in operation.
- [GitHub documents](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs)
  that full reruns retain the original SHA/ref, use the original actor's
  privileges, require repository write access and have age/count limits.
  The [REST rerun operation](https://docs.github.com/en/rest/actions/workflow-runs#re-run-a-workflow)
  documents run-ID submission and a 201 response, with no request idempotency
  key. No rerun or other CI mutation was performed during preparation.

Unsettled hypotheses: usefulness of 5%; complete queue-inclusive timing;
identification of an automatic full repeat in the presence of concurrent
manual reruns. The first needs calibration against reviewed comparable
history; the second needs a provider-backed interval definition; the third
needs explicit action reconciliation and honest unverified handling. None is
settled by plausible naming or an incremented attempt number.

#### Architecture

Follow [ADR 0001 — Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
and [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
The ADR index and relevant Accepted records agree; no conflict or exception
was found. Operational evidence remains machine-local, while Git owns Done
and CI owns attempt outcomes. This design belongs in the story/plan, not an
unrequested ADR proposal.

PFE found reusable background collection, validated proof/attempt identity,
and file-locking discipline, but no existing CI mutation owner. Extend those
responsibilities coherently rather than introducing another comparison or
story-state authority. The [collector](../../dashboard/server/landedCiCollection.ts)
keeps completed observations final, and the [history store](../../dashboard/server/landedCiHistoryStore.ts)
prunes unnamed attempts: follow-up retention must explicitly preserve both.
[The shared request owner](../../src/skills/dough-execute-plan/scripts/github-request-owner-wire.mjs)
accepts reads only; a rerun needs a narrow authorized action boundary, preserving
that read contract. The custom CI adapter is also observation-only today.

[Machine JSON storage](../../dashboard/server/machineJsonStore.ts) supplies
atomic cross-process writes on one machine, not coordination across machines.
Its generic unreadable-file recovery starts from empty state and cannot be
reused unchanged for a spent allowance. Existing launch/start stores offer
the discipline of recording intent before side effects and reconciling
uncertainty; their agent-launch state is a different domain and must not
become CI follow-up state.

#### Decisions — accepted by Terry, 2026-11-10

- **Trigger and enablement.** Provisional 5%, default off with explicit project
  enablement; new landing receipts only, avoiding a historical batch.
- **Authority and uncertainty.** One designated production dashboard
  machine per project, recording the consumed request before submission and
  never automatically resending an ambiguous request. Reconcile what CI can
  prove; otherwise retain an unverified outcome. A global cross-machine cap
  would require a different coordination design and is deferred.
- **Timing and later averages.** Provider-reported attempt start to
  completion for both observations and all baseline samples, explicitly
  without promising every queue phase. Recompute or exclude retained samples
  under another basis. Keep the original observation in later
  averages and the selectively requested repeat separately, to avoid changing
  the baseline through selective substitution. Full queue-inclusive timing
  is not promised by this increment.
- **Provider delivery boundary.** Deliver GitHub Actions full
  reruns first, with other providers retaining their current reading and an
  explanation when automatic repeat capability is unavailable. Generic
  adapter mutation would need its own agreed action contract.

No product decision remains open for preparation. The provisional threshold's
usefulness remains a learning question, not an authorization to enable a real
project or change the rule. Execution remains dependent on the preceding
comparison story's recorded supplier outcome.

## Ordering and Scope Reduction

Trace real historical proof before relying on scoped comparisons. The moving average is useful on its own and gives
developers a chance to judge its exclusions before enabling reruns. Defer the
automatic rerun first if scope shrinks. The two histories remain useful if the
moving-average rule also needs more observation. Open Dough has no calibrated
S/M/L bands, so these candidates carry effort drivers and leave bands open.

## Open Decisions

- Review the comparison and provisional 5% rule against comparable landing
  history before enabling a real project. The repeat story records its
  accepted timing, attempt-selection and default-off enablement policy;
  preparation itself enables no project.

## When to Surface

When developers want to prioritize historical CI timing in Intent. Refine the
first selected candidate against actual dashboard landings.

## Breadcrumbs

- [Architectural North Star](../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence) and [UX/UI North Star](../../docs/dashboard-ux-ui-north-star.md#read-landed-ci-timing-and-follow-up-from-done)
- [Landed run records](../../dashboard/STORY-REVIEW-LANDED-RUNS.md)
- [Current Intent CI comparison and timing definitions](../../docs/dashboard-development-intent-ci-comparison.md)
- [Intent for a selected story](../../docs/dashboard-development-intent-story.md) describes the delivered historical reading context. This seed concerns the timing series and comparison.
