# Prove retained follow-up context in Node Vitest

**Identity:** SEED-413#prove-follow-up-context-on-vitest

**Source:** [Prove retained follow-up context in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-follow-up-context-on-vitest)

Disposition: awaiting story refinement — not ready for slice-plan refinement or execution.

A developer continuing a follow-up gets fast proof that the correct source context reaches the receiving agent even after the original record expires. Cover ordinary story and session context, source identity, input order, and retry. Reconcile source-story binding with [story-linked ad hoc sessions](SEED-439-complete-story-linked-ad-hoc-sessions.md#complete-story-linked-ad-hoc-sessions). The coverage map assigns Story Notes and published comparison selectors to their owners.

## Mapped slices

The selections are backend `launches/` files at `07435ba0f`. Use story
refinement to settle the current path selection, owners, proof boundaries,
and slice sizing. The original selection ran 22 legacy cases for these
files, all passing on the first attempt, with 89.998 s summed case time.
The [coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage)
records the comparison conditions for scoped before and after measurements.

| Observable result | Legacy proof to account for |
| --- | --- |
| Send the selected story or session context in order | `agent-launch-follow-up-boundary.spec.ts`, `agent-launch-follow-up-story.spec.ts` |
| Match repeated follow-ups to their source after its record expires | `agent-launch-follow-up-identity.spec.ts`, `agent-launch-follow-up-live.spec.ts` |
| Resume Codex and Cursor with the saved follow-up context | `agent-launch-follow-up-codex.spec.ts`, `agent-launch-follow-up-cursor.spec.ts` |

Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
to the plan and all repair handoffs.
