# Prove retained landing capture in Node Vitest

**Source:** [Prove retained landing capture in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#landing-capture-evidence-via-vitest)

**Identity:** SEED-413#landing-capture-evidence-via-vitest

## Goal and scope

Give Dashboard developers fast proof that origin's first accepted comparison
stays bound to the launch that published it. Account for the 18 cases in the
12 legacy backend specs below. Move Dashboard unit proof to Node Vitest and
keep actual publisher, Git, receiver, or native behavior at its workflow
boundary when that interaction is what the case proves. Keep the existing
capture, completion, and retention rules. Published Review comparisons and
selection belong to [plan 863](https://github.com/terryyin/open-dough/blob/cc7802ace20bd4475751c5e75713d983290607e5/.planning/slice-plans/863-prove-published-review-comparisons-on-vitest/PLAN.md), completed.
The [runner cutover](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#retire-legacy-dashboard-backend-runner)
already waits for this family's published disposition.

## Current decisions

- [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
  and [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  guide the proof boundaries. Origin accepts the candidate. Dashboard uses its
  machine-local attempt and launch records to retain evidence of that acceptance.
  Installed workflow checks observe actual origin and receiver behavior across
  those boundaries. Dashboard cases use the highest typed operation that can
  produce the assertion with its real collaborators.
- Follow the North Star's [direct production seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Reuse `submitLanding` for wire behavior, `handleLanding` and its `LandingStores`
  for typed landing writes, `bindRecord` and attempt settlement for native
  binding, and `deleteRecord` for pin cleanup. Compose the launch, submission,
  and authority with selected MakeMe builders. Use isolated stores, clocks and
  small bare origins to prove retention, ref updates and deletion. Use the
  installed publisher and resume commands when their argument, Git or receiver
  handoff matters. Introduce no request or server wrappers in test support.
- The same launch reference and prepared delivery identify the pair through
  prepare, remote acceptance and retry. A launch still waiting for native
  identity reserves evidence on its attempt. A settled record keeps the same
  evidence after normal attempt expiry. Deletion makes that authority unusable
  before releasing pins. Story Branch integration differs in how it computes
  the comparison, from the fetched trunk head to the accepted integration.
  It uses the same capture and retry path. Preserve the production owners of
  these rules throughout the sequence.
- Reuse the claimed branch and installed Git setup in `storyBranchIntegration`.
  One-shot and completion recovery helpers have E2E callers. Trace each support
  deletion. Review, Intent and CI readers are outside this test-only migration.

## Premises and baseline

Observed at `887a564e579c` on 28 November 2026, in this preparation checkout
with Node 24.21.0, macOS on AC, and one worker. Initial one-minute load was
7.39. All 18 backend Chromium cases passed on the first attempt and zero Node
cases were selected. The 18 durations totaled 60.680 s, median 3.2895 s, range
1.004–8.192 s. Wall time was 64.91 s. Per-case times in seconds follow the
legacy cases below in source order. The typed and E2E observations are
companion baselines. Compare the replacement with the corresponding owned
observations, including any moved process cost.

```sh
proof_dir=$(mktemp -d "${TMPDIR:-/tmp}/dough-864.XXXXXX")
OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$proof_dir/legacy.json" \
OPEN_DOUGH_DASHBOARD_BACKEND_TIMES="$proof_dir/legacy-times.txt" \
/usr/bin/time -p caffeinate -s -i npm run test:dashboard:backend -- \
  dashboard/backend-tests/review/one-shot-landing \
  dashboard/backend-tests/review/story-branch-landing \
  dashboard/backend-tests/review/story-branch-retained-landing --workers=1
```

| Consuming operation and observed profile | Result and planning consequence |
| --- | --- |
| Maintained legacy command above with an isolated installed fixture, local bare origin and launch stores | All 18 passed, including rejection before remote acceptance, actual pin retention after GC, recovery after expiry and deletion, implicit branch context, conflict/restart/rejection, later publication and native continuation. Each receiving proof below keeps its independent observations from this baseline. |
| `caffeinate -s -i npm run test:dashboard:backend -- 'server/(landingRecordPersistence\|landingPinRecovery\|landingRequestAdmission\|launchLandingDecision\|retainedLandingDecision)\.spec\.ts$' 'launches/(retained-landing-after-expiry\|story-bound-landing-capture)\.spec\.ts$' --workers=1` | 40 Node, zero Chromium, no retries, 8.543 s summed and 19.22 s wall. The real handler persisted the pair against a matching origin, refused a lookalike target, restored pins before recording, preserved other writes, and replayed the prepared pair after a real launch settled and its attempt expired. The typed launch start passed story/host/remote handoff. The retained and attempt decisions passed their refusal tables. |
| `caffeinate -s -i npm run test:e2e -- e2e/review/one-shot-landing-recovery.spec.ts e2e/launches/agent-launch-start-session-landing-context.spec.ts --workers=1` | Both Chromium cases passed first try, 12.333 s and 8.337 s, 31.10 s wall. The former observed the original pair after actual lost push, lost write, retirement and response loss, including a later completion and other launch. The latter observed first input and installed publisher capture from the admitted Start worktree. Neither covers capture arriving before native binding or Story Branch continuation. |
| `caffeinate -s -i npm run test:e2e -- e2e/review/one-shot-landing-capture.spec.ts e2e/review/one-shot-landing-capture-cli.spec.ts e2e/review/story-branch-landing-context.spec.ts e2e/review/story-branch-landing-capture.spec.ts e2e/review/story-branch-landing-later-publication.spec.ts e2e/review/story-branch-landing-recovery.spec.ts e2e/review/story-branch-retained-landing.spec.ts --workers=1` | Disposable copies changed relative imports and renamed the conflict spec to `story-branch-landing-recovery`. All 12 cases passed first try through installed commands, real Git, and the branch's native continuation (35.926 s summed, 38.08 s wall). Removed all copies. This settles the receiving runner and fixtures for slices 1 and 6–8. |
| `caffeinate -s -i node --test --test-concurrency=1 Distribution/tests/skills/dough-execute-plan/{dashboard-landing,history-preserving-landing-expectation,publication-landing-target,resolve-publication-landing-context,execution-increment-managed-delivery-resume}.test.mjs Distribution/tests/skills/dough-land/session-record-publication.test.mjs` | 29 passed in 24.46 s wall. The installed publisher retained before push, resolved the implicit context only on the matching target, cleared it after capture, skipped capture on later publication, and sealed one session record under the accepted launch reference. Retained E2E assertions still own the persisted Dashboard pair and native handoff. |
| `caffeinate -s -i npm run test:dashboard:backend -- 'launches/retained-landing-after-expiry\.spec\.ts$' --grep 'records and replays' --workers=1` | Omitting `retainLandingSettlement(saved)` in `launchAttemptStore.ts` failed on the missing `landingReporting.settledAt` after normal launch settlement. Restored the call and the same focused case passed through prepare, expiry, record and replay. |

## Ordered slices

### 1. Retain the first one-shot comparison through installed publication

Type: Behavior
Status: planned

Behavior: The installed publisher has a launch context for a refinement or
execution and a candidate. Deliver and resume keep the prepared pair and
receipt with that launch after worktree removal. The pair remains readable
after GC and publication does not complete the launch or start an extra observer.

Proof: `one-shot-landing-capture-cli` (1.525) and `one-shot-landing-capture`
(refinement 1.625, execution 1.918), all in `dashboard/backend-tests/review/`
with `.spec.ts` suffix as for every legacy name below. Move the installed CLI
flag and zero-extra-push/observer assertion to
`e2e/review/one-shot-landing-capture-cli.spec.ts`. Move the real retirement/GC
cases to `e2e/review/one-shot-landing-capture.spec.ts`, preserving the two
workflow admissions, before-push retained submission, checkout and original
start receipt, separate completion, pins, exact diff and replay. Reuse the
existing installed launch support. The existing recovery E2E owns real write
and response loss, and the typed `landingPinRecovery` owns repair-before-record.

### 2. Admit only the authorized prepared comparison

Type: Behavior
Status: planned

Behavior: A prepare or record reaches the landing receiver. It requires the
launch reference and authorized host, origin, story and Git comparison. It
rejects a caller-selected repository and invalid commit objects. A record
requires preparation and remote acceptance. Conflicting replay keeps the
record, preparations, refs and checkout intact.

Proof: Admission part of `one-shot-landing-capture-admission` (3.232) and the
preparation refusal from `story-branch-landing-capture` (slice 6). Reuse
`landingRequestAdmission`, `launchLandingDecision`, `retainedLandingDecision`,
`landingPinRecovery` and `story-bound-landing-capture`. Extend the typed
handler's real Git contrast for candidate not at `HEAD`, non-commit object,
unknown reference, omitted required story and unaccepted comparison where
existing assertions lack that contrast. Exercise a well-formed distinct
post-acceptance pair rather than relying on the old malformed changed replay
to establish immutability. Use the wire parser for the extra `repository`
field and match the legacy persistence/ref non-effects. Keep the shared legacy
admission/deletion case until slice 5 owns the remaining deletion proof.

### 3. Bind a pending capture to the original native session

Type: Behavior
Status: planned

Behavior: A prepared and accepted pair arrives before native identity. The
attempt reports pending; binding imports that same pair and accumulated
reporting evidence. On retry the receipt stabilizes, with completion kept
independent. An older replay leaves newer completion and other launches intact.
An older install without capture still emits the gap and accepts completion.

Proof: `one-shot-landing-capture-binding` (1.308, 1.004) and
`one-shot-landing-recovery-binding` (2.044). Compose a pending accepted attempt
with its authority, original reference and real candidate. Produce the pending
receipt through `handleLanding`, bind through `bindRecord`, replay the exact
submission, and assert receipt, authority/settlement and both stores before
and after real binding. Preserve the older-install instruction and report
contrast through the typed start/reporting operations and installed reporting
fixture already used by the legacy check. Use `e2e/review/one-shot-landing-recovery.spec.ts`
for actual lost reply and stale/newer writers. Keep the pending retry contrast
in Node because the E2E begins with an already-bound launch.

### 4. Capture from a kept launch after its startup attempt expires

Type: Behavior
Status: planned

Behavior: A settled launch has an original prepared pair. After normal attempt
expiry the kept authority records and replays it. Premature missing or unreadable
attempt data, expired retained records and an unrelated attempt leave the store
unchanged and refuse as applicable.

Proof: `one-shot-landing-recovery-retention` (6.891). Extend
`launches/retained-landing-after-expiry.spec.ts` and the retained decision cases
for missing/unreadable data inside the attempt lifetime, wrong source/identity,
changed workflow, and real record pruning. Use settlement and `handleLanding`
over the actual stored attempts, completion, and refs. Preserve the original
receipt across stale `updateRecord` and native-session replacement, with refusal
of late binding. Keep the expired retry read-only and verify subsequent pruning
and no recreation. Slice 1 keeps real retirement and slice 3 keeps transport replay.

### 5. Refuse a deleted launch while its pins are being removed

Type: Behavior
Status: planned

Behavior: Deletion after attempt expiry keeps the tombstone and repository if
pin cleanup fails. A late capture stays refused. Retrying deletion removes
only the deleted launch and its pins, even with a later launch still present.

Proof: `one-shot-landing-recovery-deletion` (4.189) and deletion part of
`one-shot-landing-capture-admission`. Use `deleteRecord` and `handleLanding`
with real refs and machine records, expire the original attempt, induce the
real ref-update failure on the original repository, and check refusal before
and after retry, exact other receipt/pins and absent record. Verify stale
update and bind cannot remove deletion intent or recreate the record. Retire
the shared admission spec when slice 2's contrasts and these are green.

### 6. Keep the first accepted Story Branch comparison

Type: Behavior
Status: planned

Behavior: A claimed launch carries its context into the first authorized trunk
integration. The fetched trunk tip and actual merge or fast-forward form its
permanent pair, including when the publisher finds the context implicitly.
Replaying the first accepted integration returns the same receipt. A later
repair publishes without recording a new pair.

Proof: `story-branch-landing-context` (1.665), normal merge and fast-forward
of `story-branch-landing-capture` (5.434, 2.833), and
`story-branch-landing-later-publication` (4.062). Use
the same filenames under `e2e/review/` for the installed route. Keep exact Git
parents and pins, unchanged branch, receipt contrasts, sidecar clear, and no
completion. Keep the launch message, sidecar bindings and unchanged context
bytes. The Distribution history-preserving check proves the implicit protocol.
The E2E keeps the Dashboard pair assertion across later publication. Move the
capture file intact, including slice 7's reporting retry case.

### 7. Recover a conflicted or unacknowledged Story Branch landing

Type: Behavior
Status: planned

Behavior: Story Branch integration encounters conflict, a newer target or a
lost push response. A resumed integration keeps the resolved merge and records
only the pair that trunk accepted. If the receiver is unavailable after
acceptance, the printed retry records that pair without pushing it again.

Proof: `story-branch-landing-conflict` (3.347, 3.433, 3.641) and unacknowledged
case of `story-branch-landing-capture` (4.337). Move the conflict spec to
`e2e/review/story-branch-landing-recovery.spec.ts` and run the capture retry in
slice 6's E2E file. Preserve the real origin's rejection gate, retained workspace
`HEAD` and branch, receiver restart, superseded preparation history, restored
comparison and exactly one accepted push for the lost reply.

### 8. Continue the same claimed session after a retained landing

Type: Behavior
Status: planned

Behavior: A retained unfinished integration publishes the reviewed suffix above
the published prefix. The claim, plan, workspace and native session remain usable.
The same session can commit the next slice. Manual Done acknowledges the session
without changing the remote refs or execution record.

Proof: Move `story-branch-retained-landing` (8.192) to
`e2e/review/story-branch-retained-landing.spec.ts`. Run the real installed
integration, unfinished report, native terminal attach/next commit and manual
Done. Assert remote prefix, local suffix/head, unchanged claim/profile/plan,
no second session or stop, and acknowledgment without Git changes. Keep the
legacy proof until this native journey passes in E2E.

## Proof and local gate

Follow the [campaign comparison](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage),
[AGENTS.md](../../../AGENTS.md) and the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Use `caffeinate -s -i` on awake macOS on AC for long local checks. Keep default
timeouts. Run each slice's named Node, installed or E2E selection with one worker
as applicable. Apply MakeMe and page-object selection before editing tests.
Trace changed setup and readers, and verify the owning assertions discriminate
before deleting the old proof. Run `npm run typecheck:dashboard` for changes to
Dashboard test or production types. On the final candidate, record a one-worker
backend proof selection with zero legacy cases from this family. Compare counts,
wall and total case time, roughly 100 ms per-case guide, retries and the separate
cost of receiving E2E/installed cases. Name each final owner. Select and run the
receiving E2E paths through `npm run test:e2e` including after relocation.

## Plan review

Slice-plan refinement was unnecessary after separating admission, binding,
expiry and deletion into distinct typed proof loops. Those four fit the
15-active-minute bounds by composing or extending the existing focused tests.
The other four fit by moving the already replayed installed and E2E cases with
their fixtures. No slice-specific concern remained after the baseline, typed
discrimination and receiving-runner checks.
