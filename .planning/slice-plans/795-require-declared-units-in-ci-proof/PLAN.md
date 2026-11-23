# Read and collect CI proof only in declared units

**Identity:** SEED-423#require-declared-units-in-ci-proof
**Source:** [Read and collect CI proof only in declared units](../../seeds/SEED-423-shrink-the-installed-distribution.md#require-declared-units-in-ci-proof)
**Split from:** SEED-423#retire-finished-migrations-and-legacy-formats (plan 794).

## Goal and scope

An Open Dough developer or agent reads CI proof whose counts and execution
timing are in declared `case` or `file` units. Version 2 is the sole summary
format. Invalid proof cannot contribute numbers, including when only one
entry in the summary is invalid. Retained builds still identify the measured
revision and wall time. Follow-up receipts and spent allowances survive the
same proof refusal.

The collector keeps the attempt and revision checks, per-unit part counts and
the distinction between missing, ambiguous and present parts. Outcomes and
expectations supply their unit explicitly. Playwright records define their
unit by format. An invalid uploaded fragment is excluded with a diagnostic
and cannot fill a declared part. The existing history window, comparison
selection, retry eligibility, and client rollout are outside this change.
Historical conversion and archive backfill are outside this story.

## Current decisions

- One rule for deciding which proof is usable. Reuse
  [the summary contract](../../../Distribution/src/skills/dough-test-optimization/scripts/ci-proof-contract.mjs)
  for live and retained input. The two live readers already classify invalid
  summaries as unavailable. Use that same classification at the
  [retained build decoder](../../../dashboard/server/landedCiObservation.ts),
  which is shared by landed history and the follow-up ledger. Keep the
  Dashboard's typed response schema aligned without adding another converter.
- Keeping the existing reader with strict producer defaults would preserve
  historical proof displays, but it would keep the old contract and leave
  consumers accepting unknown units. Rewriting archived proofs first
  would need a reliable mapping for old labels, access to expired sources,
  and a migration of the persisted stores. A laboratory report provides a
  narrower mechanism. A specimen identifier and collection time can remain
  valid when a result lacks the unit required to interpret it, so the report
  carries an unavailable result while keeping the specimen record. Here the
  build identity and timestamps survive invalid proof. The analogy ends at the independent validity of the record and its
  measurement. Old unit labels give no reliable conversion. Apply the shared validator and
  preserve each affected build record at the input boundary.
- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  requires measured revision identity and comparable evidence for an
  attributed comparison. An invalid-proof gap preserves that distinction.
  [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  calls for direct mapping to the domain in code and tests.
  [ADR 0005, Native validation and A/B testing](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  supports deterministic proof at these existing command, store and
  Dashboard boundaries. This work changes no native host interaction.
- The [Dashboard UX/UI North Star, Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  calls for naming the measured build and explaining unavailable CI evidence
  in place. The comparison and history slices use the existing gap paths and
  retain revision and attempt provenance.

## Premises observed during preparation

All local product observations ran in this story's preparation worktree at
`b153a60d8` on 2026-11-23 with Node 24.21.0. Runner commands used Bash 5.3
from `/opt/homebrew/bin` and the AC sleep guard.

| Consuming operation | Observation and planning consequence |
| --- | --- |
| GitHub jobs and the custom CI producer supply declared units | The maintained workflow/config audit checked Open Dough at `c2a0c51ce`, Doughnut at `c5bf470abf`, Pygardon at `49023bf9e`, Terry Talks at `f3e72cd`, Lizard at `22672c39`, and Clipboard at `4efe81d`. Doughnut uses composite actions with declared expectations. Pygardon's configured adapter delivers summaries from `infrastructure/ci/emit-ci-proof-summary.sh`, which uses case outcomes and `:case` expectations. The read-only Dashboard snapshot held declared version 2 proofs from five projects. Doughnut's retained summaries were all from the old cohort, so its checked producer configuration supplies that project's current evidence. |
| The Open Dough actions collect reports for the actual workflow declarations | `bash scripts/test.sh` on the support checks `ci-proof-actions`, `ci-proof-declaration` and `ci-proof-frontend-report` passed. The action harness exercises Distribution file and case outcomes and the browser group's Playwright-record format. The workflow-declaration check matches the actual parts and units. The frontend report still consumes the collector's version 2 output. The eight CLI and collector checks used below also passed at the preparation revision, including the old-format acceptance witnesses. |
| Both machine stores must keep otherwise usable build records | Read-only local inventory found 22 retained builds with legacy units, all with wall time, across Doughnut (14), Terry Talks (5) and Clipboard (3). The store held no v1 summaries and none of the legacy summaries mixed declared units. The follow-up ledger held 85 stored uses of summaries and none were retired. Both stores call `keptBuildSchema` and validate whole documents. |
| A strict validator needs proof-local failure handling before it can ship | In a disposable fixture home under `storeOnMachine`, exercised `readStoredLandedCiHistory`, `keepLandedCiOrder`, `readFollowUps` and `changeFollowUps` with legacy and declared version 2 builds and a second project. Baseline read and wrote both documents. A scratch strict shared validator alone made both documents unreadable. Adding a scratch invalid-proof return from the retained decoder restored both reads and writes, retained a 60,000 ms build and the neighbouring project's declared proof, and preserved the assessed ledger row. Scratch edits were restored. The modified scoped projection and no-refetch assertion are owned by B's boundary proof. |
| Existing Dashboard baselines reach the maintained proof boundaries | Six focused Distribution support checks passed, including `landed-ci-history-proof-versions`, `dashboard-ci-proof-units-read`, `dashboard-ci-adapter-proof`, `intent-ci-scope-history-{units,timing}`, and `story-ci-comparison-entry-summaries`. `npm run test:dashboard:backend --` passed the focused `landed-ci-scope-legacy-gap.spec.ts` and `landed-ci-proof-adapter-units.spec.ts` run. The Distribution `ci-follow-up-ledger` and `ci-follow-up-reading` support checks also passed. The mounted runner passed seven cases in `intent-ci-comparison-{units,legacy}.spec.ts` and `intent-scope-timing-history-units.spec.ts`, including the current gap wording and distinct unit displays. |

The worktree baseline predates the adapter work in
[plan 793](../793-call-custom-ci-through-a-minimal-adapter-interface/PLAN.md)
and the selected comparison story in [SEED-420](../../seeds/SEED-420-unified-intent-review.md#read-proof-for-the-comparison).
Neither supplies a missing capability. Before editing a path those plans also
change, trace the landed caller and rerun the affected focused proofs if the
boundary moved. Keep the adapter command, proof acquisition rules and
comparison selection that are current at execution.

## Proof and local gates

Run the focused proofs named in each slice. Use Bash 5+ on the project's
PATH. For long or full runs on awake macOS with AC power, use
`caffeinate -s -i`. On battery, start fully awake with the lid open under
`caffeinate -i` and inspect the sleep log after the run. Follow
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
and the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run the Dashboard type check where the proof or history response types move.
Apply the repository's MakeMe and browser page-object selection when changing
tests. Apply the maintainer skill-authoring guidance to shipped guidance edits.

The [consumer trace](../../../Distribution/src/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
at preparation searched `currentSummaryOf`, `fragmentsFromOutcomes`,
`ci-proof-summary.mjs`, `legacyReason`, `legacy unit unknown`,
`legacy test result`, `keptBuildSchema`, and `ciProofSchema`. Refresh the
trace per slice on the actual diff and disposition reached consumers. The
proof map below owns the externally observable changes. The installed
`.agents` and `.claude` copies move with a release. Historical planning and
intent examples establish provenance. The product consumers include the
workflow actions, the frontend proof report, fixture collectors and
builders, both Dashboard machine stores, and the browser's proof responses,
comparison, and scope-history views.

| Final promise | Owner and observing boundary |
| --- | --- |
| Outcomes require a unit; Playwright records still publish cases | C, collector CLI and existing composite-action fixture inputs |
| Expectations require units; unusable parts cannot fill a declared part | E, collector CLI and workflow-produced combined summary |
| CLI reads and ranks only valid declared evidence | B for input refusal and D for formatting and ranking on the CLI |
| Dashboard classifies refused live proof on both providers | B, archive and custom adapter fixtures through the production readers |
| Retained invalid proof leaves history and follow-up accounting usable | A for store validation and writes, B for the retired formats and the scoped history gap |
| Project and scope timing preserve their separate meanings | B and F, retained backend journey and scoped timing views |
| Declared case and file counts and times stay separate through comparison and drill-down | G, mounted Intent and typed proof response, with the non-overlapping browser journey from B |

## Slices

### A. Keep a build record with invalid proof
Type: Behavior
Status: planned
Estimated active work: 10–13 minutes.

Behavior. Given a retained build whose summary fails validation, reading and
updating history or a follow-up record preserves the readable document, its
other records, and that build's provenance and wall time. The invalid summary
is returned as an unavailable proof with validator detail. Other malformed
build fields remain store-schema errors. Keep currently accepted summaries
readable until B.

Proof. Extend `landed-ci-history-proof-versions.test.mjs` at the real store
read/write boundary with deliberately malformed wire proof and an independent
valid control. Exercise `ci-follow-up-ledger.test.mjs` using a persisted
assessment or request with the same bad build evidence. Observe the same key
and accounting through a write, alongside the invalid proof result.
Use the fixture home and the real production store and decoder.

### B. Refuse retired summaries across CLI, Dashboard and retained history
Type: Behavior
Status: planned
Estimated active work: 13–15 minutes.

Behavior. Given v1, v2 with a missing unit, or v2 mixing a retired unit with
a declared unit, reading the attempt refuses the summary as a whole. Valid
v2 case and file evidence remains readable. A stored retired summary takes
A's invalid path and keeps its wall-time point. A's refusal never starts a
replacement proof request. Distinct malformed, missing, expired, oversize
and wrong-attempt cases retain the existing classifications.

Proof. Cover validator refusal through `ci-proof-check.test.mjs` and the
CLI read path. Reuse the live GitHub archive and custom adapter boundaries in
`dashboard-ci-proof-units-read.test.mjs`, `dashboard-ci-adapter-proof.test.mjs`
and the two `ci-proof-memory-*-gaps.spec.ts` files for provider status. Adapt
`landed-ci-scope-legacy-gap.spec.ts`, `landed-ci-proof-adapter-units.spec.ts` and
`landed-ci-history-proof-versions.test.mjs` to check the invalid scope result,
paired valid points, atomic re-read and unchanged request count. Change the
old-format E2E journey to read invalid proof. Give the declared-unit E2E
journey modern collected evidence and retain its independent drill-down and
missing-part checks. Remove obsolete `currentSummaryOf` and v1 validation here.
Typed view and fixture branches for the retired unit remain temporarily until F and G.
Collection can still emit legacy output until E, while maintained jobs
already use declared units. Run
`Distribution/tests/installation/execution-payload-update.sh` because both
installed skill roots exercise the changed custom adapter summary reader.

### C. Require a unit when turning outcomes into fragments
Type: Behavior
Status: planned
Estimated active work: 9–12 minutes.

Behavior. A fragment request with outcomes plus a declared case or file unit
writes fragments bearing that unit. An omitted or invalid outcomes unit
terminates before fragment output. Playwright records continue to emit case
fragments by format, with their existing option validation.

Proof. Exercise `ci-proof-summary.mjs fragment` with both units, omitted or
invalid unit, and the Playwright-record form in `ci-proof-units-cli.test.mjs`.
Keep the action fixture and workflow declaration checks green. Update
`fragmentsFromOutcomes` fixture call sites to say what they count, including
the by-file and custom adapter fixtures.

### D. Drop the retired unit from CLI projections
Type: Structure
Status: planned
Estimated active work: 8–11 minutes.

Structure. Change the scope, gaps, table and ranking projections to use
declared unit identity and wording, allowing E to remove the remaining
Distribution legacy helpers. Preserve the CLI's accepted output for cases,
files, missing parts, partial timing, and attempt refusals after B.
Proof. Run `ci-proof-{ranking,scope,scope-units,leads-gaps}.test.mjs` around the
CLI projections. Observe separate ranking groups and labeled scope counts
and times, including mixed declared units and no timing for an unusable part.

### E. Collect only matching declared parts
Type: Behavior
Status: planned
Estimated active work: 12–15 minutes.

Behavior. An expectation without a case or file unit fails before producing
a summary. Wrong-unit and retired fragments are excluded and diagnosed.
A missing or duplicate part leaves its existing distinct status in the
declared unit. Multiple declared units for one entry stay separate.

Proof. Prove refusal and the output file boundary with `ci-proof-units-cli`
and `ci-proof-unit-declarations`. Run the affected collect, summary, outcomes
and breakdown checks. Keep the `ci-proof-actions` and
`ci-proof-frontend-report` action paths green. Remove the unused collector
and raw fragment compatibility branches and update the shipped proof
usage.

### F. Use only declared readings in retained scope timing
Type: Structure
Status: planned
Estimated active work: 8–11 minutes.

Structure. Remove the unused legacy timing cue and `legacyReason` from the
scoped history projection, response and mounted fixtures so G can narrow the
shared unit type. B already makes retired summaries invalid at both
stores. Preserve that gap, the acquisition rules, the wall-time points, and
selected case and file points on their own series.

Proof. Run `intent-ci-scope-history-{units,timing,gaps}.test.mjs` and the
mounted `intent-scope-timing-history-units.spec.ts` cases. Reuse the backend
retained history and follow-up proof from B on the actual projection change.
The 257-line `intent-ci-scope-history-timing.test.mjs` already exceeds the
file limit. Retire the internal legacy-only fixture and its old cue from the
test that covers declared timing continuity and terminal gaps, keeping
invalid raw proof coverage at B's store boundary. Keep the independent
owning-entry/selected-unit comparability case. If still over 250 lines,
move the ownership-change case to the scope-matching spec or its own file
and run both affected checks.

### G. Read Dashboard proof and comparisons in declared units
Type: Behavior
Status: planned
Estimated active work: 12–15 minutes.

Behavior. The Dashboard proof-response contract accepts only declared-unit
summaries. An invalid response takes the existing read failure path.
A comparison of valid endpoints keeps case and file totals, timing and
unmatched-unit gaps distinct across the summary, location, folder and file
views. No legacy row, label or inferred unit remains.

Proof. Narrow `ciProofSchema` and the comparison and wording consumers as one
typed contract. Test the authenticated proof-response decoder with raw wrong
unit evidence, retain the existing unavailable response, and check current
case and file responses through `intent-ci-comparison-units.spec.ts`.
Adapt reached legacy-oriented specifications and common builders to test
unavailable or non-overlapping declared-unit cases according to the promise
they own. Keep raw invalid input in the wire-boundary proofs. Run Dashboard
type checks and the reached mounted comparison and scope-proof specs.

## Readiness review

Slice-plan refinement placed the CLI projection cleanup immediately before
it enables collector helper removal. The retained decoder comes before the
shared reader cutover, and the scope projection cleanup immediately precedes
narrowing the Dashboard unit type. Seven slices fit the eight-slice limit.
E and G settle the recorded interim behavior. No remaining slice-specific
concern was identified in the sequencing, sizing, or ownership review.
