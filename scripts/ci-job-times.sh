#!/usr/bin/env bash
# Reports how close each CI test group's slowest job runs to its deadline:
#   bash scripts/ci-job-times.sh
# Reads the jobs of the last 10 successful ci.yml runs on main through `gh`
# (read-only; it starts no run). A group job is a job with a step whose name
# ends `deadlines` and a test step (`Run the group's browser tests` or
# `Run Distribution Tests`); its group is its name without the trailing
# ` / shard i/n` or ` (i/n)`, and its deadline is the last `(<n> seconds)` in
# that step name. A job's seconds run from its start to the end of its test
# step. A run where a group job's test step did not finish is not counted for
# that group, and each group is judged only over runs at its newest job count.
# For each group it prints the job count, runs counted, the slowest job's
# lowest-highest seconds, the deadline and headroom (deadline - highest), then
# for more than one job the projection at one job fewer (each job's seconds
# before its test step plus its test-step seconds times n/(n-1), the run's
# highest job), that projection's headroom and spread (highest - lowest), and
# a verdict: `could drop one` when at least 5 runs were counted and the
# projection's headroom is at least its spread (the reserve for runner-speed
# variation); otherwise `keep`. A last line gives, over the runs read, each run's runner wait (its
# longest job creation to start) and verdict time (its first job creation to
# last job completion), counting every job, lowest to highest; it changes no
# group line. Runs whose jobs cannot be read are skipped and not counted. Exits 0
# after a report; with no readable runs, or when `gh` fails to list them, it
# says why and exits 1. Use it before changing a job count.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=scripts/gh-message.bash
source "${source_dir}/scripts/gh-message.bash"
# shellcheck disable=SC1091
# shellcheck source=scripts/trunk-runs.bash
source "${source_dir}/scripts/trunk-runs.bash"

readonly reserve_runs=5
work_dir=$(mktemp -d)
trap 'rm -rf -- "${work_dir}"' EXIT

# One `<name>\t<start>\t<test-start>\t<test-end>\t<deadline-step>` line, in
# epoch seconds, per job with a deadline step and a test step; an unfinished
# test step leaves its end empty.
# shellcheck disable=SC2016 # jq variables, not shell expansions.
job_filter='.jobs[]
  | (.steps // []) as $steps
  | ($steps | map(select(.name | endswith("deadlines"))) | first) as $deadline
  | ($steps | map(select(.name == "Run the group'"'"'s browser tests"
      or .name == "Run Distribution Tests")) | first) as $test
  | select($deadline != null and $test != null)
  | [.name, (.started_at | fromdateiso8601),
     ($test.started_at // "" | if . == "" then "" else fromdateiso8601 end),
     ($test.completed_at // "" | if . == "" then "" else fromdateiso8601 end),
     $deadline.name]
  | map(tostring) | join("\t")'
# One `<runner-wait>\t<verdict-time>` line in seconds for the run, over every
# job that started or completed.
# shellcheck disable=SC2016 # jq variables, not shell expansions.
run_filter='[.jobs[] | select(.started_at != null)
    | (.started_at | fromdateiso8601) - (.created_at | fromdateiso8601)] as $waits
  | [.jobs[] | select(.completed_at != null) | .completed_at | fromdateiso8601] as $ends
  | [($waits | max), ($ends | max) - ([.jobs[].created_at | fromdateiso8601] | min)]
  | map(tostring) | join("\t")'

# One `<run-order>\t<group>\t<before>\t<test>\t<deadline>` line per group job,
# or `<run-order>\t<group>\tunfinished` for a job whose test step has no end.
jobs="${work_dir}/jobs"
# One run_filter line per run read.
waits="${work_dir}/waits"
: > "${jobs}"
: > "${waits}"
order=0

# Appends RUN's run_filter line and group jobs, or sets skip_reason.
# shellcheck disable=SC2034 # read_trunk_runs reads skip_reason.
read_run_jobs() {
  order=$((order + 1))
  if ! gh api "repos/{owner}/{repo}/actions/runs/$1/jobs?per_page=100" \
    --jq "(${run_filter}), (${job_filter})" > "${work_dir}/run" 2> "${work_dir}/gh.err"; then
    skip_reason=$(gh_message "${work_dir}/gh.err")
    return
  fi
  local lines
  lines=$(wc -l < "${work_dir}/run")
  if ((lines < 2)); then
    skip_reason="run $1 has no group job"
    return
  fi
  head -n 1 -- "${work_dir}/run" >> "${waits}"
  awk -F '\t' -v order="${order}" '
    NR > 1 {
      group = $1
      sub(/ \/ shard [0-9]+\/[0-9]+$/, "", group)
      sub(/ \([0-9]+\/[0-9]+\)$/, "", group)
      if ($3 == "" || $4 == "") {
        printf "%s\t%s\tunfinished\n", order, group
        next
      }
      rest = $5
      while (match(rest, /\([0-9]+ seconds\)/)) {
        deadline = substr(rest, RSTART + 1, RLENGTH - 10)
        rest = substr(rest, RSTART + RLENGTH)
      }
      printf "%s\t%s\t%s\t%s\t%s\n", order, group, $3 - $2, $4 - $3, deadline
    }
  ' "${work_dir}/run" >> "${jobs}"
}

read_trunk_runs "${work_dir}" 'group jobs' read_run_jobs

print_trunk_runs_used 'Recent trunk CI job times' jobs
printf 'Seconds run from job start to the end of the test step. A group could drop one\n'
printf 'job only over at least %s runs at its job count, with the projection'"'"'s headroom\n' \
  "${reserve_runs}"
printf 'at least its spread, the reserve for runner-speed variation.\n'

# Per group and run: job count, slowest job, one-fewer projection and the
# lowest deadline; then per group over the runs at its newest count.
awk -F '\t' -v reserve_runs="${reserve_runs}" '
  $3 == "unfinished" { unfinished[$2, $1] = 1; next }
  {
    key = $2 SUBSEP $1
    count[key]++
    seconds = $3 + $4
    if (!(key in slowest) || seconds > slowest[key]) slowest[key] = seconds
    before[key, count[key]] = $3
    test_seconds[key, count[key]] = $4
    if (!(key in deadline) || $5 + 0 < deadline[key]) deadline[key] = $5 + 0
  }
  END {
    for (key in count) {
      split(key, part, SUBSEP)
      if ((part[1], part[2]) in unfinished) continue
      n = count[key]
      if (n > 1)
        for (i = 1; i <= n; i++) {
          p = sprintf("%.0f", before[key, i] + test_seconds[key, i] * n / (n - 1)) + 0
          if (!(key in projection) || p > projection[key]) projection[key] = p
        }
      if (!(part[1] in current) || part[2] + 0 < first_counted[part[1]]) {
        first_counted[part[1]] = part[2] + 0
        current[part[1]] = n
      }
    }
    for (key in count) {
      split(key, part, SUBSEP)
      g = part[1]
      if ((g, part[2]) in unfinished || count[key] != current[g]) continue
      runs[g]++
      track(g, "s", slowest[key])
      if (!(g in limit) || deadline[key] < limit[g]) limit[g] = deadline[key]
      if (key in projection) track(g, "p", projection[key])
    }
    for (g in current) {
      n = current[g]
      printf "%s: %s job%s over %s run%s, slowest job %s-%s s, deadline %s s, headroom %s", \
        g, n, (n == 1 ? "" : "s"), runs[g], (runs[g] == 1 ? "" : "s"), \
        low[g, "s"], high[g, "s"], limit[g], limit[g] - high[g, "s"]
      if (n == 1) { print ", keep"; continue }
      headroom = limit[g] - high[g, "p"]
      spread = high[g, "p"] - low[g, "p"]
      printf "; %s job%s would take %s-%s s, headroom %s, spread %s, %s\n", \
        n - 1, (n == 2 ? "" : "s"), low[g, "p"], high[g, "p"], headroom, spread, \
        ((runs[g] >= reserve_runs && headroom >= spread) ? "could drop one" : "keep")
    }
  }
  function track(g, kind, value) {
    if (!((g, kind) in low) || value < low[g, kind]) low[g, kind] = value
    if (!((g, kind) in high) || value > high[g, kind]) high[g, kind] = value
  }
' "${jobs}" | LC_ALL=C sort

awk -F '\t' '
  NR == 1 || $1 < low_wait { low_wait = $1 }
  NR == 1 || $1 > high_wait { high_wait = $1 }
  NR == 1 || $2 < low_verdict { low_verdict = $2 }
  NR == 1 || $2 > high_verdict { high_verdict = $2 }
  END {
    printf "Runner wait (longest job creation to start) %s-%s s, verdict time (first job creation to last job end) %s-%s s over %s run%s\n", \
      low_wait, high_wait, low_verdict, high_verdict, NR, (NR == 1 ? "" : "s")
  }
' "${waits}"
