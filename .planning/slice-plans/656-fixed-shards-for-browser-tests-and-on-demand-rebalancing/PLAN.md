# Fixed shards for browser tests and on-demand rebalancing

**Identity:** SEED-381#fixed-shards-for-browser-tests-and-on-demand-rebalancing
**Source:** [Fixed shards for browser tests and on-demand rebalancing](../../seeds/SEED-381-fixed-ci-test-shards.md#fixed-shards-for-browser-tests-and-on-demand-rebalancing)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Maintainers rebalance any CI test group's shards only on request. The four
browser groups' jobs in `.github/workflows/ci.yml` declare each shard's spec
files as repository-relative glob patterns, the last shard runs the rest, and
each group's configuration selects its shard through the module that already
reads the `distribution-tests` matrix. The duration lists, the deal, its
preview and refresh, and every passage about them are removed. One read-only
script reports a group's shard totals and slow files from recent `main` runs
and proposes one pattern change as a `ci.yml` diff; a private maintainer skill
says when and how to use it.

Exclusions: shard counts, deadlines, `scripts/ci-job-times.sh` and the
job-count rule; declaring a shard as a Playwright project; the per-spec times
reporter's output form; more than one proposed change per invocation; released
`CHANGELOG.md` entries and `.planning/done/`.

## Settled premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Glob matching of folder and file-name patterns needs no package | slices 1 and 4 | `node -e` with `require("node:path").matchesGlob` on Node 24.21.0 (`.node-version`) in this workspace at `4468af0ac`, 2026-11-16 | `e2e/sessions/agent-*` matches `e2e/sessions/agent-a.spec.ts` and not `session-a.spec.ts`; `dashboard/backend-tests/launches/**` matches a nested file; `dashboard/tests/navigation/{board,story}-*` matches `board-a.spec.ts` |
| Every group's times artifacts of a successful `main` run are downloadable and hold `<seconds><TAB><file>` rows | slices 2 and 7 | `gh run download 43796945648 -p '*-times-*'` into the job's scratch directory, 2026-11-16 | 17 artifacts: `e2e-times-1..6`, `dashboard-integrated-times-1..4`, `dashboard-frontend-times-1`, `dashboard-backend-times-1..3` (each `browser-times.txt`) and `test-times-1..3` (`test-times.txt`). Browser labels are relative to the configuration's directory (`runtime/…` under `e2e/`, `backend-tests/…` under `dashboard/`); Distribution labels are repository-relative |
| A shard's test step tracks its spec-seconds | slices 4 and 5 | the same run's artifacts and `gh run view 43796945648 --json jobs`, 2026-11-16 | E2E shards of 724, 690, 832, 720, 969 and 686 spec-seconds ran 192, 185, 220, 193, 259 and 186 s; backend 679, 676 and 1,013 ran 185, 185 and 270 s; about 3.7 spec-seconds a second. The dealt shards differ by up to 1.4 times within one run, so runner speed, not the deal, sets the spread |
| Folder and file-name patterns can carry the load evenly | slice 4's starting shards | per-folder and per-prefix sums of that run's artifacts | E2E 4,622 spec-seconds (even 770): `launches/agent-*` 634, `sessions/agent-*` 436, `intent` 579, `observation` 536, `review` 489, `stories` 330, `terminals` 230, `configuration` 200, `launches/responsive-*` 188, `runtime` 177. Backend 2,368 (even 789): `intent` 498, `launches` 480, `sessions` 405, `observation` 294, `usage-history` 241, `runtime` 211, `review` 157, `terminals` 57, `configuration` 23. Integrated 684 (even 171): `intent` 187, `navigation` 496. Remainder: the grouped shards have not run together on CI; slice 5 observes them |
| The deal's code has these importers | slices 4 and 6 | `git grep` for `share-deal`, `share-preview`, `duration-list`, `test-shares`, `formatTimes`, `readDurationList`, `durations` at `4468af0ac`; a deleted module fails its importers at load, so the import list is the consumer list | Production: `dashboard/tests/support/testFiles.mjs` (deal), `dashboard/tests/support/specTimes.ts` (`formatTimes`), the four configurations and `runnerConfig.mjs` (`durations` argument), `proofRecordRun.ts`, `groupRunnerExamples.ts`. Tests: `Distribution/tests/support/{browser-group-shards,dashboard-test-files,duration-list,share-deal,share-preview,test-shares}.test.mjs`, `browserGroupConfigs.mjs`, `job-duration-list.mjs`, `jobDurationTestData.mjs`, `makeMe.mjs`, `dashboard/backend-tests/runtime/dashboard-scheduling.spec.ts:166`, `dashboard/backend-tests/intent/proof-record-entry.spec.ts:50`. `Distribution/tests/helpers/copy-runner.bash` copies `share-deal.mjs` and `duration-list.mjs` into every runner fixture |
| CI tests read each browser job's `shards` input as a JSON array on one line | slice 4's declaration form | `Distribution/tests/support/ci-proof-action-fixtures.mjs:68-76,113` and `browserGroupConfigs.mjs` | `callerInputs` reads `^ {6}name: value` lines and `JSON.parse(inputs.shards).length` gives the part count; `shards: "[1, 2, …]"` stays, and more-indented lines of a block input are ignored by that reader |
| A reusable workflow accepts a declared multi-line string input that no step reads | slice 4 | not observable locally | Open; slice 5 is its early probe: a refused workflow fails the first pushed run before any job starts |

## Outside-in proof and local gates

- Focused proof runs through the runner: `bash scripts/test.sh <paths>` with
  Homebrew bash 5 first on `PATH`. Browser specs run through their group's
  npm command with the spec path.
- Slice 6 runs the whole Distribution suite once, `caffeinate -s -i npm test`
  on AC power from a fully awake machine
  ([machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)),
  because it changes `Distribution/tests/helpers/copy-runner.bash`, which
  every runner fixture loads. The browser groups' whole runs are CI's.
- The delivered revision's shard jobs prove every spec runs once: for each
  group, the `<group>-times-<shard>` artifacts name each discovered spec file
  in exactly one shard.
- Failures and flakes follow the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

| Promise | Owner |
| --- | --- |
| A new folder's spec runs once, in the last shard, with no list or preview step | 1, 4 |
| A new spec under a named folder runs in the shard naming it | 1, 4 |
| Overlapping patterns fail the configuration naming the file and both shards | 1, 3 |
| A pattern matching no spec fails the configuration naming it | 1, 3 |
| `<prefix>_SPLIT=i/n` locally runs CI's shard i | 3, 4 |
| A one-shard group declares no pattern | 1, 4 |
| Times artifacts kept 90 days | 4 |
| Each group's slowest shard no slower than under the deal | 5 |
| No duration list, deal, preview or refresh remains, nor text about them | 6 |
| Totals per shard, untimed files apart, and slow files for a chosen group | 2 |
| An older layout's runs still count; no usable run fails saying so | 2 |
| The Distribution suite gets the same report and proposal | 2, 7 |
| One smallest change as a `ci.yml` diff, nothing written; balanced shards print no diff | 7 |
| A private skill says when and how to rebalance | 8 |

## Ordered slices

### 1. Read any group's shards from the workflow
Type: Structure
Status: done
Proof: a new `Distribution/tests/support` node test over workflow text and
small label sets; `test-share-matrix.test.mjs` and `test-runner-split.sh`
unchanged and green.

`scripts/test-share-matrix.mjs` reads a named job's shards instead of only
`distribution-tests`: that job's matrix as today, or a browser group's caller
job, whose `shards: "[1, 2, …]"` input lists the shards and whose block input
gives each shard but the last its space-separated patterns:

```yaml
      shards: "[1, 2, 3]"
      specs: |
        1: dashboard/backend-tests/launches/** dashboard/backend-tests/runtime/**
        2: dashboard/backend-tests/sessions/**
```

Both forms return the same `{ file, shares, patterns }`, so `selectShare` and
its two refusals stay the one rule. A one-shard job needs no `specs`. The
existing refusals (a shard outside the list, patterns on the last shard, a
missing or repeated shard) apply to both forms. The new cases go in their own
test file (`test-share-matrix.test.mjs` is 230 lines); if the module passes
250 lines, the two declaration readers move to their own module and selection
stays. The Node runner's CLI and behavior do not change. Enables slices 2
and 3.

### 2. Report a group's shard totals from recent main runs
Type: Behavior
Status: planned
Proof: a new `Distribution/tests/ci` check with a `gh` stand-in serving
fixture runs and artifacts, as `Distribution/tests/ci/ci-job-times.sh` does,
over a fixture workflow and file tree; one unpaid read-only run against
GitHub for `distribution-tests`, its output recorded in Learnings.

Behavior: a group's job id (`distribution-tests`, `e2e`,
`dashboard-integrated`, `dashboard-frontend`, `dashboard-backend`) →
`node scripts/ci-shard-balance.mjs <group>` → it lists the last successful
`ci.yml` runs on `main` (five by default), downloads that group's times
artifacts into a temporary directory it removes, takes each file's median
seconds across the runs that timed it, and prints each shard's total under the
patterns now in `ci.yml` with the even total, the discovered files no run
timed, and the files that alone exceed a tenth of the even total. A run
without that group's artifacts is skipped and counted as skipped; with no
usable run, or when `gh` fails, it says why and exits 1. Files a run timed
that are no longer discovered are ignored. Discovery is the group's own: the
spec files under the job's `root` for a browser group, `scripts/test-jobs.sh`'s
unsplit listing for Distribution; browser labels gain their configuration
directory to become repository-relative. The script writes nothing outside
its temporary directory.

### 3. Select a browser shard from declared patterns
Type: Behavior
Status: planned
Proof: `Distribution/tests/support/dashboard-test-files.test.mjs` gains cases
over a fixture directory and fixture workflow: each shard's files, the last
shard's rest, both refusals with a split and without one, a malformed split,
and the production-chain projects partitioning the selected files.

Behavior: a workflow whose job declares patterns, and a selection naming that
workflow and job → `dashboardTestMatch` and `dashboardTestProjects` with
`<i>/<n>` return exactly shard i's files from slice 1's module; an `<n>` other
than the declared count is refused; without a split every file is returned
after the same validation. A selection that names no job, as fixture runs
use, returns every file. Interim: the real configurations still pass
`durations` and deal by their lists until slice 4 replaces that path.

### 4. Run CI's browser shards from the workflow
Type: Behavior
Status: planned
Proof: `browser-group-shards.test.mjs` rewritten: every actual spec of each
group in exactly one of its CI shards, and E2E's two projects partitioning
each shard; `ci-browser-groups.test.mjs` and the CI proof checks green;
`OPEN_DOUGH_E2E_SPLIT=2/6 npx playwright test --config e2e/playwright.config.ts --list`
lists only the second shard's files; `dashboard-scheduling.spec.ts`,
`proof-record-entry.spec.ts` and `spec-times.spec.ts` green through
`npm run test:dashboard:backend -- <spec>`; slice 2's script run on the
working tree for each group, totals recorded in Learnings.

Behavior: each browser job in `ci.yml` declares its `specs` →
`<prefix>_SPLIT=<i>/<n>` → the group's configuration runs that shard's
files. `browser-test-group.yml` declares the `specs` input and keeps
`<group>-times-<shard>` for 90 days. The four configurations,
`prepareFocusedRun`, `proofRecordRun.ts` and `groupRunnerExamples.ts` name
the group's job in place of `durations`; the deal call leaves
`testFiles.mjs`. The starting shards, to be confirmed with the script before
the push:

- `e2e`: 1 `e2e/launches/agent-*` `e2e/configuration/**`; 2
  `e2e/sessions/agent-*` `e2e/stories/**`; 3 `e2e/intent/**`
  `e2e/runtime/**`; 4 `e2e/observation/**` `e2e/terminals/**`; 5
  `e2e/review/**` `e2e/launches/responsive-*`; 6 the rest (about 834, 766,
  756, 766, 677 and 823 spec-seconds in run 43796945648).
- `dashboard-backend`: 1 `launches/**` `runtime/**` `review/**`; 2
  `sessions/**` `observation/**` `terminals/**` `configuration/**`; 3 the
  rest, each under `dashboard/backend-tests/` (about 848, 779 and 739).
- `dashboard-integrated`: 1 `dashboard/tests/intent/**`; 2 and 3 groups of
  `dashboard/tests/navigation/<prefix>-*` chosen from the script's report;
  4 the rest.
- `dashboard-frontend`: one shard, no pattern.

The `ci.yml` and workflow comments say what the declaration owns.

### 5. Settle the shards from the story's CI runs
Type: Behavior
Status: planned
Proof: two CI runs of the delivered revision or its successors; each shard's
test-step seconds and each group's artifact file counts recorded in
Learnings.

Early probe for the unused-input and wall-time premises. Before slice 4's
push, record `bash scripts/ci-job-times.sh`'s highest slowest-job seconds for
each group as that group's bound. After the push, a workflow refused for its
`specs` input stops here: slice 4's declaration changes to a one-line input
and is pushed again. Read each shard's test step from two runs. Keep a
group's shards when its slowest test step is within the bound in both.
Otherwise move one pattern toward the fastest shard, push and read again;
after two moves that leave a group over its bound, stop and record the
figures for a decision. Confirm from the artifacts that each group's shards
name every discovered spec file once.

### 6. Remove the deal, the duration lists and their references
Type: Structure
Status: planned
Proof: the whole Distribution suite once under the local gate above;
`git grep -n -i -E "longest-first|share-deal|share-preview|test-shares|duration.list|durations:"`
returns only `CHANGELOG.md` and `.planning/done/`; `spec-times.spec.ts`
green.

Delete `e2e/longest-first*`, `dashboard/*.longest-first*`,
`scripts/share-deal.mjs`, `scripts/share-preview.mjs`,
`scripts/test-shares.mjs`, and their tests
(`share-deal`, `share-preview`, `test-shares`, `duration-list` and the deal
cases of `dashboard-test-files`), with `job-duration-list.mjs`,
`jobDurationTestData.mjs` and their `makeMe.mjs` entries when nothing else
uses them. `scripts/duration-list.mjs` keeps only what the times reporter
needs (`formatTimes` and its helpers), under a name that says so, and
`specTimes.ts` imports it there. `copy-runner.bash` stops copying the deleted
modules. Rewrite `dashboard/tests/shards.md`'s split section as the declared
shards and the two refusals, drop its preview and refresh passages and the
duration-list column, and correct every other passage: `dashboard/tests/README.md`
(252 lines; the removal brings it under 250), the backend, frontend and E2E
READMEs, `Distribution/tests/README.md`, `test-data-architecture.md`,
configuration and workflow comments, `dashboard/tests/fixtures/observed-runs-ci.yml`,
`docs/maintainer/dashboard-test-timings.md` and
`dashboard-weight-timings.md`, and the duration-list mentions in
`SEED-300`, `SEED-334` and plans 617 and 648. Delete DD-279's section and
priority line from `ProjectFindings.md` (480 lines) and its retained detail
from `docs/maintainer/project-test-findings.md` (356 lines), and the
`docs/maintainer/findings/` and `project-findings-history.md` passages that
give the deal as the current response; those catalogs' seam is one finding
per section, and the edit removes whole sections along it.

### 7. Propose the smallest pattern change
Type: Behavior
Status: planned
Proof: slice 2's check gains fixtures for an uneven group (a diff moving one
pattern, and one taking a folder out of the rest), an even group (no diff)
and Distribution's matrix form; `git apply --check` accepts each printed
diff against the fixture workflow, and the workflow file's bytes are
unchanged after the run.

Behavior: uneven totals → the same command → after the report it prints one
unified diff to `ci.yml`: the single change, among moving one existing
pattern to another shard and giving a shard one folder or file-name-prefix
pattern out of the last shard's rest, that leaves the lowest slowest-shard
total. It prints the totals the change would give. When the best change
lowers the slowest shard by less than a twentieth of the even total, it says
the shards are balanced and prints no diff. Every candidate passes slice 1's
validation before it is proposed.

### 8. Rebalance on request through a maintainer skill
Type: Behavior
Status: planned
Proof: the skill's behavior review under
[author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md);
the installer's payload checks green, showing the skill is not distributed.

Behavior: a maintainer asks to rebalance a group's CI shards → the agent
finds `.agents/skills/rebalance-ci-shards/SKILL.md` (with the Claude Code
discovery pointer), runs `node scripts/ci-shard-balance.mjs <group>`, shows
the totals, slow files and proposed diff, applies the diff only when the
maintainer accepts it, and names the next `main` runs as the check. The
skill sends a job-count question to `scripts/ci-job-times.sh`.
`dashboard/tests/shards.md` and `Distribution/tests/runner-settings.md` link
the skill where they say how shards are changed.

## Current decisions

- The settings stay `<prefix>_SPLIT=<i>/<n>`; job names, proof parts,
  artifact names and the `shards` JSON input do not change.
- `scripts/test-share-matrix.mjs` stays the one reader and selector for all
  five groups. A browser group is found by its job id.
- The script lives at `scripts/ci-shard-balance.mjs`, beside
  `scripts/ci-job-times.sh`, so the suite lints and tests it; the skill only
  points at it.
- Totals are spec-seconds or job-seconds, not wall time, and medians across
  runs absorb runner-speed differences of 1.4 to 1.7 times between runs.
- Slice 5's failure to fit a group stops slice 6 only for that group's
  decision; removal does not depend on which patterns win.

## Readiness and sizing

Refinement not needed: eight slices, each one outcome with one proof loop;
slice 6 is deletion bounded by the importer observation above. Remaining
slice-specific concerns: none identified. The unused-input and wall-time
premises are bounded by the early probe in slice 5.

## Learnings

- Slice 1: the readers passed 250 lines, so `scripts/test-share-declaration.mjs`
  reads both declaration forms (`readShareDeclaration(text, file, job)`) and
  `scripts/test-share-matrix.mjs` keeps selection and the CLI.
  `Distribution/tests/helpers/copy-runner.bash` copies the new module into
  every runner fixture. Accepted proof: `node --test
  Distribution/tests/support/test-share-workflow.test.mjs
  Distribution/tests/support/test-share-matrix.test.mjs`, `bash scripts/test.sh`
  over those two, `test-runner-split.sh`, `test-runner-bash.sh` and the
  copy-runner consumers.
