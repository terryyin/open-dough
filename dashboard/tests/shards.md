# CI shards of the browser test groups

How CI runs each browser test group as its own shard jobs: the spec files
each shard declares, the times each shard keeps, the deadline each shard runs
under, and how many jobs each group keeps. The
[README](README.md) owns the groups and how each runs as a whole; the
Distribution suite's shares are the `distribution-tests` matrix in
`.github/workflows/ci.yml`
([runner settings](../../Distribution/tests/runner-settings.md)).

## The producers

`.github/workflows/ci.yml` gives each group one job calling
`.github/workflows/browser-test-group.yml` with the group's own inputs: its
npm command, settings prefix, root (its outputs and its CI proof entry),
shard matrix and each shard's spec patterns.
The shared workflow holds no group's value, so changing one group's shards or
settings leaves the others' selection, settings and timing untouched
(`Distribution/tests/support/ci-browser-groups.test.mjs`).

| Job | Command | Settings prefix | Shards |
| --- | --- | --- | --- |
| `e2e` | `npm run test:e2e` | `OPEN_DOUGH_E2E` | 6 |
| `dashboard-integrated` | `npm run test:dashboard:integrated` | `OPEN_DOUGH_DASHBOARD_INTEGRATED` | 4 |
| `dashboard-frontend` | `npm run test:dashboard:frontend` | `OPEN_DOUGH_DASHBOARD_FRONTEND` | 1 |
| `dashboard-backend` | `npm run test:dashboard:backend` | `OPEN_DOUGH_DASHBOARD_BACKEND` | 3 |

These counts make 19 jobs: 14 browser jobs, three Distribution shares, one
`lint` job and one proof job, 18 of them at once before the proof job against
the account's 20. Lint and the dashboard type-check run in `ci.yml`'s `lint`
job, each as its own step with its own outcome, under that job's own setup
deadline and 6 minutes; no group's shard runs them, and `ci-proof` does not
wait for it.

The sixth E2E shard came from integrated after the 320-second cutoff of E2E
shard 2/5 in
[run 43681477553](https://github.com/terryyin/open-dough/actions/runs/43681477553).
Specs moving from integrated into `e2e/` had grown E2E from 3,175 to 4,014
observed test-seconds a run, about 1,100 spec-seconds a shard at five shards.
That shard's runner took 1.4 to 1.9 times trunk's seconds on every spec,
1,111 test-seconds in all, and five cases were unfinished at the deadline;
trunk's
[run 43679953950](https://github.com/terryyin/open-dough/actions/runs/43679953950)
had already finished two E2E shards in 287 and 288 seconds. This capacity move
keeps tests, workers, the job count and reviewed deadlines; it claims no
minimum count or whole-workflow speedup; [the job count](#the-job-count)
sizes the layout.
Each `ci-proof` declaration (`<entry>=<shards>:case`) follows its matrix.

## The job count

Each group keeps the smallest job count whose slowest job stays inside the
deadline in recent `main` runs. A sizing decision reads the report, from the
repository root:

```sh
bash scripts/ci-job-times.sh
```

It reads the last 10 successful `ci.yml` runs on `main` and prints one line
per group (the four browser groups and Distribution Tests) with its job count,
its slowest job's seconds against the deadline and a verdict: `could drop one`
when one job fewer would stay inside the deadline with a reserve for
runner-speed variation, otherwise `keep`. A last line gives the runs' runner
wait and verdict time. The script's header comment states each calculation.
The decision needs no matched-run comparison, new measurement run or copied CI
data.

Remove a job when the report says `could drop one`; the following `main` runs
are the check, and a deadline failure restores the count. Add a job only after
a job of that group is ended by the deadline on `main` and neither moving
spec patterns between its shards nor a faster spec restores its headroom. Verdict time is never a
reason: it is the slowest job plus runner wait, the account runs 20 jobs at
once, and more jobs lengthen the wait. Runner demand below this layout comes
from fewer test-seconds, as checks leave Dashboard Integrated UI Test or the
suite gets faster; the report then shows when a group's count can follow.

Decision, 2026-11-15: the layout stays at 18 jobs. The report read the 10
successful `main` runs 43693339004 to 43712947370 of that day and said `keep`
for every group: one job fewer would overrun the deadline for Distribution
Tests, backend and integrated, E2E's five-job projection fits the deadline but
not its reserve, and the frontend job is already one.

Decision, 2026-11-16: lint and the type-check leave the frontend shard for the
`lint` job, making 19 jobs. On a slow runner they took 150 of the frontend
shard's 450 seconds and its suite was ended by the deadline two spec files
short; the group counts stay as they were.

## The split

A group's CI shard sets its `<prefix>_SPLIT=i/n` to select shard `i` of `n`.
The group's job in `.github/workflows/ci.yml` declares the shards: `shards`
lists them and `specs` gives each shard but the last its repository-relative
glob patterns, folder (`e2e/intent/**`) or file-name prefix
(`dashboard/tests/navigation/board-*`), and the last shard runs the rest. A
one-shard group declares no pattern. `support/testFiles.mjs` finds every spec
file under the group's root recursively, never entering the `test-results/`
and `playwright-report/` output a run writes there while reloading workers
discover again, so a new file needs no registration: it runs in the shard
whose pattern matches it, or in the last shard. The configuration selects its
shard through `scripts/test-share-matrix.mjs`, the selector the Distribution
suite's matrix uses, and refuses before any test is selected a spec that two
shards' patterns match, naming the file and both shards, and a pattern that
matches no spec, naming it, as it refuses a malformed split. With the variable unset, a
group's command runs every spec of its group. Independent proof subprocesses
choose their own selection; their harness (`support/proofRecordRun.ts`)
removes every group's inherited split before launching them.
`Distribution/tests/support/browser-group-shards.test.mjs` proves every spec
file of each group runs in exactly one of its CI shards and both refusals.
A maintainer who asks to rebalance a group uses the
[rebalance-ci-shards](../../.agents/skills/rebalance-ci-shards/SKILL.md)
skill: `node scripts/ci-shard-balance.mjs <group>` reports the group's shard
totals and slowest files from recent `main` runs' times and prints the one
pattern change that most lowers the slowest shard as a `ci.yml` diff, or says
the shards are balanced. The script applies nothing; the skill applies the
diff only when the maintainer accepts it.

Within an E2E Test shard, two complementary native Playwright projects queue
the serial `runtime/production-watcher*.spec.ts` chains before ordinary files.
They share one phase and one global setup: there are no project dependencies,
so the other workers run ordinary checks while a chain builds and replaces its
deployments. The projects partition the existing selected files; they neither
add shards nor repeat tests. The project names are `chromium-deployments` and
`chromium`; a whole-group invocation selects both. The other groups run one
`chromium` project. Locally, the deployment project uses at most one worker,
leaving the remaining global capacity for ordinary checks. CI keeps its
CPU-derived concurrency; this project bound changes no shard, selected file,
case budget or journey.

## Each shard's times

Each CI shard sets its group's `<prefix>_TIMES` to a file the quiet reporter
writes when the run ends, however it ended (`support/specTimes.ts`): one
`<seconds><TAB><file>` line per spec file that ran, longest first (equal
seconds bytewise by file), the file's seconds being the sum of its tests' own
durations plus each executed `beforeAll`/`afterAll` hook once, to a tenth.
Test-scoped setup and teardown are already in each test duration and are never
added a second time. Tests registered through an imported case module count
under the spec file Playwright ran, not the module. `<file>` is its path
relative to the configuration's directory. A failed or deadline-ended shard still records what completed; a
`--list` run writes nothing, and a run without the variable writes no times
file. CI keeps the file for 90 days as artifact `<group>-times-<shard>`
(`e2e`, `dashboard-integrated`, `dashboard-frontend`, `dashboard-backend`),
under the same condition as the Playwright report; `scripts/ci-shard-balance.mjs`
reads these artifacts. Its form is the Node runner's `test-times-<share>`
form.

## The deadline

CI records the group's `<prefix>_DEADLINE_MS`, the epoch 450 seconds after
the shard job starts, and the config turns what remains of it into
Playwright's `globalTimeout` (`support/suiteDeadline.mjs`); the build counts
against it, and local runs without the variable are unbounded. A shard that
cannot finish by then fails naming the deadline (`Timed out waiting`), still
within the job's 8 minutes, and its kept report holds the completed
failures' traces and error context and lists unfinished tests as skipped.
Like the shell suite's run cutoff, the 450 seconds and the job's
`timeout-minutes` are a reviewed ceiling: a shard that reaches the deadline
is made faster or rebalanced, not given more time.
