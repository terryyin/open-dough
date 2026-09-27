#!/usr/bin/env bash
# scripts/ci-container.sh stops, naming the missing runtime, when no `docker`
# is on PATH, and the Ubuntu and Node versions it states are the ones
# .github/workflows/ci.yml runs on.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/expect-in-log.bash
source "${source_dir}/tests/helpers/expect-in-log.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
script="${source_dir}/scripts/ci-container.sh"
workflow="${source_dir}/.github/workflows/ci.yml"

# An empty PATH directory: CI's runner keeps docker beside bash in /usr/bin,
# so dropping one directory from the real PATH would not hide it.
mkdir -- "${temporary_dir}/bin"
if PATH="${temporary_dir}/bin" "${BASH}" "${script}" tests/ci-container.sh \
  > "${temporary_dir}/refusal.log" 2>&1; then
  echo 'FAIL: scripts/ci-container.sh succeeded without a container runtime.' >&2
  cat -- "${temporary_dir}/refusal.log" >&2
  exit 1
fi
expect_in_log "${temporary_dir}/refusal.log" -F -- 'no container runtime: docker is not on PATH'

# Prints the value the script states once for NAME.
stated() {
  sed -n "s/^readonly $1=\([^[:space:]]*\)$/\1/p" "${script}"
}
ubuntu_version=$(stated ubuntu_version)
node_version=$(stated node_version)
if [[ -z ${ubuntu_version} || -z ${node_version} ]]; then
  echo 'FAIL: scripts/ci-container.sh does not state its Ubuntu and Node versions.' >&2
  exit 1
fi

# Every job's runner and every Node setup in the workflow must agree.
sed -n 's/^[[:space:]]*runs-on:[[:space:]]*//p' "${workflow}" > "${temporary_dir}/runners"
sed -n 's/^[[:space:]]*node-version:[[:space:]]*//p' "${workflow}" > "${temporary_dir}/nodes"
expect_in_log "${temporary_dir}/runners" -Fx -- "ubuntu-${ubuntu_version}"
expect_in_log "${temporary_dir}/nodes" -Fx -- "\"${node_version}\""
if grep -vFx -- "ubuntu-${ubuntu_version}" "${temporary_dir}/runners" \
  || grep -vFx -- "\"${node_version}\"" "${temporary_dir}/nodes"; then
  printf 'FAIL: ci.yml runs on a version other than ubuntu-%s and Node %s (above).\n' \
    "${ubuntu_version}" "${node_version}" >&2
  exit 1
fi
