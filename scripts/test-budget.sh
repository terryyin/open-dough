#!/usr/bin/env bash
# Compares the runner's per-job times with a two-number time budget at the
# recorded list's runner speed:
#   scripts/test-budget.sh <budget-file> <times-file>
# scripts/test.sh always writes the times file, one `<seconds><TAB><job>` line
# per job, longest first (to OPEN_DOUGH_TEST_TIMES when set), and on CI
# (`CI=true`) runs this after its failure reports whenever its test directory
# has a `time-budget`; elsewhere the budget is not judged at all.
# scripts/time-budget.bash reads the budget file; one without both numbers
# always fails. The share's runner factor is the median, over jobs recorded in
# the budget directory's `longest-first` with a measurable recorded time, of
# observed/recorded seconds (`node scripts/test-shares.mjs runner-factor`);
# each job's time and the share total, divided by that factor, are compared
# with the ceilings. Within budget, nothing is printed. A breach names the
# observed time, the factor (or that it was unavailable), and the time at
# recorded speed. A breach exits 1 wherever this checker runs; the runner
# alone decides that the budget is CI's, running this only when `CI=true`.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=scripts/time-budget.bash
source "${source_dir}/scripts/time-budget.bash"

budget=$1 times_file=$2
read_time_budget "${budget}" || exit 1
# The sourced reader sets both ceilings.
readonly per_job_seconds total_job_seconds

list="$(dirname -- "${budget}")/longest-first"
factor_line=$(node "${source_dir}/scripts/test-shares.mjs" runner-factor \
  --list "${list}" "${times_file}")
IFS=$'\t' read -r factor factor_label <<< "${factor_line}"

awk -F '\t' \
  -v per_job="${per_job_seconds}" \
  -v total_ceiling="${total_job_seconds}" \
  -v budget="${budget}" \
  -v factor="${factor}" \
  -v factor_label="${factor_label}" '
  {
    total += $1
    at_recorded = $1 / factor
    if (at_recorded > per_job + 0) {
      printf "OVER BUDGET: %s took %.1fs observed (factor %s, %.1fs at recorded speed); the per-job ceiling is %ss (%s).\n",
        $2, $1, factor_label, at_recorded, per_job, budget
      over = 1
    }
  }
  END {
    total_at = total / factor
    if (total_at > total_ceiling + 0) {
      printf "OVER BUDGET: all jobs took %.1f job-seconds observed (factor %s, %.1f at recorded speed); the total ceiling is %s (%s).\n",
        total, factor_label, total_at, total_ceiling, budget
      over = 1
    }
    exit over
  }
' "${times_file}" >&2
