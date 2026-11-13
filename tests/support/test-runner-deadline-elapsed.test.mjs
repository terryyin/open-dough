// A job its safety deadline stopped reports the time it ran, however long the
// rest of the run keeps the runner going before its report. The runner's own
// job, deadline and report modules (scripts/test-*.bash) run here as
// scripts/test.sh composes them; the run's end is a controlled clock: the
// report observes the run ending 1,000 seconds after the job started.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { source } from "./test-runner-deadline-fixtures.mjs";

const stopThenReportLater = `
set -euo pipefail
source_dir=$1
output_root=$(mktemp -d)
trap 'rm -rf -- "$output_root"' EXIT
source "$source_dir/scripts/test-run-job.bash"
source "$source_dir/scripts/test-job-deadline.bash"
source "$source_dir/scripts/test-run-deadline.bash"
source "$source_dir/scripts/test-report-jobs.bash"
mkfifo "$output_root/slots" "$output_root/hold"
: > "$output_root/0.log"
exec 3<> "$output_root/slots"
labels=(checks/hang.sh)
job_started=() job_pids=()
interrupt_status=''
job_started[0]=$EPOCHREALTIME
set -m
(exec 3>&-; read -r _ < "$output_root/hold") &
set +m
job_pids[0]=$!
arm_job_deadline 0 "\${job_pids[0]}"
printf 'expire\n' > "\${job_deadline_fifos[0]}"
# The watchdog hands back the stopped job's slot once its group has ended.
read -r -u 3 _
wait "\${job_pids[0]}" || true
retire_job_deadline 0
observed_at=$(awk -v start="\${job_started[0]}" 'BEGIN { printf "%.6f", start + 1000 }')
report_job 0 2>&1
`;

test("a job stopped at its safety deadline reports its own elapsed time, not the rest of the run", () => {
  const result = spawnSync(
    "bash",
    ["-c", stopThenReportLater, "stop-then-report-later", source],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const [, after] =
    /^TIMEOUT: checks\/hang\.sh \(safety deadline 180s; after ([0-9]+\.[0-9])s\)$/m.exec(
      result.stdout,
    ) ?? [];
  assert.ok(after !== undefined, result.stdout);
  assert.ok(
    Number(after) < 1000,
    `reported ${after}s: the time until the run's report, not the job's own`,
  );
});
