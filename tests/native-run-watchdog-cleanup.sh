#!/usr/bin/env bash
# A completed command must not wait for a watchdog that missed TERM.
# shellcheck disable=SC2016,SC2034 # Child shell uses $1; supervisor reads deadline globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/native-run-supervise.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-run-supervise.sh"

work_dir=$(mktemp -d)
trap 'rm -rf -- "${work_dir}"' EXIT
ready="${work_dir}/watchdog-ready"

# Reproduce the launch/TERM race with a watchdog whose TERM is ignored. The
# supervised command waits until that watchdog owns the sleep process.
native_run_watchdog() {
  trap '' TERM
  printf '%s\n' "${BASHPID}" > "${ready}"
  exec sleep 5
}

start=$(date +%s)
native_case_deadline=5
native_case_grace=0
native_run_owned "${work_dir}/stdout" "${work_dir}/stderr" '' \
  bash -c 'while [[ ! -f $1 ]]; do sleep 0.01; done' _ "${ready}"
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

echo 'PASS: completed command bounds watchdog shutdown and reaps the watchdog.'
