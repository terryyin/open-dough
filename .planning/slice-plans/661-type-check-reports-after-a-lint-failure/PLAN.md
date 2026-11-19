# Prove the type-check reports after a lint failure

**Identity:** SEED-382#type-check-reports-after-a-lint-failure
**Source:** [Prove the type-check reports after a lint failure](../../seeds/SEED-382-browser-test-job-headroom-on-slow-runners.md#type-check-reports-after-a-lint-failure)

## Provenance and findings

Correction of SEED-382#browser-test-job-headroom-on-slow-runners, which moved
lint and the dashboard type-check into `ci.yml`'s `lint` job (2026-11-16).
Its key example: "A lint or type-check failure → its own job fails naming
it". Intent Coverage on revision `cc38f4d1b` returned **Confirmed missing test
path**: a type-check `if:` that also required `steps.lint.outcome == 'success'`
left every maintained check passing. The delivered workflow is correct; only
its proof is missing.

## Preserved behavior and constraints

- The `lint` job's steps, conditions and bounds stay as delivered.
- `Distribution/tests/ci/ci-container-workflow.sh` stays as it is. It checks
  that the container diagnostic agrees with CI, and keeps its assertion that
  the `lint` job type-checks after `node scripts/setup-native.mjs npm`.

## Approach and reuse

- **Pin the condition.** The check requires the type-check step's `if:` to be
  exactly `${{ !cancelled() && steps.npm.outcome == 'success' }}`. A rule
  that only forbids a `steps.lint` term passes `!cancelled() && success()`
  and `!cancelled() && !failure() && …`, which both skip the type-check
  after a lint failure. A deliberate later change to the condition updates
  this one line.
- **Existing solution.** `jobs` and `steps` in
  [`ci-proof-action-fixtures.mjs`](../../../Distribution/tests/support/ci-proof-action-fixtures.mjs)
  already read a job's steps from `ci.yml`, and
  [`ci-proof-declaration.test.mjs`](../../../Distribution/tests/support/ci-proof-declaration.test.mjs)
  already pins `if:` lines with them. The new check is one test in a new
  `Distribution/tests/support/ci-lint-job.test.mjs` that uses those readers.
  It builds no test data, so it needs no MakeMe builder.
- No Accepted ADR governs CI workflow checks. No North Star topic is needed.

## Key examples

1. Today's `ci.yml` → the check passes.
2. The type-check `if:` also requires `steps.lint.outcome == 'success'` → the
   check fails showing the condition it found.
3. The `if:` keeps `!cancelled()` and names no lint step, but adds `success()`
   or `!failure()` → the check fails.
4. The `if:` is removed, or loses `!cancelled()` → the check fails.
5. The `if:` also requires `steps.lint-tools.outcome == 'success'` → the check
   fails: a failed lint tool download must not hide the type-check either.

## Decisive premises

Observed on 2026-11-19 at `b518b6048` in this worktree, Node from
`.node-version`, with every scratch edit reverted afterwards.

| Operation | Observed result |
| --- | --- |
| The delivered condition lets the type-check report after a lint failure on the hosted runner | `gh api repos/{owner}/{repo}/actions/runs/<id>/jobs` for failed `ci.yml` runs: in run 44339614749 `Run lint` failed and `Type-check the dashboard` succeeded; in run 44271425711 both failed, each with its own step conclusion. |
| No maintained check notices a changed type-check condition | For each of five scratch conditions (examples 2, 3 with `success()`, 3 with `!failure()`, 4 without `!cancelled()`, 5), `bash Distribution/tests/ci/ci-container-workflow.sh` and `node --test Distribution/tests/support/ci-browser-groups.test.mjs Distribution/tests/support/ci-proof-declaration.test.mjs` exited 0. |
| The planned check discriminates, run the way the slice runs it | A scratch `Distribution/tests/support/ci-lint-job.test.mjs` that finds the `lint` job's one step running `npm run typecheck:dashboard` and compares its `if:` lines with the pinned line: `bash scripts/test.sh Distribution/tests/support/ci-lint-job.test.mjs` exited 0 on today's `ci.yml` and 1 on each of the five conditions above and on the step with its `if:` removed. |

## Outside-in proof and local gates

`bash scripts/test.sh Distribution/tests/support/ci-lint-job.test.mjs`, then
`npm run lint`. Both are short; if a long full run becomes necessary on
macOS, start fully awake on AC with `caffeinate -s -i`, or on battery follow
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Failures and flakes follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Ordered slices

### 1. A workflow check pins the type-check's condition

Type: Behavior
Status: planned
Proof: the new test passes on the current `ci.yml`. With a scratch edit for
each of key examples 2 to 5 it fails, and the edit is reverted. `npm run lint`
passes.

Behavior: a `lint` job whose `Type-check the dashboard` step would not run
after a lint failure → `npm test` fails in `ci-lint-job.test.mjs`, showing the
condition found beside the one required.

The test finds the step by its `run: npm run typecheck:dashboard` line,
requires exactly one such step in the `lint` job, and compares its `if:` lines
with the pinned line. Its header comment says what the job promises: lint and
the type-check each report their own outcome.

## Current decisions

- Trunk or Story Branch Mode as the executor chooses; one slice.
- The check pins the whole condition instead of forbidding lint terms.
- The check is a Node test beside the other `ci.yml` `if:` checks, not an
  addition to the container-workflow shell check.

## Refinement and concerns

Slice-plan refinement was not needed: one slice, one outcome, proof observed.
This review identified no remaining concern for slice 1.

## Learnings
