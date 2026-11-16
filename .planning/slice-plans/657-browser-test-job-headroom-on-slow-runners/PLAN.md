# Keep browser test jobs inside their deadline on slow runners

**Identity:** SEED-382#browser-test-job-headroom-on-slow-runners
**Source:** [Keep browser test jobs inside their deadline on slow runners](../../seeds/SEED-382-browser-test-job-headroom-on-slow-runners.md#browser-test-job-headroom-on-slow-runners)
**Source review:** [source review](source-review.md)

## Goal and scope

Lint and the dashboard type-check run in a CI job of their own, so the
`dashboard-frontend` job spends its whole 450-second browser-run deadline on
its suite, and the restart-recovery test at
`e2e/launches/responsive-session-recovery-restart.spec.ts:47` no longer
stalls after "Continue execution".

Exclusions: the deadline and job bound keep their values; no other group is
resized; no runner-speed measurement; lint itself is not made faster; other
tests near their timeout are not searched for.

## Decision before Take

Owner: the developer. Slice 1 reverses the cohosting of lint on the frontend
runner (`97b0f808f`, 2026-11-14) and makes CI 19 jobs, 18 at once.
Recommended: confirm it. The seed's
[considered options](../../seeds/SEED-382-browser-test-job-headroom-on-slow-runners.md#browser-test-job-headroom-on-slow-runners)
are the alternatives; choosing one replaces slice 1 only.

## Settled premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Lint and the type-check consume the frontend suite's deadline | slice 1 | `gh run view --json jobs` step times, 2026-11-16: run 43797393195 lint 122 s, type-check 28 s, suite ended by the deadline at 289 s; run 43792139474 lint 79 s, type-check 18 s, suite 177 s | holds |
| The slow run's suite was nearly finished at the deadline | slice 1's key example | `dashboard-frontend-times-1` of both runs: 193 of 195 spec files recorded, 1,034 against 631 test-seconds | holds; a start 150 s earlier leaves over 100 s |
| The frontend job is the group closest to its deadline | slice 1 | `bash scripts/ci-job-times.sh`, 2026-11-16, 10 successful `main` runs: `dashboard-frontend` 234–443 s, headroom 7; next `dashboard-backend` 206–315 s | holds |
| Tests read the lint steps from `browser-test-group.yml` | slice 1 | read at `8fa4d3e11`: `Distribution/tests/ci/ci-container-workflow.sh` requires `npm run typecheck:dashboard` in the browser workflow before the suite; `Distribution/tests/ci/ci-lint-setup.sh` extracts the lint-tool steps from it (Linux only) | holds by reading; neither was run against the change, so slice 1 runs the first locally and CI runs the second |
| Lint needs full history | slice 1's checkout depth | `browser-test-group.yml` fetches depth 0 only when `inputs.lint`; the reason was not found | open; bounded inside slice 1: the new job keeps depth 0, the browser job keeps depth 1 as its non-lint shards have today |
| The line-47 test stalled, and was not slow | slices 2–3 | `e2e-playwright-report-5` of run 43797393195 (kept until 2026-11-23), `trace.zip` of the failed test: last action the second page's "Continue execution" click at 10.3 s, then no action until the 30 s timeout; the next statement is `settledOutcome(restarted, running.id)` (`dashboard/tests/acceptedAttempts.ts`) | holds; why the continued start did not settle is unobserved, and slice 2 is its probe |

## Outside-in proof and local gates

- Slice 1, from the repository root:
  `bash scripts/test.sh Distribution/tests/ci/ci-container-workflow.sh Distribution/tests/ci/ci-lint-setup.sh Distribution/tests/ci/ci-job-times.sh Distribution/tests/support/ci-browser-groups.test.mjs Distribution/tests/support/ci-proof-declaration.test.mjs`,
  then `npm run lint`. The published revision's CI is the proof of the layout
  itself: a `lint` job with its own result, and a `dashboard-frontend` job
  whose suite starts within about 30 s of its deadline step.
- Slices 2–3, after `node scripts/setup-native.mjs npm` and `browser`:
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config e2e/playwright.config.ts --reporter=list launches/responsive-session-recovery-restart.spec.ts`,
  with `--repeat-each` where the slice says so.
- A fix in slice 3 that changes server code or a support module other specs
  import also runs the `e2e/launches/` specs once:
  `caffeinate -s -i` in front of the same command with `launches/`, on AC
  power from a fully awake machine
  ([machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)).
- Failures and flakes follow the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

| Key example | Owner |
| --- | --- |
| A frontend runner as slow as run 43797393195 finishes its suite | 1 |
| A typical frontend job ends about 100 s sooner | 1 |
| Lint, type-check and suite failures stay independent | 1 |
| The restart-recovery test's continued start settles and the test passes | 2, 3 |

## Ordered slices

### 1. Lint and type-check in their own CI job

Status: planned
Type: Behavior

Behavior: a pushed revision → CI → a `lint` job runs lint and the dashboard
type-check with its own outcome, and `dashboard-frontend` runs only its
suite.

`ci.yml` gains the job: checkout at depth 0, the setup and Node deadlines,
the pinned Node and npm steps, the shell lint tools with their diagnosis,
`npm run lint`, then the type-check under `!cancelled()` so each reports
separately, and a `timeout-minutes` of 6. It is not a `ci-proof` need.
`browser-test-group.yml` loses its `lint` input and every lint and type-check
step, and checks out at depth 1. Update what reads them:
`ci-container-workflow.sh` (the type-check now comes from `ci.yml`),
`ci-lint-setup.sh` (its workflow path), and any fixture of
`ci-job-times.sh` that names the steps. `dashboard/tests/shards.md` states
the 19-job layout, where lint runs, and the declared 450 seconds and 8
minutes in its deadline section.

Proof: the local gate passes; on the published revision's CI the `lint` job
succeeds and the `dashboard-frontend` suite step starts within about 30 s of
the deadline step.

Accepted local proof, 2026-11-16: the slice's gate command and `npm run lint`
pass; `native-setup.sh`, `ci-proof-actions.test.mjs`,
`test-runner-split.sh` and `ci-workflow-path-policy.test.mjs`, which also read
the workflows, pass. Removing the type-check line from a copy of `ci.yml`
makes `ci-container-workflow.sh` fail. `ci-lint-setup.sh` runs its checks on
Linux only, so its first proof is the published revision's CI.

### 2. Probe: why the continued start did not settle

Status: planned
Type: Structure

Find what the continued start waited on between the "Continue execution"
click and the timeout: read the failed test's attachments and server
evidence in `e2e-playwright-report-5` of run 43797393195, read the
continue path from the recovery action to the attempt's settlement, and
run the spec with `--repeat-each 20`, alone and beside a CPU-loading
command, recording how long the settlement takes and whether it stalls.
Record the cause in Learnings. No cause found after these three
observations stops slice 3 and returns the decision to the developer with
what was seen.

Enables slice 3. Proof: Learnings names the awaited operation and the
observation that showed it.

### 3. The continued start settles on a slow runner

Status: planned
Type: Behavior

Behavior: a start a closed server left unsettled → "Continue execution" on a
second page → the start settles as launched and the test passes inside the
default timeout.

Fix the cause slice 2 names, in the product when the start can stall for a
user, otherwise in the test's harness. Keep every assertion and the default
timeout.

Proof: the spec passes with `--repeat-each 20` under the load that slowed or
stalled it in slice 2, or, when slice 2 could not reproduce the stall, a
test of the named cause fails without the fix and passes with it.

## Current decisions

- Story Branch Mode.
- Independent of SEED-381's shard conversion; whichever lands second
  reconciles `ci.yml`, `browser-test-group.yml` and `shards.md`.

## Learnings

- Slice 1: the workflow readers (`ci-container-workflow.sh`,
  `ci-lint-setup.sh`) match `run:` lines, so a step reached through a YAML
  alias is invisible to them; the `lint` job writes its npm install out in
  full. macOS system Ruby (`ruby -ryaml`) resolves the workflow's anchors for
  a structural check; no YAML parser is installed for Node or Python.

## Readiness and sizing

Refinement not needed: three slices, each with one outcome and its own
proof. Slice 1 is one workflow move with four readers. Remaining concern:
slice 3's size is unknown until slice 2 names the cause; slice 2 is its
authorized early probe.
