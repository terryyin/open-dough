# Proof record of a dashboard run

How `npm run test:dashboard` retains the selection and results of one strict
run as a JSON record, and how to read that record (the suite itself:
[README](README.md)).

To retain the selection and results of the same strict run, choose an unused
absolute file path outside `dashboard/test-results/` before invoking it. Its
parent directory must already exist. No record is created unless requested:

```sh
proof_dir=$(mktemp -d)
OPEN_DOUGH_DASHBOARD_PROOF_RECORD="$proof_dir/proof.json" \
  npm run --silent test:dashboard -- quiet-reporter.spec.ts --workers=2
proof_exit=$?
node --input-type=module - "$proof_dir/proof.json" <<'JS'
import { readFileSync } from 'node:fs';
const record = JSON.parse(readFileSync(process.argv[2], 'utf8'));
console.log(JSON.stringify(record, null, 2));
JS
printf 'Strict command exit: %s\n' "$proof_exit"
```

Reading this file executes no tests. Successful reporter output stays silent,
and the normal passing output directory is removed. The compact JSON has
`schemaVersion: 1`, a unique `run.id`, runner PID, start time, working directory,
config path, runner arguments and output directories. `selectedCount` counts
distinct project/location/title selections. Each selection's `executions`
identifies Playwright test IDs, repetition indexes and expected statuses (with
observed outcomes when available); `attempts` identifies
each observed repetition/retry, its start time, and its status/duration when
finished. Repetitions and retries do not inflate the selected count. A skipped
attempt is `skipped`, and a started attempt without a status has no observed
completion. The record contains neither traces nor captured output.

Assess the command exit and the file together: executed passing proof requires
exit 0, valid JSON with the expected schema/run/selection, `phase: "completed"`
and `terminal.strictStatus: "passed"`, plus the observed attempts relevant to
the claim. `terminal.runnerStatus` is Playwright's assertion verdict before
the strict reporter rejects unexpected output; a passed attempt or raw runner
verdict can coexist with strict failure. `--list` records `phase: "listed"`
and no attempts, so its passed verdict establishes selection only. Deadline
or graceful interruption keeps completed attempts separately from unfinished
work and records strict failure. A forced kill after selection may leave a
`running` snapshot without `terminal`; before selection it may leave no file.
Missing, malformed, listed or running evidence never establishes executed pass.

An existing destination is refused without changing its bytes. An invalid,
unwritable or disposable destination, or a failed snapshot update, prints
`Proof record unavailable at ...` separately from test diagnostics and preserves
the underlying strict command exit. Such a run has unavailable or incomplete
evidence even if the command passes. Atomic replacement makes each readable
snapshot complete JSON; it does not reconstruct an uncatchably killed run.
The reporter option belongs to this config's invocation, so nested custom
Playwright configs cannot overwrite their outer run's requested record.
Use a different path for every concurrent or later invocation. Keep the file
as long as needed and remove its caller-owned directory after reading it:
`rm -r "$proof_dir"`. There is no automatic archive or pruning policy.

`--list` records the selection alone. Each attempt's `durationMs` is the
test's own time: a worker fixture's publication, a serial file's `beforeAll`
and `afterAll`, and the time between tests are not in it, so a change to
shared setup shows in wall time and in the gaps between one test's end and
the next's start on the same worker, not in the summed durations. A measured
run omits `--reporter`: `--reporter=list` replaces the quiet reporter and
no record is written. Record the load average before and after, and compare
runs taken under different loads relatively. The separate shard timing artifact
adds each executed `beforeAll`/`afterAll` hook once to those test durations, so
allocation includes the serial files' shared setup and teardown without
counting per-test fixtures twice. [Dashboard shards](shards.md) describes the
early dispatch of serial production chains beside ordinary checks.
