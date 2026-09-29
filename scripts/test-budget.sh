#!/usr/bin/env bash
# Compares the runner's per-job times with a two-number time budget:
#   scripts/test-budget.sh <budget-file> <times-file>
# scripts/test.sh always writes the times file, one `<seconds><TAB><job>` line
# per job, longest first (to OPEN_DOUGH_TEST_TIMES when set), and on CI
# (`CI=true`) runs this after its failure reports whenever its test directory
# has a `time-budget`; elsewhere the budget is not judged at all.
# scripts/time-budget.bash reads the budget file; one without both numbers
# always fails. Within budget, nothing is printed.
# Each job over the per-job ceiling, and a total over the total ceiling, is
# reported on stderr. A breach exits 1 wherever this checker runs; the runner
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

awk -F '\t' -v per_job="${per_job_seconds}" -v total_ceiling="${total_job_seconds}" -v budget="${budget}" '
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
' "${times_file}" >&2
