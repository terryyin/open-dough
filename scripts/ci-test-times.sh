#!/usr/bin/env bash
# Reports recent trunk CI job times against the suite's time budget:
#   bash scripts/ci-test-times.sh [job…]
# Reads the `test-times-<share>` artifacts of the last 10 successful ci.yml
# runs on main through `gh` (read-only; it starts no test run) and the ceilings
# from `${OPEN_DOUGH_TEST_DIR:-Distribution/tests}/time-budget` through
# scripts/time-budget.bash. Each share's runner factor comes from
# `node scripts/test-shares.mjs runner-factor` against
# `${OPEN_DOUGH_TEST_DIR:-Distribution/tests}/longest-first`; times are divided by that
# factor so the report speaks recorded-speed units with the factor range each
# share saw. Runs whose artifacts cannot be downloaded (past CI's seven-day
# retention) are skipped and not counted. For each job, and for each share's
# total, it prints the recent lowest-highest seconds at recorded speed, the
# factor range, the ceiling, headroom (ceiling - highest), spread (highest -
# lowest), and a verdict: `wide` when headroom is at least the spread,
# otherwise `thin` naming the recent highest value to project a paired local
# ratio from. Named jobs (as the times files name them, such as
# Distribution/tests/installation/install.sh) restrict the job lines; share totals always appear. With
# no names, every job appears, highest first. Exits 0 after a report; with no
# readable runs, or when `gh` fails, it says why and exits 1. See
# Distribution/tests/time-budget.md for how a slice uses the verdict.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd -- "${source_dir}"
# shellcheck disable=SC1091
# shellcheck source=scripts/time-budget.bash
source "${source_dir}/scripts/time-budget.bash"
# shellcheck disable=SC1091
# shellcheck source=scripts/gh-message.bash
source "${source_dir}/scripts/gh-message.bash"
# shellcheck disable=SC1091
# shellcheck source=scripts/trunk-runs.bash
source "${source_dir}/scripts/trunk-runs.bash"

test_dir="${OPEN_DOUGH_TEST_DIR:-Distribution/tests}"
budget="${test_dir}/time-budget"
list="${test_dir}/longest-first"
read_time_budget "${budget}" || exit 1
# The sourced reader sets both ceilings.
readonly per_job_seconds total_job_seconds

work_dir=$(mktemp -d)
trap 'rm -rf -- "${work_dir}"' EXIT

# One `<run>\t<share>\t<seconds-at-recorded>\t<job>\t<factor>\t<factor-label>`
# line per job time across the runs used.
times="${work_dir}/times"
: > "${times}"

# Appends RUN's times from its test-times artifacts, or sets skip_reason.
# shellcheck disable=SC2034 # read_trunk_runs reads skip_reason.
read_run_times() {
  local run=$1 found=0 file share factor_line factor factor_label
  if ! gh run download "${run}" -D "${work_dir}/${run}" -p 'test-times-*' \
    > /dev/null 2> "${work_dir}/gh.err"; then
    skip_reason=$(gh_message "${work_dir}/gh.err")
    return
  fi
  for file in "${work_dir}/${run}"/test-times-*/test-times.txt; do
    [[ -f ${file} ]] || continue
    share=${file%/test-times.txt}
    share=${share##*/test-times-}
    factor_line=$(node "${source_dir}/scripts/test-shares.mjs" runner-factor \
      --list "${list}" "${file}")
    IFS=$'\t' read -r factor factor_label <<< "${factor_line}"
    awk -F '\t' \
      -v run="${run}" \
      -v share="${share}" \
      -v factor="${factor}" \
      -v factor_label="${factor_label}" '
      NF >= 2 {
        printf "%s\t%s\t%s\t%s\t%s\t%s\n",
          run, share, $1 / factor, $2, factor, factor_label
      }
    ' "${file}" >> "${times}"
    found=1
  done
  ((found == 1)) || skip_reason="run ${run} has no test-times.txt"
}

read_trunk_runs "${work_dir}" 'test-times artifacts' read_run_times

print_trunk_runs_used 'Recent trunk CI timings' artifacts
printf 'Ceilings (%s): %ss per job, %s job-seconds per share, at recorded speed.\n' \
  "${budget}" "${per_job_seconds}" "${total_job_seconds}"

# Prints `<name>: <low>-<high> <unit> at recorded speed (factors …), ceiling,
# headroom, spread, verdict` for each
# `<name>\t<low>\t<high>\t<factor-low-label>\t<factor-high-label>` line on
# stdin, or `<name>: no recent timing` for a line without numbers.
report() {
  awk -F '\t' -v ceiling="$1" -v unit="$2" '
    NF < 3 {
      printf "%s: no recent timing; its first CI run settles it.\n", $1
      next
    }
    {
      headroom = sprintf("%.1f", ceiling - $3)
      spread = sprintf("%.1f", $3 - $2)
      printf "%s: %.1f-%.1f %s at recorded speed (factors %s-%s), ceiling %s, headroom %s, spread %s, ", \
        $1, $2, $3, unit, $4, $5, ceiling, headroom, spread
      if (headroom + 0 >= spread + 0) print "wide"
      else printf "thin: project from %.1f\n", $3
    }
  '
}

# One pass over recorded-speed times: each job's and each share total's
# `<name>\t<low>\t<high>\t<factor-low-label>\t<factor-high-label>`. Job factor
# labels come from the runs that held the job; share labels from every run
# that share saw.
: > "${work_dir}/jobs.raw"
: > "${work_dir}/shares.raw"
awk -F '\t' \
  -v jobs_out="${work_dir}/jobs.raw" \
  -v shares_out="${work_dir}/shares.raw" '
  function track_factor(key, factor, label) {
    if (!(key in f_low) || factor < f_low[key]) {
      f_low[key] = factor
      f_low_label[key] = label
    }
    if (!(key in f_high) || factor > f_high[key]) {
      f_high[key] = factor
      f_high_label[key] = label
    }
  }
  {
    job = $4
    share = $2
    seconds = $3 + 0
    factor = $5 + 0
    if (!(job in j_high) || seconds > j_high[job]) j_high[job] = seconds
    if (!(job in j_low) || seconds < j_low[job]) j_low[job] = seconds
    track_factor("j:" job, factor, $6)
    total[share, $1] += seconds
    track_factor("s:" share, factor, $6)
  }
  END {
    for (job in j_high)
      printf "%s\t%s\t%s\t%s\t%s\n",
        job, j_low[job], j_high[job],
        f_low_label["j:" job], f_high_label["j:" job] > jobs_out
    for (key in total) {
      split(key, part, SUBSEP)
      share = part[1]
      if (!(share in s_high) || total[key] > s_high[share]) s_high[share] = total[key]
      if (!(share in s_low) || total[key] < s_low[share]) s_low[share] = total[key]
    }
    for (share in s_high)
      printf "share %s total\t%s\t%s\t%s\t%s\n",
        share, s_low[share], s_high[share],
        f_low_label["s:" share], f_high_label["s:" share] > shares_out
  }
' "${times}"
sort -t $'\t' -k3,3gr -k1,1 "${work_dir}/jobs.raw" > "${work_dir}/jobs"

if (($# == 0)); then
  report "${per_job_seconds}" s < "${work_dir}/jobs"
else
  printf '%s\n' "$@" | awk -F '\t' '
    FNR == NR { line[$1] = $0; next }
    { print(($1 in line) ? line[$1] : $1) }
  ' "${work_dir}/jobs" - | report "${per_job_seconds}" s
fi

sort -t $'\t' -k1,1 "${work_dir}/shares.raw" | report "${total_job_seconds}" job-seconds
