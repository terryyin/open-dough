# Dashboard shards

How CI runs the dashboard suite as shard jobs: the split that selects each
shard's spec files, the times each shard keeps for refreshing
`longest-first`, and the deadline each shard runs under. The
[README](README.md) owns the strategy and how the suite runs as a whole; the
Node suite's shares are in [tests/test-shares.md](../../tests/test-shares.md).

## The split

CI sets `OPEN_DOUGH_DASHBOARD_SPLIT=i/n` to select share `i` of `n` whole
spec files. `longest-first` orders known files by recorded hosted duration;
unlisted specs follow sorted, and that order is dealt round-robin across
shares. CI currently uses twelve shares and runs the dashboard type-check
once in the last share, whose recorded browser load is smallest. Stale and
repeated list entries are ignored. With the variable unset,
`npm run test:dashboard` keeps running the whole suite. Independent proof
subprocesses choose their own selection; their harness
(`support/proofRecordRun.ts`) removes the inherited split before launching
them.

## Each shard's times

Each CI shard sets `OPEN_DOUGH_DASHBOARD_TIMES` to a file the quiet
reporter writes when the run ends, however it ended (`support/specTimes.ts`):
one `<seconds><TAB><file>` line per spec file that ran, longest first (equal
seconds bytewise by file), the file's seconds being the sum of its tests' own
durations to a tenth and `<file>` its path relative to this directory, the
label `longest-first` carries. A failed or deadline-ended shard still records
what completed; a `--list` run writes nothing, and a run without the variable
writes no times file. CI keeps the file for seven days as artifact
`dashboard-times-<shard>`, under the same condition as the Playwright report,
and the twelve artifacts of one run are the source `longest-first` is
refreshed from (`gh run download RUN_ID -p 'dashboard-times-*'`), keeping the
seconds beside the labels. Its form is the Node runner's `test-times-<share>`
form, so one refresh procedure serves both lists.

## The deadline

CI records `OPEN_DOUGH_DASHBOARD_DEADLINE_MS`, the epoch 320 seconds
after the shard job starts, and the config turns what remains of it into
Playwright's `globalTimeout` (`support/suiteDeadline.mjs`); the build counts
against it, and local runs without the variable are unbounded. A shard that
cannot finish by then fails naming the deadline (`Timed out waiting`), still
within the job's 6 minutes, and its kept report holds the completed
failures' traces and error context and lists unfinished tests as skipped.
Like the shell suite's `tests/time-budget`, the 320 seconds and the job's
`timeout-minutes` are a reviewed ceiling: a shard that reaches the deadline
is made faster or rebalanced, not given more time.
