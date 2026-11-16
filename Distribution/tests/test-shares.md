# Test shares

CI runs the suite as split jobs, each with `OPEN_DOUGH_TEST_SPLIT=<i>/<n>` set
to its share; each fails on its own share's failures or deadlines and
keeps its times for seven days as workflow artifact `test-times-<i>`.
`scripts/test-shares.mjs` owns which jobs each share runs and in which order.

Default discovery combines guidance checks in `Distribution/tests/` and tool
checks in `Distribution/evaluation/tests/`. All three CI shares use that same
discovery and allocator; every selected file belongs to exactly one share.
The focused `npm run test:evaluation` command filters this same discovery to
tool checks. Neither command discovers operational `src/`, `cases/`, fixtures
or nested feature support as jobs. Named files remain one scheduled job each.

## The deal

Duration lists may keep their ordinary TSV rows in named parts. Leading
`# Include: <relative-path>` lines in the index name those files; each part
contains rows, not another index. Reading combines all rows before this deal.
Refresh keeps known labels in their existing parts, writes new labels in the
index, and updates each source line. Single-file lists and timing artifacts
keep their existing form.

`Distribution/tests/longest-first` records each job's seconds from one CI run, one
`<seconds><TAB><label>` line per job, longest first, the form the runner's
times file prints; `#` lines are its header. For a split, `scripts/test-jobs.sh`
hands the discovered jobs, that list and the split to `scripts/test-shares.mjs`
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
dealt into its shards by the same rule, and `preview --spec-dir` shows that
deal before a push
([dashboard/tests/shards.md](../../dashboard/tests/shards.md#preview-before-pushing)).

`OPEN_DOUGH_TEST_SPLIT=<i>/<n>` runs only share `i` of `n` of that deal, so
every job lands in exactly one share whatever order the file system lists the
tests in, and a failure or time is reported only for the share's own jobs. A
malformed value, or `i` outside `1..n`, fails the run naming the value before
any job starts. Unset, every job runs in bytewise path order.

## Refresh the duration list

Refresh `Distribution/tests/longest-first` from a recent successful `main`
run's artifacts, every job. Observed seconds are scaled to the existing list's
runner speed (divided by the run's factor against that list); when the list
does not yet exist or no measurable common job is available, times stay as
observed:

```sh
gh run download RUN_ID -p 'test-times-*' -D DIR
node scripts/test-shares.mjs refresh --list Distribution/tests/longest-first \
  --source 'run RUN_ID at REVISION, DATE' DIR/test-times-*/test-times.txt
```

The refresh keeps the header and records the source in its `# Source:` line,
naming the runner factor or that it was unavailable.

## Proof

`Distribution/tests/support/share-deal.test.mjs` proves the deal's rules on small inputs,
`Distribution/tests/support/test-shares.test.mjs` the share and refresh commands,
`Distribution/tests/support/share-preview.test.mjs` the `--spec-dir` preview, and
`Distribution/tests/test-runner/test-runner-split.sh` that the runner's shares follow it. The
dashboard's spec-file shards use the same allocator through
`dashboard/tests/support/testFiles.mjs`
([dashboard/tests/shards.md](../../dashboard/tests/shards.md)).
