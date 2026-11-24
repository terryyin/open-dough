# Prove landed CI attempt evidence through typed backend handlers

**Identity:** SEED-413#renovate-landed-ci-attempt-evidence
**Source:** [Landed attempt evidence story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-landed-ci-attempt-evidence)

## Goal and scope

Give maintainers faster Node Vitest proof that a landed attempt retains its
original timing, proof and follow-up inputs. Account for the ten original
Intent specs named below. Keep scoped history, the 14 wall-time history files,
and the [automatic-repeat correction](../607-close-landed-ci-repeat-check-gaps/PLAN.md)
with their existing owners. Where the wall-time story also changes the
collector, use the current typed pass and check both cohorts wherever the
binding changes.

Apply the [campaign criteria](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-later-dashboard-backend-unit-test-families)
for speed, case purpose, coverage and retirement of unused support.

## Current decisions

- Follow the North Star for [direct production seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [Vitest and E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  and [shared published Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads).
  Apply [ADR 0002 on fast feedback and direct mapping](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [ADR 0008 on Dashboard authority and persisted evidence](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and [ADR 0010 on evidenced improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
- Reuse `collectLandedCiPass` and the inputs made explicit in
  [the scoped history migration](https://github.com/terryyin/open-dough/blob/674da3627e1d20e3376b6fef8b4f1a98e1a3768f/.planning/slice-plans/806-renovate-landed-ci-scope-proof/PLAN.md).
  Keep one production pass and the existing scheduler, abort ownership and
  store format. Bind the existing typed CI callbacks and use temporary
  retained documents where writes or reopening matter.
- Follow [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md).
  Reuse `makeMe.aLandedCiHistory`, kept launches, proof and Git builders. Seed
  retained state for read purposes. Exercise the real collector when retaining
  proof or updating timing is the assertion. Use real file, artifact ZIP and
  Git I/O where those boundaries distinguish behavior. Inspect remaining
  consumers before removing any wrapper. Apply the
  [file-size check](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#file-size)
  if production binding expands.

## Decisive premises and baseline

At `177084da6`, the backend group's engine classifier selects the ten
named specs on Playwright. The source trace reaches `collectLandedCiPass`
with a published source, receipts, history, repository, stop signal and
provider reads. The pass reads Git order and delegates to
`collectLandingResolution`; the retained evidence paths consume the typed
attempt and provider outcomes. The finished scoped campaign observed 16
first-attempt passes in 12 migrated files, reducing combined case time from
58.563 s to 8.369 s across comparable selections. It established the
collection seam and the persisted reopen behavior for scoped evidence.

The preparation baseline ran this cohort alongside the other new cohort on
AC macOS with Node 24.21.0 at two workers. The combined run passed all 92
cases on their first attempts across 29 files and took 100.11 s elapsed.
The ten Intent files supplied 34 cases and 61.738 s summed case time. Treat the
summed case time as a planning baseline. Measure standalone cohort elapsed
before edits and retain the per-case proof record for comparison.

```sh
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR \
  OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$proof_dir/proof.json" \
  /usr/bin/time -p npm run test:dashboard:backend -- \
  landed-ci-attempt-start landed-ci-proof- landed-ci-reader-restart \
  landed-ci-follow-up-reading intent-ci-proof-read ci-proof-extraction \
  ci-time-without token-index --workers=2
```

Before editing each selection, run its existing cases, record the verdict,
and inspect what would fail if the named behavior changed. Use the campaign's
before-and-after measurement on the complete cohort. Slice 4 checks whether
an existing E2E case observes the old-address distinction before deciding
where that assertion lands. The current restart spec actually occupies the
old port and checks requests at both addresses, so a local-file read alone
cannot own that distinction.

## Slices

Outside-in proof. All file stems in this section refer to
`dashboard/backend-tests/intent/<stem>.spec.ts`. Use the maintained backend
runner to verify each slice's exact selection. Retain a map from each original
purpose to its surviving assertion and use that map during cleanup.

### 1. Retained timing belongs to the original attempt

Type: Behavior
Status: done

Convert `landed-ci-attempt-start` and `landed-ci-attempt-start-adapter`.
Give the typed collection pass a retained receipt, Git order and a provider
that answers for both original and newer attempts. Use
`collectRetainedAttemptTiming` on the real production path.
Observe the saved and reopened build with the original provider identity
and its own start. Preserve the explanation for missing original bounds.
Assert that a newer faster or opaque adapter attempt cannot replace the
original. Use one representative restart assertion here for the timing
write; leave the addressed-reader assertion to slice 4.

### 2. Standalone collection retains the selected attempt's proof

Type: Behavior
Status: done

Convert `landed-ci-proof-collection` and
`landed-ci-proof-adapter-units`. Pass GitHub artifact answers and an
adapter's typed proof with independent case and file timing to the
existing pass and `collectedProofOf` path. Call collection with no open
Intent reader. Observe the document after collection, and read it through
`performIntentCiProofRead` for the same attempt. Keep distinctions among
pending, unavailable, and retained evidence where the source cases
distinguish them. Compose dedicated read inputs with MakeMe.

### 3. Proof extraction and admission preserve evidence identity

Type: Behavior
Status: done

Convert `ci-proof-extraction` and `intent-ci-proof-read` through
`ciProofArtifactReader`, `parseIntentCiProofRead`, and the existing
admitted read path. Supply ZIP contents with an absent part and untimed
result. Observe the resulting proof records, including those distinctions.
Give the admission input a run with its attempt missing and observe the
refusal and zero calls to the provider. Keep a consumer check of the
authenticated route dispatch if its binding changes.

### 4. A new reader uses the saved history after the old address is released

Type: Behavior
Status: done

Resolve `landed-ci-reader-restart`. Give `performIntentCiHistoryRead`
an explicit reopened history document and provider spy. Assert identical
retained point and zero provider calls. Trace the existing
`e2e/intent/intent-ci-wall-time-history-*` journeys and
`runtime/chosen-port` cases for the separate composition assertion. Preserve
it in one E2E journey if coverage lacks the combination: restart the reader
on its own address with the old address claimed, read the retained answer,
and observe that the old listener received no reader traffic. Prove
discrimination before deleting the mounted spec.

### 5. Follow-up uses the original measurement after later history changes

Type: Behavior
Status: planned

Convert `landed-ci-follow-up-reading`. Call `answerCiFollowUp` through
its typed admitted inputs and keep `retainedFollowUpOf` and
`withOriginalFollowUpSamples` on the production path. Supply kept original
and repeat timings, persisted sample exclusions, the current landing and
the following landing. Keep real Git order or
temporary documents where the case depends on them. Observe sample
inclusion exactly once, the reason for dropping the slow outlier, repeat
exclusion and retained workflow/sample provenance after window eviction and
a newer same-identity record. Keep request admission and actual repeat
submission in their existing proof owners.

### 6. Runner-wait timing uses the same attempt and graph semantics

Type: Behavior
Status: planned

Convert `ci-time-without-runner-waits` and
`ci-time-without-adapter-runner-waits` directly through
`timeWithoutRunnerWaits`, `timeWithoutAdapterRunnerWaits` and
`asComparisonSlot`. Give the functions workflow definitions and the typed
job timing or graph variants the cases already distinguish. Observe the
longest dependency chain, carried jobs, matrix and reusable workflow
matching and unavailable timing reasons. For a timed-out job-graph read,
observe the selected attempt and proof identity in the comparison answer.

### 7. The attempt evidence cohort gives faster feedback

Type: Behavior
Status: planned

Run the whole cohort at two workers before and after conversion, with a
proof record and wall elapsed. Compare file and case counts, individual
durations against the ~100 ms aim, summed case time and command elapsed.
Account for the cost of relocated proof. Check remaining slow cases for
unnecessary Git, persistence or repeated assertions, retaining required
costs with the relevant purpose. Verify all ten original files have a
disposition and that the backend selection uses Node Vitest. Delete support
only after its consumers have gone.

## Learnings

- Slice 1 reopen proof for the timing write is a second
  `performIntentCiHistoryRead` on the retained document (no further provider
  calls). The old-address HTTP restart stays with slice 4.
- Refactor disposition for slice 1: skipped. Owned change is only the two
  subject specs; product search finds the conversion on the existing
  `collectLandedCiPass` / `collectRetainedAttemptTiming` seam already used by
  `landed-ci-scope-*` specs; no new production representation; no
  refactor-check candidate.
- Slice 2: unavailable proofs are not remembered — assert listing/archive
  after collection, before a second typed proof read. Optional
  `IntentCiProofReaders` on `performIntentCiProofRead` / `readIntentCiProof`
  forwards collection seams; production `performedRead` still omits readers.
- Slice 2 refactor: named readers type, `buildKeyOf`, extracted
  `retainedLandedCiProof` support, split summary history reopen; cohort-wide
  checkout harness left as follow-up.
- Slice 3: narrow `RequestedRead` to `intent-ci-proof` before
  `performIntentCiProofRead`; authenticated route dispatch binding unchanged.
- Slice 4: Vitest owns retained-history reopen; E2E
  `e2e/intent/landed-ci-reader-restart.spec.ts` owns old-address composition
  (wall-time E2E + chosen-port lacked that combination).

## Accepted proof (slice 1)

Focused: `npm run test:dashboard:backend -- landed-ci-attempt-start landed-ci-attempt-start-adapter --workers=2` (exit 0; 2 files / 3 tests).
Evidence: `open-dough/evidence/slice1-proof2-20261124182203.log.run.json`,
`slice1-proof-lint4.log.run.json` (renewed after delivery formatting lint repair),
`slice1-return-report.md`. Consumer-trace: test-only; production binding unchanged.

## Accepted proof (slice 2)

Focused (post-refactor): `npm run test:dashboard:backend -- landed-ci-proof-collection landed-ci-proof-adapter-units --workers=2` (exit 0; 2 files / 5 tests).
Evidence: `open-dough/evidence/slice2-refactor-20261124185000.log.run.json`,
`slice2-proof-ts.log.run.json` (renewed after delivery formatting lint repair),
`slice2-return-report.md`, `slice2-refactor-consumer-trace-20261124185000.txt`.
Production: optional `IntentCiProofReaders` pass-through; default wire unchanged.

## Accepted proof (slice 3)

Focused: `npm run test:dashboard:backend -- ci-proof-extraction intent-ci-proof-read --workers=2` (exit 0; 2 files / 2 tests); `npm run typecheck:dashboard` (exit 0).
Evidence: `open-dough/evidence/slice3-proof2-20261124185123.log.run.json`,
`slice3-typecheck2-20261124185123.log.run.json`, `slice3-return-report.md`.
Refactor disposition: skipped — subject specs plus comment-only Distribution pointer; product search finds conversion onto existing `ciProofArtifactReader` / `parseIntentCiProofRead` / `performIntentCiProofRead`; no new production representation.

## Accepted proof (slice 4)

Focused: `npm run test:dashboard:backend -- landed-ci-reader-restart --workers=2` (exit 0; 1 test);
`npm run test:e2e -- intent/landed-ci-reader-restart.spec.ts --reporter=list` (exit 0; 1 test).
Evidence: `open-dough/evidence/slice4-proof-20261124185713.log.run.json`,
`slice4-e2e2-20261124185746.log.run.json`, `slice4-return-report.md`.
Refactor disposition: skipped — subject Intent conversion + new E2E composition owner; no production change; no refactor-check candidate.

## Concern evidence

A separate refinement pass was unnecessary because the seven slices each
name one observation and reuse existing production entries. The slices
follow the production path from attempt timing and proof
to read and follow-up. The old-address restart proof has an independent
owner decision in slice 4 and cannot be dropped on the strength of the
typed read alone. No unresolved scope decision remains.

## Verification and delivery

- Local gate: for measured runs use the maintained [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  with `caffeinate -s -i` on AC power. Keep the default timeout and follow the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Run `npm run test:dashboard:backend -- <exact files> --workers=2` as
  cases move and compare with the same selection conditions. Capture
  `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD` and elapsed separately.
  Run Dashboard typecheck and lint for production contracts and affected E2E
  for any relocated observation. Use the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  for changed binding and persistence. Follow normal refactor and hosted CI gates.
