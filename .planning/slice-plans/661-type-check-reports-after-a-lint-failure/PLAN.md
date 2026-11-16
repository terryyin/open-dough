# Prove the type-check reports after a lint failure

**Identity:** SEED-382#type-check-reports-after-a-lint-failure
**Source:** [Prove the type-check reports after a lint failure](../../seeds/SEED-382-browser-test-job-headroom-on-slow-runners.md#type-check-reports-after-a-lint-failure)

## Provenance and findings

Correction of SEED-382#browser-test-job-headroom-on-slow-runners, which moved
lint and the dashboard type-check into `ci.yml`'s `lint` job (2026-11-16).
Its key example: "A lint or type-check failure → its own job fails naming
it". Intent Coverage on revision `cc38f4d1b` returned **Confirmed missing test
path**: changing the `Type-check the dashboard` step's `if:` to also require
`steps.lint.outcome == 'success'` left
`Distribution/tests/ci/ci-container-workflow.sh`,
`Distribution/tests/ci/ci-lint-setup.sh`,
`Distribution/tests/support/ci-browser-groups.test.mjs` and
`Distribution/tests/support/ci-proof-declaration.test.mjs` passing, while
evaluating the step conditions for a lint-failed run showed the type-check
skipped. The container-workflow check reads only `run:` lines. The delivered
workflow is correct; only its proof is missing.

## Preserved behavior and constraints

- The `lint` job's steps, conditions and bounds stay as delivered.
- The existing container-workflow assertions stay: the type-check runs after
  `node scripts/setup-native.mjs npm` in the `lint` job.
- No YAML parser is installed for the shell checks; read the workflow text as
  the existing checks do.

## Outside-in proof and local gates

`bash scripts/test.sh Distribution/tests/ci/ci-container-workflow.sh`, then
`npm run lint`. Failures and flakes follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Ordered slices

### 1. The workflow check guards the type-check's condition

Status: planned
Type: Behavior

Behavior: a `lint` job whose `Type-check the dashboard` step would skip after
a lint failure → the workflow check fails naming the step's condition.

Extend the `lint`-job guard in `ci-container-workflow.sh` to read that
step's `if:` and require `!cancelled()` with no `steps.lint` term.

Proof: the check passes on the current `ci.yml`; on a copy whose type-check
`if:` adds `&& steps.lint.outcome == 'success'`, and on one that drops
`!cancelled()`, it fails.

## Current decisions

- Trunk or Story Branch Mode as the executor chooses; one slice.

## Learnings
