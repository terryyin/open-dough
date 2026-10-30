#!/usr/bin/env bash
# On CI the runner holds job times to its checks' `time-budget` at the recorded
# list's runner speed: each job and the share total, divided by the share's
# runner factor, are compared with the ceilings. A breach names observed time,
# factor (or that it was unavailable) and time at recorded speed and fails the
# run; a run within budget is silent. Elsewhere the budget is not judged: an
# over-budget run prints nothing and passes. The checker itself exits 1 on any
# breach wherever it runs; only the runner decides that the budget is CI's.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/expect-in-log.bash
source "${source_dir}/tests/helpers/expect-in-log.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
checks="${temporary_dir}/checks"
mkdir -p -- "${checks}"
# The slow check's duration is what the budget measures, so it sleeps.
printf '#!/usr/bin/env bash\nsleep 0.3\n' > "${checks}/slow.sh"
printf '#!/usr/bin/env bash\ntrue\n' > "${checks}/fast.sh"

# Runs the runner over the checks, logging to <name>.log: with CI=true when $2
# is `ci`, and with CI unset otherwise (this check may itself run on CI).
run_suite() {
  suite_status=0
  local ci=(env -u CI)
  [[ $2 != ci ]] || ci=(env CI=true)
  "${ci[@]}" OPEN_DOUGH_TEST_DIR="${checks}" "${BASH}" "${source_dir}/scripts/test.sh" \
    > "${temporary_dir}/$1.log" 2>&1 || suite_status=$?
}

expect_breaches() {
  local log="${temporary_dir}/$1.log"
  expect_in_log "${log}" -E -- "^OVER BUDGET: ${checks}/slow\.sh took [0-9]+\.[0-9]s observed \(factor unavailable, [0-9]+\.[0-9]s at recorded speed\); the per-job ceiling is 0\.1s \(${checks}/time-budget\)\.$"
  expect_in_log "${log}" -E -- "^OVER BUDGET: all jobs took [0-9]+\.[0-9] job-seconds observed \(factor unavailable, [0-9]+\.[0-9] at recorded speed\); the total ceiling is 0\.2 \(${checks}/time-budget\)\.$"
  local lines
  lines=$(wc -l < "${log}")
  if grep -q -F -- 'fast.sh' "${log}" || ((lines != 2)); then
    printf 'FAIL: the %s budget report is not exactly the two breaches:\n' "$1" >&2
    cat -- "${log}" >&2
    exit 1
  fi
}

# Runs the checker on a fabricated times file against a substitute directory
# that holds its own time-budget and optional longest-first.
check_times() {
  local name=$1 dir=$2 times=$3
  check_status=0
  "${BASH}" "${source_dir}/scripts/test-budget.sh" \
    "${dir}/time-budget" "${times}" \
    > "${temporary_dir}/${name}.log" 2>&1 || check_status=$?
}

printf 'per-job-seconds=0.1\ntotal-job-seconds=0.2\n' > "${checks}/time-budget"
run_suite ci-over ci
if ((suite_status != 1)); then
  printf 'FAIL: CI accepted a run over budget (exit %s).\n' "${suite_status}" >&2
  exit 1
fi
expect_breaches ci-over

# The checker itself fails on any breach wherever it runs, CI set or not;
# only the runner decides that the budget is CI's.
printf '0.3\t%s/slow.sh\n' "${checks}" > "${temporary_dir}/times"
check_times direct "${checks}" "${temporary_dir}/times"
if ((check_status != 1)); then
  printf 'FAIL: the checker accepted a breach with CI unset (exit %s).\n' "${check_status}" >&2
  cat -- "${temporary_dir}/direct.log" >&2
  exit 1
fi
expect_breaches direct

run_suite local-over local
if ((suite_status != 0)) || [[ -s ${temporary_dir}/local-over.log ]]; then
  printf 'FAIL: a local run over budget exited %s or printed output:\n' "${suite_status}" >&2
  cat -- "${temporary_dir}/local-over.log" >&2
  exit 1
fi

printf '# A comment.\nper-job-seconds=100\ntotal-job-seconds=200\n' > "${checks}/time-budget"
run_suite within ci
if ((suite_status != 0)) || [[ -s ${temporary_dir}/within.log ]]; then
  printf 'FAIL: a CI run within budget exited %s or printed output:\n' "${suite_status}" >&2
  cat -- "${temporary_dir}/within.log" >&2
  exit 1
fi

# Slow runner, no added time: every job at 2× its recorded seconds passes
# under ceilings the raw times breach.
slow="${temporary_dir}/slow-runner"
mkdir -p -- "${slow}"
printf '10.0\t%s/a.sh\n10.0\t%s/b.sh\n' "${slow}" "${slow}" > "${slow}/longest-first"
printf 'per-job-seconds=15\ntotal-job-seconds=25\n' > "${slow}/time-budget"
printf '20.0\t%s/a.sh\n20.0\t%s/b.sh\n' "${slow}" "${slow}" > "${temporary_dir}/slow-times"
check_times slow-runner "${slow}" "${temporary_dir}/slow-times"
if ((check_status != 0)) || [[ -s ${temporary_dir}/slow-runner.log ]]; then
  printf 'FAIL: a uniformly slow runner exited %s or printed output:\n' "${check_status}" >&2
  cat -- "${temporary_dir}/slow-runner.log" >&2
  exit 1
fi

# Concentrated slowdown: one job at 3× while the rest stay at 1× breaches,
# naming the job, factor 1.0 and both times.
concentrated="${temporary_dir}/concentrated"
mkdir -p -- "${concentrated}"
printf '10.0\t%s/a.sh\n10.0\t%s/b.sh\n10.0\t%s/c.sh\n' \
  "${concentrated}" "${concentrated}" "${concentrated}" > "${concentrated}/longest-first"
printf 'per-job-seconds=15\ntotal-job-seconds=40\n' > "${concentrated}/time-budget"
printf '30.0\t%s/a.sh\n10.0\t%s/b.sh\n10.0\t%s/c.sh\n' \
  "${concentrated}" "${concentrated}" "${concentrated}" > "${temporary_dir}/concentrated-times"
check_times concentrated "${concentrated}" "${temporary_dir}/concentrated-times"
if ((check_status != 1)); then
  printf 'FAIL: a concentrated slowdown exited %s:\n' "${check_status}" >&2
  cat -- "${temporary_dir}/concentrated.log" >&2
  exit 1
fi
expect_in_log "${temporary_dir}/concentrated.log" -F -- \
  "OVER BUDGET: ${concentrated}/a.sh took 30.0s observed (factor 1.0, 30.0s at recorded speed); the per-job ceiling is 15s (${concentrated}/time-budget)."
expect_in_log "${temporary_dir}/concentrated.log" -F -- \
  "OVER BUDGET: all jobs took 50.0 job-seconds observed (factor 1.0, 50.0 at recorded speed); the total ceiling is 40 (${concentrated}/time-budget)."

# New test time: an unrecorded job's time counts in the total at the share's
# factor (here 2.0 from the two recorded jobs).
new_job="${temporary_dir}/new-job"
mkdir -p -- "${new_job}"
printf '10.0\t%s/a.sh\n10.0\t%s/b.sh\n' "${new_job}" "${new_job}" > "${new_job}/longest-first"
printf 'per-job-seconds=20\ntotal-job-seconds=25\n' > "${new_job}/time-budget"
printf '20.0\t%s/a.sh\n20.0\t%s/b.sh\n20.0\t%s/new.sh\n' \
  "${new_job}" "${new_job}" "${new_job}" > "${temporary_dir}/new-job-times"
check_times new-job "${new_job}" "${temporary_dir}/new-job-times"
if ((check_status != 1)); then
  printf 'FAIL: an unrecorded job over the total exited %s:\n' "${check_status}" >&2
  cat -- "${temporary_dir}/new-job.log" >&2
  exit 1
fi
expect_in_log "${temporary_dir}/new-job.log" -F -- \
  "OVER BUDGET: all jobs took 60.0 job-seconds observed (factor 2.0, 30.0 at recorded speed); the total ceiling is 25 (${new_job}/time-budget)."
if grep -q -F -- 'per-job ceiling' "${temporary_dir}/new-job.log"; then
  printf 'FAIL: the unrecorded-job case reported a per-job breach:\n' >&2
  cat -- "${temporary_dir}/new-job.log" >&2
  exit 1
fi
# Without the unrecorded job the same factor would leave 20.0 at recorded speed,
# under the total ceiling; counting it is what fails the share.
printf '20.0\t%s/a.sh\n20.0\t%s/b.sh\n' "${new_job}" "${new_job}" > "${temporary_dir}/new-job-without"
check_times new-job-without "${new_job}" "${temporary_dir}/new-job-without"
if ((check_status != 0)) || [[ -s ${temporary_dir}/new-job-without.log ]]; then
  printf 'FAIL: recorded jobs alone at the same factor exited %s or printed:\n' "${check_status}" >&2
  cat -- "${temporary_dir}/new-job-without.log" >&2
  exit 1
fi
