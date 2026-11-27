# Diagnose Dashboard CI probe flakes

**Identity:** SEED-413#diagnose-dashboard-ci-probe-flakes

**Source:** [Diagnose Dashboard CI probe flakes](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#diagnose-dashboard-ci-probe-flakes), based on the maintainer's 2026-11-27 backlog request. Probe branch names, revisions, and job URLs were not supplied.

## Findings and scope

| Probe finding | Preserved behavior and observation |
| --- | --- |
| [`launches/responsive-unattached-startup.spec.ts:156`](../../../dashboard/frontend-tests/launches/responsive-unattached-startup.spec.ts#L156) twice reported zero terminal presentations where the test expected one. | A blank keyboard start presents the correct session's terminal once and leaves focus on the other task. Determine whether the test asserted before presentation could settle, or whether presentation was missed. |
| `VITEST_BROWSER_CONNECTION_CLOSED` appeared once during [`intent/intent-scope-timing-history-provenance.spec.ts`](../../../dashboard/frontend-tests/intent/intent-scope-timing-history-provenance.spec.ts). | The Intent spec still proves the timing history's build provenance. Establish whether the file started and reached its assertion, and where the browser connection failed. |

The maintainer observed these specific occurrences on probe branches only and
reported both unresolved. The same disconnect signature has separately
occurred on main. [Plan 881](../881-keep-full-frontend-runs-connected/PLAN.md)
already owns the frontend browser-connection repair. Compare this occurrence
with its evidence and give that owner any matching or distinguishing
observations. A shared error code alone cannot establish a shared cause.

Keep the existing assertions and apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Use the existing frontend Vitest runner in keeping with the
[Architectural North Star](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).

## Ordered slices

### 1. Attribute each CI probe failure

Type: Behavior (early probe)
Status: planned

Behavior: Given the three reported probe occurrences, comparing the original
CI evidence and a focused replay gives maintainers the cause and repair owner
for each failure, or a precise record of the missing observation that prevents
attribution.

Proof:
- Recover the probe job logs and retained browser output if available. Record
  the branch, revision, run/job, attempt, and relevant log excerpt. For the
  terminal case, compare the attempt observation, terminal callback, and
  assertion order. For the Intent case, compare the last file-start and
  browser/socket events with plan 881's findings.
- If the logs leave the terminal ordering unresolved, replay
  `npm run test:dashboard:frontend -- responsive-unattached-startup.spec.ts`
  on the matching revision and worker profile where possible. Use at most
  three focused diagnostic runs and capture the callback and assertion order.
  For the disconnect, use the existing owner's full-run evidence and avoid
  launching a duplicate full-suite reproduction.
- Record a conclusion and owner for each symptom, or the missing signal and
  next discriminating check when the evidence is inconclusive. A passing replay
  leaves the failure open. Identify retained proof for any subsequent repair
  before changing a test, runner, or product behavior.

Local gate: a focused runner invocation for the terminal symptom if needed.
Run any long macOS check from a fully awake machine on AC power under
`caffeinate -s -i` per [AGENTS.md](../../../AGENTS.md).

## Plan review

One bounded probe uses the shared CI evidence and leaves repair sizing to the
findings. The probe owns log availability, reproduction, and cause
attribution. The current evidence does not establish either cause.
