#!/usr/bin/env bash
# scripts/ci-job-times.sh reports each CI test group's slowest job against its
# deadline and whether one job fewer would still fit with the reserve: a wide
# group could drop one; a thin, a past-deadline, a single-job and a
# fewer-than-five-runs group keep. A group is judged over runs at its newest
# job count, without runs where its test step did not finish; seconds end with
# the test step, not later uploads; the deadline is the run's own. A last line
# gives the runs' runner wait and verdict time over every job, `ci-proof`
# included, and jobs that waited change no group line. The reason
# is given when gh fails, lists no run or serves no readable job. A `gh`
# stand-in serves fixture runs, so the check never reaches GitHub.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/expect-in-log.bash
source "${source_dir}/Distribution/tests/helpers/expect-in-log.bash"
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/expect-report.bash
source "${source_dir}/Distribution/tests/helpers/expect-report.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
fake="${temporary_dir}/gh"
mkdir -p -- "${fake}/bin" "${fake}/jobs"

# The stand-in logs its calls, prints the `--jq` listing from fixture `listing`
# (or fails with `list-error`), and applies an api call's `--jq` filter to the
# run's fixture jobs; a run without them fails as gh does.
cat > "${fake}/bin/gh" << 'STANDIN'
#!/usr/bin/env bash
set -euo pipefail
case "$1 $2" in
  'run list')
    printf '%s\n' "$*" >> "${FAKE_GH}/calls"
    if [[ -f ${FAKE_GH}/list-error ]]; then
      cat -- "${FAKE_GH}/list-error" >&2
      exit 1
    fi
    cat -- "${FAKE_GH}/listing"
    ;;
  api\ *)
    printf 'api %s %s\n' "$2" "$3" >> "${FAKE_GH}/calls"
    run=${2#*/runs/}
    run=${run%%/*}
    if [[ ! -f ${FAKE_GH}/jobs/${run} ]]; then
      printf 'HTTP 404: Not Found (https://api.github.com/%s)\n' "$2" >&2
      exit 1
    fi
    jq -s '{jobs: .}' "${FAKE_GH}/jobs/${run}" | jq -r "$4"
    ;;
  *) exit 2 ;;
esac
STANDIN
chmod +x "${fake}/bin/gh"

runs=(201 202 203 204 205 206)
printf '%s\t%s\n' 201 2026-09-30T11:00:00Z 202 2026-09-29T11:00:00Z \
  208 2026-09-28T12:00:00Z 203 2026-09-28T11:00:00Z 204 2026-09-27T11:00:00Z \
  205 2026-09-26T11:00:00Z 206 2026-09-25T11:00:00Z > "${fake}/listing"

# Prints the fixture time SECONDS after a run's jobs were created.
at() {
  printf '"2026-09-30T10:%02d:%02dZ"' $(($1 / 60)) $(($1 % 60))
}

# Writes run RUN's job NAME whose test step ends SECONDS after its start, or
# never when SECONDS is `unfinished`. Every job spends 10 s before its test
# step, keeps its times for 40 s after it, and names a 180-second
# prerequisite deadline beside its 300-second run deadline.
job() {
  local run=$1 name=$2 test_step=$3 end=$4 start test_start kept finished completed=null
  start=$(at 0)
  test_start=$(at 10)
  kept=$(at 590)
  finished=$(at 600)
  [[ ${end} == unfinished ]] || completed=$(at "${end}")
  cat >> "${fake}/jobs/${run}" << JOB
{"name": "${name}", "created_at": ${start}, "started_at": ${start}, "completed_at": ${finished}, "steps": [
  {"name": "Start prerequisite acquisition (180 seconds) and run (300 seconds) deadlines"},
  {"name": "Start Node and npm cache deadline (60 seconds)"},
  {"name": "${test_step}", "started_at": ${test_start}, "completed_at": ${completed}},
  {"name": "Keep per-spec times", "started_at": ${completed}, "completed_at": ${kept}}]}
JOB
}

# Declares GROUP with COUNT jobs in each of runs 201-206: per run, its slowest
# job's seconds (the others take 20 s less), `<count>:<seconds>` for another
# job count, `unfinished` for jobs whose test step did not end, or `-` for no
# jobs.
group() {
  local name=$1 count=$2 index=0 value n seconds i end job_name test_step
  shift 2
  for value in "$@"; do
    run=${runs[index]}
    index=$((index + 1))
    [[ ${value} != - ]] || continue
    n=${count} seconds=${value}
    [[ ${value} != *:* ]] || { n=${value%%:*} seconds=${value#*:}; }
    for ((i = 1; i <= n; i++)); do
      if [[ ${name} == 'Distribution Tests' ]]; then
        job_name="${name} (${i}/${n})" test_step='Run Distribution Tests'
      else
        job_name="${name} / shard ${i}/${n}" test_step="Run the group's browser tests"
      fi
      end=${seconds}
      ((i == 1)) || [[ ${seconds} == unfinished ]] || end=$((seconds - 20))
      job "${run}" "${job_name}" "${test_step}" "${end}"
    done
  done
}

group 'Distribution Tests' 3 120 100 110 105 115 100
group thin 6 240 200 220 230 210 5:290
group late 2 160 170 180 165 175 160
group single 1 200 150 unfinished 170 180 190
group sparse 2 60 50 55 52 - -
start=$(at 0)
proved=$(at 20)
for run in "${runs[@]}" 207; do
  printf '{"name": "ci-proof", "created_at": %s, "started_at": %s, "completed_at": %s, "steps": []}\n' \
    "${start}" "${start}" "${proved}" >> "${fake}/jobs/${run}"
done

# Makes run RUN's jobs whose names start NAME wait for a runner for SECONDS: their
# start and every later time move by SECONDS; their creation stays.
wait_for_runner() {
  # shellcheck disable=SC2016 # jq variables, not shell expansions.
  jq -c --arg name "$2" --argjson by "$3" '
    def later: if . == null then . else fromdateiso8601 + $by | todateiso8601 end;
    if .name | startswith($name) then
      .started_at |= later | .completed_at |= later
      | .steps |= map(.started_at |= later | .completed_at |= later)
    else . end' "${fake}/jobs/$1" > "${fake}/waited"
  mv -- "${fake}/waited" "${fake}/jobs/$1"
}

# Runs the command with the stand-in, logging to <name>.log and setting
# command_status for expect_report.
# shellcheck disable=SC2034
run_times() {
  command_status=0
  PATH="${fake}/bin:${PATH}" FAKE_GH="${fake}" "${BASH}" "${source_dir}/scripts/ci-job-times.sh" \
    > "${temporary_dir}/$1.log" 2>&1 || command_status=$?
}

run_times all
expect_report all 0 << 'REPORT'
Recent trunk CI job times: 6 successful ci.yml runs on main, 2026-09-25T11:00:00Z to 2026-09-30T11:00:00Z (1 without readable jobs skipped).
Seconds run from job start to the end of the test step. A group could drop one
job only over at least 5 runs at its job count, with the projection's headroom
at least its spread, the reserve for runner-speed variation.
Distribution Tests: 3 jobs over 6 runs, slowest job 100-120 s, deadline 300 s, headroom 180; 2 jobs would take 145-175 s, headroom 125, spread 30, could drop one
late: 2 jobs over 6 runs, slowest job 160-180 s, deadline 300 s, headroom 120; 1 job would take 310-350 s, headroom -50, spread 40, keep
single: 1 job over 5 runs, slowest job 150-200 s, deadline 300 s, headroom 100, keep
sparse: 2 jobs over 4 runs, slowest job 50-60 s, deadline 300 s, headroom 240; 1 job would take 90-110 s, headroom 190, spread 20, keep
thin: 6 jobs over 5 runs, slowest job 200-240 s, deadline 300 s, headroom 60; 5 jobs would take 238-286 s, headroom 14, spread 48, keep
Runner wait (longest job creation to start) 0-0 s, verdict time (first job creation to last job end) 600-600 s over 6 runs
REPORT
expect_in_log "${fake}/calls" -x -F -- "run list --workflow ci.yml --branch main --status success --limit 10 --json databaseId,createdAt --jq .[] | \"\(.databaseId)\t\(.createdAt)\""
expect_in_log "${fake}/calls" -x -F -- 'api repos/{owner}/{repo}/actions/runs/201/jobs?per_page=100 --jq'

wait_for_runner 201 ci-proof 656
wait_for_runner 201 thin 282
wait_for_runner 203 late 100
wait_for_runner 207 ci-proof 999
run_times waited
{
  sed '$d' "${temporary_dir}/all.log"
  printf '%s\n' 'Runner wait (longest job creation to start) 0-656 s, verdict time (first job creation to last job end) 600-882 s over 6 runs'
} | expect_report waited 0

printf '%s\t%s\n' 207 2026-09-30T11:00:00Z 208 2026-09-29T11:00:00Z > "${fake}/listing"
run_times unreadable
expect_report unreadable 1 << 'REPORT'
No recent trunk timings were found: none of the 2 listed runs had readable group jobs (last gh message: HTTP 404: Not Found (https://api.github.com/repos/{owner}/{repo}/actions/runs/208/jobs?per_page=100))
REPORT

: > "${fake}/listing"
run_times empty
expect_report empty 1 << 'REPORT'
No recent trunk timings were found: gh listed no successful ci.yml runs on main.
REPORT

printf 'HTTP 401: Bad credentials (https://api.github.com/graphql)\n' > "${fake}/list-error"
run_times gh-fails
expect_report gh-fails 1 << 'REPORT'
No recent trunk timings were found: gh run list failed: HTTP 401: Bad credentials (https://api.github.com/graphql)
REPORT
