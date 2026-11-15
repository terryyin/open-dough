#!/usr/bin/env bash
# Own one detached native command, with an optional active-turn controller.
# Both routes share model/watchdog setup and the supervisor's deadline and
# group teardown authority; only their wait and cleanup ordering differ.
# shellcheck disable=SC2034,SC2154,SC2312 # Supervisor/case globals and wait receipts.

# Sets the caller-local model and watchdog resources for either supervision
# route. The controller adds its own group before the shared watchdog starts.
native_run_start_owned() {
  local stdout_file=$1
  local stderr_file=$2
  local workdir=$3
  shift 3
  native_run_outcome=exited
  sentinel=$(mktemp "${TMPDIR:-/tmp}/native-run.XXXXXX")
  timeout_flag="${sentinel}.timed-out"
  # Create the watchdog's fifo here so a stopped watchdog cannot recreate it
  # after cleanup.
  wait_fifo="${sentinel}.wait"
  mkfifo "${wait_fifo}"

  native_run_spawn_group "${workdir}" "$@" > "${stdout_file}" 2>> "${stderr_file}" &
  pid=$!
  # Wait until setsid/setpgrp detaches; do not sample the caller's group.
  pgid=$(native_run_child_pgid "${pid}" "$(native_run_pgid_of $$)")
}

native_run_watch_owned() {
  native_run_watchdog "${pid}" "${pgid}" "${native_case_deadline:-3600}" "${native_case_grace:-15}" \
    "${sentinel}" "${timeout_flag}" "${wait_fifo}" > /dev/null 2>&1 &
  watchdog=$!
}

native_run_owned() {
  if [[ -n ${native_run_controller_command[0]-} ]]; then
    native_run_owned_controlled "$@"
    return $?
  fi
  local pid pgid watchdog sentinel timeout_flag wait_fifo status=0
  native_run_start_owned "$@"
  native_run_watch_owned

  wait "${pid}" || status=$?
  rm -f "${sentinel}"
  if [[ -f ${timeout_flag} ]]; then
    wait "${watchdog}" 2> /dev/null || true
    rm -f "${timeout_flag}" "${wait_fifo}"
    native_run_outcome=timeout
    return 124
  fi
  native_run_stop_watchdog "${watchdog}"
  rm -f "${timeout_flag}" "${wait_fifo}"
  return "${status}"
}

native_run_wait_first() {
  local child rc
  while :; do
    for child in "$@"; do
      if ! kill -0 "${child}" 2> /dev/null; then
        native_run_finished=${child}
        wait "${child}"
        return $?
      fi
    done
    rc=0
    wait -n -p native_run_finished "$@" 2> /dev/null || rc=$?
    # Bash's wait -n excludes already reaped jobs; explicit wait above keeps
    # their cached status when they finish between the sample and wait -n.
    [[ -z ${native_run_finished-} ]] || return "${rc}"
  done
}

native_run_owned_controlled() {
  local stdout_file=$1 stderr_file=$2 workdir=$3
  shift 3
  local pid pgid controller controller_pgid watchdog sentinel timeout_flag wait_fifo
  local status=0 controller_status=0 interrupted=0 saved_int saved_term
  native_run_failure_reason=
  native_run_start_owned "${stdout_file}" "${stderr_file}" "${workdir}" "$@"
  native_run_spawn_group '' "${native_run_controller_command[@]}" >> "${stderr_file}" 2>&1 &
  controller=$!
  controller_pgid=$(native_run_child_pgid "${controller}" "$(native_run_pgid_of $$)")
  saved_int=$(trap -p INT) saved_term=$(trap -p TERM)
  trap 'interrupted=130; native_run_terminate_group "${pgid}" "${pid}" 0; native_run_terminate_group "${controller_pgid}" "${controller}" 0' INT
  trap 'interrupted=143; native_run_terminate_group "${pgid}" "${pid}" 0; native_run_terminate_group "${controller_pgid}" "${controller}" 0' TERM
  native_run_watch_owned
  native_run_wait_first "${pid}" "${controller}" || status=$?
  if [[ ${native_run_finished-} == "${controller}" ]]; then
    controller_status=${status}
    if ((controller_status == 0)); then
      status=0
      wait "${pid}" || status=$?
    else
      native_run_mark_failed "active-turn controller exited ${controller_status}"
    fi
  else
    # A model that ends early cannot be kept alive to fake an in-flight event.
    if kill -0 "${controller}" 2> /dev/null; then
      native_run_mark_failed 'native command ended before its active-turn controller'
      [[ ${status} -ne 0 ]] || status=125
    else
      wait "${controller}" || controller_status=$?
      if ((controller_status != 0)); then
        native_run_mark_failed "active-turn controller exited ${controller_status}"
        [[ ${status} -ne 0 ]] || status=${controller_status}
      fi
    fi
  fi
  native_run_terminate_group "${pgid}" "${pid}" 0
  native_run_terminate_group "${controller_pgid}" "${controller}" 0
  wait "${pid}" 2> /dev/null || true
  wait "${controller}" 2> /dev/null || true
  rm -f "${sentinel}"
  native_run_stop_watchdog "${watchdog}"
  if [[ -f ${timeout_flag} ]]; then
    native_run_outcome=timeout status=124
  elif ((interrupted != 0)); then
    native_run_mark_failed 'active-turn execution interrupted'
    status=${interrupted}
  fi
  rm -f "${timeout_flag}" "${wait_fifo}"
  trap - INT TERM
  [[ -z ${saved_int} ]] || eval "${saved_int}"
  [[ -z ${saved_term} ]] || eval "${saved_term}"
  return "${status}"
}
