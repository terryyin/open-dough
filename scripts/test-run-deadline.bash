# Absolute CI run cutoff for scripts/test.sh. When OPEN_DOUGH_TEST_DEADLINE_MS
# names an absolute epoch in milliseconds (CI's 320-second allowance established
# with setup), the shared terminate and TIMEOUT report path stops the whole
# selected run: running groups end, queued checks do not start, started
# unfinished jobs stay failed with timing, and unstarted selected jobs get an
# unfinished outcome without invented time. Proof may release the wait early by
# writing the run wait FIFO. Source after scripts/test-job-deadline.bash.
# shellcheck shell=bash
# source_dir, output_root, labels, job_pids, and per-job deadline arrays come
# from scripts/test.sh / scripts/test-job-deadline.bash. run_deadline_hit is
# assigned here and read by scripts/test.sh.
# shellcheck disable=SC2154,SC2034

# OPEN_DOUGH_TEST_DEADLINE_MS is the absolute run cutoff epoch (ms).
# OPEN_DOUGH_TEST_RUN_DEADLINE_READY receives the run wait-FIFO and remaining
# whole seconds when the run cutoff is armed. OPEN_DOUGH_TEST_DISABLE_RUN_DEADLINE=1
# skips the absolute cutoff for discriminating proof. Read before
# scripts/test.sh clears OPEN_DOUGH_TEST_*.
run_deadline_ms=${OPEN_DOUGH_TEST_DEADLINE_MS:-}
run_deadline_ready_file=${OPEN_DOUGH_TEST_RUN_DEADLINE_READY:-}
run_deadline_disabled=${OPEN_DOUGH_TEST_DISABLE_RUN_DEADLINE:-}

declare -a job_run_deadline_flags=()

run_deadline_watchdog=
run_deadline_fifo=
run_deadline_sentinel=
run_deadline_flag=
# scripts/test.sh reads this after wait/slot loops (cross-file shared flag).
run_deadline_hit=0

job_cut_by_run_deadline() {
  local index=$1
  local flag=${job_run_deadline_flags[index]:-}
  [[ -n ${flag} && -f ${flag} ]]
}

# Epoch milliseconds from EPOCHREALTIME (seconds with fraction).
now_epoch_ms() {
  local now=${EPOCHREALTIME}
  printf '%s\n' "$((${now%.*} * 1000 + 10#${now#*.} / 1000))"
}

run_deadline_configured() {
  [[ -n ${run_deadline_ms} && -z ${run_deadline_disabled} ]]
}

# True when the absolute cutoff is armed and its flag exists (wall expiry or
# proof wrote the wait FIFO).
run_deadline_reached() {
  run_deadline_configured || return 1
  [[ -n ${run_deadline_flag} && -f ${run_deadline_flag} ]]
}

# Remaining whole seconds until run_deadline_ms, or 0 when already past.
run_deadline_remaining_seconds() {
  local now_ms remaining
  now_ms=$(now_epoch_ms)
  remaining=$(((run_deadline_ms - now_ms + 999) / 1000))
  if ((remaining < 0)); then
    remaining=0
  fi
  printf '%s\n' "${remaining}"
}

publish_run_deadline_ready() {
  local fifo=$1 remaining=$2
  local partial
  [[ -n ${run_deadline_ready_file:-} ]] || return 0
  partial="${run_deadline_ready_file}.partial"
  printf '%s\t%s\n' "${fifo}" "${remaining}" > "${partial}"
  mv -- "${partial}" "${run_deadline_ready_file}"
}

# Arms the absolute run cutoff outside every job group. No-op when unset or
# disabled. When the epoch is already past, marks the hit immediately. On later
# expiry the watchdog writes the flag, a slot token that ends the launch loop's
# untimed slot wait, and signals the runner (USR1) so a blocked wait returns;
# the shared stop/report path then runs.
arm_run_deadline() {
  local remaining sentinel wait_fifo runner_pid=$$

  run_deadline_watchdog=
  run_deadline_fifo=
  run_deadline_sentinel=
  run_deadline_flag=
  run_deadline_configured || return 0

  remaining=$(run_deadline_remaining_seconds)
  if ((remaining <= 0)); then
    run_deadline_flag="${output_root}/run-deadline.timed-out"
    : > "${run_deadline_flag}"
    run_deadline_hit=1
    return 0
  fi

  sentinel=$(mktemp "${output_root}/run-deadline-sentinel.XXXXXX")
  run_deadline_flag="${sentinel}.timed-out"
  wait_fifo="${sentinel}.wait"
  mkfifo "${wait_fifo}"
  run_deadline_sentinel=${sentinel}
  run_deadline_fifo=${wait_fifo}
  publish_run_deadline_ready "${wait_fifo}" "${remaining}"

  (
    trap 'exit 0' TERM INT
    exec 4<> "${wait_fifo}"
    read -r -t "${remaining}" -u 4 _ || true
    exec 4>&-
    if [[ ! -f ${sentinel} ]]; then
      exit 0
    fi
    : > "${run_deadline_flag}"
    printf '\n' >&3
    kill -USR1 "${runner_pid}" 2> /dev/null || true
  ) &
  run_deadline_watchdog=$!
}

retire_run_deadline() {
  local watchdog=${run_deadline_watchdog:-}
  local sentinel=${run_deadline_sentinel:-}
  local wait_fifo=${run_deadline_fifo:-}

  [[ -n ${sentinel} ]] && rm -f -- "${sentinel}"
  if [[ -n ${watchdog} ]]; then
    if [[ -n ${run_deadline_flag} && -f ${run_deadline_flag} ]]; then
      wait "${watchdog}" 2> /dev/null || true
    else
      owned_process_group_stop_watchdog "${watchdog}"
    fi
  fi
  [[ -n ${wait_fifo} ]] && rm -f -- "${wait_fifo}"
  run_deadline_watchdog=
  run_deadline_fifo=
  run_deadline_sentinel=
}

# Shared bounded cleanup for one started job that must end before reporting:
# used by the absolute run cutoff (per-job safety expiry uses the watchdog).
stop_owned_job_group() {
  local index=$1
  local job_pid=${job_pids[index]:-}
  local pgid

  [[ -n ${job_pid} ]] || return 0
  if [[ -e ${output_root}/${index}.status ]]; then
    return 0
  fi
  pgid=$(owned_process_group_pgid_of "${job_pid}")
  [[ -n ${pgid} ]] || pgid=${job_pid}
  owned_process_group_terminate "${pgid}" "${job_pid}" "${JOB_DEADLINE_GRACE_SECONDS}"
}

# Ends every still-running owned group for the absolute cutoff, marks each for
# the shared TIMEOUT reporting path, and settles status/slots. Idempotent.
stop_running_jobs_for_run_deadline() {
  local index flag
  run_deadline_hit=1
  [[ -n ${run_deadline_flag} ]] && : > "${run_deadline_flag}"
  # Already stopped once for this cutoff.
  if [[ -f ${output_root}/run-deadline.stopped ]]; then
    return 0
  fi
  : > "${output_root}/run-deadline.stopped"
  retire_all_job_deadlines
  for index in "${!job_pids[@]}"; do
    if [[ -e ${output_root}/${index}.status ]]; then
      continue
    fi
    flag="${output_root}/${index}.run-deadline"
    : > "${flag}"
    job_run_deadline_flags[index]=${flag}
    # Reuse the per-job timeout marker so report_job shares one path.
    if [[ -z ${job_deadline_timeout_flags[index]:-} ]]; then
      job_deadline_timeout_flags[index]=${flag}
    else
      : > "${job_deadline_timeout_flags[index]}"
    fi
    stop_owned_job_group "${index}"
    if [[ ! -e ${output_root}/${index}.status ]]; then
      printf '124\n' > "${output_root}/${index}.status"
      printf '\n' >&3
    fi
  done
  wait || true
  for index in "${!job_pids[@]}"; do
    if [[ -n ${job_pids[index]:-} && -z ${job_reaped[index]:-} ]]; then
      wait "${job_pids[index]}" 2> /dev/null || true
      job_reaped[index]=1
    fi
  done
  retire_run_deadline
}

print_run_deadline_summary() {
  local index
  local running=() not_started=()
  for index in "${!job_started[@]}"; do
    if job_cut_by_run_deadline "${index}"; then
      running+=("${labels[index]}")
    fi
  done
  for index in "${!labels[@]}"; do
    if [[ -z ${job_started[index]+x} ]]; then
      not_started+=("${labels[index]}")
    fi
  done
  printf 'RUN DEADLINE: exhausted absolute cutoff' >&2
  if [[ -n ${run_deadline_ms} ]]; then
    printf ' (OPEN_DOUGH_TEST_DEADLINE_MS=%s)' "${run_deadline_ms}" >&2
  fi
  printf '.\n' >&2
  if ((${#running[@]} > 0)); then
    local joined
    printf -v joined '%s, ' "${running[@]}"
    printf 'unfinished running: %s\n' "${joined%, }" >&2
  fi
  if ((${#not_started[@]} > 0)); then
    local joined
    printf -v joined '%s, ' "${not_started[@]}"
    printf 'not started: %s\n' "${joined%, }" >&2
  fi
}

# USR1 from the run-cutoff watchdog only marks the hit. Stopping owned groups
# runs on the main path after wait returns; traps must not call wait.
handle_run_deadline_signal() {
  # shellcheck disable=SC2034 # scripts/test.sh reads this flag on the main path.
  run_deadline_hit=1
  [[ -n ${run_deadline_flag} ]] && : > "${run_deadline_flag}"
}
