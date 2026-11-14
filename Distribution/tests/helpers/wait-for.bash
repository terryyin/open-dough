#!/usr/bin/env bash
# Bounded waits for an observable condition, never for elapsed time alone.
# Each CONDITION is shell source evaluated in the caller's context. The bound
# is at least LIMIT_SECONDS whole seconds and should cover the awaited
# operation's own lifecycle.

# Sets _wait_now to the current time in microseconds, or in whole seconds
# where the shell has no EPOCHREALTIME (bash before 5). The suite requires
# Bash 5, but native fixtures copy this helper into scripts that an agent host
# runs with its own `bash`, which on macOS can still be Bash 3.2.
wait_for_clock() {
  if [[ -n ${EPOCHREALTIME:-} ]]; then
    _wait_now=${EPOCHREALTIME//[.,]/}
  else
    _wait_now=${SECONDS}
  fi
}

# Polls CONDITION until it succeeds. Returns 1 silently once the bound passes.
# Locals are prefixed so CONDITION still sees the caller's own variables.
poll_until() {
  local _wait_limit=$1 _wait_condition=$2 _wait_now _wait_deadline
  wait_for_clock
  if [[ -n ${EPOCHREALTIME:-} ]]; then
    _wait_deadline=$((_wait_now + _wait_limit * 1000000))
  else
    # Whole seconds tick at wall-clock boundaries; one more never cuts it short.
    _wait_deadline=$((_wait_now + _wait_limit + 1))
  fi
  until eval "${_wait_condition}"; do
    wait_for_clock
    if ((_wait_now >= _wait_deadline)); then
      return 1
    fi
    sleep 0.05
  done
}

# Like poll_until, but a missed event fails with the name of what it awaited.
wait_for() {
  local _wait_description=$1 _wait_limit=$2 _wait_condition=$3
  poll_until "${_wait_limit}" "${_wait_condition}" && return 0
  printf 'error: timed out after %ss waiting for %s\n' \
    "${_wait_limit}" "${_wait_description}" >&2
  return 1
}
