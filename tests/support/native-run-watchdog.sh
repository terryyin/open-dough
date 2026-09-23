#!/usr/bin/env bash
# Wait for a native run's deadline without spawning a sleeper that can leak.

native_run_watchdog() {
  local pid=$1
  local pgid=$2
  local deadline=$3
  local grace=$4
  local sentinel=$5
  local timeout_flag=$6
  local wait_pipe="${sentinel}.wait"

  # A timed read needs no child that could survive a raced shutdown and keep
  # the caller's command-substitution output pipe open.
  trap 'exit 0' TERM INT
  mkfifo "${wait_pipe}"
  exec 4<> "${wait_pipe}"
  read -r -t "${deadline}" -u 4 _ || true
  exec 4>&-
  rm -f -- "${wait_pipe}"
  if [[ ! -f ${sentinel} ]]; then
    exit 0
  fi
  : > "${timeout_flag}"
  native_run_terminate_group "${pgid}" "${pid}" "${grace}"
}

native_run_stop_watchdog() {
  local watchdog=$1
  local attempt

  kill -s TERM "${watchdog}" 2> /dev/null || true
  for ((attempt = 0; attempt < 10; attempt++)); do
    if ! kill -0 "${watchdog}" 2> /dev/null; then
      break
    fi
    sleep 0.05
  done
  # The background shell can miss TERM before its trap is installed. Bound
  # completion even then; this watchdog owns no child process.
  if kill -0 "${watchdog}" 2> /dev/null; then
    kill -s KILL "${watchdog}" 2> /dev/null || true
  fi
  wait "${watchdog}" 2> /dev/null || true
}
