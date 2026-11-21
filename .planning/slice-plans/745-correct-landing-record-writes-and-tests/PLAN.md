# Keep kept records intact through landings and prove it at the landing adapter

**Identity:** SEED-413#correct-landing-record-writes-and-tests
**Source:** [Keep kept records intact through landings and prove it at the landing adapter](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#correct-landing-record-writes-and-tests)
**Source review:** [Independent promises](source-review.md)

## Execution context

- Accepted Story Branch claim: `7ed7478c86f2adcad65c14f8cb6aeaab0d13e3cc`
  on `origin/main` and the published execution branch
  `codex/keep-kept-records-intact-through-landings-and-pr`. Starting revision
  `f7190a3b1e077ab8de9f6ed943120ec45d129c1a`. Publisher:
  `dashboard-territory.local-open-dough`, agent Yui-chan.
- Owned execution checkout is the established
  `.worktrees/keep-kept-records-intact-through-landings-and-pr` worktree.
  The integration checkout is the repository's default worktree.
  Locked install and Dashboard typecheck passed with Node 24.21.0.
- Codex observer for the execution branch: GitHub `ci.yml` (CI), coordinator
  `yui-745`, directory `/tmp/dough-ci-501/watch-P95x26`, PID 69075, yielded
  cell `g72:18`, session `72505`. The initial claim's trunk CI is unobserved.
- Keep the planning authority of the accepted plan. No override of overrun
  replanning was requested.
- Slice 1 accepted on the Story Branch at
  `e4554c51f7d03ca34bc1f89270ead1244c71b5dd`, attached to the same observer.
- Slice 2 accepted on the same branch and observer at
  `a58d03eacfcce654007a9c7e9467918c411eb186`.
- Slice 3 accepted on the same branch and observer at
  `e1f8d3b1e9afa62d97fcfedeb1bb49208b3f5d7f`.
- Slice 4 accepted on the same branch and observer at
  `8b5ac52fa8adbd320a5a3ea88995e3ffe5378075`.
- GitHub canceled the superseded slice 2 push run `44848314743/1`
  after the slice 3 push had scheduled run `44849901905` on the same
  branch. The workflow cancels in-progress runs on superseding pushes
  to the same ref.

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
revision.

At `7ed7478c8`, the eight-spec baseline had 23 passing cases and three
default-timeout failures with the runner's two local workers:
`declared-blank-launch-publication`, `declared-worktree-publication` and
`ad-hoc-session-comparisons`. All 26 passed at the same default timeout with
`--workers=1` (21.46 s total). The respective publisher and mixed Review
case durations were 2.45 s, 3.17 s and 3.15 s under that selection. Plan 743
slice 4 owns the publisher and mixed-case proof reductions and the
worktree/mixed default-timeout repair. Use the one-worker cohort for local
comparison; the serial pass supplies a controlled baseline and leaves the
default-load failures attributed separately. The two decision specs ran 12
cases in about 1.09 s of case time combined. The checkout's Git evidence
directory retains `baseline-default.json` and `baseline-serial.txt`.

## Plan review

Slice-plan refinement was not needed: each slice owns one write fix, one
production collaborator change, or one test-suite weakness with its own
proof loop, and none prepares beyond its own proof. This review found no
remaining slice-specific planning concern.

## Ordered slices

### 1. A landing changes only the record it binds

Type: Behavior
Status: done

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

**Observed.** Both adapter cases failed before the write fix with the
production-retention fixture in place. Prepare dropped the creation and record
overwrote the intervening Done and newly added session. With the fix, the
retained and attempt paths preserved the exact kept documents. Exact retries
performed no record write. Interleaved preparations kept both deliveries,
and a replaced launch kept its record untouched.

The serial nine-spec cohort passed 30 cases, the expanded machine
landing/recovery/history/follow-up checks passed, and the eight selected
Chromium specs passed 11 cases without retries. The early one-shot case now
asserts a pending-native-session receipt and an unconsumed record EIO marker.
The browser recovery case still observes a real bound-record EIO, reporting
retry, and the exact landed comparison. Literal commands, assertions, trace,
and logs are in `slice-1-report.md` beside the runs in the worktree Git
evidence directory.

### 2. A branch handoff keeps a concurrent Done and reports only what it saved

Type: Behavior
Status: done

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

**Observed.** Before the guarded save, three interleaved cases lost a
newer stop explanation, cleared a real Done mark, or overwrote a changed
branch entry. With the fix, all four typed cases passed, including the
successful default save whose returned path matches the persisted file.
Four existing branch-entry cases and the installed handoff command passed.
Plan 742 had not landed, so the route delegates to the minimal typed handler
and retains its admission and command proof.

The expanded run hit the existing timeout in both declared publisher
specs and the mixed comparison spec on the loaded local host. The direct
handler and command results were strict passes. The three existing cases
are covered by plan 743's publisher and mixed-review proof reduction
(`c16c24200` on its active branch). The outstanding gate is coordination
with that owner and rechecking the final integrated proof. See
`slice-2-report.md` and its named proof files in the worktree Git evidence.

### 3. Composed cases mark Done through the production Done write

Type: Structure
Status: done

Give `setRecordDoneAt` and its Done capture write the optional record-store
collaborator, pass composed stores in the four specs, and delete
`composedLandingStores.markDone`. Enables the backend-test-support rule that
no support writes Done.

**Proof.** The four specs pass unchanged in their assertions;
`rg "doneAt" dashboard/backend-tests/support` shows no Done write; the Done
specs that use the machine default (`sessions/agent-launch-done*`,
`review/done-kept-*`) still pass.

**Observed.** The four composed cases passed on their initial serial run
using the production Done write, with existing assertions preserved. The
landing adapter race now calls the same production write on its composed
store and passed all four adapter cases. The selected machine-default Done
and kept Review families passed, as did six Chromium cases. The capture
reads and writes the same collaborator as the initial Done transition.

The composed helper is gone. The two remaining direct Done writes in
`doneCaptureReview.ts` are removed by active plan 743's `00870a500`;
the full support scan must be confirmed after integration. The expanded or
later grouped runs hit the mixed comparison timeout under plan 743
(`c16c24200`) and the manual observation deletion timeout under plan 736
(`1bb48cd6f`). Both remain with their active owners. See
`slice-3-report.md` in the worktree Git evidence for the exact proof
selections, terminal results and separate timeout evidence.

### 4. Decide landings over one typed input and its own clock

Type: Structure
Status: done

Apply the decision-input decision: typed input, `receivedAt` for expiry,
no re-export, no `path`, no duplicate retained lookup in `handleLanding`.

**Proof.** Landing decision, retained, publisher and Done-landing specs pass;
a retained expiry case decides by `receivedAt` (a `receivedAt` past the
window refuses or expires as `Date.now()` did) without faking time.

**Observed.** The adapter delegates retained lookup to the decision and uses
an optional attempt update in place of `path`. A result that becomes retained
between the two attempt-lock acquisitions saves under the lock in which it
was decided. The two stable paths were exercised and the between-lock
transition was inspected in the handler.

The fixed receipt-time case returned the intended 404. Restoring `Date.now()`
for that case returned a comparison 409, which the assertion rejected.
Keep this refusal when moving the decisions into tables. The serial cohort
passed 24 cases in 11 files without retries, including the publisher and
mixed cases and the native retained route. See `slice-4-report.md` in the
worktree Git evidence.

### 5. Landing admission agrees with the local origin rule and its order

Type: Behavior
Status: done

Pre-condition: a landing request on a loopback host. Trigger: a same-origin
request with `Sec-Fetch-Site: same-origin` and no `Origin`; a GET with a
non-JSON content type. Postcondition: the first is admitted; the second
answers 405.

**Proof.** Admission cases in `landingRequestAdmission.spec.ts` as one
`test.each` table of refusals plus the admitted case; each fails against
the current order or origin rule.

**Observed.** The old path rejected a metadata-only same-origin prepare
with 403 and returned 415 before the method and route refusals. The revised
admission table passed all ten cases. The two backend selections passed
86 cases, and two Chromium cases exercised installed publication and
reporting-only retry through the live route. Dashboard typecheck passed.
See `slice-5-report.md` in the worktree Git evidence.

Plan 736 landed at `0747fb0a2`, with its plan-link update at `434d4262f`
absorbed through source freshness. The landed observation code shares
`withinRetention` via `launchRecordRetention.ts`. Carry its exact module
and retention imports forward so the landing document and composed reader
share that predicate. The reconciling delta leaves the landed observation
fixture's work on trunk. Rechecked the persistence and admission specs and
four machine aged-out/removed history cases, 18 strict passes in
`slice-5-retention-reconciled.json`.

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
