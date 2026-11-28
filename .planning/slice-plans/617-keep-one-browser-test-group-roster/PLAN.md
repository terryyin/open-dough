# Keep one browser test group roster

**Identity:** SEED-334#keep-one-browser-test-group-roster
**Source:** [Minimal correction story](../../seeds/SEED-334-product-wide-end-to-end-tests.md#keep-one-browser-test-group-roster)

## Goal and scope

Make the set of browser test groups (E2E Test, Dashboard Integrated UI Test,
Dashboard Frontend Test, Dashboard Backend Test) one concept with one home,
product-wide names and current guidance, and guard each CI producer's setup
bounds separately. Behavior-preserving: every group's selection, settings,
outputs, shards, CI proof entries and the interim group stay as delivered.
Excluded: adding or removing a group (the interim group's retirement stays with
SEED-334#retire-dashboard-integrated-ui-test, which may land before or after
this story; whichever lands second updates the other's callers, and the roster
holds whichever groups are current at execution), new runners or CI jobs, Intent
naming (SEED-334#observe-tagged-install-and-read-e2e-proof), speed work, and
rewriting historical records, findings or frozen fixtures.

## Provenance and current findings

The completed execution of
SEED-334#run-and-observe-product-wide-end-to-end-tests (story section and
plan 608 recoverable at `125c45649fa587c78ed7445deff35db87604489d`; claim `a9ddb54a786d7d64d2bf63500f93cec1c9c5952d`) published
`970c8c586`, `27724831f`, `8d6106164`, `cd7da4de9`, `da2581974`, `d21a0ebc5`
and `bda0a659b` on its uncontaminated story branch. Findings were first
checked at `bda0a659b` and rechecked at `3cd26c333`, after
`951f66a76` moved the root `tests/` tree to `Distribution/tests/` and the
interim-folder dissolution moved the `runners` array into
`dashboard/tests/support/groupRunnerExamples.ts`:

1. **Group roster repeated.** The four groups' commands and settings prefixes
   are hard-coded in `dashboard/tests/support/proofRecordRun.ts:76` (the
   regex that keeps every group's split, proof record and times out of
   nested proof runs), `scripts/dashboard-repeat.sh:40-42` (accepted
   commands) and `:134-137` (unset settings),
   `scripts/ci-container.sh:24-28`,
   `Distribution/tests/support/local-test-suite-fixtures.mjs:54-58` and
   `dashboard/tests/support/groupRunnerExamples.ts` (name, script, config,
   prefix, directory, root and durations beside each group's example spec
   and grep). Only `Distribution/tests/support/browserGroupConfigs.mjs`
   derives them, from `ci.yml`, `package.json` and the configurations.
   Adding or removing a group (the queued interim-group retirement) needs
   coordinated edits, and only the backend split is proved absent from
   nested proof runs
   (`dashboard/backend-tests/intent/proof-record-entry.spec.ts:41-65`;
   `runner-ownership.spec.ts` passes other groups' settings as explicit child
   env, which bypasses the filter).
2. **Dashboard names on product-wide helpers.** `scripts/dashboard-repeat.sh`
   (`DASHBOARD_REPEAT_SUITE`/`_INSTALL`, `dough-dashboard-repeat` work dir) now
   repeats any group including `test:e2e`, tested by
   `Distribution/tests/test-runner/dashboard-repeat.sh`;
   `scripts/ci-container.sh --dashboard` runs all four groups;
   `dashboard/tests/support/testFiles.mjs`
   `dashboardSpecFiles`/`dashboardTestMatch`/`dashboardTestProjects`,
   and `fullSuiteSelection.mjs` `fullDashboardSuite` serve every group.
3. **Setup guard weakened.** `Distribution/tests/native-harness/native-setup.sh:197`
   concatenates `ci.yml` and `browser-test-group.yml` before its presence
   checks. The browser producers' Node/npm/Chromium acquisition steps were
   copied out of `ci.yml`'s YAML anchors in `da2581974`, so either file can
   drop a one-minute bound, deadline or failure diagnosis while the other
   still satisfies the check.
4. **Stale placement guidance.** `dashboard/tests/README.md:63` still says
   "All four roots are one suite, run and sharded together", written for the
   slice-3 umbrella that `da2581974` retired; `:39` says a case needing the
   real server "stays an integrated journey here", contradicting
   `e2e/README.md` placement and the interim group's purpose.

## Decisions and preserved proof

- One dependency-free roster module beside `runnerConfig.mjs` in
  `dashboard/tests/support/` (the approved shared runner-support owner) lists
  each group's job id, npm command, configuration, settings prefix and root. Configurations, `proofRecordRun.ts`, the repeat helper, the
  container diagnostic and the tests above read it; `runnerVariables` stays
  the one rule for setting names. Do not introduce a runner framework.
- `Distribution/tests/support/ci-browser-groups.test.mjs` keeps proving `ci.yml` callers,
  inputs and `expect` shard counts; extend it so the roster equals the
  `ci.yml` callers, the `package.json` scripts and each configuration's
  arguments. `ci.yml` keeps literal inputs (Actions cannot import the roster).
- Rename to `scripts/browser-group-repeat.sh` (and its test under
  `Distribution/tests/test-runner/`), its override variables, and `ci-container.sh --browser-groups`; rename the shared
  selection helpers by group, not dashboard. Update live references
  (`dashboard/tests/README.md`, `Distribution/tests/test-environment.md`,
  `Distribution/tests/ci/ci-container.md`). Leave `docs/maintainer/` records,
  `DearDough.md`, findings and
  `Distribution/tests/support/fixtures/node-suite-ci-runs/` as recorded.
- Keep the duplicated workflow setup steps (anchors do not cross workflow
  files); guard them per file instead. `Distribution/tests/native-harness/native-setup.sh` is 239 lines:
  move its workflow assertions into a check that evaluates `ci.yml` and
  `browser-test-group.yml` separately, such as
  `Distribution/tests/ci/ci-container-workflow.sh` (84 lines), without growing
  either past 250.
- Edited files near the limit: `dashboard/tests/README.md` (248),
  `proofRecordRun.ts` (223).
  Renames and derivations must not grow them past 250. `groupRunnerExamples.ts` keeps
  only each group's example spec and grep, keyed to roster entries.
- ADRs: [0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
  supports group names over dashboard names;
  [0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  evidence distinctions are untouched (no proof entry, part or reader change);
  [0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md) bounds
  the gain to fewer coordinated edits with equal protection. No conflict.

## Decisive premises

| Premise and consuming observation | Result and remainder |
| --- | --- |
| Current roster copies (slice 1) | `git grep` at `bda0a659b`, repeated at `3cd26c333` on 2026-11-15, found the locations in finding 1; other hits for the four prefixes are tests that name one group's setting as a case input. |
| Bash helpers can read a dependency-free module (slice 1) | `node --input-type=module -e 'await import("./dashboard/tests/support/runnerConfig.mjs")'` printed `runnerVariables("OPEN_DOUGH_E2E")` in 0.17 s without side effects, 2026-11-15 at `3cd26c333`; the roster module itself is new. |
| Selection baseline to preserve (both slices) | Native `--list --reporter=list` at `3cd26c333`, 2026-11-15: E2E 820 tests in 422 files, integrated 230 / 113, frontend 359 / 147, backend 1,571 / 493. Trunk conversions move these between groups, so execution retakes them on its starting revision and compares after each slice against that. |
| Focused proof runs green before edits (both slices) | At `3cd26c333`, 2026-11-15, load 5-20, AC: `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i bash scripts/test.sh Distribution/tests/support/ci-browser-groups.test.mjs Distribution/tests/support/browser-group-shards.test.mjs Distribution/tests/test-runner/dashboard-repeat.sh Distribution/tests/ci/ci-container.sh Distribution/tests/ci/ci-container-workflow.sh Distribution/tests/native-harness/native-setup.sh Distribution/tests/support/local-test-suite-focused-runners.test.mjs` exit 0 (27.8 s); `npx playwright test --config dashboard/backend.playwright.config.ts backend-tests/runtime/runner-ownership.spec.ts backend-tests/intent/proof-record-entry.spec.ts --workers=2 --reporter=list` 7/7 (30.6 s). |

## Ordered slices

### 1. Derive every browser test group consumer from one roster
Type: Structure
Status: planned
Proof: First extend nested-proof isolation so a proof subprocess started with
every group's split, proof record and times inherited from the parent
environment (not passed as explicit child env) receives none of them. Record
its result on the current hard-coded filter before deriving it; it must pass
there and after the filter reads the roster. Extend `ci-browser-groups.test.mjs` to tie the
roster to `ci.yml`, `package.json` and the configurations, and add a
negative case that a roster entry missing from `ci.yml` fails it. Then run the
focused command above with the renamed repeat test, the backend pair above,
the native `--list` counts (equal to those retaken at the starting revision), `npm run lint` and
`npm run typecheck:dashboard`.

Structure: Replace the copies in finding 1 with roster reads and apply the
renames in finding 2 with their live references. The repeat helper refuses a
command outside the roster and clears every roster group's split and
deadline; the container diagnostic runs each roster group's command.
`runner-ownership.spec.ts` keeps its per-group spec/grep cases, with
`groupRunnerExamples.ts` reduced to those examples keyed to roster entries. No selection, setting name, output path, CI input or proof entry
changes.

### 2. Guard each CI producer's setup and correct placement guidance
Type: Structure
Status: planned
Proof: Move the workflow-setup expectations out of
`Distribution/tests/native-harness/native-setup.sh`
so each of `ci.yml` and `browser-test-group.yml` must state its bounded Node,
npm and Chromium acquisition, deadlines and failure diagnosis. On an owned
scratch copy, remove `timeout-minutes: 1` from the browser workflow's Node
step and observe the new check fail while the old concatenated check passed;
restore. Run `bash scripts/test.sh
Distribution/tests/native-harness/native-setup.sh
Distribution/tests/ci/ci-container-workflow.sh Distribution/tests/ci/ci-container.sh`
and `npm run lint`.

Structure: Replace `dashboard/tests/README.md`'s "one suite, run and sharded
together" with the independent groups, and route a case needing the real
server, Git or a synthetic host to an E2E workflow or a Dashboard Backend Test
boundary check, as `e2e/README.md` already states. State that an
E2E spec no shard pattern lists runs in the remainder shard (observed
2026-11-28: `launches/released-installation-preparation.spec.ts` ran in shard
6, not the planned shard 1). Keep the interim group's
existing description, and end the README at 250 lines or fewer.

## Verification and delivery gates

Follow [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
as written, including failures attributed to earlier work and CI failures on
published revisions. Before test edits run the installed
`test-entry-rules.mjs` on the exact paths; MakeMe applies to `Distribution/tests/` and the
dashboard roots, page objects to the browser roots. No wall-clock sleeps,
`test.slow()` or suite/file/group/hook timeouts. Trace removed names and
literals with the installed consumer-trace tooling; run the independent
post-change refactor before each commit. No whole local suite is required:
`runner-ownership.spec.ts` drives every group by npm and direct
configuration, and hosted CI runs all four producers on the published
candidate, which is the all-group proof. Local gate: from a fully awake macOS
machine on AC use `caffeinate -s -i`; on battery plug in or use lid-open
`caffeinate -i` and read the sleep log.
Inspect load and memory before the browser runs.

## Plan concern assessment

Refinement was not needed: two behavior-preserving slices, each with one
concept, an existing proof seam and a short loop. No remaining slice-specific
concern was found. This correction is planned only; it grants no Take or
execution.
