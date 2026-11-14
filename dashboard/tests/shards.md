# CI shards of the browser test groups

How CI runs each browser test group as its own shard jobs: the split that
deals each shard its spec files by recorded duration and its preview, the
times each shard keeps for refreshing the group's duration list, and the
deadline each shard runs under. The [README](README.md) owns the groups and
how each runs as a whole; the Node suite's shares are in
[tests/test-shares.md](../../tests/test-shares.md).

## The producers

`.github/workflows/ci.yml` gives each group one job calling
`.github/workflows/browser-test-group.yml` with the group's own inputs: its
npm command, settings prefix, root (its outputs and its CI proof entry) and
shard matrix.
The shared workflow holds no group's value, so changing one group's shards or
settings leaves the others' selection, settings and timing untouched
(`tests/support/ci-browser-groups.test.mjs`).

| Job | Command | Settings prefix | Duration list | Shards |
| --- | --- | --- | --- | --- |
| `e2e` | `npm run test:e2e` | `OPEN_DOUGH_E2E` | `e2e/longest-first` | 6 |
| `dashboard-integrated` | `npm run test:dashboard:integrated` | `OPEN_DOUGH_DASHBOARD_INTEGRATED` | `dashboard/integrated.longest-first` | 5 |
| `dashboard-frontend` | `npm run test:dashboard:frontend` | `OPEN_DOUGH_DASHBOARD_FRONTEND` | `dashboard/frontend.longest-first` | 1 |
| `dashboard-backend` | `npm run test:dashboard:backend` | `OPEN_DOUGH_DASHBOARD_BACKEND` | `dashboard/backend.longest-first` | 4 |

Shard counts were sized from each group's actual membership and the per-spec
seconds of the last thirteen-shard run (43374366861): about 640, 690, 175 and
640 test-seconds in a group's largest shard, below the former largest shard's
1,015, which ran in 276 s of its 320 s deadline. They bound each shard's time;
they claim no speedup. Each job's `ci-proof` declaration (`<entry>=<shards>:case`)
changes with its matrix in the same change.

## The split

A group's CI shard sets its `<prefix>_SPLIT=i/n` to select shard `i` of `n`
whole spec files of the group. Its duration list, beside its configuration,
records one `<seconds><TAB><file>` row per spec, longest first, with paths
relative to the configuration's directory: `e2e/` for E2E Test (`intent/…`),
`dashboard/` for the three dashboard groups (`tests/…`, `frontend-tests/…`,
`backend-tests/…`). A list may also index named parts with header lines
`# Include: <relative-path>`; the reader combines their rows before the
unchanged deal. The E2E, integrated and backend lists index two parts by
feature folder: `-agents` for `launches/`, `sessions/` and `terminals/`, and
`-project` for the rest. Other `#` lines are comments. `support/testFiles.mjs`
finds every spec file under the group's root recursively, never entering the
`test-results/` and `playwright-report/` output a run writes there while
reloading workers discover again, so a new file needs no registration. It
hands those files, its list and its split to `scripts/share-deal.mjs`, which
deals them by the rule the Node suite's shares follow
([tests/test-shares.md](../../tests/test-shares.md#the-deal)), a spec file
being a job: one the list does not record is dealt after the recorded files
at their median seconds until the list is next refreshed (below). A list line that is not `<seconds><TAB><file>` fails the
configuration naming the file, line and content before any test is selected,
as a malformed split does. CI runs the dashboard type-check once in the lint
job. With the variable unset, a group's command runs every spec of its
group. Independent proof subprocesses choose their own selection; their
harness (`support/proofRecordRun.ts`) removes every group's inherited split
before launching them.

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

### Preview before pushing

Before pushing a change that adds, removes or renames a spec file, preview
the deal CI will run for its group, from the repository root:

```sh
node scripts/test-shares.mjs preview --split-count 6 --spec-dir e2e
node scripts/test-shares.mjs preview --split-count 5 --spec-dir dashboard \
  --root tests --list dashboard/integrated.longest-first
```

`--spec-dir` is the configuration's directory, `--root` the group's root under
it (default `.`), and `--list` its duration list (default
`<spec-dir>/longest-first`). The preview discovers the spec files as the
configuration does and prints each shard's predicted seconds (its `share i/n`
line; the preview's jobs are spec files), then every unrecorded file with its
shard and the assumed seconds. It prints no headroom line: the shard's
deadline (below) is wall-clock under parallel workers, not a sum of
test-seconds, so balanced predictions are what the preview shows. The
predictions use recorded CI seconds, never local timing. A high unrecorded
count means the list is stale; refresh it from a recent `main` run's
`<group>-times-<shard>` artifacts (below), every file of that group. Observed
seconds are scaled to the existing list's runner speed (divided by the run's
factor against that list); when the list does not yet exist or no measurable
common file is available, times stay as observed:

```sh
gh run download RUN_ID -p 'e2e-times-*' -D DIR
node scripts/test-shares.mjs refresh --list e2e/longest-first \
  --source 'run RUN_ID at REVISION, DATE' DIR/e2e-times-*/browser-times.txt
```

The refresh keeps an index's parts and each known spec's part, writes the same
new `# Source:` to each list (naming the runner factor or that it was
unavailable), and keeps new specs in the index until they are organized.
Duration lists and CI timing artifacts retain their ordinary TSV form. No part
changes a spec's recorded seconds or shard assignment.
`tests/support/browser-group-shards.test.mjs` proves each group's deal: every
spec file in exactly one of its group's CI shards and the preview listing a
new spec as unrecorded in the shard the deal gives it;
`tests/support/dashboard-test-files.test.mjs` proves the deal itself and a
malformed list line failing the configuration.

## Each shard's times

Each CI shard sets its group's `<prefix>_TIMES` to a file the quiet reporter
writes when the run ends, however it ended (`support/specTimes.ts`): one
`<seconds><TAB><file>` line per spec file that ran, longest first (equal
seconds bytewise by file), the file's seconds being the sum of its tests' own
durations plus each executed `beforeAll`/`afterAll` hook once, to a tenth.
Test-scoped setup and teardown are already in each test duration and are never
added a second time. Tests registered through an imported case module count
under the spec file Playwright ran, not the module. `<file>` is its path
relative to the configuration's directory, the label the group's duration list
carries. A failed or deadline-ended shard still records what completed; a
`--list` run writes nothing, and a run without the variable writes no times
file. CI keeps the file for seven days as artifact `<group>-times-<shard>`
(`e2e`, `dashboard-integrated`, `dashboard-frontend`, `dashboard-backend`),
under the same condition as the Playwright report, and one run's artifacts of
a group are the source its list is refreshed from, with observed seconds
scaled to the list's runner speed as above. Its form is the Node runner's
`test-times-<share>` form, so one refresh procedure serves every list.

## The deadline

CI records the group's `<prefix>_DEADLINE_MS`, the epoch 320 seconds after
the shard job starts, and the config turns what remains of it into
Playwright's `globalTimeout` (`support/suiteDeadline.mjs`); the build counts
against it, and local runs without the variable are unbounded. A shard that
cannot finish by then fails naming the deadline (`Timed out waiting`), still
within the job's 6 minutes, and its kept report holds the completed
failures' traces and error context and lists unfinished tests as skipped.
Like the shell suite's `tests/time-budget`, the 320 seconds and the job's
`timeout-minutes` are a reviewed ceiling: a shard that reaches the deadline
is made faster or rebalanced, not given more time.
