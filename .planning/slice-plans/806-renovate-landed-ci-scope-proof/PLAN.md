# Prove landed CI scoped test history through typed backend handlers

**Identity:** SEED-413#renovate-landed-ci-scope-proof
**Source:** [Scoped test history story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-landed-ci-scope-proof)

## Goal and scope

Give Dashboard maintainers fast Node Vitest feedback on the 13 scoped
test history specs. Preserve the identity, points, gaps and provenance
Intent reads across collection, restart and a bounded retained window.
Wall-time-only and runner-wait proof, automatic repeat, standalone proof
collection and backend runner retirement have separate owners.

Apply the [campaign's speed and coverage criteria](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-later-dashboard-backend-unit-test-families).
Aim for about 100 ms per unit case or faster. Use the smallest set of cases
that still catches the distinct regressions in these 13 source files.

## Current decisions

- Follow the North Star for [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Apply [ADR 0002 on direct domain mapping and fast feedback](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [ADR 0008 on Dashboard authority and repository roles](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and [ADR 0010 on comparative evidence](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Use the published source and exact comparison facts already resolved for
  the caller. Preserve the [Review repository](../../NORTH-STAR.md#read-published-comparisons-from-the-review-repository)
  and [shared refresh](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads)
  ownership as those plans land. Any genuine browser observation promoted
  to E2E follows the North Star on [acting as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows).
- Reuse the existing collection pass, `collectLandingResolution`,
  `collectedProofOf`, `scopeHistoryOf` and `performIntentCiHistoryRead`.
  Bind the pass's project, retained history, receipts, Git order, stop
  signal and CI providers explicitly. Reuse any compatible bindings
  delivered by [wall-time history](../805-renovate-landed-ci-backend-proof/PLAN.md).
  The first slice owns binding the proof readers and pass to explicit
  inputs if needed. Keep one proof reader per production lifetime and the
  existing distinction between a pending reply and immutable attempt
  evidence. Use the existing contextual attempt keys and atomic history
  writes. Reuse `deliverCompletion` and its request admission where the
  outcome depends on delivery or retry.
- Apply [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md).
  Compose accepted receipts and Git histories that match the chosen build,
  plus retained observations for read-only checks. Supply CI evidence at
  the existing GitHub or adapter contract. Keep their production parse,
  identity and retention rules in the observed operation. Use real files
  for restart and compatibility, and real Git for order and provenance.
  Page actions in the existing provenance setup only arrange accepted
  inputs. Keep any independent browser or wire assertion at its production
  owner, with [Dough Page Objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  selection for E2E. Add only MakeMe data builders to test support.
- Several binding modules approach the
  [250-line check](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#file-size)
  (`intentCiHistoryRead.ts` 244, `landedCiHistoryStore.ts` 247 and
  `landedCiResolution.ts` 240 at preparation). If needed, keep request and
  persisted documents with their existing owners and move only a cohesive
  read projection or pass operation out of its adapter. Confirm wall-time
  and scoped callers together. The first slice owns any split needed for
  the proof binding.
- The scoped proof work can start from the current pass. The preceding
  story's placement gives maintainers an earlier measurement and reuse
  opportunity. The [automatic-repeat correction](../607-close-landed-ci-repeat-check-gaps/PLAN.md)
  retains its separate coverage and natural-load obligations.

## Decisive premises and baseline

At `a75673b31` on awake AC macOS (Node 24.21.0, Homebrew Bash on PATH),
the maintained command below exited 0. Its completed proof selected
38 cases across both cohorts. The 16 scoped cases in 13 files all passed
on their first attempt, summing to 44.696 s inside cases. This confirms
the existing provenance, retry, restart and compatibility routes. Slice 1
captures the standalone elapsed baseline before the first conversion.

```sh
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR \
  OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD=/tmp/dough-backend-renovation.mBpXIm/proof.json \
  npm run --silent test:dashboard:backend -- landed-ci-history- landed-ci-scope- --workers=2
```

The observed route resolves landings through the same collector which
writes proof and timing to the kept build. The history reader reads
retained state with its order and dispatches scoped reads to
`scopeHistoryOf`. The provenance cases arrange published Git states
before collecting; completion retry is a separate production trigger.
Reuse the collector and file-backed read in process. Slice 1 confirms
the explicit proof input still reaches retention and the reader before
further migrations.

A scratch change from 20 to 19 in `measuredWindow` made
`landed-ci-scope-retained-window.spec.ts` fail on the missing kept build.
The same run of `npm run --silent test:dashboard:backend --
landed-ci-history-read-window.spec.ts landed-ci-scope-retained-window.spec.ts
--workers=2` passed both cases after restoring the source. Slice 5 retains
this discrimination through the collector and store.

## Slices and outside-in proof

Each file stem below denotes `dashboard/backend-tests/intent/landed-ci-scope-<stem>.spec.ts`.
For each slice, map the original behavioral purposes to their surviving cases,
including any moved proof. Give each case one observable purpose. Compose
prerequisites with MakeMe and exercise real Git, persistence, collection or
delivery when the assertion depends on it. Compare related cases across the
cohort, wall-time history and existing owners. Remove repeated assertions and
setup, varying one independent behavior per case and retaining combinations
that affect the result.
Check the focused run's case durations during each migration slice so it can
simplify costly setup while it still owns that case.

### 1. An unanswered proof stays linked to the same attempt through recovery

Type: Behavior
Status: planned

Before migrating the first case, time the baseline command above with only
the `landed-ci-scope-` selector. Use the proof record for each case duration,
case and file counts and summed case time. Record shell elapsed separately.
Convert `pending-proof`, `proof-recovery` and `proof-adapter-recovery`
using the existing ordered collection pass and history reader. Supply
real published ancestry, accepted landing receipts and typed GitHub or
adapter responses for the exact attempt. Bind only the proof and pass
inputs needed for this outcome. Preserve the scheduler and its abort
ownership in the production caller.

**Proof.** An unanswered read produces a linked pending gap without losing
known run identity or independent trunk order. A succeeding pass or a
reopened collector resolves it to the same attempt. Cover distinct provider
and proof-state behavior with representative cases. Use reopen where saved
state affects recovery, keeping the finality interaction with slice 2. Observe
actual writes and public scoped reads. Verify production wiring with affected
wall-time and scoped consumers if shared composition changes.

### 2. A reopened collector keeps final evidence and advances pending builds

Type: Behavior
Status: planned

Convert `proof-lifecycle` and `proof-finality`. Supply a retained exact
attempt and a held or running attempt with independent outputs. Close the
first collection owner and reopen using the same real temporary store.

**Proof.** Observe the pending attempt become a point and other recorded
evidence stay unchanged. A final unreadable proof is never requested
again even if its provider would now answer. Count actual proof asks,
assert the previously saved gap, and prove the other attempt's progress.

### 3. Contextual adapter identity controls which scope points can be shared

Type: Behavior
Status: planned

Convert `adapter-identity` and `adapter-shared-attempt`. Give the production
collector distinct adapter runs with the same opaque attempt ID and two
receipts for one truly shared attempt. Use the same contextual identity
for collection and read projection.

**Proof.** Distinct runs return their own exact file evidence. A shared
attempt returns one point and retains both represented landing receipts.
Observe the saved build keys and the public scoped result.

### 4. Scoped reads preserve exact, equivalent and later build provenance

Type: Behavior
Status: planned

Convert `build-provenance` and `later-build`. Compose the skipped Planning
and prior/late landing inputs with real Git and typed accepted receipts.
Run the collecting and selected scoped read operations with the actual
endpoint, attempt evidence and order.

**Proof.** Retain the exact and skipped roles on one shared build. Preserve
the labelled later attempt for the cancelled landing. Assert the selected
endpoint and prove unrelated later points are excluded. If an independent
live publication assertion is found, map it to an existing or
representative E2E check before deleting the old owner.

### 5. The retained window advances in trunk order and reads old evidence

Type: Behavior
Status: planned

Convert `pending-order`, `retained-window` and `legacy-gap`. Use the
production store and branch order reader with 20 retained scoped
measurements, one unpositioned receipt and a recoverable local Git order.
Use the existing versioned document and compatibility reader for old proof.

**Proof.** See all 20 existing proofs while the new receipt is unordered.
Restore order, collect the new attempt and see the oldest trunk
measurement removed even when receipt dates disagree. Observe the
preserved legacy proof and explanation-only gap after a real store write.

### 6. A completion retry retains one scoped measurement

Type: Behavior
Status: planned

Convert `proof-completion`. Compose launch and landing preconditions.
Submit a real typed delivery and repeat it using the same admitted
attempt and receipt. Allow the production collection trigger to observe
the delivery; keep the completion outcome out of arrangement.

**Proof.** Read the delivery receipts, saved history and scoped result after
both submissions. Assert one collected proof and one measurement with the
same identity. Keep shared origin and wire response framing with its
adapter proof.

### 7. The scoped cohort gives faster feedback

Type: Behavior
Status: planned

Run the maintained scoped selection at two workers under conditions comparable
to slice 1. Compare shell elapsed, summed case time and file and case counts.
List individual case durations against the ~100 ms target. Investigate slower
cases for avoidable setup, waiting and repeated proof, and document any retained
cost and the behavior that needs it. Include the cost of any proof moved to
another suite. Retire setup and support imports whose consumers are gone.

**Proof.** The runner proof record shows passing Node Vitest cases and the
comparable run is faster. The purpose map names surviving coverage for each
removed or consolidated case and the focused proof shows that the surviving
case rejects a representative regression. Inspect for direct typed entry and
verify the cohort is free of server mounts, browser setup and new wrappers.

## Concern evidence

Refinement retained seven slices and assigned overlap review to each migration
slice, with measurement in slices 1 and 7. The common model is a landing
receipt resolved against attempt evidence. The exact, equivalent and later
roles remain available through one read projection. The map covers every scoped
source file and retains the genuine delivery and restart triggers. No remaining
slice-specific concern was identified.

## Verification and delivery

- Local gate: use the maintained [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  with `caffeinate -s -i` on AC power for measured runs. Keep the default
  timeout and follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Run focused files through `npm run test:dashboard:backend -- <files>`.
  Run Dashboard typecheck and lint for changed contracts. Apply the
  [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  to changed stores, readers, delivery and adapter bindings. Where an
  assertion moves, verify it rejects a representative wrong outcome.
  Run other proof suites only where a changed effect reaches them.
- Use the normal post-change refactor, delivery and hosted CI gates. Keep
  timing and coverage evidence in this plan for wrap-up.
