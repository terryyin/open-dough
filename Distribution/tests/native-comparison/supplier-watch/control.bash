#!/usr/bin/env bash
# The controller's only clock is an external release barrier. No timer mode.
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Case and retained fixture state.
set -euo pipefail
case_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "${case_dir}/../../support/native-comparison-run.sh"
source "${case_dir}/case.bash"
root=$1 stream=$2 scratch=$3 clock=$4
source "${scratch}/case-evidence/watch-state.bash"
# Source the domain publisher directly: this case's public event is the watch request.
source "${case_dir}/../../support/native-comparison-supplier.sh"
printf '%s\n' "${BASHPID}" > "${clock}/controller-pid"
exec 8<> "${clock}/advance"
for expected in nonqualifying qualifying; do
  read -r -u 8 event
  [[ ${event} == "${expected}" ]] || exit 23
  case_apply_event "${root}" "${event}" "${scratch}"
  printf '%s\n' "${case_remote_main}" > "${scratch}/case-evidence/expected-main"
  printf 'watch-event: %s\n' "${event}" >> "${scratch}/case-evidence/watch-observations.txt"
  if [[ ${event} == nonqualifying ]]; then
    supplier_case_observe "${root}" watch-hold "${stream}" "${scratch}" "${harness}" \
      >> "${scratch}/case-evidence/watch-observations.txt"
  fi
  printf '%s\n' "${case_remote_main}" > "${clock}/${event}"
done
