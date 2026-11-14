# Proof record of a browser test group's run

How each browser test group's command (`npm run test:e2e`,
`npm run test:dashboard:integrated`, `:frontend` or `:backend`) retains the
selection and results of one strict run as a JSON record, and how to read
that record (the groups themselves: [README](README.md)).

This file is the run's **transcript**: a caller-owned absolute path for one
invocation's selection and attempts, named by the group's own
`<prefix>_PROOF_RECORD` (`OPEN_DOUGH_E2E_PROOF_RECORD`,
`OPEN_DOUGH_DASHBOARD_INTEGRATED_PROOF_RECORD`, `..._FRONTEND_...` or
`..._BACKEND_...`). CI requests one per shard of each group
(`.github/workflows/browser-test-group.yml`) and writes that shard's CI proof
fragment for the group's entry from it (`.github/actions/ci-proof-fragments`,
`report-format: playwright-record`).

To retain the selection and results of the same strict run, choose an unused
absolute file path outside the group's `test-results/` before invoking it.
Its parent directory must already exist. No record is created unless
requested:

```sh
proof_dir=$(mktemp -d)
OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$proof_dir/proof.json" \
  npm run --silent test:dashboard:backend -- quiet-reporter.spec.ts --workers=2
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

## Frontend test proof artifact

When CI's proof summary job runs, it still keeps the combined
`ci-proof-summary-attempt-<attempt>` artifact. With `frontend-entry:
dashboard/frontend-tests`, the same summarize step also renders
`frontend-test-proof.md` from that written summary and uploads
`frontend-test-proof-attempt-<attempt>` (30-day retention). The report covers
only `dashboard/frontend-tests`: repository, revision, run id and attempt,
per-file passed/failed/other counts, and summed recorded test execution
durations from the proof record (not job wall time). Other means skipped or
unfinished selections; the record does not distinguish them further. Measured
`0 ms` stays distinct from unavailable timing. A present shard with no
frontend selections is a reported zero; a missing or ambiguous shard stays
unknown. Partial or conflicting evidence stays incomplete and never becomes
an executed pass. Report generation reads the summary only; it runs no tests
and does not change the suite verdict or the combined summary.

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
