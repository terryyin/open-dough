# Prove host launch choices and first input in Node Vitest

**Identity:** SEED-413#prove-native-first-input-on-vitest

**Source:** [Prove host launch choices and first input in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-first-input-on-vitest)

Disposition: awaiting story refinement — not ready for slice-plan refinement or execution.

A developer choosing a native host gets fast proof that its model and effort reach the process and that a recovered conversation receives first input once. Cover discovery, refusal, creation, recovery and connection lifetime for Claude, Codex and Cursor. Retain actual process or protocol proof where that boundary observes dispatch, cancellation, loss or recovery.

## Mapped slices

The selections are backend `launches/` files at `07435ba0f`. Use story
refinement to settle the current path selection, owners, proof boundaries,
and slice sizing. The original selection ran 68 legacy cases for these
files, all passing on the first attempt, with 167.178 s summed case time.
The [coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage)
records the comparison conditions for scoped before and after measurements.

| Observable result | Legacy proof to account for |
| --- | --- |
| Send Claude's chosen model, effort, and environment | `agent-launch-boundary.spec.ts`, `agent-launch-environment.spec.ts`, `agent-launch-model-boundary.spec.ts` |
| Use the admitted Codex model and effort before acknowledging input | `agent-launch-codex-model-boundary.spec.ts`, `agent-launch-codex-options.spec.ts` |
| Validate Cursor's chosen model at discovery and creation | `agent-launch-cursor-model-admission.spec.ts`, `agent-launch-cursor-model-verification.spec.ts` |
| Record creation before sending first input | `agent-launch-codex-creation-boundary.spec.ts`, `agent-launch-creation-gates-boundary.spec.ts` |
| Recover uncertain first input only with the matching evidence | `agent-launch-ad-hoc-codex-recovery-boundary.spec.ts`, `agent-launch-codex-reconciliation-boundary.spec.ts`, `agent-launch-codex-verify-boundary.spec.ts` |
| Respect host connection loss and startup reconnection | `agent-launch-codex-lifetime.spec.ts`, `agent-launch-codex-startup.spec.ts` |
| Send only one input during competing native starts | `agent-launch-duplicate.spec.ts` |

Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
to the plan and all repair handoffs.
