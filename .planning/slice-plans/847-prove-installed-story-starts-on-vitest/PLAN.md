# Prove installed execution and refinement starts in Node Vitest

**Identity:** SEED-413#prove-installed-story-starts-on-vitest

**Source:** [Prove installed execution and refinement starts in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-installed-story-starts-on-vitest)

Disposition: awaiting story refinement — not ready for slice-plan refinement or execution.

A developer starting a queued story gets fast proof that execution or refinement publishes the right assignment before dispatch. Exercise the installed Start and Preparing commands, their receipts, and worktree-update retry. Keep real Git and a private origin where publication supplies the evidence.

## Mapped slices

The selections are backend `launches/` files at `07435ba0f`. Use story
refinement to settle the current path selection, owners, proof boundaries,
and slice sizing. The original selection ran 48 legacy cases for these
files, all passing on the first attempt, with 291.083 s summed case time.
The [coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage)
records the comparison conditions for scoped before and after measurements.

| Observable result | Legacy proof to account for |
| --- | --- |
| Start execution only after the Take is published | `agent-launch-start.spec.ts`, `agent-launch-start-refusal.spec.ts`, `agent-launch-start-taken-refused.spec.ts`, `agent-launch-start-duplicate.spec.ts` |
| Recover a kept Take and use its original claim | `agent-launch-start-resume.spec.ts`, `agent-launch-start-codex-recovery.spec.ts` |
| Publish Preparing before dispatch and explain a stopped allocation | `agent-launch-preparation-start.spec.ts`, `agent-launch-preparation-stops.spec.ts` |
| Recover the original Preparing assignment after an interruption | `agent-launch-preparation-resume.spec.ts`, `agent-launch-preparation-continuation-refusal.spec.ts`, `agent-launch-preparation-store-failure.spec.ts` |
| Continue Codex refinement only with its verified allocation | `agent-launch-preparation-codex-continuation.spec.ts`, `agent-launch-preparation-codex-retry.spec.ts` |
| Restore reporting on a kept installed start | `agent-launch-incomplete-reporting-settlement.spec.ts`, `agent-launch-update-worktree-retry.spec.ts` |

Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
to the plan and all repair handoffs.
