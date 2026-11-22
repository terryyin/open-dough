#!/usr/bin/env bash
# Own one detached native command, with an optional active-turn controller.
# Both routes share the watchdog and group teardown. On INT or TERM the
# supervisor stops its owned groups, restores the caller's signal traps and
# returns 130 or 143, also in native_run_interrupt_status.
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
  pgid=$(native_run_child_pgid "${pid}" "${supervisor_pgid}")
}

native_run_watch_owned() {
  native_run_watchdog "${pid}" "${pgid}" "${native_case_deadline:-3600}" "${native_case_grace:-15}" \
    "${sentinel}" "${timeout_flag}" "${wait_fifo}" > /dev/null 2>&1 &
  watchdog=$!
}

# The interrupt trap can run during startup, before either group is known.
# Startup finishes acquiring any group it already spawned; teardown then
# stops that group too. Stop any groups already known to release a blocked wait.
native_run_interrupt_owned() {
  ((native_run_interrupt_status == 0)) || return 0
  native_run_interrupt_status=$1
  native_run_stop_groups "${native_case_grace:-15}"
}

native_run_stop_groups() {
  local grace=$1
  if [[ -n ${pgid} ]]; then
    native_run_terminate_group "${pgid}" "${pid}" "${grace}"
    pgid=
  fi
  if [[ -n ${controller_pgid} ]]; then
    native_run_terminate_group "${controller_pgid}" "${controller}" "${grace}"
    controller_pgid=
  fi
}

native_run_owned() {
  local stdout_file=$1 stderr_file=$2 workdir=$3
  shift 3
  local pid pgid='' controller='' controller_pgid='' watchdog='' sentinel timeout_flag wait_fifo
  local supervisor_pid=${BASHPID} supervisor_pgid
  local status=0 saved_int saved_term
  native_run_interrupt_status=0
  native_run_failure_reason=
  saved_int=$(trap -p INT) saved_term=$(trap -p TERM)
  trap 'native_run_interrupt_owned 130' INT
  trap 'native_run_interrupt_owned 143' TERM

  supervisor_pgid=$(native_run_pgid_of "${supervisor_pid}")
  native_run_start_owned "${stdout_file}" "${stderr_file}" "${workdir}" "$@"
  if ((native_run_interrupt_status == 0)) && [[ -n ${native_run_controller_command[0]-} ]]; then
    native_run_spawn_group '' "${native_run_controller_command[@]}" >> "${stderr_file}" 2>&1 &
    controller=$!
    controller_pgid=$(native_run_child_pgid "${controller}" "${supervisor_pgid}")
  fi
  if ((native_run_interrupt_status == 0)); then
    native_run_watch_owned
    if [[ -n ${controller} ]]; then
      native_run_wait_controlled || status=$?
    else
      wait "${pid}" || status=$?
    fi
  fi

  if ((native_run_interrupt_status != 0)); then
    native_run_stop_groups "${native_case_grace:-15}"
    wait "${pid}" 2> /dev/null || true
    [[ -z ${controller} ]] || wait "${controller}" 2> /dev/null || true
  elif [[ -n ${controller} ]]; then
    native_run_stop_groups 0
    wait "${pid}" 2> /dev/null || true
    wait "${controller}" 2> /dev/null || true
  fi
  rm -f "${sentinel}"
  if [[ -n ${watchdog} ]]; then
    if [[ -f ${timeout_flag} && -z ${controller} ]] && ((native_run_interrupt_status == 0)); then
      wait "${watchdog}" 2> /dev/null || true
    fi
    native_run_stop_watchdog "${watchdog}"
  fi
  if ((native_run_interrupt_status != 0)); then
    native_run_mark_failed 'native execution interrupted'
    status=${native_run_interrupt_status}
  elif [[ -f ${timeout_flag} ]]; then
    native_run_outcome=timeout status=124
  fi
  rm -f "${timeout_flag}" "${wait_fifo}"
  if [[ -n ${saved_int} ]]; then eval "${saved_int}"; else trap - INT; fi
  if [[ -n ${saved_term} ]]; then eval "${saved_term}"; else trap - TERM; fi
  return "${status}"
}

# Returns the status of whichever CHILD ends first, named in
# native_run_finished. Bash's wait -n can miss a child that exits as it
# starts waiting and then blocks on the other child alone, so observe each
# exit and reap that child by pid; the watchdog still bounds the wait.
native_run_wait_first() {
  local child
  native_run_finished=
  while :; do
    for child in "$@"; do
      if ! kill -0 "${child}" 2> /dev/null; then
        native_run_finished=${child}
        wait "${child}"
        return $?
      fi
    done
    sleep 0.05
  done
}

native_run_wait_controlled() {
  local status=0 controller_status=0
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
  return "${status}"
}
