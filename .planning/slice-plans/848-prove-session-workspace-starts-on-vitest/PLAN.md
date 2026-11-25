# Prove Dashboard session workspace choices in Node Vitest

**Identity:** SEED-413#prove-session-workspace-starts-on-vitest

**Source:** [Prove Dashboard session workspace choices in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-workspace-starts-on-vitest)

Disposition: awaiting story refinement — not ready for slice-plan refinement or execution.

A developer choosing a workspace gets fast proof of the checkout, admission, and landing policy the host receives. Scheduled maintenance uses the supported admission path and reports attention once. Cover borrowed and isolated choices, explicit confirmation, admission receipts, retained landing evidence and expiry. Reconcile default-start, scheduled admission, and declared landing with [story-linked ad hoc sessions](SEED-439-complete-story-linked-ad-hoc-sessions.md#complete-story-linked-ad-hoc-sessions).

## Mapped slices

The selections are backend `launches/` files at `07435ba0f`. Use story
refinement to settle the current path selection, owners, proof boundaries,
and slice sizing. The original selection ran 40 legacy cases for these
files, all passing on the first attempt, with 182.387 s summed case time.
The [coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage)
records the comparison conditions for scoped before and after measurements.

| Observable result | Legacy proof to account for |
| --- | --- |
| Use the chosen checkout and keep exact first input | `agent-launch-ad-hoc-boundary.spec.ts`, `agent-launch-ad-hoc-sessions.spec.ts`, `agent-launch-ad-hoc-codex-input.spec.ts` |
| Require confirmation before starting with existing changes | `agent-launch-start-session-existing-changes-boundary.spec.ts`, `agent-launch-ad-hoc-cursor-established.spec.ts` |
| Publish isolated admission before contacting the host | `admitted-session-refusal.spec.ts`, `admitted-session-retry.spec.ts`, `agent-launch-start-session-isolated-codex.spec.ts` |
| Recover the same workspace and landing policy | `agent-launch-start-session-failed-boundary.spec.ts`, `agent-launch-start-session-identity.spec.ts`, `agent-launch-start-session-kept.spec.ts`, `agent-launch-start-session-lost.spec.ts`, `agent-launch-start-session-stops.spec.ts` |
| Capture the accepted landing using retained workspace evidence | `agent-launch-start-session-landing-admission.spec.ts`, `agent-launch-start-session-landing-boundary.spec.ts`, `agent-launch-start-session-landing-retained.spec.ts` |
| Keep retained workspace evidence until its attempt is pruned | `agent-launch-start-session-retention.spec.ts` |
| Start one due feedback session and report attention once | `feedback-maintenance-launch.spec.ts` |

Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
to the plan and all repair handoffs.
