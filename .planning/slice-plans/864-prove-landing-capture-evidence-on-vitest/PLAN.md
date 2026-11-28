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
selection belong to [plan 863](../863-prove-published-review-comparisons-on-vitest/PLAN.md).
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
Status: done

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

Accepted proof, before delivery marks this slice done: the two specs moved to
`e2e/review/` with only the `../../dashboard/` import prefix used by
`e2e/review/one-shot-landing-recovery.spec.ts`. The legacy copies were removed.
`OPEN_DOUGH_E2E_PROOF_RECORD` at
`open-dough/evidence/slice1-e2e-selection.json` selected 3 chromium cases and
recorded `strictStatus: passed` in 14.3 s: the CLI `--landing-context` case,
and refinement and execution retirement/GC. Assertions in those specs observe
the prepared pair, the receipt after worktree removal, `cat-file` after
`gc --prune=now`, and absent completion and observer. No production file
changed. Refactor pass skipped: these are the slice's subject specs, and a
search for their names finds only this plan. Later slices 6–8 can reuse the
same import prefix. The quiet e2e reporter prints nothing on a pass, so a
proof record is what names the selected cases.

### 2. Admit a prepare only for the authorized comparison

Type: Behavior
Status: planned

Behavior: A prepare reaches the landing receiver only with this launch's
reference and its authorized host, origin, story, and Git comparison of the
workspace HEAD. It rejects a caller-selected repository, a candidate that is
not HEAD, a non-commit object, an unknown object, an unknown launch reference,
and an omitted story. The record, preparations, refs, and checkout stay as
they were.

Proof: Admission part of `one-shot-landing-capture-admission` (3.232). Restore
the unrun authoring for `parseLandingSubmission`'s extra `repository` field in
`landingRequestAdmission.spec.ts` and for `a prepare admits only this launch's
comparison of its workspace HEAD` in `landingPinRecovery.spec.ts`. Run those
two specs. Leave the record-and-later-pair test for slice 3. Keep the shared
legacy admission spec until slice 6.

### 3. Keep the accepted pair when a later comparison arrives

Type: Behavior
Status: planned

Behavior: A record requires the prepared comparison and remote acceptance.
After that pair is retained, a well-formed distinct pair for the same launch
leaves the record, preparations, refs, and checkout intact.

Proof: Restore the unrun test `recording waits for acceptance, then a distinct
pair leaves that landing unchanged` in `landingPinRecovery.spec.ts`. It records
only after the real push, then refuses a later real commit as a second pair.
Run that spec. Do not use the old malformed changed replay as this proof.

### 4. Bind a pending capture to the original native session

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

### 5. Capture from a kept launch after its startup attempt expires

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
and no recreation. Slice 1 keeps real retirement and slice 4 keeps transport replay.

### 6. Refuse a deleted launch while its pins are being removed

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
the shared admission spec when slices 2 and 3 and these are green.

### 7. Keep the first accepted Story Branch comparison

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
capture file intact, including slice 8's reporting retry case.

### 8. Recover a conflicted or unacknowledged Story Branch landing

Type: Behavior
Status: planned

Behavior: Story Branch integration encounters conflict, a newer target or a
lost push response. A resumed integration keeps the resolved merge and records
only the pair that trunk accepted. If the receiver is unavailable after
acceptance, the printed retry records that pair without pushing it again.

Proof: `story-branch-landing-conflict` (3.347, 3.433, 3.641) and unacknowledged
case of `story-branch-landing-capture` (4.337). Move the conflict spec to
`e2e/review/story-branch-landing-recovery.spec.ts` and run the capture retry in
slice 7's E2E file. Preserve the real origin's rejection gate, retained workspace
`HEAD` and branch, receiver restart, superseded preparation history, restored
comparison and exactly one accepted push for the lost reply.

### 9. Continue the same claimed session after a retained landing

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

Slice 2 overran at 16.9 active minutes with no proof run. Writing the prepare
refusals and the later-pair immutability test in one slice was the false
sizing assumption. Those are now slices 2 and 3. The unrun authoring is parked
outside the worktree. Binding, expiry, and deletion stay one proof loop each.
The installed and E2E moves stay as they were. This split takes the plan to
nine slices, inside the execution allowance for splitting the slice in progress.

## Execution context

- Mode: story-branch. Owned workspace
  `/Users/terryyin/git/open-dough/.worktrees/prove-retained-landing-capture-in-node-vitest`,
  branch `cursor/prove-retained-landing-capture-in-node-vitest`, created for
  this identity. Integration checkout `/Users/terryyin/git/open-dough` on
  `main`. Remote `origin`. Ordinary increments publish to
  `origin/cursor/prove-retained-landing-capture-in-node-vitest`; integration
  target is `origin/main`.
- Starting revision `4c38141a1b7f5a808d5b793e95d98c827a210055`. Accepted Take
  `dfc699737c5df187855e7941ef4d2e44e8021115`. Slice 1 published
  `f5b38eb90e68703c6633ae2a168262a529dc001d` on
  `origin/cursor/prove-retained-landing-capture-in-node-vitest`, suffix base
  the Take, zero reconciliations. That receipt is the next increment's
  previously published base. Observer `/tmp/dough-ci-501/watch-1ZhItf` reused.
  No unpublished candidate. Publisher `dashboard-territory.local-open-dough`,
  agent `Yua-chan`.
- Setup in this checkout: Node 24.21.0 and Bash 5.3.20 from `/opt/homebrew/bin`.
  `node scripts/setup-native.mjs npm`, `browser`, and `check` passed
  (Chromium 158.0.8127.18). `npm run --silent typecheck:dashboard` passed.
  Lockfile unchanged.
- CI: GitHub Actions `terryyin/open-dough`, workflow `ci.yml` (id 351271804,
  display name CI, active), integrated-state completion check `ci.yml` on
  `push`. Observer `/tmp/dough-ci-501/watch-1ZhItf` uses
  `.agents/skills/dough-execute-plan`. The Take published before this observer
  was armed, so that claim is `pendingCi: unobserved` and is not registered here.
- Slice 1 proof decision: macOS on AC, 48 GiB, load about 9.3/7.6/6.7, with
  little free memory and other worktrees already running one-worker backend
  and E2E suites. Run this slice's receiving E2E at `--workers=1` under
  `caffeinate -s -i`. Recheck competing Open Dough test processes before
  launch. Treat a resource failure as a reason to reconsider, not to retry
  immediately. Expect several minutes, including a cold dashboard build. The
  settled disposable 12-case replay was 38 s wall; the recovery E2E pair was
  31 s wall.
- The publication that first lands this launch on trunk takes landing context
  `/Users/terryyin/.open-dough/dashboard/reporting/369db0bd-7bb0-4738-bb9d-e92b252f003a/landing-context.json`.
  Later trunk publications take none.
- Replanning keeps existing planning authority. No `--replan` or `--no-replan`.
  Slice 1 has no story-obligation entries.
- Slice 2 overran at 16.9 active minutes, `storyOverruns` 1, with no proof.
  Its unrun spec diff is parked at
  `/Users/terryyin/git/open-dough/.git/worktrees/prove-retained-landing-capture-in-node-vitest/open-dough/evidence/slice2-unrun.patch`.
  The worktree specs were restored. Slice 2 now proves only prepare admission.
  Slice 3 proves the accepted pair against a later comparison.
