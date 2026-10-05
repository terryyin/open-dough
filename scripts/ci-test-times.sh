#!/usr/bin/env bash
# Reports recent trunk CI job times against the suite's time budget:
#   bash scripts/ci-test-times.sh [job…]
# Reads the `test-times-<share>` artifacts of the last 10 successful ci.yml
# runs on main through `gh` (read-only; it starts no test run) and the ceilings
# from `${OPEN_DOUGH_TEST_DIR:-tests}/time-budget` through
# scripts/time-budget.bash. Runs whose artifacts cannot be downloaded (past CI's
# seven-day retention) are skipped and not counted. For each job, and for each
# share's total, it prints the recent lowest-highest seconds, the ceiling,
# headroom (ceiling - highest), spread (highest - lowest), and a verdict:
# `wide` when headroom is at least the spread, otherwise `thin` naming the
# recent highest value to project a paired local ratio from. Named jobs (as the
# times files name them, such as tests/install.sh) restrict the job lines;
# share totals always appear. With no names, every job appears, highest first.
# Exits 0 after a report; with no readable runs, or when `gh` fails, it says
# why and exits 1. See tests/time-budget.md for how a slice uses the verdict.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd -- "${source_dir}"
# shellcheck disable=SC1091
# shellcheck source=scripts/time-budget.bash
source "${source_dir}/scripts/time-budget.bash"
# shellcheck disable=SC1091
# shellcheck source=scripts/gh-message.bash
source "${source_dir}/scripts/gh-message.bash"

budget="${OPEN_DOUGH_TEST_DIR:-tests}/time-budget"
read_time_budget "${budget}" || exit 1
# The sourced reader sets both ceilings.
readonly per_job_seconds total_job_seconds

work_dir=$(mktemp -d)
trap 'rm -rf -- "${work_dir}"' EXIT

no_timings() {
  printf 'No recent trunk timings were found: %s\n' "$1" >&2
  exit 1
}

if ! runs=$(gh run list --workflow ci.yml --branch main --status success --limit 10 \
  --json databaseId,createdAt \
  --jq '.[] | "\(.databaseId)\t\(.createdAt)"' 2> "${work_dir}/gh.err"); then
  message=$(gh_message "${work_dir}/gh.err")
  no_timings "gh run list failed: ${message}"
fi
[[ -n ${runs} ]] || no_timings 'gh listed no successful ci.yml runs on main.'

# One `<run>\t<share>\t<seconds>\t<job>` line per job time across the runs used.
times="${work_dir}/times"
: > "${times}"
used=0 skipped=0 newest='' oldest='' last_error=''
while IFS=$'\t' read -r run created; do
  if ! gh run download "${run}" -D "${work_dir}/${run}" -p 'test-times-*' \
    > /dev/null 2> "${work_dir}/gh.err"; then
    skipped=$((skipped + 1))
    last_error=$(gh_message "${work_dir}/gh.err")
    continue
  fi
  found=0
  for file in "${work_dir}/${run}"/test-times-*/test-times.txt; do
    [[ -f ${file} ]] || continue
    share=${file%/test-times.txt}
    share=${share##*/test-times-}
    awk -F '\t' -v run="${run}" -v share="${share}" \
      'NF >= 2 { print run "\t" share "\t" $1 "\t" $2 }' "${file}" >> "${times}"
    found=1
  done
  if ((found == 0)); then
    skipped=$((skipped + 1))
    last_error="run ${run} has no test-times.txt"
    continue
  fi
  used=$((used + 1))
  [[ -n ${newest} ]] || newest=${created}
  oldest=${created}
done <<< "${runs}"
((used > 0)) || no_timings "none of the ${skipped} listed runs had readable test-times artifacts (last gh message: ${last_error})"

printf 'Recent trunk CI timings: %s successful ci.yml runs on main, %s to %s' \
  "${used}" "${oldest}" "${newest}"
((skipped == 0)) || printf ' (%s without readable artifacts skipped)' "${skipped}"
printf '.\nCeilings (%s): %ss per job, %s job-seconds per share.\n' \
  "${budget}" "${per_job_seconds}" "${total_job_seconds}"

# Prints `<name>: <low>-<high> <unit>, ceiling, headroom, spread, verdict` for
# each `<name>\t<low>\t<high>` line on stdin, or `<name>: no recent timing`
# for a line without numbers.
report() {
  awk -F '\t' -v ceiling="$1" -v unit="$2" '
    NF < 3 {
      printf "%s: no recent timing; its first CI run settles it.\n", $1
      next
    }
    {
      headroom = sprintf("%.1f", ceiling - $3)
      spread = sprintf("%.1f", $3 - $2)
      printf "%s: %.1f-%.1f %s, ceiling %s, headroom %s, spread %s, ", \
        $1, $2, $3, unit, ceiling, headroom, spread
      if (headroom + 0 >= spread + 0) print "wide"
      else printf "thin: project from %.1f\n", $3
    }
  '
}

# Each job's `<job>\t<low>\t<high>`, highest first.
awk -F '\t' '
  !($4 in high) || $3 + 0 > high[$4] { high[$4] = $3 + 0 }
  !($4 in low) || $3 + 0 < low[$4] { low[$4] = $3 + 0 }
  END { for (job in high) printf "%s\t%s\t%s\n", job, low[job], high[job] }
' "${times}" | sort -t $'\t' -k3,3gr -k1,1 > "${work_dir}/jobs"

if (($# == 0)); then
  report "${per_job_seconds}" s < "${work_dir}/jobs"
else
  printf '%s\n' "$@" | awk -F '\t' '
    FNR == NR { line[$1] = $0; next }
    { print(($1 in line) ? line[$1] : $1) }
  ' "${work_dir}/jobs" - | report "${per_job_seconds}" s
fi

# Each share's `share <i> total\t<low>\t<high>` over its runs' summed times.
awk -F '\t' '
  { total[$2, $1] += $3 }
  END {
    for (key in total) {
      split(key, part, SUBSEP)
      share = part[1]
      if (!(share in high) || total[key] > high[share]) high[share] = total[key]
      if (!(share in low) || total[key] < low[share]) low[share] = total[key]
    }
    for (share in high) printf "share %s total\t%s\t%s\n", share, low[share], high[share]
  }
' "${times}" | sort -t $'\t' -k1,1 | report "${total_job_seconds}" job-seconds
