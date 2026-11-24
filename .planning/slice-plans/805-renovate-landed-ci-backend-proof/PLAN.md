# Prove landed CI wall-time history through typed backend handlers

**Identity:** SEED-413#renovate-landed-ci-backend-proof
**Source:** [Wall-time history story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-landed-ci-backend-proof)

## Goal and scope

Give Dashboard maintainers fast Node Vitest feedback on the 14 wall-time
history specs. Preserve how accepted landings become timed builds or gaps,
how the history and selected comparison agree, how the retained window is
read, and how time without runner waits is derived. Keep the production
request and persistence contracts. Scoped test proof, standalone proof
collection, reader restart, automatic-repeat correction and backend runner
retirement have separate owners.

Apply the [campaign's speed and coverage criteria](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-later-dashboard-backend-unit-test-families).
Aim for about 100 ms per unit case or faster. Use the smallest set of cases
that still catches the distinct regressions in these 14 source files.

## Current decisions

- Follow the North Star for [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Apply [ADR 0002 on direct domain mapping and fast feedback](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [ADR 0008 on Dashboard authority and repository roles](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and [ADR 0010 on comparative evidence](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Keep the existing published-source, refresh and exact-revision ownership
  described in the North Star topics on the [Review repository](../../NORTH-STAR.md#read-published-comparisons-from-the-review-repository)
  and [shared refresh](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads).
  Use the published source already resolved for the requesting operation.
- Reuse `collectLandingResolution`, `landingResolution`, the collection
  order/window logic and `performIntentCiHistoryRead`. The current collector
  reads ambient configuration and machine files. Give its existing pass
  explicit project, launch/receipt and history inputs plus the collaborators
  it uses for clock, CI and writes. Keep scheduling and abort ownership with
  `LandedCiCollection` and bind the file store, Git and providers in
  production. Reuse `ciComparisonReader` for comparison. Keep each pass's CI
  reads and comparison memo under their respective owners.
- Follow [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md).
  Reuse `makeMe.aLandedCiHistory`, launch records and checkout builders.
  Compose a kept landing to arrange a read. In collection cases, supply the
  accepted input and observe a pass creating the saved result. Keep real Git
  where ancestry is asserted and real temporary documents where reopening
  or malformed persisted state matters. Supply answers at the existing
  typed GitHub and adapter lookup boundaries. The first slice owns making
  the pass callable without changing its scheduler or duplicating its logic.
- The current collector, resolution and history read/store files fit the
  [250-line check](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#file-size).
  If the binding pushes one over, keep collector scheduling with the
  lifecycle owner and move the existing ordered pass as a unit, or move
  only the existing history projection from adapter composition. Keep
  reads, selection and pruning on their existing production path. Check all
  call sites and affected scoped-history specs before accepting the change.
- The [scoped proof story](../806-renovate-landed-ci-scope-proof/PLAN.md) may
  also change these entries. Each story starts from the current composition
  and can deliver independently. The [automatic-repeat correction](../607-close-landed-ci-repeat-check-gaps/PLAN.md)
  keeps its distinct process, natural-load and fault obligations.

## Decisive premises and baseline

At `a75673b31` on awake AC macOS (Node 24.21.0, Homebrew Bash on PATH),
the maintained backend command selected both cohorts and exited 0. The
finished proof record showed 22 first-attempt passes across 14 wall-time
files. Their summed case duration was 71.333 s in this combined run. All
38 selected cases passed. This observed the existing mount-based results,
including pending-to-final and restart. Slice 1 measures standalone elapsed
time for the before-and-after comparison.

```sh
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR \
  OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD=/tmp/dough-backend-renovation.mBpXIm/proof.json \
  npm run --silent test:dashboard:backend -- landed-ci-history- landed-ci-scope- --workers=2
```

The shared pass and read functions point to one kept history document.
Collection writes keyed receipts and attempt evidence via
`keepLandedCiResolution` and reads the latest persisted state again on the
next pass. The read applies local or retained trunk order and projects the
window without triggering collection. The baseline reaches these behavior
paths through production composition. Slice 1 proves the same wiring with
explicit inputs before subsequent cases adopt it.

A scratch change from 20 to 19 in `measuredWindow` made
`landed-ci-history-read-window.spec.ts` fail its exact history assertion.
The same run of `npm run --silent test:dashboard:backend --
landed-ci-history-read-window.spec.ts landed-ci-scope-retained-window.spec.ts
--workers=2` passed both cases after restoring the source. Slice 5 retains
this discrimination at the typed reader.

## Slices

Each file stem below denotes `dashboard/backend-tests/intent/landed-ci-history-<stem>.spec.ts`.
For each slice, map the original behavioral purposes to their surviving cases,
including any moved proof. Give each case one observable purpose. Use MakeMe
to compose prerequisites, and exercise Git, persistence or the collector when
its real behavior is part of the assertion. Compare related cases across the
cohort and existing owners. Remove repeated assertions and setup, varying one
independent behavior per case and retaining combinations that affect the result.
Check the focused run's case durations during each migration slice so it can
simplify costly setup while it still owns that case.

### 1. Accepted landings are collected with the production lifecycle

Type: Behavior
Status: done

Before migrating the first case, time the baseline command above with only
the `landed-ci-history-` selector. Use the proof record for each case duration,
case and file counts and summed case time. Record shell elapsed separately.
Use `collection` and `lifecycle`. Make the existing ordered collection pass
callable with typed project, records, history store, Git
order, CI and stop inputs. Keep production's auto-collection enablement,
receipt-triggered scheduling and stopped-pass behavior in the owner that
starts it. A landing recorded before collection starts becomes readable
without any page. A disabled collector leaves a read passive. A pending
landing survives closing and reopening the collector and becomes one point.

**Proof.** Invoke production start or its typed lifecycle entry, observe
the public history after each pass and the saved document after reopening
it. Control the CI state transition at the typed lookup. Observe no
collection in disabled mode and no late write when a held read is aborted.
Keep the existing process-level lifetime cases with the correction.
Run the scoped lifecycle consumers if the shared composition changes.

**Slice 1 evidence.** Baseline at `920286793` (`landed-ci-history-` only, two
workers, AC power): 22 cases in 14 files passed, summed case time 75.795 s,
shell elapsed 50.22 s. The converted `collection` file took 9685 ms over 2
cases and `lifecycle` 5469 ms over 1 case. After slice 1, the four converted
cases run in 0.6–33.5 ms. The pass is `collectLandedCiPass` in
`dashboard/server/landedCiPass.ts`, fed by `LandedCiPassInputs`. Unit cases
compose those inputs through `dashboard/backend-tests/support/landedCiPassInputs.ts`.
`LandedCiCollection` keeps scheduling and abort. Its history input is a
machine `home`, because reads and writes also use the follow-up ledger, plus
a separate proof read. The reads take `{ home }` options.
`intentCiHistoryRead.ts` sits at exactly 250 lines, so any growth there
needs a split. Two-process measurement stays with `landed-ci-collector-lifetime`,
and the No build gap moves to slices 2 and 4.

### 2. Exact pending runs agree between history and comparison

Type: Behavior
Status: done

Convert `pending` and `comparison-run`. Give the pass an accepted receipt,
retained state, controlled clock and exact-run answers for absent, queued,
completed and unread CI. Give the comparison its existing admitted
revision endpoints and the same Git/CI evidence. Keep the saved receipt
and target after its launch record disappears.

**Proof.** Read the pending gap before completion and trace the same
exact run/attempt and duration through both typed readers after completion.
Confirm repeat delivery yields one observation and the original receipt time
controls the no-build horizon. Compare `pending` with `comparison-run` so
one representative case owns reader agreement. Prove repeated delivery,
the no-build horizon and receipt retention where each has a distinguishing
result. Check the selected comparison contract wherever the binding changes.

**Slice 2 evidence.** `pending` and `comparison-run` went from 5 server cases
taking 24,910 ms to 3 typed cases taking about 82 ms. The pass now takes its
clock as `now`, and production binds `observationNow`. The resolution
functions require `now`. `landedCiPass({ builds, trunk, records, readable?, now?, … })`
and `historyEntries()` in the support builder compose a pass and read it.
One `comparison-run` case owns reader agreement and repeat delivery. The No
build horizon and receipt retention live in `pending`. The comparison's
receipt-hour matching and memory reuse stay with the `ci-comparison-finality-*`
specs.

### 3. Equivalent and later builds resolve from pending evidence

Type: Behavior
Status: done

Convert `pending-proof` and `pending-sources`. Give `landingResolution`
and the collection pass Git ancestry, a skipped or cancelled landing or
adapter attempt, and controlled CI plus proof responses over successive
passes. Keep the window open to other landings when one proof is unanswered.

**Proof.** Assert the waiting reason and run identity while a build or proof
is pending, continued collection of unrelated evidence, and the eventual
equivalent, later or exact point with its original provenance. Prove
answered and unanswered outcomes through the same production rules.

**Slice 3 evidence.** `pending-proof` and `pending-sources` went from 4
server cases taking 11,557 ms to 3 typed cases taking about 81 ms. The two
pending-proof cases merged into one. The support builder gained optional
`skips` and `proofOf` answers. A skip is a real MakeMe repository revision
that changes only files the workflow ignores. Later conversions build launch
records with the `makeMe.aLaunchRecord…landedAt(revision, { receipt })` chain
rather than porting `storyLandingRecord` or `capturedComparisonLanding`.

### 4. Final gaps keep their reasons and valid late recovery

Type: Behavior
Status: done

Convert `gaps`, `comparison-gap` and `no-proof-recovery`. Exercise
`landingResolution`, the retained-gap reopen rule and the history/comparison
readers with published landings, recorded gaps and CI answers for missing
proof, unusable timing or an invalid run URL. Run actual collection when
recovery is the trigger.

**Proof.** Check the exact build and link only where valid, and the existing
reason at each relevant reader. Differentiate an invalid duration from zero.
An eligible old no-proof equivalent gap reopens on collection. Other final
gaps stay final, and reading alone leaves saved state untouched.

**Slice 4 evidence.** `gaps`, `comparison-gap` and `no-proof-recovery` went
from 4 server cases taking 11,321 ms to 4 typed cases taking about 0.6 s in
total. `comparison-gap` keeps its `asComparisonSlot` mapping case, and
`comparison-run` still owns agreement through `ciComparisonReader`. The
support builder's `keepHistory(home, history)` seeds retained history
through production's store. Slice 5 seeds its retained history with it.

### 5. History returns the newest measured window in trunk order

Type: Behavior
Status: done

Convert `window` and `read-window` with real ancestry for the collecting
window and composed retained history for the read. Use the production
window functions through the pass and `performIntentCiHistoryRead`.

**Proof.** Assert pruning of older measurements and stale pending landings
during a pass. Read a pre-seeded 35-build history and verify exact newest
20, gaps among and after them and exclusion of an older gap. Keep storage
pruning and read projection independently observed.

**Slice 5 evidence.** `window` went from 1442 ms to 42 ms and `read-window`
from 868 ms to 15 ms. The 20→19 `measuredWindow` scratch change fails both
cases, so the discrimination now holds at the typed reader. An unpruned
`windowedHistory` fails only `window`, which keeps storage pruning and read
projection independently observed.

### 6. Time without runner waits preserves wall time and explains gaps

Type: Behavior
Status: done

Convert `time-without-runner-waits`, `measure-gaps` and
`adapter-measure-gaps`. Supply typed GitHub jobs or adapter job graphs for a
retained attempt to the production measure path and typed reader. Keep
the job evidence tied to the original attempt.

**Proof.** Observe one retained timing answer, the measure with the waits
removed, and unchanged wall time. An unanswered jobs read is pending and is
retried. An answered missing graph is final and names its build. Assert
read and write behavior through the same store the pass uses.

**Slice 6 evidence.** `time-without-runner-waits` went from 2546 ms to 29 ms,
`measure-gaps` from 3922 ms to 40 ms, and `adapter-measure-gaps` from two
cases taking 4075 ms to one taking 31 ms. The builder answers
`timeWithoutRunnerWaitsOf` through `measureOf`. `measuredHistoryEntries`
reads the measure, and `keepWallTimeBuilds` keeps passed wall-time-only
builds. `landedCiRetainedMeasureGapSetup.ts` lost its last consumer and was
deleted. Adapter reason wording stays with
`Distribution/tests/support/dashboard-ci-adapter-revision-lookup.test.mjs`.

### 7. The wall-time cohort gives faster feedback

Type: Behavior
Status: done

Run the maintained selection at two workers under conditions comparable to
slice 1. Compare shell elapsed, summed case time and file and case counts.
List individual case durations against the ~100 ms target. Investigate slower
cases for avoidable setup, waiting and repeated proof, and document any retained
cost and the behavior that needs it. Include the cost of any proof moved to
another suite. Retire setup and support imports whose consumers are gone.

**Proof.** The runner proof record shows passing Node Vitest cases and the
comparable run is faster. The purpose map names surviving coverage for each
removed or consolidated case and the focused proof shows that the surviving
case rejects a representative regression. Inspect for direct typed entry and
verify the cohort is free of server mounts, browser setup and new wrappers.

**Slice 7 evidence.** The comparison used the baseline's literal command
(`landed-ci-history-`, two workers, `/usr/bin/time -p caffeinate -s -i`) on
AC power at load 6.5–8.2. The baseline ran at 920286793 at load ~5–7.

| | Baseline | After |
| --- | --- | --- |
| Files / cases | 14 / 22 | 14 / 19, all passed first attempt |
| Summed case time | 75.795 s | 0.770 s |
| Runner duration | 48.9 s | 4.2 s |
| Shell elapsed | 50.22 s | 4.66 s |

Every case is under 100 ms. The slowest are `window` at 91 ms (24 real MakeMe
repository revisions for trunk ancestry), `comparison-run` at 86 ms (both
readers over three passes) and `adapter-measure-gaps` at 80 ms (three
landings over two passes). Each retained cost is the behavior asserted, so no
avoidable setup, waiting or repeated proof remains. Most of the run is Vitest
import and worker spawn time. No cases were added to the moved-proof owners
named in slices 1–6 (`landed-ci-collector-lifetime`,
`ci-comparison-finality-*`, `landed-ci-proof-collection`,
`story-branch-landing-capture`, `landed-ci-attempt-start-adapter` and
Distribution `dashboard-ci-adapter-revision-lookup`), so the moved proof added
no cost. The slice 1–6 purpose maps cover every removed or consolidated case.
In each slice, at least one scratch mutation made a surviving case fail
(pass ignores stop, trunk ignores kept references, nudge ignores `collects()`,
pass ignores the typed clock, retention dropped, unanswered proof made final,
final gaps, `measuredWindow` 20→19, unpruned window, and unanswered runner-wait
read made final). The 14 files import only Vitest, production modules, MakeMe,
`landedCiPassInputs` and the existing comparison support. None uses Playwright,
`test.use`, a server mode or a page. Retired: `landedCiHistoryAnswers.ts`,
which had no importer, `landingMinutesAgo` and `runsListedAgain`, which had no
caller, and the `export` on the file-local `TrunkChange`, `publishedChange`
and `observedKinds`. Other mount-era support still serves the
`landed-ci-scope-*` specs and other owners.

## Execution complete

Product advice: The composed-state approach works across a collection pass
and its read model. The 14 wall-time specs dropped from 50.22 s to 4.66 s of
shell time, with every case under 100 ms and a surviving mutation check in
each slice. The Taken [scoped proof story](../806-renovate-landed-ci-scope-proof/PLAN.md)
can reuse `collectLandedCiPass` and `dashboard/backend-tests/support/landedCiPassInputs.ts`
rather than build its own pass setup. It also edits `landedCiCollectionLanding.ts`,
so its integration should expect a small textual merge there. No
correction is needed.

## Concern evidence

Refinement retained seven slices and assigned overlap review to each migration
slice, with measurement in slices 1 and 7. The model is a receipt resolved to
attempt evidence which a read projects. The runner-wait measure derives from
that same attempt. The slice map covers all 14 source files, with separate
observations for expiry, recovery and passive reads. No remaining slice-specific
concern was identified.

## Story obligations

### G1. Receipt-triggered collection has no unit case
Reported: slice 1 — "no unit case for the receipt-triggered nudge"
Story clause: "Cover initial collection and restart"
Disposition: proved by slice 1: `dashboard/backend-tests/intent/landed-ci-proof-collection.spec.ts` lands through the installed publication and polls the retained proof with a two-minute recheck, so only the landing endpoint's nudge (`dashboard/server/launchBoundaryAnswer.ts`) collects it in time; it passed in slice 1's consumer run. A conversion of that standalone owner must keep this observation.

### G2. Repeat landing report's same receipt has no typed case
Reported: slice 2 — "The typed cases only cover repeated delivery at the collection level."
Story clause: "Give expiry, repeated delivery and receipt retention their own observations"
Disposition: proved by slice 2: `dashboard/backend-tests/review/story-branch-landing-capture.spec.ts` "records the fetched trunk tip and the accepted merge …" integrates again with an explicit landing context and observes `landing: { state: "recorded", receipt }`, the same receipt, while the record stays unchanged; collection-level repeat delivery is owned by `landed-ci-history-comparison-run.spec.ts`.

### G3. Adapter collection's absent GitHub Actions requests have no typed case
Reported: slice 3 — "checking that adapter projects make no GitHub `actions-*` calls, stay with the adapter specs."
Story clause: "exact and reused builds"
Disposition: proved by slice 3: `dashboard/backend-tests/intent/landed-ci-attempt-start-adapter.spec.ts` collects an adapter project's landing and asserts no `actions-` request at line 107, and `landed-ci-history-pending-sources.spec.ts:98` proves the adapter attempt's pending-to-exact point.

## Verification and delivery

- Local gate: use the maintained [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  with `caffeinate -s -i` on AC power for measured runs. Keep the default
  timeout and follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Run focused files through `npm run test:dashboard:backend -- <files>`.
  Run the Dashboard typecheck and lint for changed contracts. Use the
  [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  for changed binding, read and storage consumers. Where ownership moves,
  check that the new assertion rejects a representative wrong result before
  retiring the old assertion. Keep the affected app or end-to-end proof
  if a shared adapter effect reaches it.
- Use the normal post-change refactor, delivery and hosted CI gates. Keep
  timing and coverage evidence in this plan for wrap-up.
