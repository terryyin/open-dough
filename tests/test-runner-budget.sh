#!/usr/bin/env bash
# The runner holds job times to its checks' `time-budget`: a breach names each
# job over the per-job ceiling and a total over the total ceiling, fails the
# run in CI, and is only reported elsewhere; a run within budget is silent.
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

# Runs the runner over the checks with CI set to $2, logging to <name>.log.
run_suite() {
  suite_status=0
  CI=$2 OPEN_DOUGH_TEST_DIR="${checks}" "${BASH}" "${source_dir}/scripts/test.sh" \
    > "${temporary_dir}/$1.log" 2>&1 || suite_status=$?
}

expect_breaches() {
  local log="${temporary_dir}/$1.log"
  expect_in_log "${log}" -E -- "^OVER BUDGET: ${checks}/slow\.sh took [0-9]+\.[0-9]s; the per-job ceiling is 0\.1s \(${checks}/time-budget\)\.$"
  expect_in_log "${log}" -E -- "^OVER BUDGET: all jobs took [0-9]+\.[0-9] job-seconds; the total ceiling is 0\.2 \(${checks}/time-budget\)\.$"
  local lines
  lines=$(wc -l < "${log}")
  if grep -q -F -- 'fast.sh' "${log}" || ((lines != 2)); then
    printf 'FAIL: the %s budget report is not exactly the two breaches:\n' "$1" >&2
    cat -- "${log}" >&2
    exit 1
  fi
}

printf 'per-job-seconds=0.1\ntotal-job-seconds=0.2\n' > "${checks}/time-budget"
run_suite ci-over true
if ((suite_status != 1)); then
  printf 'FAIL: CI accepted a run over budget (exit %s).\n' "${suite_status}" >&2
  exit 1
fi
expect_breaches ci-over

run_suite local-over ''
if ((suite_status != 0)); then
  printf 'FAIL: a local run over budget exited %s, not 0.\n' "${suite_status}" >&2
  cat -- "${temporary_dir}/local-over.log" >&2
  exit 1
fi
expect_breaches local-over

printf '# A comment.\nper-job-seconds=100\ntotal-job-seconds=200\n' > "${checks}/time-budget"
run_suite within true
if ((suite_status != 0)) || [[ -s ${temporary_dir}/within.log ]]; then
  printf 'FAIL: a CI run within budget exited %s or printed output:\n' "${suite_status}" >&2
  cat -- "${temporary_dir}/within.log" >&2
  exit 1
fi
