#!/usr/bin/env bash
# Stopping a completed command's watchdog must be bounded, reap the watchdog,
# run none of its shell handlers, and leave no scratch.
# shellcheck disable=SC2016,SC2034 # Child shell uses $1; supervisor reads deadline globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
# shellcheck source=Distribution/evaluation/src/native-run-supervise.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/evaluation/src/native-run-supervise.sh"
# shellcheck source=Distribution/evaluation/tests/native-harness/support/native-check-expectations.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-check-expectations.sh"

work_dir=''
native_check_workspace work_dir
ready="${work_dir}/watchdog-ready"
handler_ran="${work_dir}/watchdog-handler-ran"
export TMPDIR="${work_dir}/tmp"
mkdir -p -- "${TMPDIR}"

# Hold the watchdog in the state of a just-forked subshell: a catchable TERM
# still runs caller cleanup (recorded here) and does not stop it.
native_run_watchdog() {
  trap 'printf "%s\n" TERM > "${handler_ran}"' TERM
  printf '%s\n' "${BASHPID}" > "${ready}"
  while :; do sleep 0.05; done
}

start=$(date +%s)
native_case_deadline=5
native_case_grace=0
# The command awaits the watchdog within its own deadline, so a missed ready
# signal fails by name before the watchdog would stop it.
status=0
native_run_owned "${work_dir}/stdout" "${work_dir}/stderr" '' \
  bash -c 'ready_file=$1; source "$2"; wait_for watchdog-ready 4 '\''test -f "${ready_file}"'\''' \
  _ "${ready}" "${source_dir}/Distribution/tests/helpers/wait-for.bash" || status=$?
native_check_expect_status 'completed command observes its watchdog' 0 "${status}" "${work_dir}/stderr"
elapsed=$(($(date +%s) - start))

((elapsed <= 2))
watchdog_pid=$(cat "${ready}")
native_check_expect_process 'completed command reaps its watchdog' "${watchdog_pid}" exited "${ready}"
native_check_expect_absent 'stopping watchdog runs no shell handler' "${handler_ran}"
leftover=$(find "${TMPDIR}" -mindepth 1 -print)
native_check_expect_value 'watchdog scratch removed' '' "${leftover}"
