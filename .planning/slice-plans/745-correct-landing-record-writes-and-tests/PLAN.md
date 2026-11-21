# Keep kept records intact through landings and prove it at the landing adapter

**Identity:** SEED-413#correct-landing-record-writes-and-tests
**Source:** [Keep kept records intact through landings and prove it at the landing adapter](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#correct-landing-record-writes-and-tests)

## Correction input

- **Provenance.** Critical review of
  SEED-413#decide-landings-over-typed-attempts-and-records, landed at
  `4a5ceb24a`; its plan 738 is recoverable at
  `086faa5a2:.planning/slice-plans/738-decide-landings-over-typed-attempts-and-records/PLAN.md`.
  The seed section holds the review evidence, scope, key examples and
  acceptance; this plan does not restate them.
- **Preserved product behavior.** Landing receipts, states
  (`prepared`, `recorded`, `pending-native-session`), refusals and their
  statuses, pins and follow-up registration, retained-landing reuse, the
  write-ahead attempt order and the shared lock order (attempt lock, then
  record lock). Branch entry keeps its proposal, pins and refusals.
- **Boundaries.** Plan
  [742](../742-prove-ad-hoc-review-handoffs/PLAN.md) (Taken) slice 4
  extracts the branch-entry command's typed admission and handler. Plan
  [743](../743-restore-done-capture-proof-after-composed-reviews/PLAN.md)
  (Taken at `44d066285`) slice 4 narrows the publisher cases and leaves
  this story the composed-store fixture and the deletion fix. Plan
  [736](https://github.com/terryyin/open-dough/blob/24864be6360f87cc9fec3dc4333de5361de165eb/.planning/slice-plans/736-observe-done-deliveries-over-typed-records/PLAN.md) owns
  observation fixtures. Recheck each one's landed form before editing a
  shared file.

## Current decisions

- **Record changes, not snapshots.** `decideLanding` answers a change over
  the source's kept records (for example `(records) => records`, touching
  only the record bound to the reference) instead of `nextRecords`. The
  adapter applies it inside `stores.replaceRecords` to that write's own
  `kept[source]`, so creation records, retention and changes made since
  the decision survive and no session leaves as `removed`. Delete
  `persistSourceRecords`. No change answers no record write.
- **Branch handoff save.** The save, through `changeSessionRecord`, rechecks
  the current record (same `launchedAt`, no `doneAt`, no
  `landingReporting`, same `branchEntry`) and merges only
  `landingReporting` into it. The handoff answers `landingContext` only
  when that save kept it. Prove it at the typed branch-entry handler: reuse
  742's extracted entry when landed; otherwise extract only the typed
  handler (request, origin, collaborator for the context answer) behind
  the unchanged route, leaving 742 its admission and command proof.
- **Done through production.** `setRecordDoneAt` and its Done capture write
  take an optional typed record-store collaborator
  (`keptRecords`, `replaceRecords`), defaulting to the machine stores as
  `handleLanding` does. Composed cases pass their composed stores, and
  `composedLandingStores.markDone` is deleted.
- **Composed stores follow the record store.** The composed
  `replaceRecords` hands `change` the document after the production
  retention step and keeps non-session records; `keptRecords` keeps only
  retained session records. Reuse the production pure step (extract it
  from `replaceRecords` in `launchRecordDocument.ts` if needed) rather than
  copying its rules.
- **Decision input.** `decideLanding` and `decideAttemptLanding` take one
  typed input (`report`, `origin`, `operation`, `attempts`, `records`,
  `receiptId`, `receivedAt`). The retained path's expiry compares with
  `receivedAt`, not `Date.now()`. Remove the `decideAttemptLanding`
  re-export, `LandingDecision.path`, and `handleLanding`'s own retained
  lookup (the decision already knows whether it is retained).
- **Admission order.** `submitLanding` keeps `verifyLocalOrigin` as the
  origin rule and checks route and method before reading the body, so a
  GET answers 405 before the 415 content-type check. The shared
  `admitLandingRequest` used by the installed publisher bridge accepts
  what `verifyLocalOrigin` accepts, including `Sec-Fetch-Site:
  same-origin` without `Origin`.
- Follows [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
  the [North Star on directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Decisive premises

Observed on 2026-11-21 SGT at `5c5726d94` by reading the preparation
worktree; `git log 4a5ceb24a..HEAD -- dashboard/server dashboard/backend-tests/support`
lists no commit, so the reviewer's scratch run at `4a5ceb24a` still applies.

| Consuming operation | Result |
| --- | --- |
| Creation record lost on `prepare` (slice 1) | Retained: the review's scratch case with a declared landing and an unresolved creation record ended with one record after one `prepare`. Code agrees: `keptRecords` filters `"session" in entry` and retention, and `persistSourceRecords` replaces `[source]` with that list. |
| Concurrent change lost on the attempt path (slice 1) | Not reproduced; code read: `nextRecords` is built inside `replaceAttempts` from that moment's `keptRecords`, then written later under `withKeptAttempts`. Not decisive: the change-based write is required by the first row regardless. The slice's case changes the composed record document between deciding and saving and must fail before the fix. |
| Branch handoff clears Done and misreports context (slice 2) | Code read: `acceptBranchLandingAnswer` returns `answered`, built from the pre-entry record, whenever `launchedAt` matches and the current has no `landingReporting`; `submitSessionBranchEntry` sets `landingContext` whenever `answered` exists. The case must fail before the fix. |
| Done in composed cases through production (slice 3) | Code read: `setRecordDoneAt` reaches the machine store through `keptSession`, `changeSessionRecord` and `keptWithDoneCapture` (`doneCapture.ts` `replaceRecords`). Four specs call `stores.markDone`: `declared-blank-launch-publication`, `declared-worktree-publication`, `ad-hoc-session-comparisons`, `ad-hoc-prepared-landing-done`. |
| Admission drift (slice 5) | Code read: `submitLanding` calls `textBody` (415 on non-JSON) before `admitLandingRequest` checks the method, and `admitLandingRequest` calls `verifySameOrigin`, which refuses a missing `Origin` that `verifyLocalOrigin` admits through `Sec-Fetch-Site: same-origin`. `git show 89ac5ce79` shows the prior order: method 405, then the JSON body. |

Rows 3 and 5 read the consuming code itself: `acceptBranchLandingAnswer`
is a pure eight-line function and the admission order is sequential calls in
`submitLanding`, so no unobserved transformation lies between the read and
the outcome; each slice's case still fails before its fix. The affected
specs passed in hosted CI at `8ecbf43ae` (2026-11-20 23:44 UTC, success),
whose `dashboard/server` and `dashboard/backend-tests/support` match this
revision. Run the affected cohort locally before slice 1 as the timing
baseline.

## Plan review

Slice-plan refinement was not needed: each slice owns one write fix, one
production collaborator change, or one test-suite weakness with its own
proof loop, and none prepares beyond its own proof. This review found no
remaining slice-specific planning concern.

## Ordered slices

### 1. A landing changes only the record it binds

Type: Behavior
Status: planned

Pre-condition: composed stores keep a project's declared-landing launch, an
unresolved creation record and another session. Trigger: `handleLanding`
prepares and then records, on both the retained and attempt paths, with a
second session marked Done between deciding and saving. Postcondition:
only the bound record gains its preparation or landing; the creation record
and the concurrent Done stay; nothing leaves as `removed`.

Composed stores first gain the record-store semantics from Current
decisions, so these cases observe what the machine store would keep.

**Proof.** Persistence cases at `handleLanding` with composed stores fail
when the adapter writes the decision's snapshot (scratch revert). Rerun the
existing landing and publisher specs that read the stores.

### 2. A branch handoff keeps a concurrent Done and reports only what it saved

Type: Behavior
Status: planned

Pre-condition: a kept Default main launch with a branch entry and a
storyless-capable installed landing module, arranged as
`aDeclaredPublisherBranch` (`backend-tests/support/declaredPublisherBranch.ts`)
already arranges it for `branchLandingContext`. Trigger: the typed branch
handoff, with the session marked Done (through `setRecordDoneAt`) while its
context is written. Postcondition: the record keeps `doneAt`, has no
`landingReporting`, and the answer has no `landingContext`; without the
concurrent Done the record gains `landingReporting` and the answer names
the saved file.

**Proof.** Both cases at the typed branch-entry handler under the stubbed
machine HOME; the concurrent case fails when the save returns `answered`
(scratch revert). Rerun `ad-hoc-session-branch-entry`.

### 3. Composed cases mark Done through the production Done write

Type: Structure
Status: planned

Give `setRecordDoneAt` and its Done capture write the optional record-store
collaborator, pass composed stores in the four specs, and delete
`composedLandingStores.markDone`. Enables the backend-test-support rule that
no support writes Done.

**Proof.** The four specs pass unchanged in their assertions;
`rg "doneAt" dashboard/backend-tests/support` shows no Done write; the Done
specs that use the machine default (`sessions/agent-launch-done*`,
`review/done-kept-*`) still pass.

### 4. Decide landings over one typed input and its own clock

Type: Structure
Status: planned

Apply the decision-input decision: typed input, `receivedAt` for expiry,
no re-export, no `path`, no duplicate retained lookup in `handleLanding`.

**Proof.** Landing decision, retained, publisher and Done-landing specs pass;
a retained expiry case decides by `receivedAt` (a `receivedAt` past the
window refuses or expires as `Date.now()` did) without faking time.

### 5. Landing admission agrees with the local origin rule and its order

Type: Behavior
Status: planned

Pre-condition: a landing request on a loopback host. Trigger: a same-origin
request with `Sec-Fetch-Site: same-origin` and no `Origin`; a GET with a
non-JSON content type. Postcondition: the first is admitted; the second
answers 405.

**Proof.** Admission cases in `landingRequestAdmission.spec.ts` as one
`test.each` table of refusals plus the admitted case; each fails against
the current order or origin rule.

### 6. Decision specs keep refusals as tables over MakeMe data

Type: Structure
Status: planned

Removes the decision specs' private data helpers: `attemptLandingDecisionCase.ts`
helpers become MakeMe steps or named examples, with one declared-landing
example replacing `aDeclaredRecord` and `aComposedDeclaredLanding`.
Decision specs keep only refusals, through `decideLanding`, as `test.each`
tables; persistence and success outcomes live in slice 1's adapter cases.
Drop assertions that restate inputs.

**Proof.** Every refusal status and message the old specs checked maps to a
row; `launchLandingDecision.spec.ts` and `retainedLandingDecision.spec.ts`
import nothing from support beyond MakeMe; the case count and run time do
not grow (ADR 0010).

### 7. Record deletion acts on the record that holds the landing

Type: Structure
Status: planned

In `declared-blank-launch-publication`, delete the record the composed
stores hold (the one with the landing) rather than the machine store's,
so pin release is observed on the owning record.

**Proof.** The case fails when deletion leaves pins held; the publisher
specs pass.

## Proof map

| Promise (seed acceptance) | Owner |
| --- | --- |
| A landing keeps creation records and concurrent changes; reverting the fix fails | Slice 1 |
| A branch handoff keeps concurrent changes and answers context only when saved; reverting the fix fails | Slice 2 |
| No backend-test support writes Done | Slice 3 |
| Typed decision input, `receivedAt` clock, retired re-export, `path`, duplicate lookup | Slice 4 |
| Admission accepts what `verifyLocalOrigin` accepts; 405 before 415 | Slice 5 |
| Decision specs import no data helper beyond MakeMe; refusals as tables | Slice 6 |
| Deletion acts on the landing record | Slice 7 |

## Local gates

- Before slice 1, install with the pinned Node (`.node-version`) and record
  the affected cohort's baseline: `server/launchLandingDecision`,
  `server/retainedLandingDecision`, `server/landingRequestAdmission`,
  `review/ad-hoc-prepared-landing-done`, `review/ad-hoc-session-comparisons`,
  `review/ad-hoc-session-branch-entry`, `launches/declared-blank-launch-publication`,
  `launches/declared-worktree-publication`.
- Local gate on AC power under `caffeinate -s -i`, per
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Run `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:backend -- <affected specs>`,
  then Dashboard typecheck and lint sequentially. Keep default timeouts and
  never use `test.slow()`. Apply [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md)
  and the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  to every failure. Run the consumer trace for changed boundaries
  (`decideLanding`, `LandingDecision`, `setRecordDoneAt`,
  `acceptBranchLandingAnswer`, `admitLandingRequest`, composed stores).
