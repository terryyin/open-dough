#!/usr/bin/env bash
# An explicitly advanced controlled supplier-publication driver.
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
# Own the clock child explicitly: publisher failure must not leave a pipeline
# parent waiting for its still-blocked clock. Clock failure closes this FIFO.
clock_pipe="${scratch}/watch-clock.pipe"
mkfifo "${clock_pipe}"
node "${case_dir}/clock.mjs" "${clock}" > "${clock_pipe}" &
clock_pid=$!
finish_clock() {
  kill "${clock_pid}" 2> /dev/null || true
  wait "${clock_pid}" 2> /dev/null || true
  rm -f "${clock_pipe}"
}
trap finish_clock EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
index=0
while read -r event; do
  index=$((index + 1))
  [[ ${index}:${event} == 1:nonqualifying || ${index}:${event} == 2:qualifying ]] || exit 23
  # End unchanged evidence conservatively before snapshot or publication work.
  printf 'turn-2-publication-%s-begin-ms: %s\n' "${index}" "$(node -e 'console.log(Date.now())')" \
    >> "${scratch}/case-evidence/watch-observations.txt"
  if [[ ${index} -eq 1 ]]; then
    supplier_case_observe "${root}" 2-before "${stream}" "${scratch}" "${harness}" \
      >> "${scratch}/case-evidence/watch-observations.txt"
  fi
  case_apply_event "${root}" "${event}" "${scratch}"
  printf '%s\n' "${case_remote_main}" > "${scratch}/case-evidence/expected-main"
  {
    printf 'turn-2-publication-%s-event: %s\n' "${index}" "${event}"
    printf 'turn-2-publication-%s-sha: %s\n' "${index}" "${case_remote_main}"
    printf 'turn-2-publication-%s-ms: %s\n' "${index}" "$(node -e 'console.log(Date.now())')"
  } >> "${scratch}/case-evidence/watch-observations.txt"
  if [[ ${event} == nonqualifying ]]; then
    supplier_case_observe "${root}" 2-hold "${stream}" "${scratch}" "${harness}" \
      >> "${scratch}/case-evidence/watch-observations.txt"
  fi
  printf '%s\n' "${case_remote_main}" > "${clock}/${event}"
done < "${clock_pipe}"
[[ ${index} -eq 2 ]]
wait "${clock_pid}"
