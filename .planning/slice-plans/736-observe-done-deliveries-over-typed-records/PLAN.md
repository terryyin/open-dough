# Observe Done deliveries over typed kept records

**Identity:** SEED-413#observe-done-deliveries-over-typed-records
**Source:** [Observe Done deliveries over typed kept records](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#observe-done-deliveries-over-typed-records)
**Source review:** [Independent source review](source-review.md)

## Goal and scope

Dashboard maintainers can prove which Done branches a trunk revision delivers
from composed Done records and real Git, without a machine home.
`dashboard/server/observedSessionLandings.ts` becomes a store adapter over a
typed delivery-observation decision and its process-lifetime owner
(`dashboard/server/observedSessionDeliveries.ts`). Delivery-observation proof
starts from composed Done records, keeping only pin retention and the
deletion, expiry, and post-pin write-loss races at the adapter over an
explicit record-store collaborator.

Included:

- extracting the typed decision (`decideObservedDeliveries`) and its
  process-lifetime owner (`observedSessionDeliveries`: per-project observed
  revision, checked witnesses, and in-flight pass coalescing) over `LaunchRecord[]`,
  the trunk ref and observed revision, the authorized trunk head reader, and
  `inspectManualLanding`;
- giving `sessionLandingObservations` an explicit `ObservedLandingStore`
  collaborator (`{ keptRecords, changeSessionRecord }`, defaulting to
  `dashboard/server/launchRecordStore.ts` for `observeProjectRevision`) that
  applies each `ObservedDelivery` to the live record and releases unkept
  delivery pins on loss;
- removing `keep`, `markDone`, and `home` from
  `dashboard/backend-tests/support/doneBranchObservation.ts`, proving
  selection, witness skipping, newly-Done discovery, and inspection retry
  from composed Done records, and moving the adapter race and pin-retention
  cases onto the explicit store collaborator with zero `HOME` stubs.

Excluded: the Done transition, Git branch-result capture, MakeMe branch-result
steps, and composed-record `doneCaptureReview.ts`
(Done split story SEED-413#split-done-mark-decision-from-store, done,
recorded as this story's blocking supplier); exposing production pin-ref
queries in place of `adHocBranchRefs.ts`
(the branch entry story (SEED-413#split-branch-entry-proposal-from-store, done; recoverable at `9969388`));
splitting `handleLanding`
(landing reports (completed; recoverable at `086faa5a:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#decide-landings-over-typed-attempts-and-records`));
and folding `twoDoneBranchesMergedByHand` and `observedTrunk` into MakeMe
([launch flavors](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#fold-done-capture-launches-into-makeme)).
`observeProjectRevision` keeps its signature for `performedRead.ts` and
`performedRevisionCheck.ts`.

## Key examples and proof

| Example | Observable proof and owner |
| --- | --- |
| Two Done branches merged by hand are each delivered by the published head, decided from composed records with no kept store and no delivery pins written | Typed decision cases over composed Done records and real Git in `review/observed-session-deliveries.spec.ts` (slice 1). |
| Witness skipping at an unchanged revision, recheck on revision advance, newly-Done discovery at an unchanged revision, and failed-inspection retry while independent deliveries settle | Process-lifetime owner cases in `review/observed-session-deliveries.spec.ts`, `review/ad-hoc-manual-landing-observation.spec.ts` (second case), and `review/ad-hoc-manual-landing-observation-retry.spec.ts` with composed records and no store (slice 2). |
| Deleting or expiring a record while its inspection waits does not recreate the launch or leave delivery pins, and a store write failing after pinning releases the unkept delivery pins | Adapter race cases in `review/ad-hoc-manual-landing-observation-lifecycle.spec.ts` over an explicit `ObservedLandingStore` collaborator (slice 3). |
| Restart discovery after branch retirement preserves both `"delivered"` and `"branch-result"` comparisons when `origin` is offline, and repeated/advanced observations retain one delivery and one pin pair until removal | Composed restart case in `review/ad-hoc-manual-landing-observation.spec.ts` (first case) and explicit-store pin-retention case in `review/ad-hoc-manual-landing-revision-observation.spec.ts` (slice 4). |

Every replaced case keeps its assertions.

## Current decisions

- Follow the [Architectural North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support):
  reshape the production seam in `dashboard/server/`, add zero wrappers to
  `dashboard/test-support/` or `dashboard/backend-tests/support/`, and shrink
  `doneBranchObservation.ts`.
- **Typed decision (`observedSessionDeliveries.ts`).** Export
  `ObservedDelivery` (`{ record, result, pair }`), `decideObservedDeliveries(records, ref, revision, { checked, readTrunkHead, inspect })`,
  and `observedSessionDeliveries({ readTrunkHead, inspect })`. Cache
  `readTrunkHead` (defaulting to `readBranchTrunkRevision`) per
  `(result.repository, trunk.remote, trunk.target)` within one pass; catch a
  rejected trunk-head read or thrown `inspect` per record without marking its
  witness `checked`; mark `checked.add(witness)` only when `inspect` resolves
  to `undefined`. Keep `Map<string, ProjectObservation>` (`revision`,
  `checked`, and in-flight `pass` coalescing) in one place on
  `observedSessionDeliveries`, exposing both `observe(source, revision, records)`
  for composed-record callers and a pass runner that `sessionLandingObservations`
  uses so the in-flight `pass` covers reading `store.keptRecords`, deciding,
  and applying every delivery.
- **Store adapter (`observedSessionLandings.ts`).** Export
  `ObservedLandingStore` (`keptRecords` and `changeSessionRecord`) and let
  `sessionLandingObservations({ store, readTrunkHead, inspect } = {})` default
  `store` to `{ keptRecords, changeSessionRecord }` from
  `./launchRecordStore.ts`. Apply each `ObservedDelivery` inside
  `store.changeSessionRecord` after checking `launchedAt`, `branchPinOwner`,
  and `branchResultAtDone` (`doneAt`, `repository`, `base`, `revision`,
  `committedTip`), calling `keepManualLanding`, and on `catch` checking
  `sessionRecord(await store.keptRecords(source.id), record.session)?.landing?.delivery !== landing.delivery`
  before `releaseManualLanding(landing)`.
- **Pin queries across sibling order.** If
  `SEED-413#split-branch-entry-proposal-from-store` has already landed on
  trunk when execution starts, read branch and one-shot pins through its
  production queries in `launchRecordPins.ts` and `launchLandingGit.ts`;
  otherwise keep the existing `adHocBranchRefs.ts` pin readers.
- **File size.** Keep `observedSessionDeliveries.ts` and
  `observedSessionLandings.ts` (currently 160 lines) well under the 250-line
  [file-size check](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#file-size).

## Decisive premises

| Consuming operation | Observation |
| --- | --- |
| Existing manual-landing observation specs pass under the focused Vitest command (slices 1–4) | At `0c1aad867` on 2026-11-20 (`uptime` load 15.42, AC power), `caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:backend -- review/ad-hoc-manual-landing-observation review/ad-hoc-manual-landing-revision-observation` passed 6/6 cases across 4 files (summed 20.41 s, individual 2.09 s–4.87 s). |
| `readBranchTrunkRevision` and `inspectManualLanding` decide both hand-merged deliveries from composed Done `LaunchRecord`s and `storyReview` reads the composed landed result with an empty `HOME` and zero delivery pins (slices 1–2) | At `0c1aad867` on 2026-11-20 (`uptime` load 13.38), a scratch spec `zz-scratch-observed-deliveries.spec.ts` ran under the same Vitest command with `HOME` stubbed to an empty directory, composed two Done isolated-branch records (`manualDeliveryChecked: true`), merged and pushed both to `origin/main`, verified both `ManualLanding` pairs (`base -> firstMerge` and `firstMerge -> head`) with `landingPins === []`, and verified `storyReview` answered `kind: "landed"` with `second.txt` (1.37 s). Scratch deleted. |
| Pinning a composed branch result with `keepBranchResultRefs` preserves an uncommitted working-tree draft across `retireAdHocBranch` and offline `origin`, and adapter write-loss after `keepManualLanding` cleans up unkept one-shot pins without `HOME` (slices 3–4) | Same scratch run at `0c1aad867` (2.84 s). After `readBranchWorkspace` + `keepBranchResultRefs` and `retireAdHocBranch(..., { discardWorkingChanges: true })`, throwing after `keepManualLanding` and running the `sessionRecord` + `releaseManualLanding` `catch` cleared the 2 one-shot pins back to `[]`; keeping the delivery in an in-memory record array and pointing `origin` to `offline` answered both `"delivered"` and `"branch-result"` comparisons, file diffs, and file texts, and `withinRetention` + `releaseExpiredRecordPins` cleared all remaining pins. Scratch deleted. |
| `observedSessionLandings.ts` has no external callers of `captureObservedLandings` and only the four observation specs call `sessionLandingObservations` (slices 1 and 3) | Read-only search across the checkout at `0c1aad867` (`rg "captureObservedLandings|sessionLandingObservations|observeProjectRevision" dashboard`): `performedRead.ts` and `performedRevisionCheck.ts` import only `observeProjectRevision`; only the four `review/ad-hoc-manual-landing-*observation*.spec.ts` files import `sessionLandingObservations`. |

No other premise is left unobserved. Composed `LaunchRecord` branch-result
builders and composed-record `doneCaptureReview.ts` are supplied by the
recorded blocking dependency on `SEED-413#split-done-mark-decision-from-store`.

## Execution context

Story Branch Mode in the dashboard-established owned worktree
`/Users/terryyin/git/open-dough/.worktrees/observe-done-deliveries-over-typed-kept-records`
on `codex/observe-done-deliveries-over-typed-kept-records`. Default and
integration checkout `/Users/terryyin/git/open-dough`; authorized remote
`origin`, trunk `main`. Publisher `dashboard-territory.local-open-dough`,
agent Honoka-chan. Starting revision
`1946c3db2264257afb7d578591fe096d495ba250`; claim and previously published
base `e6cd3a3200b7a8b4f9a2092799efcdd5e6e81b5d`. The recorded Ready assessment
was marked Changed since readiness review. The selected story and plan still
align; production pin queries from the landed branch-entry sibling are available.
Existing planning authority applies.

Story-branch CI observes GitHub workflow `ci.yml` (CI), with coordinator
`honoka-observe-736-76f2889f` and yielded Codex cell `g61:13` (shell session
`22870`, PID `27702`, mailbox `/tmp/dough-ci-501/watch-jEMfCL`).


## Ordered slices

### 1. Decide observed deliveries from composed Done records and real Git

Type: Behavior
Status: done

Record the [evaluation baseline](#local-gates) at the execution base first.
Extract `decideObservedDeliveries` and `observedSessionDeliveries` into
`dashboard/server/observedSessionDeliveries.ts` and rewire
`dashboard/server/observedSessionLandings.ts` onto them without changing
`observeProjectRevision` or existing spec behavior. Add
`dashboard/backend-tests/review/observed-session-deliveries.spec.ts` proving,
from composed Done records with no kept store and no `HOME` stub, that two
Done branches merged by hand onto published trunk return each branch's exact
`ObservedDelivery` (`base -> firstMerge` and `firstMerge -> head`) with zero
one-shot pins written, and that records already holding `landing`, lacking a
current `branchResult` with `manualDeliveryChecked: true`, targeting another
ref, or matching `trunk.revision === revision` are skipped.

**Proof.** `observed-session-deliveries.spec.ts` and the four
`ad-hoc-manual-landing-*observation*.spec.ts` files pass. Scratch-inverting
the `manualDeliveryChecked` or `trunk.revision === revision` guard fails
`observed-session-deliveries.spec.ts`. `npm run typecheck:dashboard` and
`npm run lint` pass.

**Accepted proof.** The five focused specs selected 15 cases and all passed
with one worker. The exact-pair case composes two real hand-merged Done
branches and checks both comparisons and empty delivery pins. Eight cases
check eligibility at the authorized-head boundary. In a disposable checkout,
inverting the manual-delivery guard failed the exact-pair case and the guard's
head-read assertion. Dashboard typecheck passed. The reached authenticated
revision check, backlog, revision reuse, stream and shared listing cases
passed (53). The typed decision yields each discovery before the next
inspection, so the live adapter still applies deliveries in inspection order.

### 2. Prove witness skipping, newly-Done discovery, and inspection retry over composed records

Type: Behavior
Status: planned

Extend `observed-session-deliveries.spec.ts` to prove that an unmerged Done
branch is inspected once and skipped on a repeat check at the same revision,
rechecked when the observed revision advances, and left unchecked when
`readTrunkHead` answers `undefined`. Move the second case of
`ad-hoc-manual-landing-observation.spec.ts` ("an unchanged revision check
discovers delivery for a newly Done session") and
`ad-hoc-manual-landing-observation-retry.spec.ts` onto
`observedSessionDeliveries` and composed review, keeping the landed file
assertions (`newly-done.txt`, `independent.txt`, `retry.txt`) and removing
their `keptSession` imports, `markDone` calls, and offline-remote setup
workaround.

**Proof.** `observed-session-deliveries.spec.ts`,
`ad-hoc-manual-landing-observation.spec.ts`, and
`ad-hoc-manual-landing-observation-retry.spec.ts` pass. Scratch-recording
`checked.add(witness)` inside `catch` fails
`ad-hoc-manual-landing-observation-retry.spec.ts`. `npm run typecheck:dashboard`
and `npm run lint` pass.

### 3. Apply deliveries and prove deletion, expiry, and write-loss races over an explicit record store

Type: Behavior
Status: planned

Give `sessionLandingObservations` its explicit `ObservedLandingStore`
collaborator (`{ store, readTrunkHead, inspect }`, defaulting `store` to
`{ keptRecords, changeSessionRecord }`). Remove `keep` and `home` from
`twoDoneBranchesMergedByHand` in
`dashboard/backend-tests/support/doneBranchObservation.ts` so it builds
composed Done records over real Git with no machine home. Move
`ad-hoc-manual-landing-observation-lifecycle.spec.ts` onto
`sessionLandingObservations({ store, inspect })` over an explicit in-memory
record store (using production `withinRetention` and `releaseExpiredRecordPins`
for expiry). Move the pure `withinRetention` rule out of the machine record
document into `launchRecordRetention.ts`, where production readers and
writers and these cases can share it. Keep the survivor delivery and pin
assertions for deletion and expiry during a held inspection. Prove that a
store write failing after `keepManualLanding` releases unkept delivery pins
and that a change to the live launch time, pin owner, or Done branch result
prevents the adapter from saving the inspection's result. Remove
`HOME` stubs, `changeLaunchStore`, `deleteRecord`/`keptRecords`/`replaceRecords`,
and `installRecordRemovalDispatch` from the spec.

**Proof.** `ad-hoc-manual-landing-observation-lifecycle.spec.ts` and
`ad-hoc-manual-landing-observation-retry.spec.ts` pass with zero `HOME` stubs.
Scratch-omitting `releaseManualLanding` in `observedSessionLandings.ts` fails
the write-loss case, and scratch-omitting the live-record guard fails the
changed-record case. `npm run typecheck:dashboard` and `npm run lint` pass.

### 4. Move restart comparison survival and repeated-revision pin retention off the machine store and evaluate

Type: Behavior
Status: planned

Move the first case of `ad-hoc-manual-landing-observation.spec.ts` ("the first
observation after restart discovers a delivery while preserving the fixed
branch comparison") onto composed Done state (`keepBranchResultRefs` before
`retireAdHocBranch`, `observedSessionDeliveries`, and composed review/diff/text
with `origin` offline) and move
`ad-hoc-manual-landing-revision-observation.spec.ts` onto
`sessionLandingObservations({ store })` over an inline explicit
`ObservedLandingStore` holding a composed Done record (keeping its repeated
and advanced observation checks, `saved` landing identity, single one-shot pin
pair, and pin cleanup on removal via `releaseExpiredRecordPins`). Clean up
any stale description in `dashboard/backend-tests/README.md`, run the consumer
trace and reached suites, and record the ADR 0010 evaluation.

**Proof.** `observed-session-deliveries.spec.ts` and all four
`ad-hoc-manual-landing-*observation*.spec.ts` files pass with zero `HOME`
stubs and zero imports from `launchRecordStore.ts`, `launchRecordDocument.ts`,
`launchRecordRemoval.ts`, or `test-support/support/launchStore.ts`;
`doneBranchObservation.ts` contains no `keep` or `markDone` call. Run the
reached `observation/authenticated-read-revision-*` readers and the backend
family gate (`backend-tests/review backend-tests/launches backend-tests/sessions`),
`npm run typecheck:dashboard`, and `npm run lint`. Record the ADR 0010
comparison under [Local gates](#local-gates).

## Local gates

- Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Apply [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) before editing
  tests or builders. Keep default test timeouts and never use `test.slow()`.
- On AC power, run checks under `caffeinate -s -i`, as
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  describes, with `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`.
  Each slice runs `npm run --silent test:dashboard:backend -- <its specs>`,
  `npm run typecheck:dashboard`, and `npm run lint`. Slice 4 runs the
  installed [consumer trace](../../../.agents/skills/dough-execute-plan/scripts/consumer-trace.mjs)
  from the execution base (`--term sessionLandingObservations --term observeProjectRevision --term decideObservedDeliveries --term observedSessionDeliveries --term twoDoneBranchesMergedByHand --term observedTrunk`),
  runs reached `observation/authenticated-read-revision-check.spec.ts` and
  `observation/authenticated-read-revision-backlog.spec.ts`, and runs
  `npm run --silent test:dashboard:backend -- backend-tests/review backend-tests/launches backend-tests/sessions`.
- Evaluate under
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Before slice 1 at the execution base, and after slice 4 on the final
  candidate, record across the observation specs and `doneBranchObservation.ts`:
  `doneCaptureCase.ts` imports and calls, store-module imports
  (`launchRecordStore.ts`, `launchRecordDocument.ts`,
  `launchRecordRemoval.ts`, `launchStore.ts`), `doneBranchObservation.ts`
  imports, `HOME` stubs (`keep`), and summed and median per-case time over
  three interleaved runs at comparable `uptime` load. Every assertion is
  preserved.

### Execution-base evaluation

At `e6cd3a320` on this AC-powered 16-core macOS host (48 GiB, 45% memory
free before the run), the six existing observation cases passed each of
three one-worker trials. One preceding default two-worker run at load 18.12
timed out in the restart case (5,020 ms); its focused store-backed setup is
replaced in slice 4. Retain the default case timeout. Use one worker in
paired measurements to reduce contention and use the same commands and test
selection on each side.

| Trial | One-minute load | Sum | Median per case |
| --- | ---: | ---: | ---: |
| 1 | 19.66 | 10.195 s | 1.757 s |
| 2 | 19.29 | 11.518 s | 2.017 s |
| 3 | 16.47 | 10.428 s | 1.580 s |

Across the four specs and helper: five `doneCaptureCase.ts` imports, seven
direct store-module imports, four `doneBranchObservation.ts` imports.
Machine-home setup comes from four call sites reaching `keep` (two direct
and two through `anIsolatedBranch`) and four direct `markDone` calls. The
baseline records in the checkout's Git evidence directory retain the case
times and exact selection. Expand the final check to all new cases and
compare the original six separately for timing.

## Plan review

Slice-plan refinement was not needed. The four slices separate the typed
decision, the process-lifetime witness/retry rules, the explicit-store adapter
races, and the remaining restart and repeated-revision pin retention along
single behavioral responsibilities, with `twoDoneBranchesMergedByHand`
dropping `keep`/`home` in slice 3 alongside its last store caller. This review
found no remaining slice-specific concern.
