#!/usr/bin/env bash
# Stopping a completed command's watchdog must be bounded, reap the watchdog,
# run none of its shell handlers, and leave no scratch.
# shellcheck disable=SC2016,SC2034 # Child shell uses $1; supervisor reads deadline globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/native-run-supervise.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-run-supervise.sh"

work_dir=$(mktemp -d)
trap 'rm -rf -- "${work_dir}"' EXIT
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
if ! native_run_owned "${work_dir}/stdout" "${work_dir}/stderr" '' \
  bash -c 'ready_file=$1; source "$2"; wait_for watchdog-ready 4 '\''test -f "${ready_file}"'\''' \
  _ "${ready}" "${source_dir}/tests/helpers/wait-for.bash"; then
  printf 'FAIL: completed command did not observe its watchdog:\n' >&2
  cat "${work_dir}/stderr" >&2
  exit 1
fi
elapsed=$(($(date +%s) - start))

if ((elapsed > 2)); then
  printf 'FAIL: completed command waited %ss for its watchdog.\n' "${elapsed}" >&2
  exit 1
fi
watchdog_pid=$(cat "${ready}")
if kill -0 "${watchdog_pid}" 2> /dev/null; then
  printf 'FAIL: watchdog %s remained after completed command.\n' "${watchdog_pid}" >&2
  exit 1
fi
if [[ -e ${handler_ran} ]]; then
  echo 'FAIL: stopping the watchdog ran a shell handler that can hold caller cleanup.' >&2
  exit 1
fi
leftover=$(find "${TMPDIR}" -mindepth 1 -print)
if [[ -n ${leftover} ]]; then
  printf 'FAIL: watchdog scratch remained:\n%s\n' "${leftover}" >&2
  exit 1
fi
