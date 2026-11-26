# Prove Dashboard worker recovery and drain in Node Vitest

**Identity:** SEED-413#prove-launch-worker-recovery-on-vitest

**Source:** [Prove Dashboard worker recovery and drain in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-launch-worker-recovery-on-vitest)

**Replacement trace:** `SEED-413#prove-launch-starts-and-recovery-on-vitest`, former plan 846 slices 5–8. The developer
kept the delivered admission and settlement work under the original identity.
The new slices 1–4 map to former slices 5–8 in that order.

Disposition: awaiting story refinement — not ready for slice-plan refinement or execution.

## Goal and scope

Give Dashboard maintainers fast typed proof that Continue recovers the same
interrupted attempt, the native handoff preserves worker ownership, change
reads and reconciliation use the currently held state, and drain waits for
settlement. Move the six legacy backend specs mapped below to Node Vitest.
Keep real server restart, Git publication, native input and preview replacement
with their maintained E2E journeys.

## Decisions and proof to carry forward

- Use the existing [launch owner](../../../dashboard/server/launchAttemptOwner.ts),
  [continuation owner](../../../dashboard/server/launchAttemptContinuation.ts)
  and [machine JSON store](../../../dashboard/server/machineJsonStore.ts).
  Use typed requests, private machine files and held effects. Keep the real
  process at the boundary where its liveness or restart is the observation.
- Use [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and the existing
  [page objects](../../../.agents/skills/dough-page-objects/SKILL.md) where selected.
  Reuse the existing proof seams. Remove support only after its last caller moves.
- The original plan's eight retained launch E2E cases passed at execution
  entry, including restart, orphaned worker recovery, verification and
  reconciliation. The watcher E2E was also previously observed with held
  admission and a settled outcome before preview replacement. Recheck the
  surviving callers on the follow-up's integrated base and reuse evidence
  only when the behavior, setup and observation still match.
- The [unverified slice 1 patch](SLICE-1-IN-PROGRESS.patch) preserves the
  four in-progress test files from former slice 5. Its base was
  `0e58f2b6b2d1b8dd19448887d2fb5203b134ba5c`; the original local stash OID
  was `fb912b73b25715ba9388f02248c51b6fae666a83`. The patch is preparation
  evidence. It is not an accepted implementation. In the new checkout,
  compare its paths with the integrated tree and use `git apply --check`
  before choosing whether to recover it. Then check both retained restart
  and verification journeys and the exact Node receiving assertions.

## Decisive premises to recheck during refinement

| Premise | Consuming operation and required evidence |
| --- | --- |
| Each mapped legacy assertion still owns a surviving behavior | Run the exact remaining backend selector on its integrated base and record browser and Node cases by path. Trace shared support before any removal. |
| The retained E2E reaches the necessary process boundary | Check receiving assertions for same attempt, workspace and input, worker liveness, published reconciliation and viewer replacement before removing a legacy assertion. Use the exact journeys named by each slice. |

## Ordered slices

### 1. Resume an interrupted attempt once with the kept input

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.

Proof: Arrange a kept interrupted attempt via its typed request and
worker and record inputs. Start refuses and Continue reuses the same
attempt, workspace and effort. Observe the kept first input when retry
is warranted and refuse another dispatch once that input is confirmed.
During a slow but live launch, keep Continue refused until the worker
settles and read its eventual outcome.
Use the [restart E2E](../../../e2e/launches/responsive-session-recovery-restart.spec.ts)
for real server replacement and [recovery verification](../../../e2e/launches/responsive-session-recovery-verification.spec.ts)
for recovery of uncertain first input. Run those journeys before removing
the legacy process checks. Compare the actual receiving assertions with the legacy variants before
removal. Carry a missing second-input, workspace or retained-effort
observation into the smallest matching journey.
Keep this slice scoped to the generic attempt owner and preserve the
host-specific input rules via their coverage owners.

The existing `agent-launch-codex-recovery.spec.ts` already exercises
Continue across a server restart, keeps the native workspace and first
input, and asserts one native `turn/start` when history confirms receipt.
Run it to receive the equivalent legacy process observations. The
Intent code-browse spec builds its named `ownRecordContinuation.ts`
sample from a literal fixture, so retiring the actual launch helper
does not reach that consumer. Check executable references before removal.

### 2. Protect the transition to the native worker

Type: Behavior
Status: planned
Estimate: 10–15 active minutes.

Proof: Pass persisted server, child and native worker facts through the
typed launch owner and production worker-state checks. Protect both sides
of the handoff from a competing Start or Continue. The
[second-server E2E](../../../e2e/launches/agent-launch-second-server.spec.ts)
observes the live script through native confirmation. The
[orphan E2E](../../../e2e/launches/agent-launch-second-server-orphan.spec.ts)
kills the owner, sees its child still running, and resumes the same
published claim after exit. Preserve those process signals while removing
the duplicate backend server journey.

### 3. Read changes and reconcile a settled attempt

Type: Behavior
Status: planned
Estimate: 10–15 active minutes.

Proof: With a held change count and typed attempt owner, observe a newer
owned change immediately and an unchanged non-owner answer at its configured
bound. An outcome or a later completed session report can justify
reconciliation only when that evidence is current for the read. Verify the
reconciled marker in the real attempt file and refusals for active and
unresolved evidence. Keep the
[completed-reconciliation E2E](../../../e2e/launches/responsive-session-reconciliation-completed.spec.ts)
for the published Take read. Convert the change and reconciliation specs.

### 4. Wait for durable settlement before replacing the Dashboard

Type: Behavior
Status: planned
Estimate: 10–15 active minutes.

Proof: Submit typed Start and Continue with an outstanding acceptance and
run `drain` through the production composition of `LaunchAdmission` and
`LaunchAttemptOwner`. Both new calls receive the 503 refusal. Hold the
publication and native confirmation handoffs in turn, and verify that drain
resolves only after the final outcome is readable. Run the existing
[production updater E2E](../../../e2e/runtime/production-watcher-updates.spec.ts)
through the existing held-update journey. The watcher requests drain while
a session-store lock holds native startup, proves the current preview stays
up and refuses new starts, and observes the same accepted attempt settled
before replacement. Preserve that journey while removing
`dashboard-update-drain.spec.ts`.

## Proof ownership and local gate

Files are relative to `dashboard/backend-tests/launches/`.

| Slice | Legacy selection | Observable proof |
| --- | --- | --- |
| 1 | `agent-launch-continuation-interrupted.spec.ts`, `agent-launch-uncertain-continuation.spec.ts` | Same attempt, workspace, effort and input, observed once at native receipt |
| 2 | `agent-launch-worker-handoff.spec.ts` | Durable handoff protects both sides and second process follows the same claim |
| 3 | `agent-launch-change-wait.spec.ts`, `settled-attempt-reconciliation.spec.ts` | Change counts and bound, outcome or report freshness, reconciliation proof |
| 4 | `dashboard-update-drain.spec.ts` | 503 refusals and pending drain up to durable native confirmation |

Use fresh absolute proof output paths from the repo root with one worker.
Record case and engine counts, per-case time and elapsed selection time.
Preserve full behavioral coverage across Node and the named E2E journeys.
The drain journey shares a serial deployment, so run the whole spec when
that boundary changes. Use the same workload for a timing comparison.

```sh
selection='launches/(agent-launch-(change-wait|continuation-interrupted|uncertain-continuation|worker-handoff|cross-server-accept)|dashboard-update-drain|settled-attempt-reconciliation|launch-attempt-(admission-close|worker))\.spec\.ts$'
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$backend_proof" /usr/bin/time -p npm run test:dashboard:backend -- "$selection" --workers=1
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_E2E_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_E2E_PROOF_RECORD="$e2e_proof" /usr/bin/time -p npm run test:e2e -- 'e2e/launches/(agent-launch-second-server(-orphan)?|responsive-session-(recovery-(restart|verification)|reconciliation-completed))\.spec\.ts$' --workers=1
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_E2E_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_E2E_PROOF_RECORD="$drain_proof" /usr/bin/time -p npm run test:e2e -- 'e2e/runtime/production-watcher-updates\.spec\.ts$' --workers=1
```

Run affected consumers from the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
and `npm run typecheck:dashboard` for changed typed contracts. Run long local
checks on awake macOS on AC under `caffeinate -s -i` per [AGENTS.md](../../../AGENTS.md).
Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
to each failure and repair handoff. Keep default test timeouts.
