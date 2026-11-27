#!/usr/bin/env bash
# The native production build gate
# (dashboard/test-support/fixtures/production-build-gate.mjs), in its starting
# and completed modes, already observes its hold file when it announces its
# arrival: a release immediately after arrival ends it with status 0, and the
# arrival names its checkout (and, for a starting build, its own process).
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/wait-for.bash
source "${source_dir}/Distribution/tests/helpers/wait-for.bash"
fail() {
  printf 'FAIL: %s\n' "$1" >&2
  exit 1
}
temporary_dir=$(mktemp -d)
gate_pid=
cleanup() {
  if [[ -n ${gate_pid} ]]; then kill -KILL "${gate_pid}" 2> /dev/null || true; fi
  rm -rf -- "${temporary_dir}"
}
trap cleanup EXIT
gate="${source_dir}/dashboard/test-support/fixtures/production-build-gate.mjs"

for mode in starting completed; do
  home="${temporary_dir}/${mode}-home"
  checkout="${temporary_dir}/${mode}-checkout"
  mkdir -- "${home}" "${checkout}"
  : > "${home}/builds.log"
  : > "${home}/completed-build"
  if [[ ${mode} == completed ]]; then
    hold="${home}/hold-completed-build"
    arrival="${home}/completed-build"
    arguments=(completed)
  else
    hold="${home}/hold-build-1"
    arrival="${home}/builds.log"
    arguments=()
  fi
  : > "${hold}"
  (cd -- "${checkout}" && exec env HOME="${home}" node "${gate}" "${arguments[@]}") &
  gate_pid=$!
  wait_for "the ${mode} gate's arrival" 10 "[[ -s \"${arrival}\" ]]"
  kill -0 "${gate_pid}" 2> /dev/null || fail "the ${mode} gate ended before its release"
  rm -- "${hold}"
  status=0
  wait "${gate_pid}" || status=$?
  gate_pid=
  [[ ${status} == 0 ]] || fail "the ${mode} gate ended with status ${status} after its release"
  name=$(basename -- "${checkout}")
  if [[ ${mode} == completed ]]; then
    [[ $(< "${arrival}") == "${name}" ]] || fail "the completed arrival did not name its checkout"
  else
    [[ $(< "${arrival}") =~ ^[0-9]+\ ${name}$ ]] || fail "the starting arrival did not name its process and checkout"
  fi
done
