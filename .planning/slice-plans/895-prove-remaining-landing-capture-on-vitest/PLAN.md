# Prove the remaining landing capture cases in Node Vitest

**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

**Source:** [Prove the remaining landing capture cases in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#remaining-landing-capture-via-vitest)

**Identity:** SEED-413#remaining-landing-capture-via-vitest

## Goal and scope

Give Dashboard developers an owner for the three installed landing retries that
[plan 864](https://github.com/terryyin/open-dough/blob/079e46bf6b7d47136c435480541b9b8decd2cc29/.planning/slice-plans/864-prove-landing-capture-evidence-on-vitest/PLAN.md) left on the
legacy runner, then delete the two specs that still hold them. Keep the
existing publication, capture, and retention rules. This plan is provisional.
Refinement owns the examples, the receiving boundary, and the slice boundaries.

The original identity, kept for recovery after that story's cleanup, is
`SEED-413#landing-capture-evidence-via-vitest`.

## Inherited evidence

Plan 864 slices 1–10 proved the rest of the family. These observations stayed
in the legacy specs because no Node or end-to-end case owns them:

- `dashboard/backend-tests/review/one-shot-landing-capture-admission.spec.ts`:
  a record written before any prepare, and an installed retry whose stderr
  says the session was deleted while that attempt is kept.
- `dashboard/backend-tests/review/one-shot-landing-recovery-retention.spec.ts`:
  the installed retry of the retained pair after real attempt expiry,
  including the retry after the workspace is gone.

Foreign remote and target refusals, a different story identity, expiry
refusal, the recorded pair after expiry, and deletion of pins through
`handleLanding` already have owners in plan 864. Refinement checks that those
owners still discriminate before this plan deletes either file.

This story waits until plan 864 is integrated. Trunk before that integration
still holds the whole family.

## Provisional ordered slices

### 1. Own the installed capture before prepare and the deleted-session retry

Type: Behavior
Status: planned

`one-shot-landing-capture-admission.spec.ts` keeps a record with no landing
and no preparation, and an installed retry that reports deletion while the
attempt remains.

### 2. Own the installed retry after real attempt expiry

Type: Behavior
Status: planned

`one-shot-landing-recovery-retention.spec.ts` keeps the installed retry after
the attempt expires, including the same receipt after the workspace is gone
and a single accepted push.

### 3. Delete both legacy specs

Type: Behavior
Status: planned

After the owners discriminate, delete both specs. A one-worker backend
selection of this family finds zero legacy cases.

## Proof and local gate

Measure the focused selections and the final family selection with one worker.
Follow the [campaign comparison](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage).
Use awake macOS on AC under `caffeinate -s -i` for long local checks per
[AGENTS.md](../../../AGENTS.md). Keep default timeouts and apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
