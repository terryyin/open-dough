#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd -- "${source_dir}"

test_list=$(mktemp)
trap 'rm -f -- "${test_list}"' EXIT
find tests -type f -name '*.sh' ! -path 'tests/support/*' -print0 > "${test_list}"

run_check() {
  local label=$1
  shift
  printf '\nRunning %s\n' "${label}"
  if ! "$@"; then
    printf 'FAIL: %s\n' "${label}" >&2
    status=1
  fi
}

status=0
while IFS= read -r -d '' test_file; do
  run_check "${test_file}" bash "${test_file}"
done < "${test_list}"

run_check 'scripts/check-self-installation.sh' \
  bash "${source_dir}/scripts/check-self-installation.sh" "${source_dir}"

exit "${status}"
