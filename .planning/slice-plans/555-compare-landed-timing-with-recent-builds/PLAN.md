# Compare landed timing with a filtered moving average

**Source:** [selected story](../../seeds/SEED-285-landed-ci-timing-history.md#compare-landed-timing-with-recent-builds)

**Identity:** SEED-285#compare-landed-timing-with-recent-builds

## Goal and scope

A developer can compare the latest recorded landing, a Done story's landed wall
time, or a selected entry/folder/file's test execution time with an explainable
prior-build average. The story's Scope and Key examples own the product rule.
Calculate from retained local observations only, show observed values and
exclusions, and preserve the current Intent reading and CI lifecycle.

The initial calibration uses up to 20 retained prior distinct measured builds,
with the selected attempt and any measured revision at/after the represented
endpoint excluded. Compute the median once, exclude values strictly above
115% of it, then arithmetic-mean at least five remaining samples. Keep complete
fast values and zeros. Do not round before filtering or calculation. This is
an inspectable reference, not causal attribution or statistical confidence.

The delivered store retains 20 measured builds in total, not 20 predecessors
per Done story. A retained selected build therefore has at most 19 prior
samples, fewer for an older retained endpoint or after exclusions. This may
span about a day on Open Dough; the actual count/span and insufficient-history
state own that limitation. Do not extend retention to satisfy the minimum.

Exclude reruns, slowdown flags, configurable thresholds/windows, more retention
or backfill, historical rename inference, a separate Done wall-time chart and
new CI acquisition. Planning authorizes no implementation or Take.

## Architecture and PFE

Apply [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002 — whole-product focus and reuse](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
and [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
The [ADR index](../../../docs/adrs/README.md) and relevant in-file Accepted
statuses agree; no successor, conflict or exception applies. This local design
belongs with Intent under ADR 0000. The existing
[North Star](../../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence)
already establishes shared evidence interpretation and local derivation; no
new architecture topic or aggregate store is needed.

PFE originally at `0d92177ead4aaf8f9364afeddd9d5227d0208e52`, 2026-11-09;
delivered-history contracts reconciled at `0c32a9335` later that day:

- [The delivered project history](../../../docs/dashboard-development-intent-ci-status.md)
  owns retained landing-to-attempt evidence, trunk ordering, distinct-build
  windows, project presentation and local read lifecycle.
  [Scope history plan 554](../554-trace-landed-proof-timing/PLAN.md) owns
  retained validated proof, supported entry/path/unit readings, Done endpoint
  selection and entry/folder/file history. The project wall-time owner is now
  delivered at `0c32a9335`: `landedCiCollection.ts`, `landedCiHistoryStore.ts`,
  `landedCiMeasuredBuilds.ts` and `intentCiHistoryRead.ts` keep/read the newest
  20 distinct measured builds and their gaps. Stored builds carry timings and
  identities, not validated summaries. Scope history and proof retention remain
  plan 554's work, including proof backfill for already-final wall-time builds.
  Reconcile that extension before integrating completeness-based averages;
  a wall-time point alone does not establish complete test proof. Preserve
  active owners' uncommitted files. Do not duplicate collection, storage or
  resolution.
- Existing `publishedStoryEndpoints.ts` and `intentCiComparisonResolve.ts`
  distinguish the published Done endpoint from the measured Landed slot.
  Reuse that fact via the history reading context; story identity, completion
  date or measured revision alone is not a replacement endpoint.
- `ciScopeProof.ts`, `ciProofTiming.ts` and `ciScopeComparisonTiming.ts` own
  path aggregation, longest owning entry, complete/partial/not-recorded time,
  entry-only totals, breakdown requirements and measured zero. Reuse these
  meanings. Wall-time proof completeness is different: all declared parts
  present in a validated nonempty summary, even without test durations.
  Do not reject a complete scope for an unrelated entry's gap or invent proof
  of undeclared workflow coverage.
- `ciProofTimeWords.ts` and `storyCiRelativeChange.ts` own wall-time bounds,
  precise scope duration differences and percentage only against a positive
  reference. Reuse formatting and arithmetic; `Baseline` continues to mean
  the existing story endpoint, while the new reference is `Prior-build average`.
- `IntentCiComparisonSummary.tsx`, `IntentScopeProof.tsx` and
  `IntentFileProof.tsx` are the current reading owners. Extend their delivered
  history presentation rather than creating another Intent route. Follow the
  [delivered CI status history](../../../docs/dashboard-development-intent-ci-status.md)
  and `IntentCiHistory.tsx` for dated points/gaps and readable build evidence.
  Add one horizontal reference for the displayed endpoint, not a rolling
  historical curve. The spent plan's mockup is no longer an active input.

One common rule selects prior attempts, projects the requested comparable
measure, records exclusion reasons, and derives the reference. Wall-time and
scope-time eligibility differ for a domain reason; they do not need separate
collectors or unrelated averaging algorithms. Derive each answer afresh from
one retained snapshot rather than persisting a competing aggregate authority.

No start-blocking dependency is recorded. The shared direction and independent
selection/calculation work allow execution to start without completed supplier
implementations. Integration waits for their published owners, with actual
contract reconciliation in the affected slice. Shared files and delivery order
alone are not a supplier prerequisite. If delivered behavior invalidates these
assumptions, reassess the same plan before dependent edits.

## Outside-in proof ownership

Every new capability needs failing-first proof; existing helper observations
below prove reusable meanings, not this comparison. Integrated scenarios use
real retained landing/attempt/proof inputs from supplier fixtures and consume
the normal authenticated local-history path. A fixture-supplied finished average
would bypass the selection, filtering and no-acquisition promises.

| Source promise | Owning slice and observable proof |
| --- | --- |
| Project wall-time reference, exact 15% boundary, one median pass, five-sample minimum, fast values, zeros and counts/span | Slice 1: project CI status journey plus focused reference contract checks. Independently expect 100,100,100,100,115,116 → median 100, mean 103 over five; selected 120 → +17 and percentage from 17/103. Keep the excluded 116 point and linked reason visible. Include even median, unrounded boundary, four after filtering, fast complete and zero-median/zero-average cases. |
| Window, gaps, complete declared proof versus measured test durations, no replacement from outside retention | Slice 1: retained 20-build fixture including endpoint gives at most 19 prior samples; distinct incomplete/failed/pending/missing reasons; entry-only untimed but present proof qualifies wall time. Reject missing/ambiguous/empty proof, not zero. Assert no provider request caused by opening/refreshing the reference. |
| Exact selected Done endpoint, same-build exclusion, future proxy rejection, equivalent/later provenance and old endpoint unavailable | Slice 2: Done result with multiple publications of one story identity, a shared equivalent attempt, and earlier cancelled landing resolving beyond the endpoint. Assert the exact candidate identities, selected value/provenance, count, average and difference. Add later unrelated history while retaining its preceding samples and verify the Done reference unchanged; separately evict prior samples and observe the changed reference or insufficient-history state. Selected cancellation keeps its labelled later result without leaking it into baseline. |
| Entry/folder/file measure and matching, hidden-tree contributor, complete fast/zero, changed entry/unit, no breakdown, partial/missing selected timing | Slice 3: drill entry Summary → folder Summary → file Proof through collected scope history, assert independent sums/reference and specific excluded reasons. Unrelated-entry gap does not reject complete scope. Prior reference can remain when selected timing cannot support a difference but its entry/path/unit identity is evidenced; missing terminal identity plus changed historical units/owners keeps labelled segments without a combined reference. |
| Existing Baseline/Branch/Landed, Purpose/Proof, history failure/retry and selection survive | Slices 2–3: enclosing comparison assertions plus navigation and fail/retry of history only; original comparison and selected Done endpoint remain. |
| Local-only reading, including refresh/revisit/restart; same evidence by keyboard/phone/screen reader | Every slice: settle/account for independent existing live reads, then count provider operations around reference browsing. Reuse supplier persistence proof, adding comparison after isolated server/store restart. Observe words/marks, usable links and focus at narrow width; no colour-only exclusion. |

Arrange every automated test's domain data through shared MakeMe builders
([test data architecture](../../../tests/README.md#test-data-architecture)).
Reuse/extend landing, run/attempt, proof-entry and retained-history builders;
expose case-driving facts at call sites. Inputs whose exact form is under test,
actions and independently calculated expectations stay outside builders.

## Ordered slices

### 1. Read an explainable prior-build average in project CI status

Type: Behavior
Status: planned
Proof: New project-history browser journey through retained observations and
normal local read, plus focused deterministic cohort/eligibility/filter checks.

Behavior: Given collected complete successful wall times, open project CI status
→ see the latest represented landing's value, prior-build average, signed time
and percentage, sample count/span, and the reference line beside unchanged
observed points/gaps. Evidence names which attempts were used or excluded and
why, including the median/15% rule. Four post-filter samples show insufficient
history; five suffice. Measured zero remains valid and a zero reference has no
percentage. A selected measurement without usable proof retains any usable prior
reference with an unavailable difference. No older evidence is fetched to fill
the reference and no upstream read starts on browsing.

First reconcile the delivered project-history owner and plan 554's proof
extension for completeness and endpoint order; use the current owner.
Build the common selection and reference rule within that reading domain,
not a new persistence or provider path. Include
all safety boundaries from the start: selected-attempt exclusion, no measured
revision at/after endpoint, one attempt once, single-pass median filter, exact
threshold, complete fast observations and separate wall-proof eligibility.
Keep accessible evidence and local-read retry usable with no average.

### 2. Compare a Done landing against its own historical reference

Type: Behavior
Status: planned
Proof: New selected-Done wall-time comparison journey through the actual endpoint
and retained-history reader; affected existing story comparison journeys.

Behavior: Given one story's preparation, execution and later publication, select
the execution's Done result → the existing CI timing comparison also shows its
wall-time reference using only prior retained attempts before that exact
published endpoint. Later builds never enter that reference; it stays unchanged
while the preceding retained samples stay unchanged. Eviction may change or
remove the reference and must update its count/span or insufficient-history
reason. An equivalent
selected build never enters its own baseline through an earlier landing; an
older cancellation's future measured build never becomes prior evidence. A
selected cancelled landing can still show its labelled later result. Outside
retention or unavailable selected proof is explained beside available timings.

Reuse slice 1's reference rule and the supplier's endpoint context. Show compact
metrics labelled Prior-build average beside the current comparison, retaining
Baseline/Branch/Landed and their links. Do not add a separate Done wall chart.
Exercise local-history failure and retry without replacing current evidence or
selection, and show the same comparison from retained evidence after restart.

### 3. Follow the reference through entry, folder and file timing

Type: Behavior
Status: planned
Proof: New entry → folder → file Done-story history journey through validated
retained proof and normal scope projection, plus focused matching/completeness
checks and the affected enclosing Summary/Proof journeys.

Behavior: Given collected proof for the selected Done landing and prior builds,
open entry Summary, a folder, then file Proof → each shows its own comparable
execution-time reference, elapsed difference and percentage with included and
excluded evidence. An entry can use complete entry-only totals; folder/file
needs complete breakdown. Include published contributors outside the visible
tree. Preserve supported path/entry/unit matching and observed folder membership;
unsupported identity, missing breakdown or partial timing is explained and
excluded. Complete fast readings and measured zero stay eligible. Another
entry's gap cannot suppress this scope's complete measurement. When the selected
scope is unmeasured but its entry/path/unit signature is evidenced, an earlier
matching reference remains and its difference has a reason rather than a lower
bound or invented zero. If terminal identity is unavailable, keep supported
historical segments but explain that no comparable reference can be established;
never pool distinct units/owners or obtain identity from current trunk.

Apply the same selection/filter rule to the supplier's complete scope readings;
reuse precise duration formatting. Existing Purpose/Proof navigation and story
selection survive. Prove keyboard/narrow-width evidence and independently retry
history. Browsing and revisiting scopes, including after restart, uses local
collected data without provider acquisition.

## Verification and delivery gates

Use the installed execution workflow for source review, independent post-change
refactoring, consumer trace, focused proof, agent commits and applicable final CI
repair. New behavior must fail its proof when disabled. Inspect enclosing text,
roles/counts, selectors, shared fixture/provider contracts and authenticated
read consumers as changes become concrete; choose affected suites from that
trace instead of weakening existing comparisons. Update maintained Intent timing
documentation with the shipped rule, scope and limitations.

Local gate: each new capability's focused journey/contracts and affected existing
history/comparison/timing consumers, `npm run typecheck:dashboard`, and applicable
lint/format hooks. Start long runs fully awake. On AC wrap them in
`caffeinate -s -i`; on battery plug in or use `caffeinate -i` with lid open and
inspect the sleep log, per
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Use Homebrew Bash 5 first on PATH for shell checks. Inspect host load/memory,
competing work and expected cost before expensive proof, sequence owned heavy
work or reduce workers while preserving coverage. Full suites are not routine
local gates for this bounded change; published CI failures remain owned.

Starting preservation commands, supplemented with new capability-named specs
and actual supplier-history consumer tests once published:

```sh
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/support/intent-ci-proof-timing.test.mjs tests/support/intent-scope-proof.test.mjs tests/support/intent-scope-comparison-wording.test.mjs
caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-comparison.spec.ts tests/intent/intent-ci-comparison-relative.spec.ts tests/intent/intent-summary-story-comparison.spec.ts tests/intent/intent-summary-story-comparison-file.spec.ts --workers=1
npm run typecheck:dashboard
```

[The project's failing and flaky test policy applies as written](../../../AGENTS.md#failing-and-flaky-tests),
including failures on base, published CI ownership, preserving another active
repair owner's uncommitted files, and the exact scope of human exceptions.
Never rerun until green as a fix. Use observable events or controlled clocks,
never sleeps or `test.slow()`. Keep default timeouts; an essential override
belongs inside its individual test only.

Three Behavior slices each close one reading journey using the common rule;
there is no speculative Structure slice or separate testing slice. No numeric
slice target or hard limit is supplied; size by these bounded proof loops and
reassess at the first failed integration assumption rather than accumulating
special cases. Preserve safe states and follow the execution escalation rules.

## Decisive premises and observed results

Observed in this owned checkout at `0d92177ead4aaf8f9364afeddd9d5227d0208e52`
on 2026-11-09. `npm ci --ignore-scripts` succeeded; no product code was changed.

| Premise / consuming operation | Observation in the consuming form/profile | Result and remainder |
| --- | --- | --- |
| Existing timing and relative-change owners handle measured/zero/unrecorded input and precise scope differences | Shared-MakeMe Node probe below in this checkout, Node v24.21.0 | Complete 1200 ms and zero both measured; untimed entry has present part but no test timing; zero reference gives +1.2 s without relative; 1200→1500 gives +300 ms and +25%. Confirms distinct wall completeness and test timing. No new averaging behavior is claimed. |
| Browser proof route can load the selected existing Intent scenarios | `npm run test:dashboard -- --list dashboard/tests/intent/intent-ci-status-execution-time.spec.ts dashboard/tests/intent/intent-ci-comparison.spec.ts` after local install | Exit 0. Settles runner/spec-import prefix only; actual new comparison journeys remain failing-first execution work. Tests use isolated FakeGitHub/local store, not production data. |
| History and Done-source work can be consumed without duplicating owners | Initial preparation read plans 550/551/554; amendment at `0c32a9335` read maintained Intent CI status/story docs and delivered collector/store/window/local reader | Project wall-time history is delivered with 20 measured builds total, gaps and shared-build references, but no stored proof summary. Plan 554 supplies validated proof retention/backfill and scoped readings; averages must not infer completeness from a wall-time point. Independent calculation can still start; reconcile proof extension before integration. This contract observation claims no new behavior proof. |

```sh
node --input-type=module <<'NODE'
import { makeMe } from './tests/support/makeMe.mjs';
import { entryTimingOf } from './dashboard/src/ciProofTiming.ts';
import { timeChangeOf } from './dashboard/src/storyCiRelativeChange.ts';
import { executionTimeDifferenceWords, relativePercentWords } from './dashboard/src/ciProofTimeWords.ts';
const complete = makeMe.aCiProofEntry.at('tests').counting(2).timed(1200).please();
const zero = makeMe.aCiProofEntry.at('tests').counting(2).timed(0).please();
const noTiming = makeMe.aCiProofEntry.at('tests').counting(2).please();
const positive = timeChangeOf(1200,1500,executionTimeDifferenceWords);
console.log(JSON.stringify({complete:entryTimingOf(complete),zero:entryTimingOf(zero),noTiming:entryTimingOf(noTiming),noTimingPartStatus:noTiming.parts[0].status,zeroBaseline:timeChangeOf(0,1200,executionTimeDifferenceWords),positive,percent:relativePercentWords(positive.relative)}));
NODE
```

## Current decisions and learnings

- The initial rule is the refinement's stated calibration, not a decision to
  enable the later story's automatic rerun or its separate 5% hypothesis.
- The existing retained cohort bounds prior candidates. Exclusions do not cause
  acquisition or backfill, and missing/partial values never become zeros.
  The delivered 20-build total permits at most 19 prior samples for a retained
  measured endpoint; older Done results may have too few or no retained samples.
- Read the selected represented endpoint separately from its measured attempt;
  shared equivalent and later-trunk sources require both identities.
- A horizontal average reference belongs to the displayed endpoint. A whole
  curve of historical moving averages is outside this increment.
- All planned proof is still owed. Preparation observations establish current
  reusable behavior and route availability, not execution completion.
- The two SEED-288 follow-ups remain queued: do not assume shared pending
  judgment or proof-free adapter equivalent timing is delivered. Wall-time
  reuse without proof would still not satisfy this story's complete-proof
  candidate rule.

## Delivered-history amendment — 2026-11-09

Terry's follow-up reconciles this plan with the delivered 20-build store and
plan 554's proof-retention responsibility. Retain all three Behavior slices,
their existing proof maps and calibration. No larger window, slice replacement,
sizing exception, resplit or execution is introduced. Reassess against the
actual published proof extension before dependent integration.
