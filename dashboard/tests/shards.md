# Dashboard shards

How CI runs the dashboard suite as shard jobs: the split that deals each
shard its spec files by recorded duration and its preview, the times each
shard keeps for refreshing `longest-first`, and the deadline each shard runs
under. The
[README](README.md) owns the strategy and how the suite runs as a whole; the
Node suite's shares are in [tests/test-shares.md](../../tests/test-shares.md).

## The split

CI sets `OPEN_DOUGH_DASHBOARD_SPLIT=i/n` to select shard `i` of `n` whole
spec files. `longest-first` records each spec file's seconds from one CI run,
one `<seconds><TAB><file>` line per file, longest first, `<file>` being the
path relative to this directory; `#` lines are its header.
`support/testFiles.mjs` hands the discovered spec files, that list and the
split to `scripts/share-deal.mjs`, the allocator the Node suite's shares use
([tests/test-shares.md](../../tests/test-shares.md)). Recorded files go,
longest first, to the shard with the smallest predicted total (ties to the
lower shard). A file the list does not name, so a new or renamed one, is
unrecorded: unrecorded files follow in bytewise order, each assumed at the
median of the recorded seconds, so a file-set change moves predicted time by
at most that file's duration instead of a block of its sorted neighbours, and
the shards' predictions lie within one spec file's duration of each other.
Listed names that match no spec file are ignored. A list line that is not
`<seconds><TAB><file>` fails the configuration naming the file, line and
content before any test is selected, as a malformed split does. CI uses
twelve shards and runs the dashboard type-check once, in the last shard,
whose predicted browser load the deal keeps within one spec file of the
others. With the variable unset, `npm run test:dashboard` keeps running the
whole suite. Independent proof subprocesses choose their own selection; their
harness (`support/proofRecordRun.ts`) removes the inherited split before
launching them.

### Preview before pushing

Before pushing a change that adds, removes or renames a spec file, preview
the deal CI will run, from the repository root:

```sh
node scripts/test-shares.mjs preview --split-count 12 --spec-dir dashboard/tests
```

It discovers the spec files as the configuration does and prints each shard's
predicted seconds (its `share i/n` line; the preview's jobs are spec files),
then every unrecorded file with its shard and the assumed seconds. It prints no headroom line: the shard's deadline (below) is
wall-clock under parallel workers, not a sum of test-seconds, so balanced
predictions are what the preview shows. The predictions use recorded CI
seconds, never local timing. A high unrecorded count means the list is stale;
refresh it from a recent `main` run's twelve `dashboard-times-<shard>`
artifacts (below), every file, keeping the seconds (the list header repeats
this):

```sh
gh run download RUN_ID -p 'dashboard-times-*' -D DIR
node scripts/test-shares.mjs refresh --list dashboard/tests/longest-first \
  --source 'run RUN_ID at REVISION, DATE' DIR/dashboard-times-*/dashboard-times.txt
```

The refresh keeps the header and records the source in its `# Source:` line.
`tests/support/dashboard-test-files.test.mjs` proves the configuration's
deal: every spec file in exactly one of the twelve shards, their predictions
within one recorded file of each other, a new spec unrecorded in the lightest
shard, and a malformed list line failing the configuration.

## Each shard's times

Each CI shard sets `OPEN_DOUGH_DASHBOARD_TIMES` to a file the quiet
reporter writes when the run ends, however it ended (`support/specTimes.ts`):
one `<seconds><TAB><file>` line per spec file that ran, longest first (equal
seconds bytewise by file), the file's seconds being the sum of its tests' own
durations to a tenth, including tests it registers through an imported case
module (they count under the spec file Playwright ran, not the module), and
`<file>` its path relative to this directory, the label `longest-first`
carries. A failed or deadline-ended shard still records
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
