#!/usr/bin/env bash
# Whether a process that is not the caller's child can still act.

# Succeeds while PID names a live process. A reaped or zombie process can no
# longer write.
process_running() {
  local state
  state=$(ps -o stat= -p "$1" 2> /dev/null) && [[ ${state} != Z* ]]
}
