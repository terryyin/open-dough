#!/usr/bin/env bash
set -euo pipefail

# scripts/test.sh [path…] runs the named checks, or with none, the whole suite.
caller_dir=${PWD}
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd -- "${source_dir}"
# shellcheck disable=SC1091
# shellcheck source=scripts/lost-setpgid-race.bash
source scripts/lost-setpgid-race.bash

# shellcheck disable=SC1091
# shellcheck source=scripts/test-environment.bash
source "${source_dir}/scripts/test-environment.bash"
# The sourced environment resolves the Bash every check runs in.
readonly test_bash

# The runner is the one scheduler: every shell check and every `node --test`
# file is its own job, and no job runs a worker pool of its own. Each job keeps
# a private temp directory. Plan 073 capped the pool at four because elapsed-time
# waits starved at eight; tests now wait for events, so the default is one slot
# per online CPU. OPEN_DOUGH_TEST_JOBS overrides it with any count of 1 or more.
job_slots=${OPEN_DOUGH_TEST_JOBS:-$(getconf _NPROCESSORS_ONLN)}
if ((job_slots < 1)); then
  job_slots=1
fi

output_root=$(mktemp -d)
# Each job's seconds and label, longest first; see scripts/test-budget.sh.
# OPEN_DOUGH_TEST_TIMES names this run's file; jobs do not inherit it, so a
# runner that a check starts keeps its times in its own output.
times_file=${OPEN_DOUGH_TEST_TIMES:-${output_root}/times}
unset OPEN_DOUGH_TEST_TIMES
# fd 4 keeps the runner's stderr while it goes to a launching job's launch file
# (see the launch loop); an exit mid-launch restores it and shows that file.
exec 4>&2
launching=''
# shellcheck disable=SC2329 # Invoked by the EXIT trap below.
finish() {
  exec 2>&4
  [[ ! -s ${launching} ]] || cat -- "${launching}" >&2
  rm -rf -- "${output_root}"
}
trap finish EXIT
mkfifo "${output_root}/slots"
exec 3<> "${output_root}/slots"
for ((slot = 0; slot < job_slots; slot++)); do
  printf '\n' >&3
done

# Prints the seconds between two EPOCHREALTIME readings, to a tenth.
elapsed_seconds() {
  awk -v start="$1" -v end="$2" 'BEGIN { printf "%.1f\n", end - start }'
}

node_reporter="${source_dir}/tests/support/node-test-failures-reporter.mjs"
check_stop_report="${source_dir}/tests/support/check-stop-report.bash"
run_job() {
  exec 2>&4 4>&-
  local index=$1 kind=$2 label=$3
  local log="${output_root}/${index}.log" launch="${output_root}/${index}.launch"
  local job_status=0 started=${EPOCHREALTIME}
  if [[ ${kind} == node ]]; then
    node --test --test-reporter="${node_reporter}" "${label}" > "${log}" 2>&1 \
      || job_status=$?
  else
    BASH_ENV="${check_stop_report}" "${test_bash}" "${label}" > "${log}" 2>&1 \
      || job_status=$?
  fi
  # Only a lost setpgid race's launch line is emptied; any other launch output
  # stays and fails the run.
  if [[ -s ${launch} ]] && lost_setpgid_race "${BASHPID}" "${launch}"; then
    : > "${launch}"
  fi
  printf '%s\n' "${job_status}" > "${output_root}/${index}.status"
  elapsed_seconds "${started}" "${EPOCHREALTIME}" > "${output_root}/${index}.seconds"
  printf '\n' >&3
}

# scripts/test-jobs.sh lists this run's jobs in start order: the named checks,
# resolved from the caller's directory, or with none every check in
# OPEN_DOUGH_TEST_DIR (default `tests`), and OPEN_DOUGH_TEST_SPLIT's share. A
# bad path fails the run here, before any job starts. Like
# OPEN_DOUGH_TEST_TIMES, jobs do not inherit the split, so a runner that a
# check starts runs all of its own checks.
"${test_bash}" scripts/test-jobs.sh --from "${caller_dir}" "$@" > "${output_root}/jobs"
unset OPEN_DOUGH_TEST_SPLIT
kinds=()
labels=()
while IFS=$'\t' read -r -d '' kind label; do
  kinds+=("${kind}")
  labels+=("${label}")
done < "${output_root}/jobs"

# Prints one started job's wall seconds: those its job recorded, or, when the
# job left none, the time from its start until the runner observed it ended.
job_seconds() {
  local index=$1 seconds
  if [[ -e ${output_root}/${index}.seconds ]]; then
    read -r seconds < "${output_root}/${index}.seconds"
    printf '%s\n' "${seconds}"
  else
    elapsed_seconds "${job_started[index]}" "${observed_at}"
  fi
}

# Reports one started job from what the runner observed: the exit status it
# recorded, or none. Only failing checks are reported, each with its own
# captured output. A passing check must be silent, so a check that exits 0 but
# wrote anything fails too. On an interrupt, a job still running, or one that
# ended from the same signal, is reported as interrupted with its elapsed time
# and the tail of its output. Otherwise a job that ended without recording a
# status, such as one whose shell was killed, failed. A reported job sets the
# run's status to 1.
report_job() {
  local index=$1 log="${output_root}/$1.log" launch="${output_root}/$1.launch"
  local job_status='' seconds heading show_log=(cat --)
  if [[ -e ${output_root}/${index}.status ]]; then
    read -r job_status < "${output_root}/${index}.status"
  fi
  if [[ -n ${interrupt_status} &&
    (-z ${job_status} || ${job_status} -eq ${interrupt_status}) ]]; then
    seconds=$(job_seconds "${index}")
    heading="INTERRUPTED: ${labels[index]} (after ${seconds}s); last lines of its output:"
    show_log=(tail -n 40 --)
  elif [[ -z ${job_status} ]]; then
    heading="FAIL: ${labels[index]} (ended without recording an exit status)"
  elif [[ ${job_status} -ne 0 ]]; then
    heading="FAIL: ${labels[index]}"
  elif [[ -s ${log} || -s ${launch} ]]; then
    heading="FAIL: ${labels[index]} (passed but printed output)"
  else
    # An explicit status: under the interrupt trap, Bash before 5.3 gives a
    # bare `return` the interrupted `wait`'s status, which `set -e` ends on.
    return 0
  fi
  {
    printf '%s\n' "${heading}"
    [[ ! -s ${launch} ]] || cat -- "${launch}"
    "${show_log[@]}" "${log}"
  } >&2
  status=1
}

# Each job runs in a process group of its own: job control is on only while
# the job starts, which also keeps INT from being ignored in it. Stopping a job
# therefore reaches everything it started, without `setsid`, which macOS lacks.
# Workers a check deliberately detaches leave the group and stay that check's
# own teardown. A terminal's Ctrl-C reaches the runner but not the jobs, so on
# INT or TERM the runner stops the jobs still running, reports every started
# job, and exits with the signal's status. Logs are removed after the report.
interrupt_status=''
status=0
job_pids=()
job_started=()
# shellcheck disable=SC2329 # Invoked by the INT and TERM traps below.
interrupt() {
  trap '' INT TERM
  # A launch cut short here is reported with its job below.
  exec 2>&4
  launching=''
  interrupt_status=$2
  observed_at=${EPOCHREALTIME}
  local index pgid stopped=()
  for index in "${!job_pids[@]}"; do
    if [[ ! -e ${output_root}/${index}.status ]]; then
      kill -TERM -- "-${job_pids[index]}" 2> /dev/null || true
      stopped+=("${job_pids[index]}")
    fi
  done
  wait || true
  # A process that outlived TERM in a stopped group does not outlive KILL.
  for pgid in "${stopped[@]}"; do
    kill -KILL -- "-${pgid}" 2> /dev/null || true
  done
  printf 'Test run interrupted by SIG%s.\n' "$1" >&2
  for index in "${!job_started[@]}"; do
    report_job "${index}"
  done
  exit "${interrupt_status}"
}
trap 'interrupt INT 130' INT
trap 'interrupt TERM 143' TERM

for index in "${!labels[@]}"; do
  read -r -u 3
  job_started[index]=${EPOCHREALTIME}
  # What Bash writes while starting the job, before the job's own output
  # redirection, goes to its launch file; the job and its report handle it.
  launching="${output_root}/${index}.launch"
  exec 2> "${launching}"
  set -m
  run_job "${index}" "${kinds[index]}" "${labels[index]}" < /dev/null &
  set +m
  exec 2>&4
  launching=''
  job_pids[index]=$!
done

wait
observed_at=${EPOCHREALTIME}

for index in "${!labels[@]}"; do
  report_job "${index}"
done

for index in "${!labels[@]}"; do
  seconds=$(job_seconds "${index}")
  printf '%s\t%s\n' "${seconds}" "${labels[index]}"
done | sort -rn > "${times_file}"
# The time budget is CI's and the whole suite's (or a split share's): only a CI
# run (`CI=true`) without chosen checks is judged against it.
budget="${OPEN_DOUGH_TEST_DIR:-tests}/time-budget"
[[ ${CI:-} != true ]] || (($#)) || [[ ! -f ${budget} ]] \
  || "${test_bash}" scripts/test-budget.sh "${budget}" "${times_file}" || status=1

exit "${status}"
