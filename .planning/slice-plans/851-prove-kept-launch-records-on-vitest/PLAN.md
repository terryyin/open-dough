# Prove retained launch records in Node Vitest

**Source:** [Prove retained launch records in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-kept-launch-records-on-vitest)

Disposition: awaiting story refinement — not ready for slice-plan refinement or execution.

A developer reading the Dashboard gets fast proof that retained launches and their native session identities survive restart and reads from another server. Cover kept-start store behavior, host-qualified identities, concurrent record writes, replacement, and per-host observation. Retain true multiprocess or filesystem evidence where it supplies the result.

## Mapped slices

The selections are backend `launches/` files at `07435ba0f`. Use story
refinement to settle the current path selection, owners, proof boundaries,
and slice sizing. The original selection ran 18 legacy cases for these
files, all passing on the first attempt, with 38.817 s summed case time.
The [coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage)
records the comparison conditions for scoped before and after measurements.

| Observable result | Legacy proof to account for |
| --- | --- |
| Read kept starts, respect their write lock, and tell whether they run | `start-store.spec.ts`, `agent-launch-start-kept-not-running.spec.ts` |
| Read the same record across Dashboard instances and after replacement | `agent-launch-records-replaced.spec.ts`, `agent-launch-records-shared-machine.spec.ts` |
| Preserve healthy observations and apply the record lifetime | `agent-launch-records.spec.ts`, `launch-observations.spec.ts` |
| Keep equal native identifiers distinct by host | `agent-launch-host-identity.spec.ts` |

Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
to the plan and all repair handoffs.
