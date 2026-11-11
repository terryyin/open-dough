# Per-job wall-clock safety deadline for scripts/test.sh. Each scheduled Bash
# check or node --test file gets JOB_DEADLINE_SECONDS from its own start.
# Expiry ends that job's process group with bounded TERM→KILL cleanup, settles
# the scheduler slot when the killed job cannot, and leaves a timeout marker
# for reporting. Proof may release the wait early by writing the job's FIFO.
# Absolute CI run cutoff lives in scripts/test-run-deadline.bash; both share
# one TIMEOUT reporting path via job_timeout_heading / job_timed_out.
# shellcheck shell=bash
# source_dir and output_root come from scripts/test.sh.
# shellcheck disable=SC2154

# shellcheck source=scripts/owned-process-group.bash
# shellcheck disable=SC1091
source "${source_dir}/scripts/owned-process-group.bash"

# OPEN_DOUGH_TEST_JOB_DEADLINE_READY names a file the runner replaces each time
# it arms a job's safety deadline: index, wait-FIFO path, and the fixed 180s
# allowance, tab-separated. A write to that FIFO expires the wait without
# wall-clock delay. OPEN_DOUGH_TEST_DISABLE_JOB_DEADLINE=1 skips arming so a
# discriminating check can observe the same scenario without expiry handling.
# Read before scripts/test.sh clears OPEN_DOUGH_TEST_*.
job_deadline_ready_file=${OPEN_DOUGH_TEST_JOB_DEADLINE_READY:-}
job_deadline_disabled=${OPEN_DOUGH_TEST_DISABLE_JOB_DEADLINE:-}

# Fixed safety allowance: stop a never-ending check; not a slow-test threshold.
JOB_DEADLINE_SECONDS=180
JOB_DEADLINE_GRACE_SECONDS=2

declare -a job_deadline_watchdogs=()
declare -a job_deadline_fifos=()
declare -a job_deadline_sentinels=()
declare -a job_deadline_timeout_flags=()

# Publishes INDEX, the wait FIFO path, and the selected duration when a check
# asks to observe deadline arming (OPEN_DOUGH_TEST_JOB_DEADLINE_READY). Each
# arming replaces the ready file (current job) and appends the same line to
# `${ready}.log` so a fast-completing job is not missed by the observer.
publish_job_deadline_ready() {
  local index=$1 fifo=$2
  local partial line
  [[ -n ${job_deadline_ready_file:-} ]] || return 0
  printf -v line '%s\t%s\t%s\n' "${index}" "${fifo}" "${JOB_DEADLINE_SECONDS}"
  printf '%s' "${line}" >> "${job_deadline_ready_file}.log"
  partial="${job_deadline_ready_file}.partial"
  printf '%s' "${line}" > "${partial}"
  mv -- "${partial}" "${job_deadline_ready_file}"
}

# Arms a watchdog outside JOB_PID's process group. No-op when deadlines are
# disabled for discriminating proof.
arm_job_deadline() {
  local index=$1 job_pid=$2
  local sentinel timeout_flag wait_fifo watchdog

  job_deadline_watchdogs[index]=
  job_deadline_fifos[index]=
  job_deadline_sentinels[index]=
  job_deadline_timeout_flags[index]=
  [[ -z ${job_deadline_disabled:-} ]] || return 0

  sentinel=$(mktemp "${output_root}/${index}.deadline-sentinel.XXXXXX")
  timeout_flag="${sentinel}.timed-out"
  wait_fifo="${sentinel}.wait"
  mkfifo "${wait_fifo}"
  job_deadline_sentinels[index]=${sentinel}
  job_deadline_timeout_flags[index]=${timeout_flag}
  job_deadline_fifos[index]=${wait_fifo}

  publish_job_deadline_ready "${index}" "${wait_fifo}"
  # Watchdog and slot settlement run outside the job's process group. On expiry
  # the killed job cannot release its slot; do that here so a blocked launch
  # loop can admit the next queued check without waiting for the final reap.
  (
    owned_process_group_watchdog "${job_pid}" "${job_pid}" \
      "${JOB_DEADLINE_SECONDS}" "${JOB_DEADLINE_GRACE_SECONDS}" \
      "${sentinel}" "${timeout_flag}" "${wait_fifo}" > /dev/null 2>&1
    if [[ -f ${timeout_flag} && ! -e ${output_root}/${index}.status ]]; then
      printf '124\n' > "${output_root}/${index}.status"
      printf '\n' >&3
    fi
  ) &
  watchdog=$!
  job_deadline_watchdogs[index]=${watchdog}
}

# Stops the watchdog for INDEX when its job finished, failed, or the run is
# interrupted. Safe when the job never armed a deadline.
retire_job_deadline() {
  local index=$1
  local watchdog=${job_deadline_watchdogs[index]:-}
  local sentinel=${job_deadline_sentinels[index]:-}
  local wait_fifo=${job_deadline_fifos[index]:-}
  local timeout_flag=${job_deadline_timeout_flags[index]:-}

  [[ -n ${sentinel} ]] && rm -f -- "${sentinel}"
  if [[ -n ${watchdog} ]]; then
    if [[ -n ${timeout_flag} && -f ${timeout_flag} ]]; then
      wait "${watchdog}" 2> /dev/null || true
    else
      owned_process_group_stop_watchdog "${watchdog}"
    fi
  fi
  [[ -n ${wait_fifo} ]] && rm -f -- "${wait_fifo}"
  job_deadline_watchdogs[index]=
  job_deadline_fifos[index]=
  job_deadline_sentinels[index]=
  # Leave timeout_flag for report_job when present; clear the slot otherwise.
  if [[ -n ${timeout_flag} && ! -f ${timeout_flag} ]]; then
    job_deadline_timeout_flags[index]=
  fi
}

# When expiry killed the job before it could write completion files, record a
# failed status and release its scheduler slot so queued work can continue.
settle_timed_out_job() {
  local index=$1
  local timeout_flag=${job_deadline_timeout_flags[index]:-}
  [[ -n ${timeout_flag} && -f ${timeout_flag} ]] || return 0
  if [[ ! -e ${output_root}/${index}.status ]]; then
    printf '124\n' > "${output_root}/${index}.status"
    printf '\n' >&3
  fi
}

job_timed_out() {
  local index=$1
  local timeout_flag=${job_deadline_timeout_flags[index]:-}
  [[ -n ${timeout_flag} && -f ${timeout_flag} ]]
}

job_timeout_heading() {
  local index=$1
  local seconds=$2
  if job_cut_by_run_deadline "${index}"; then
    printf 'TIMEOUT: %s (exhausted run deadline; after %ss)' \
      "${labels[index]}" "${seconds}"
    return 0
  fi
  printf 'TIMEOUT: %s (safety deadline %ss; after %ss)' \
    "${labels[index]}" "${JOB_DEADLINE_SECONDS}" "${seconds}"
}

retire_all_job_deadlines() {
  local index
  for index in "${!job_deadline_watchdogs[@]}"; do
    retire_job_deadline "${index}"
  done
}

# Collect a finished job's status and stop its deadline watchdog immediately so
# a completed check cannot later kill other work. Needed during the launch
# loop: with one slot, the next job starts before the final drain runs.
# job_pids and output_root come from scripts/test.sh.
declare -a job_reaped=()

reap_finished_jobs() {
  local index
  for index in "${!job_pids[@]}"; do
    [[ -z ${job_reaped[index]:-} ]] || continue
    if [[ ! -e ${output_root}/${index}.status ]] && kill -0 "${job_pids[index]}" 2> /dev/null; then
      continue
    fi
    wait "${job_pids[index]}" 2> /dev/null || true
    # A trapped signal can interrupt wait before the worker exits.
    if kill -0 "${job_pids[index]}" 2> /dev/null; then
      continue
    fi
    settle_timed_out_job "${index}"
    retire_job_deadline "${index}"
    job_reaped[index]=1
  done
}

# The slot token already announces completion. Reap that worker directly;
# Bash 5.2's wait -n can miss its exit and wait on a deadline watcher alone.
# Retire finished deadlines before handing the slot to the next launch.
await_job_slot_handoff() {
  if ((run_deadline_hit)) || run_deadline_reached; then
    stop_running_jobs_for_run_deadline
    return 0
  fi
  reap_finished_jobs
}

# Reap workers from their completion records and slot events, without
# wait-any while deadline watchers are alive. A bounded FIFO read also
# notices a worker that died without returning its slot and a run-cutoff USR1.
wait_remaining_jobs() {
  local active_indices index
  while true; do
    if ((run_deadline_hit)) || run_deadline_reached; then
      stop_running_jobs_for_run_deadline
      return 0
    fi
    reap_finished_jobs
    active_indices=()
    for index in "${!job_pids[@]}"; do
      [[ -z ${job_reaped[index]:-} ]] || continue
      active_indices+=("${index}")
    done
    ((${#active_indices[@]} > 0)) || return 0
    read -r -t 0.2 -u 3 _ || true
  done
}
