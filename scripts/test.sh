#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd -- "${source_dir}"

# Tests run in child shells, so check the bash they will actually use.
test_bash=$(command -v bash)
# Expand BASH_VERSION in the child shell, not this runner.
# shellcheck disable=SC2016
test_bash_version=$("${test_bash}" -c 'printf "%s" "${BASH_VERSION}"')
if [[ ${test_bash_version%%.*} -lt 4 ]]; then
  printf 'FAIL: shell tests require Bash 4+; resolved %s (version %s).\n' \
    "${test_bash}" "${test_bash_version}" >&2
  printf 'Install Bash 4+ and put its bin directory first on PATH, then rerun the tests.\n' >&2
  exit 1
fi

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
  run_check "${test_file}" "${test_bash}" "${test_file}"
done < "${test_list}"

run_check 'scripts/check-self-installation.sh' \
  "${test_bash}" "${source_dir}/scripts/check-self-installation.sh" "${source_dir}"

exit "${status}"
