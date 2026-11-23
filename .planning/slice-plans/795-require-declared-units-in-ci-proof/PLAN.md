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
| A strict validator needs proof-local failure handling before it can ship | In a disposable fixture home under `storeOnMachine`, exercised `readStoredLandedCiHistory`, `keepLandedCiOrder`, `readFollowUps` and `changeFollowUps` with legacy and declared version 2 builds and a second project. Baseline read and wrote both documents. A scratch strict shared validator alone made both documents unreadable. Adding a scratch invalid-proof return from the retained decoder restored both reads and writes, retained a 60,000 ms build and the neighbouring project's declared proof, and preserved the assessed ledger row. Scratch edits were restored. The modified scoped projection and no-refetch assertion are owned by slice 2's boundary proof. |
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
| Outcomes require a unit; Playwright records still publish cases | 3, collector CLI and existing composite-action fixture inputs |
| Expectations require units; unusable parts cannot fill a declared part | 5, collector CLI and workflow-produced combined summary |
| CLI reads and ranks only valid declared evidence | 2 for input refusal and 4 for formatting and ranking on the CLI |
| Dashboard classifies refused live proof on both providers | 2, archive and custom adapter fixtures through the production readers |
| Retained invalid proof leaves history and follow-up accounting usable | 1 for store validation and writes, 2 for the retired formats and the scoped history gap |
| Project and scope timing preserve their separate meanings | 2 and 6, retained backend journey and scoped timing views |
| Declared case and file counts and times stay separate through comparison and drill-down | 7, mounted Intent and typed proof response, with the non-overlapping browser journey from slice 2 |

## Slices

### 1. Keep a build record with invalid proof
Type: Behavior
Status: done
Estimated active work: 10–13 minutes.

Behavior. Given a retained build whose summary fails validation, reading and
updating history or a follow-up record preserves the readable document, its
other records, and that build's provenance and wall time. The invalid summary
is returned as an unavailable proof with validator detail. Other malformed
build fields remain store-schema errors. Keep currently accepted summaries
readable until slice 2.

Proof. Extend `landed-ci-history-proof-versions.test.mjs` at the real store
read/write boundary with deliberately malformed wire proof and an independent
valid control. Exercise `ci-follow-up-ledger.test.mjs` using a persisted
assessment or request with the same bad build evidence. Observe the same key
and accounting through a write, alongside the invalid proof result.
Use the fixture home and the real production store and decoder.

Accepted proof. The shared retained-build decoder classifies invalid summaries,
including a missing payload or typed parse failure, within the proof field.
The history store's atomic read and write retained the original build key,
revision, 60-second wall interval, and neighbouring valid proof. The new
`ci-follow-up-ledger-proof.test.mjs` store case observed the same recorded
receipt, original build, and spent allowance through an outcome update.
The existing ledger selection was preserved. The four store checks and three
reached consumer checks passed 30 cases with Bash 5 and the macOS AC guard.
Dashboard type checking passed. Commands, selections and trace remain in
`slice-a-return.md` in this checkout's Git evidence directory.

### 2. Refuse retired summaries across CLI, Dashboard and retained history
Type: Behavior
Status: done
Estimated active work: 13–15 minutes.

Behavior. Given v1, v2 with a missing unit, or v2 mixing a retired unit with
a declared unit, reading the attempt refuses the summary as a whole. Valid
v2 case and file evidence remains readable. A stored retired summary takes
slice 1's invalid path and keeps its wall-time point. Slice 1's refusal never starts a
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
Typed view and fixture branches for the retired unit remain temporarily until slices 6 and 7.
Collection can still emit legacy output until slice 5, while maintained jobs
already use declared units. Run
`Distribution/tests/installation/execution-payload-update.sh` because both
installed skill roots exercise the changed custom adapter summary reader.

Accepted proof. The shared validator refuses v1, missing units and mixed
declared and retired units before using any counts. The real CLI, GitHub
archive, custom adapter and retained decoder all take that path. The scoped
history reader kept the old attempt's wall interval and paired valid timing,
with no additional proof request. The declared browser journey kept distinct
case and file readings and the visible missing case part. The Distribution,
installed payload, backend, E2E and Dashboard type checks passed. The
refactor renewed the CLI and two browser refusal cases. Commands and
observations are in `slice-b-return.md` and `slice-b-refactor-return.md` in
this checkout's Git evidence directory.

The comparison sibling returned to the backlog at `18826cc78` and changed
this plan's source link. Pinned trunk `28785ac04` introduced no product
changes in that interval. The adapter sibling remained Taken.

### 3. Require a unit when turning outcomes into fragments
Type: Behavior
Status: done
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

Accepted proof. The CLI rejects missing and unsupported outcomes units
before output creation. Case and file outcomes write separate fragments,
and the Playwright-record command still supplies cases and rejects outcomes
options. The action replay and workflow declaration proof cover their actual
inputs. The custom adapter by-file producer already declares `file`.
Focused Distribution, backend, E2E and Dashboard type checks passed. The
literal commands and consumer trace are retained in `slice-c-return.md`.
The outcomes part of G2 is proved here. The expectation and incoming
fragment requirements stay with slice 5.

### 4. Drop the retired unit from CLI projections
Type: Structure
Status: done
Estimated active work: 8–11 minutes.

Structure. Change the scope, gaps, table and ranking projections to use
declared unit identity and wording, allowing slice 5 to remove the remaining
Distribution legacy helpers. Preserve the CLI's accepted output for cases,
files, missing parts, partial timing, and attempt refusals after slice 2.
Proof. Run `ci-proof-{ranking,scope,scope-units,leads-gaps}.test.mjs` around the
CLI projections. Observe separate ranking groups and labeled scope counts
and times, including mixed declared units and no timing for an unusable part.

Accepted proof. Scope and ranking cases kept case and file figures separate,
left missing and ambiguous parts unmeasured, and kept untimed totals out of
the leads. The CLI and table checks preserved attempt refusals, the lead
budget, and the 16 KiB output boundary. The 35 selected Distribution cases
and installed-payload check passed. Commands and observations are in
`slice-d-return.md` in this checkout's Git evidence directory.

### 5. Collect only matching declared parts
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

### 6. Use only declared readings in retained scope timing
Type: Structure
Status: planned
Estimated active work: 8–11 minutes.

Structure. Remove the unused legacy timing cue and `legacyReason` from the
scoped history projection, response and mounted fixtures so slice 7 can narrow the
shared unit type. Slice 2 already makes retired summaries invalid at both
stores. Preserve that gap, the acquisition rules, the wall-time points, and
selected case and file points on their own series.

Proof. Run `intent-ci-scope-history-{units,timing,gaps}.test.mjs` and the
mounted `intent-scope-timing-history-units.spec.ts` cases. Reuse the backend
retained history and follow-up proof from slice 2 on the actual projection change.
The 257-line `intent-ci-scope-history-timing.test.mjs` already exceeds the
file limit. Retire the internal legacy-only fixture and its old cue from the
test that covers declared timing continuity and terminal gaps, keeping
invalid raw proof coverage at slice 2's store boundary. Keep the independent
owning-entry/selected-unit comparability case. If still over 250 lines,
move the ownership-change case to the scope-matching spec or its own file
and run both affected checks.

### 7. Read Dashboard proof and comparisons in declared units
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

## Execution context

- Tsubomi-chan, Story Branch Mode on
  `codex/read-and-collect-ci-proof-only-in-declared-units`. The established Take
  `cc18578a63e19d63a6eaa4a35e8c99fa5037b8e1` was accepted on `origin/main`
  from `678701204fc07654897a8341178c94d8df8772e0`.
- The Codex observer covers the story branch using GitHub Actions `ci.yml`.
  Coordinator `seed-423-units-ed1a06d9`, mailbox
  `/tmp/dough-ci-501/watch-sX111F`, PID `72385`, cell `g446:13`, session `51637`.
- Slice 1 was accepted on the story branch at
  `1d78c4b9149e07203ea63bb85d7db38672f50b08`.
- Slice 2 was accepted on the story branch at
  `b147240973d2d1c625bbb06f7a5a7f1ad051ff1e`.
- Slice 3 was accepted on the story branch at
  `cce5ca4466839193eeb42e26e0d1c87f9b450c61`.
- The Intent retry test repair was accepted on the story branch at
  `f379ad88f6cc049ff057660d5dd07c814b6d26de`. The exact local failure control
  and passing regression proof are in [the diagnosis](diagnosis-intent-read-recovery.md).
  Slice 4 was restored with its implementation and proof inputs intact.

## Story obligations

### G1. Retired summaries remain readable during slice 1
Reported: slice 1 — "Valid classified proof and readable v1/v2 summaries keep their established behavior during A."
Story clause: "Read version 2 summaries whose evidence uses declared units throughout."
Disposition: proved by slice 2: the shared reader, CLI, both live providers and retained history refused the retired wire fixtures; see the accepted proof under slice 2.

### G2. The collector has temporary undeclared inputs
Reported: slice 2 — "Collection still accepts undeclared fragment or expectation input during these intermediate slices."
Story clause: "Outcomes reports require `--unit case|file`, and summary expectations require a unit for each entry and part count."
Disposition: interim until slices 3, 5

### G3. Dashboard projections still have legacy unit branches
Reported: slice 2 — "The Dashboard's remaining typed fixture and projection branches for legacy evidence still have owners in slices 6 and 7."
Story clause: "A count with an unknown unit cannot be attributed safely, and skipping one unit or entry within an invalid summary would present partial proof as complete."
Disposition: interim until slices 6, 7

## Readiness review

Slice-plan refinement placed the CLI projection cleanup immediately before
it enables collector helper removal. The retained decoder comes before the
shared reader cutover, and the scope projection cleanup immediately precedes
narrowing the Dashboard unit type. Seven slices fit the eight-slice limit.
Slices 5 and 7 settle the recorded interim behavior. No remaining slice-specific
concern was identified in the sequencing, sizing, or ownership review.
