#!/usr/bin/env bash
# Compares the runner's per-job times with a two-number time budget:
#   scripts/test-budget.sh <budget-file> <times-file>
# scripts/test.sh always writes the times file, one `<seconds><TAB><job>` line
# per job, longest first (to OPEN_DOUGH_TEST_TIMES when set), and runs this
# after its failure reports whenever its test directory has a `time-budget`.
# The budget file sets `per-job-seconds=<n>` and `total-job-seconds=<n>`;
# `#` lines and blank lines are ignored. Within budget, nothing is printed.
# Each job over the per-job ceiling, and a total over the total ceiling, is
# reported on stderr. A breach fails only in CI
# (`CI=true`); elsewhere the report is a diagnostic and the exit status is 0.
# A budget file without both numbers always fails.
set -euo pipefail

budget=$1 times_file=$2
per_job='' total=''
while IFS= read -r line || [[ -n ${line} ]]; do
  case ${line} in
    '' | '#'*) ;;
    per-job-seconds=*) per_job=${line#*=} ;;
    total-job-seconds=*) total=${line#*=} ;;
    *) per_job='' total='' && break ;;
  esac
done < "${budget}"
number='^[0-9]+(\.[0-9]+)?$'
if [[ ! ${per_job} =~ ${number} || ! ${total} =~ ${number} ]]; then
  printf 'FAIL: %s must set only per-job-seconds=<n> and total-job-seconds=<n>.\n' \
    "${budget}" >&2
  exit 1
fi

awk -F '\t' -v per_job="${per_job}" -v total_ceiling="${total}" -v budget="${budget}" '
  {
    total += $1
    if ($1 > per_job + 0) {
      printf "OVER BUDGET: %s took %.1fs; the per-job ceiling is %ss (%s).\n",
        $2, $1, per_job, budget
      over = 1
    }
  }
  END {
    if (total > total_ceiling + 0) {
      printf "OVER BUDGET: all jobs took %.1f job-seconds; the total ceiling is %s (%s).\n",
        total, total_ceiling, budget
      over = 1
    }
    exit over
  }
' "${times_file}" >&2 || [[ ${CI:-} != true ]]
