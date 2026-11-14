# Keep one browser test group roster

**Identity:** SEED-334#keep-one-browser-test-group-roster
**Source:** [Minimal correction story](../../seeds/SEED-334-product-wide-end-to-end-tests.md#keep-one-browser-test-group-roster)

## Goal and scope

Make the set of browser test groups (E2E Test, Dashboard Integrated UI Test,
Dashboard Frontend Test, Dashboard Backend Test) one concept with one home,
product-wide names and current guidance, and guard each CI producer's setup
bounds separately. Behavior-preserving: every group's selection, settings,
outputs, shards, CI proof entries and the interim group stay as delivered.
Excluded: adding or removing a group (the interim group's removal stays with
SEED-334#focus-detailed-dashboard-ui-checks), new runners or CI jobs, Intent
naming (SEED-334#observe-tagged-install-and-read-e2e-proof), speed work, and
rewriting historical records, findings or frozen fixtures.

## Provenance and current findings

The completed execution of
SEED-334#run-and-observe-product-wide-end-to-end-tests (story section and
plan 608 recoverable at `125c45649fa587c78ed7445deff35db87604489d`; claim `a9ddb54a786d7d64d2bf63500f93cec1c9c5952d`) published
`970c8c586`, `27724831f`, `8d6106164`, `cd7da4de9`, `da2581974`, `d21a0ebc5`
and `bda0a659b` on its uncontaminated story branch. Findings were rechecked at
`bda0a659b`:

1. **Group roster repeated.** The four groups' commands and settings prefixes
   are hard-coded in `dashboard/tests/support/proofRecordRun.ts:76` (the
   regex that keeps every group's split, proof record and times out of
   nested proof runs), `scripts/dashboard-repeat.sh:40-42` (accepted
   commands) and `:134-137` (unset settings), `scripts/ci-container.sh:24-28`,
   `tests/support/local-test-suite-fixtures.mjs:54-58` and the `runners`
   array in `dashboard/backend-tests/runtime/runner-ownership.spec.ts`. Only
   `tests/support/browserGroupConfigs.mjs` derives them, from `ci.yml`,
   `package.json` and the configurations. Adding or removing a group (the
   queued interim-group removal) needs coordinated edits, and only the
   backend split is proved absent from nested proof runs
   (`dashboard/backend-tests/intent/proof-record-entry.spec.ts:41-65`;
   `runner-ownership.spec.ts` passes other groups' settings as explicit child
   env, which bypasses the filter).
2. **Dashboard names on product-wide helpers.** `scripts/dashboard-repeat.sh`
   (`DASHBOARD_REPEAT_SUITE`/`_INSTALL`, `dough-dashboard-repeat` work dir) now
   repeats any group including `test:e2e`; `scripts/ci-container.sh
   --dashboard` runs all four groups; `support/testFiles.mjs`
   `dashboardSpecFiles`/`dashboardTestMatch`/`dashboardTestProjects`,
   `support/fullSuiteSelection.mjs` `fullDashboardSuite` and
   `scripts/test-shares.mjs` `listDashboardSpecFiles` serve every group.
3. **Setup guard weakened.** `tests/native-setup.sh:197` concatenates `ci.yml`
   and `browser-test-group.yml` before its presence checks. The browser
   producers' Node/npm/Chromium acquisition steps were copied out of `ci.yml`'s
   YAML anchors in `da2581974`, so either file can drop a one-minute bound,
   deadline or failure diagnosis while the other still satisfies the check.
4. **Stale placement guidance.** `dashboard/tests/README.md:63` still says
   "All four roots are one suite, run and sharded together", written for the
   slice-3 umbrella that `da2581974` retired; `:39` says a case needing the
   real server "stays an integrated journey here", contradicting
   `e2e/README.md` placement and the interim group's purpose.

## Decisions and preserved proof

- One dependency-free roster module beside `runnerConfig.mjs` in
  `dashboard/tests/support/` (the approved shared runner-support owner) lists
  each group's job id, npm command, configuration, settings prefix, root and
  duration list. Configurations, `proofRecordRun.ts`, the repeat helper, the
  container diagnostic and the tests above read it; `runnerVariables` stays
  the one rule for setting names. Do not introduce a runner framework.
- `tests/support/ci-browser-groups.test.mjs` keeps proving `ci.yml` callers,
  inputs and `expect` shard counts; extend it so the roster equals the
  `ci.yml` callers, the `package.json` scripts and each configuration's
  arguments. `ci.yml` keeps literal inputs (Actions cannot import the roster).
- Rename to `scripts/browser-group-repeat.sh` (and its test), its override
  variables, and `ci-container.sh --browser-groups`; rename the shared
  selection helpers by group, not dashboard. Update live references
  (`dashboard/tests/README.md`, `tests/test-environment.md`,
  `tests/ci-container.md`, `tests/longest-first` row label with seconds
  unchanged). Leave `docs/maintainer/` records, `DearDough.md`, findings and
  `tests/support/fixtures/node-suite-ci-runs/` as recorded.
- Keep the duplicated workflow setup steps (anchors do not cross workflow
  files); guard them per file instead. `tests/native-setup.sh` is 250 lines:
  move its workflow assertions into a check that evaluates `ci.yml` and
  `browser-test-group.yml` separately, such as `tests/ci-container-workflow.sh`
  (99 lines), without growing either past 250.
- Edited files near the limit: `scripts/test-shares.mjs` and
  `dashboard/tests/README.md` (250), `runner-ownership.spec.ts` (243),
  `proofRecordRun.ts` (223). Renames and derivations must not grow them past
  250; deriving the `runners` array should shrink the spec.
- ADRs: [0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
  supports group names over dashboard names;
  [0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  evidence distinctions are untouched (no proof entry, part or reader change);
  [0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md) bounds
  the gain to fewer coordinated edits with equal protection. No conflict.

## Decisive premises

| Premise and consuming observation | Result and remainder |
| --- | --- |
| Current roster copies (slice 1) | `git grep` at `bda0a659b` found the locations in finding 1; no other production or support script names the four prefixes. |
| Bash helpers can read a dependency-free module (slice 1) | `node --input-type=module -e 'await import("./dashboard/tests/support/runnerConfig.mjs")'` printed `runnerVariables("OPEN_DOUGH_E2E")` in 0.03 s without side effects, 2026-11-14 at `bda0a659b`; the roster module itself is new. |
| Selection baseline to preserve (both slices) | Native `--list` at `bda0a659b`: E2E 560 tests in 306 files, integrated 611 / 270, frontend 153 / 57, backend 1,411 / 417 (equal to `migration-reconciliation-slice-4.json` cases). |
| Focused proof runs green before edits (both slices) | `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i bash scripts/test.sh tests/support/ci-browser-groups.test.mjs tests/support/browser-group-shards.test.mjs tests/dashboard-repeat.sh tests/ci-container.sh tests/ci-container-workflow.sh tests/native-setup.sh tests/support/local-test-suite-focused-runners.test.mjs` exit 0 (8.9 s, load ~4, AC); `npx playwright test --config dashboard/backend.playwright.config.ts backend-tests/runtime/runner-ownership.spec.ts backend-tests/intent/proof-record-entry.spec.ts --workers=2` 12/12 (19.7 s). |

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
the four native `--list` counts (unchanged), `npm run lint` and
`npm run typecheck:dashboard`.

Structure: Replace the copies in finding 1 with roster reads and apply the
renames in finding 2 with their live references. The repeat helper refuses a
command outside the roster and clears every roster group's split and
deadline; the container diagnostic runs each roster group's command.
`runner-ownership.spec.ts` keeps its per-group spec/grep cases on roster
entries. No selection, setting name, output path, CI input or proof entry
changes.

### 2. Guard each CI producer's setup and correct placement guidance
Type: Structure
Status: planned
Proof: Move the workflow-setup expectations out of `tests/native-setup.sh`
so each of `ci.yml` and `browser-test-group.yml` must state its bounded Node,
npm and Chromium acquisition, deadlines and failure diagnosis. On an owned
scratch copy, remove `timeout-minutes: 1` from the browser workflow's Node
step and observe the new check fail while the old concatenated check passed;
restore. Run `bash scripts/test.sh tests/native-setup.sh
tests/ci-container-workflow.sh tests/ci-container.sh` and `npm run lint`.

Structure: Replace `dashboard/tests/README.md`'s "one suite, run and sharded
together" with the independent groups, and route a case needing the real
server, Git or a synthetic host to an E2E workflow or a Dashboard Backend Test
boundary check, as `e2e/README.md` already states. Keep the interim group's
existing description.

## Verification and delivery gates

Follow [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
as written, including failures attributed to earlier work and CI failures on
published revisions. Before test edits run the installed
`test-entry-rules.mjs` on the exact paths; MakeMe applies to `tests/` and the
dashboard roots, page objects to the browser roots. No wall-clock sleeps,
`test.slow()` or suite/file/group/hook timeouts. Trace removed names and
literals with the installed consumer-trace tooling; run the independent
post-change refactor before each commit. No whole local suite is required:
`runner-ownership.spec.ts` drives every group by npm and direct
configuration, and hosted CI runs all four producers on the published
candidate, which is the all-group proof. Local gate: from a fully awake macOS
machine on AC use `caffeinate -s -i`; on battery plug in or use lid-open
`caffeinate -i` and read the sleep log, per
[machine sleep](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Inspect load and memory before the browser runs.

## Plan concern assessment

Refinement was not needed: two behavior-preserving slices, each with one
concept, an existing proof seam and a short loop. No remaining slice-specific
concern was found. This correction is planned only; it grants no Take or
execution.
