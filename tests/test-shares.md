# Test shares

CI runs the suite as split jobs, each with `OPEN_DOUGH_TEST_SPLIT=<i>/<n>` set
to its share; each fails on its own share's failures or budget breach and
keeps its times for seven days as workflow artifact `test-times-<i>`.
`scripts/test-shares.mjs` owns which jobs each share runs, in which order, and
previews that deal before a push.

## The deal

Duration lists may keep their ordinary TSV rows in named parts. Leading
`# Include: <relative-path>` lines in the index name those files; each part
contains rows, not another index. Reading combines all rows before this deal.
Refresh keeps known labels in their existing parts, writes new labels in the
index, and updates each source line. Single-file lists and timing artifacts
keep their existing form.

`tests/longest-first` records each job's seconds from one CI run, one
`<seconds><TAB><label>` line per job, longest first, the form the runner's
times file prints; `#` lines are its header. `scripts/test-jobs.sh` hands the
discovered jobs, that list and the split to `scripts/test-shares.mjs`
(`scripts/share-deal.mjs` holds the deal). Recorded jobs go, longest first
(equal seconds bytewise), to the share with the smallest predicted total
(ties to the lower share). A job the list does not name, so a new or renamed
one, is unrecorded: unrecorded jobs follow in bytewise order, each assumed at
the median of the recorded seconds, so a file-set change moves predicted time
by at most that job's duration instead of a block of its sorted neighbours.
The deal is the same whatever order the jobs are discovered in, and the
shares' predicted totals lie within one job's duration of each other. Each
share starts its recorded jobs longest first, then the unrecorded ones, so the
longest job does not start last. Listed names that match no job are ignored.
A list line that is not `<seconds><TAB><label>` fails the run naming the
file, line and content before any job starts. The dashboard's spec files are
dealt into its shards by the same rule
([dashboard/tests/shards.md](../dashboard/tests/shards.md)).

`OPEN_DOUGH_TEST_SPLIT=<i>/<n>` runs only share `i` of `n` of that deal, so
every job lands in exactly one share whatever order the file system lists the
tests in, and a failure or time is reported only for the share's own jobs. A
malformed value, or `i` outside `1..n`, fails the run naming the value before
any job starts. Unset, every job runs, in the deal's order for one share.

## Preview before pushing

Before pushing a change that adds, removes or renames a test file, preview the
deal CI will run, from the repository root:

```sh
node scripts/test-shares.mjs preview --split-count 3
```

It lists the suite's jobs through `scripts/test-jobs.sh` and prints each
share's predicted job-seconds with its headroom to `total-job-seconds` in
`tests/time-budget`, then every unrecorded job with its share and the assumed
seconds. The predictions use recorded CI seconds, never local timing. A high
unrecorded count means the list is stale; refresh it from a recent `main` run's
artifacts, every job, keeping the seconds (the list header repeats this):

```sh
gh run download RUN_ID -p 'test-times-*' -D DIR
node scripts/test-shares.mjs refresh --list tests/longest-first \
  --source 'run RUN_ID at REVISION, DATE' DIR/test-times-*/test-times.txt
```

The refresh keeps the header and records the source in its `# Source:` line.
`OPEN_DOUGH_TEST_DIR=<dir>` and `--test-dir <dir>` preview a substitute
directory with its own list and budget; `--spec-dir <dir>` previews the
dashboard's spec files under that directory instead, with no budget
([dashboard/tests/shards.md](../dashboard/tests/shards.md)); `--list`,
`--budget` and `--labels <file>` (labels one per line) name the inputs
directly, and without a budget the preview prints no headroom.

## Proof

`tests/support/share-deal-recorded-runs.test.mjs` proves the deal on retained
CI runs (`tests/support/fixtures/node-suite-ci-runs/`),
`tests/support/share-deal.test.mjs` its rules on small inputs,
`tests/support/test-shares.test.mjs` the commands, and
`tests/test-runner-split.sh` that the runner's shares follow it. The
dashboard's spec-file shards use the same allocator through
`dashboard/tests/support/testFiles.mjs`
([dashboard/tests/shards.md](../dashboard/tests/shards.md)).
