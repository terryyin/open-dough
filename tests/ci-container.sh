#!/usr/bin/env bash
# scripts/ci-container.sh stops, naming the missing runtime, when no `docker`
# is on PATH or its daemon cannot be reached, and refuses by name a directory
# or path outside the checkout, each before any image work; and the Ubuntu and
# Node versions it states are the ones .github/workflows/ci.yml runs on.
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

# A substitute `docker` records each subcommand; with FAKE_DAEMON=down every
# call fails, as a stopped runtime's do, and otherwise every call succeeds.
mkdir -- "${temporary_dir}/fake-bin"
cat > "${temporary_dir}/fake-bin/docker" << 'DOCKER'
#!/usr/bin/env bash
printf '%s\n' "${1:-}" >> "${DOCKER_CALLS}"
[[ ${FAKE_DAEMON:-} != down ]]
DOCKER
chmod +x "${temporary_dir}/fake-bin/docker"
touch -- "${temporary_dir}/outside.sh"
outside_dir=$(cd -- "${temporary_dir}" && pwd -P)

# Runs the script with the substitute docker from DIR with FAKE_DAEMON set to
# STATE, expecting it to fail before any image work; its output goes to LOG.
expect_refusal() {
  local log=$1 dir=$2 state=$3
  shift 3
  : > "${temporary_dir}/calls"
  if (cd -- "${dir}" && PATH="${temporary_dir}/fake-bin:${PATH}" \
    DOCKER_CALLS="${temporary_dir}/calls" FAKE_DAEMON="${state}" \
    "${BASH}" "${script}" "$@") > "${log}" 2>&1; then
    printf 'FAIL: scripts/ci-container.sh %s succeeded from %s with the daemon %s.\n' \
      "$*" "${dir}" "${state}" >&2
    cat -- "${log}" >&2
    exit 1
  fi
  if grep -vFx info "${temporary_dir}/calls" > /dev/null; then
    printf 'FAIL: scripts/ci-container.sh %s went past its refusal to docker:\n' "$*" >&2
    cat -- "${temporary_dir}/calls" "${log}" >&2
    exit 1
  fi
}

expect_refusal "${temporary_dir}/daemon.log" "${source_dir}" down tests/ci-container.sh
expect_in_log "${temporary_dir}/daemon.log" -F -- 'no container runtime: docker cannot reach its daemon'
expect_in_log "${temporary_dir}/calls" -Fx -- info

expect_refusal "${temporary_dir}/path.log" "${source_dir}" up "${temporary_dir}/outside.sh"
expect_in_log "${temporary_dir}/path.log" -F -- \
  "path ${temporary_dir}/outside.sh is outside this checkout"
expect_refusal "${temporary_dir}/relative.log" "${source_dir}/tests" up ../../outside.sh
expect_in_log "${temporary_dir}/relative.log" -F -- 'path ../../outside.sh is outside this checkout'
expect_refusal "${temporary_dir}/caller.log" "${temporary_dir}" up
expect_in_log "${temporary_dir}/caller.log" -F -- \
  "the current directory ${outside_dir} is outside this checkout"

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
