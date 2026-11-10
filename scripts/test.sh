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

# Re-enter through the local admission owner for full runs. Its immediate child
# alone skips this wrapper; a nested suite still validates inherited ownership.
# Keep this before discovery/setup and outside OPEN_DOUGH_TEST_* normalization.
# Pathless local runs take shared admission only when the resolved test
# directory lies inside this checkout. Outside-checkout substitutes (runner
# fixtures over a temporary checks directory) stay independent.
if (($# == 0)) && [[ -z ${CI:-} && -z ${OPEN_DOUGH_TEST_SPLIT:-} && ${DOUGH_LOCAL_SUITE_RUNNER_PID:-} != "${PPID}" ]]; then
  admission_test_dir=${OPEN_DOUGH_TEST_DIR:-tests}
  [[ ${admission_test_dir} == /* ]] || admission_test_dir=${source_dir}/${admission_test_dir}
  checkout=$(pwd -P)
  if resolved=$(cd -- "${admission_test_dir}" 2> /dev/null && pwd -P); then
    case ${resolved}/ in
      "${checkout}"/*)
        exec node "${source_dir}/scripts/local-test-suite.mjs" repository \
          "${source_dir}" "${caller_dir}" "${test_bash}" "${source_dir}/scripts/test.sh"
        ;;
      *) ;; # outside-checkout substitute: skip shared admission
    esac
  fi
fi

# The runner is the one scheduler: every shell check and every `node --test`
# file is its own job, and no job runs a worker pool of its own. Each job keeps
# a private temp directory. Local runs default to four jobs; CI keeps one per
# online CPU. OPEN_DOUGH_TEST_JOBS overrides either with a count of 1 or more.
default_job_slots=4
[[ -z ${CI:-} ]] || default_job_slots=$(getconf _NPROCESSORS_ONLN)
job_slots=${OPEN_DOUGH_TEST_JOBS:-${default_job_slots}}
if ((job_slots < 1)); then
  job_slots=1
fi

output_root=$(mktemp -d)
# Each job's seconds and label, longest first; see scripts/test-budget.sh.
# OPEN_DOUGH_TEST_TIMES names this run's file.
times_file=${OPEN_DOUGH_TEST_TIMES:-${output_root}/times}
# OPEN_DOUGH_TEST_OUTCOMES names a file that receives each job's reported
# outcome and label: `passed`, `failed`, or `unfinished` for a selected check
# the absolute CI run cutoff left unstarted; one tab-separated line per job.
# shellcheck disable=SC2034 # scripts/test-report-jobs.bash writes this file.
outcomes_file=${OPEN_DOUGH_TEST_OUTCOMES:-}
# OPEN_DOUGH_TEST_SLOT_GATE names a file the runner writes each time it finds
# every job slot occupied with a job still queued: the number of jobs started
# so far. The runner then waits for a slot as it always does.
slot_gate_file=${OPEN_DOUGH_TEST_SLOT_GATE:-}
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

# shellcheck disable=SC1091
# shellcheck source=scripts/test-run-job.bash
source "${source_dir}/scripts/test-run-job.bash"
# shellcheck disable=SC1091
# shellcheck source=scripts/test-job-deadline.bash
source "${source_dir}/scripts/test-job-deadline.bash"
# shellcheck disable=SC1091
# shellcheck source=scripts/test-run-deadline.bash
source "${source_dir}/scripts/test-run-deadline.bash"
# shellcheck disable=SC1091
# shellcheck source=scripts/test-report-jobs.bash
source "${source_dir}/scripts/test-report-jobs.bash"

# scripts/test-jobs.sh lists this run's jobs in start order: the named checks,
# resolved from the caller's directory, or with none every check in the test
# directory, and OPEN_DOUGH_TEST_SPLIT's share. The runner resolves the test
# directory once — OPEN_DOUGH_TEST_DIR, default `tests` — and hands it over.
# A bad path fails the run here, before any job starts.
test_dir=${OPEN_DOUGH_TEST_DIR:-tests}
OPEN_DOUGH_TEST_DIR=${test_dir} "${test_bash}" scripts/test-jobs.sh --from "${caller_dir}" "$@" > "${output_root}/jobs"
# Every OPEN_DOUGH_TEST_* setting is the runner's own: it has read each one it
# uses by now, and none reaches a job, so a runner that a check starts runs all
# of its own checks with only the settings that check gives it.
unset "${!OPEN_DOUGH_TEST_@}"
kinds=()
labels=()
while IFS=$'\t' read -r -d '' kind label; do
  kinds+=("${kind}")
  labels+=("${label}")
done < "${output_root}/jobs"

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
  trap '' INT TERM USR1
  # A launch cut short here is reported with its job below.
  exec 2>&4
  launching=''
  interrupt_status=$2
  # shellcheck disable=SC2034 # scripts/test-report-jobs.bash uses this for elapsed fallback.
  observed_at=${EPOCHREALTIME}
  local index pgid stopped=()
  # Retire deadline watchdogs before wait: each may still be blocked on its
  # timed FIFO read, and wait would otherwise sit until that allowance ends.
  retire_run_deadline
  retire_all_job_deadlines
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
trap 'handle_run_deadline_signal' USR1

# Absolute CI run cutoff (OPEN_DOUGH_TEST_DEADLINE_MS), when set: same epoch
# model as the dashboard suite. Local named checks omit it by default.
arm_run_deadline

# run_deadline_hit is assigned in scripts/test-run-deadline.bash.
# shellcheck disable=SC2154
for index in "${!labels[@]}"; do
  if ((run_deadline_hit)) || run_deadline_reached; then
    stop_running_jobs_for_run_deadline
    break
  fi
  if [[ -n ${slot_gate_file} ]] && ! read -r -t 0 -u 3; then
    printf '%s\n' "${index}" > "${slot_gate_file}.partial"
    mv -- "${slot_gate_file}.partial" "${slot_gate_file}"
  fi
  # Timed slot wait so a run-cutoff USR1 is noticed while every slot is busy;
  # an unbounded read would ignore the flag until a job ended on its own.
  while ! read -r -t 0.2 -u 3; do
    if ((run_deadline_hit)) || run_deadline_reached; then
      stop_running_jobs_for_run_deadline
      break 2
    fi
  done
  await_job_slot_handoff
  if ((run_deadline_hit)) || run_deadline_reached; then
    # Slot token was taken; return it so finish can close cleanly.
    printf '\n' >&3
    stop_running_jobs_for_run_deadline
    break
  fi
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
  # The deadline clock starts with this job, not while it was queued. The
  # watchdog stays outside the job's process group so it can finish the group.
  arm_job_deadline "${index}" "${job_pids[index]}"
  jobs_started=$((jobs_started + 1))
done

wait_remaining_jobs
if ((run_deadline_hit)) || run_deadline_reached; then
  stop_running_jobs_for_run_deadline
fi
retire_run_deadline
# shellcheck disable=SC2034 # scripts/test-report-jobs.bash uses this for elapsed fallback.
observed_at=${EPOCHREALTIME}

if ((run_deadline_hit)); then
  print_run_deadline_summary
  status=1
fi

for index in "${!job_started[@]}"; do
  report_job "${index}"
done

write_job_times
write_job_outcomes
# The time budget is CI's and the whole suite's (or a split share's): only a CI
# run (`CI=true`) without chosen checks is judged against it. A run stopped by
# the absolute cutoff has already failed; still leave reports for artifacts.
budget=${test_dir}/time-budget
if ((! run_deadline_hit)); then
  [[ ${CI:-} != true ]] || (($#)) || [[ ! -f ${budget} ]] \
    || "${test_bash}" scripts/test-budget.sh "${budget}" "${times_file}" || status=1
fi

exit "${status}"
