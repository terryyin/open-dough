#!/usr/bin/env bash
# Wait for a native run's deadline without spawning a sleeper that can leak.
# Implementation lives in scripts/owned-process-group.bash.

native_run_watchdog_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
# shellcheck source=scripts/owned-process-group.bash
# shellcheck disable=SC1091
source "${native_run_watchdog_dir}/scripts/owned-process-group.bash"

native_run_watchdog() {
  owned_process_group_watchdog "$@"
}

native_run_stop_watchdog() {
  owned_process_group_stop_watchdog "$@"
}
