# Per-job reporting for scripts/test.sh: wall seconds, FAIL/TIMEOUT/INTERRUPTED
# headings, times file, and outcomes including unfinished unstarted checks.
# shellcheck shell=bash
# labels, output_root, job_started, interrupt_status, observed_at, status,
# times_file, and outcomes_file come from scripts/test.sh.
# shellcheck disable=SC2154

# Prints one started job's wall seconds: those its job, or the safety deadline
# that stopped it, recorded; or, when none were, the time from its start until
# the runner observed it ended.
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
# and the tail of its output. A job whose safety deadline expired, or that the
# absolute run cutoff stopped unfinished, is reported with its label, the
# deadline reason, elapsed time, and captured output through one TIMEOUT path.
# Otherwise a job that ended without recording a status, such as one whose
# shell was killed, failed. A reported job sets the run's status to 1 and its
# outcome to `failed`; any other started job's is `passed`. Selected checks
# never started under the absolute cutoff are recorded as `unfinished` outside
# this helper and get no invented timing.
outcomes=()
report_job() {
  local index=$1 log="${output_root}/$1.log" launch="${output_root}/$1.launch"
  local job_status='' seconds heading show_log=(cat --)
  outcomes[index]=failed
  if [[ -e ${output_root}/${index}.status ]]; then
    read -r job_status < "${output_root}/${index}.status"
  fi
  if [[ -n ${interrupt_status} &&
    (-z ${job_status} || ${job_status} -eq ${interrupt_status}) ]]; then
    seconds=$(job_seconds "${index}")
    heading="INTERRUPTED: ${labels[index]} (after ${seconds}s); last lines of its output:"
    show_log=(tail -n 40 --)
  elif job_timed_out "${index}"; then
    seconds=$(job_seconds "${index}")
    heading=$(job_timeout_heading "${index}" "${seconds}")
  elif [[ -z ${job_status} ]]; then
    heading="FAIL: ${labels[index]} (ended without recording an exit status)"
  elif [[ ${job_status} -ne 0 ]]; then
    heading="FAIL: ${labels[index]}"
  elif [[ -s ${log} || -s ${launch} ]]; then
    heading="FAIL: ${labels[index]} (passed but printed output)"
  else
    outcomes[index]=passed
    # An explicit status: under the interrupt trap, Bash before 5.3 gives a
    # bare `return` the interrupted `wait`'s status, which `set -e` ends on.
    return 0
  fi
  {
    printf '%s\n' "${heading}"
    [[ ! -s ${launch} ]] || cat -- "${launch}"
    "${show_log[@]}" "${log}"
  } >&2
  # shellcheck disable=SC2034 # scripts/test.sh reads status for the run exit.
  status=1
}

# Timing only for jobs that started; unstarted cutoff work gets no invented time.
write_job_times() {
  : > "${times_file}"
  if ((${#job_started[@]} > 0)); then
    local index seconds
    for index in "${!job_started[@]}"; do
      # shellcheck disable=SC2312
      seconds=$(job_seconds "${index}")
      printf '%s\t%s\n' "${seconds}" "${labels[index]}"
    done | sort -rn > "${times_file}"
  fi
}

write_job_outcomes() {
  [[ -n ${outcomes_file} ]] || return 0
  local index
  for index in "${!labels[@]}"; do
    if [[ -z ${job_started[index]+x} ]]; then
      printf 'unfinished\t%s\n' "${labels[index]}"
    else
      printf '%s\t%s\n' "${outcomes[index]}" "${labels[index]}"
    fi
  done > "${outcomes_file}"
}
