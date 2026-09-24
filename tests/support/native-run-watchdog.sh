#!/usr/bin/env bash
# Wait for a native run's deadline without spawning a sleeper that can leak.

native_run_watchdog() {
  local pid=$1
  local pgid=$2
  local deadline=$3
  local grace=$4
  local sentinel=$5
  local timeout_flag=$6
  local wait_fifo=$7

  # A timed read needs no child that could survive a raced shutdown and keep
  # the caller's command-substitution output pipe open.
  trap 'exit 0' TERM INT
  exec 4<> "${wait_fifo}"
  read -r -t "${deadline}" -u 4 _ || true
  exec 4>&-
  if [[ ! -f ${sentinel} ]]; then
    exit 0
  fi
  : > "${timeout_flag}"
  native_run_terminate_group "${pgid}" "${pid}" "${grace}"
}

native_run_stop_watchdog() {
  local watchdog=$1

  # Until the forked watchdog resets inherited traps, a catchable signal runs
  # the caller's EXIT cleanup inside it. It owns no child or cleanup of its
  # own, so KILL is the only stop that cannot delete the caller's evidence.
  kill -s KILL "${watchdog}" 2> /dev/null || true
  wait "${watchdog}" 2> /dev/null || true
}
