#!/usr/bin/env bash
# scripts/ci-container.sh stops, naming the missing runtime, when no `docker`
# is on PATH or its daemon cannot be reached, and refuses by name a directory
# or path outside the checkout, each before any image work. Its Ubuntu and
# Node versions and dashboard checks agree with .github/workflows/ci.yml;
# its bare image bootstraps system libraries that native CI already has,
# supplies the hosted font inventory, and keeps cache and run isolation.
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
# call fails, as a stopped runtime's do. The reachable stand-in captures the
# consumed Dockerfile and invocation, and remembers its one built image.
mkdir -- "${temporary_dir}/fake-bin"
cat > "${temporary_dir}/fake-bin/docker" << 'DOCKER'
#!/usr/bin/env bash
printf '%s\n' "${1:-}" >> "${DOCKER_CALLS}"
[[ ${FAKE_DAEMON:-} != down ]] || exit 1
case $1 in
  image)
    [[ -f ${DOCKER_IMAGE} && $(cat -- "${DOCKER_IMAGE}") == "$3" ]]
    ;;
  build)
    cat > "${DOCKER_RECIPE}"
    printf '%s\n' "$3" > "${DOCKER_IMAGE}"
    ;;
  run)
    if [[ $3 == --user ]]; then
      printf '%s\n' "$@" > "${DOCKER_CHOWN}"
    else
      printf '%s\n' "$@" > "${DOCKER_RUN}"
    fi
    ;;
esac
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

# Prints the value the script states once for NAME, without its quotes and
# across every line a quoted value spans.
stated() {
  awk -v prefix="readonly $1=" -v q="'" '
    !found && index($0, prefix) == 1 {
      found = 1
      $0 = substr($0, length(prefix) + 1)
      quoted = sub("^" q, "")
    }
    found && (!quoted || sub(q "$", "")) { print; exit }
    found { print }
  ' "${script}"
}
ubuntu_version=$(stated ubuntu_version)
node_version=$(cat -- "${source_dir}/.node-version")
if [[ -z ${ubuntu_version} || -z ${node_version} ]]; then
  echo 'FAIL: scripts/ci-container.sh does not state its Ubuntu and Node versions.' >&2
  exit 1
fi

# The diagnostic image uses the exact shared selection, not latest-v24.x.
# shellcheck disable=SC2016 # Literal source contract.
expect_in_log "${script}" -Fx -- 'node_version=$(cat -- "${source_dir}/.node-version")'
# shellcheck disable=SC2016 # Literal source contract.
expect_in_log "${script}" -F -- 'base=https://nodejs.org/dist/v${node_version}'

# Every job's runner and every Node setup in the workflow must agree.
sed -n 's/^[[:space:]]*runs-on:[[:space:]]*//p' "${workflow}" > "${temporary_dir}/runners"
sed -n 's/^[[:space:]]*run: bash scripts\/setup-ci-node\.sh[[:space:]]*//p' "${workflow}" > "${temporary_dir}/nodes"
expect_in_log "${temporary_dir}/runners" -Fx -- "ubuntu-${ubuntu_version}"
expect_in_log "${temporary_dir}/nodes" -Fx -- ".node-version"
if grep -vFx -- "ubuntu-${ubuntu_version}" "${temporary_dir}/runners" \
  || grep -vFx -- ".node-version" "${temporary_dir}/nodes"; then
  printf 'FAIL: ci.yml runs on a version other than ubuntu-%s and Node %s (above).\n' \
    "${ubuntu_version}" "${node_version}" >&2
  exit 1
fi

# The diagnostic image bootstraps system libraries on bare Ubuntu; native CI
# uses the runner's libraries and the locked local Playwright package. The
# diagnostic runs the workflow's type-check and browser suite together. In CI
# the type-check belongs to lint so it cannot spend a shard's browser deadline.
# Keep the bootstrap explicit rather than removing --with-deps from the image.
dashboard_install=$(stated dashboard_install)
if [[ ${dashboard_install} != 'npx playwright install --with-deps chromium' ]]; then
  echo 'FAIL: scripts/ci-container.sh must bootstrap Chromium system dependencies.' >&2
  exit 1
fi
stated dashboard_steps | sed '1a\
node scripts/setup-native.mjs browser
' > "${temporary_dir}/stated-dashboard"
if ! awk '
  /^  [^ #]/ { job = $1; installed = 0; next }
  /^[[:space:]]*(- )?run:/ {
    sub(/^[[:space:]]*(- )?run:[[:space:]]*/, "")
    if ($0 == "node scripts/setup-native.mjs npm") installed = 1
    else if ($0 == "npm run typecheck:dashboard") {
      if (job != "lint:" || !installed) exit 1
      print
    } else if (job == "dashboard:" && installed && $0 !~ /^\|$/) print
  }
' "${workflow}" > "${temporary_dir}/ci-dashboard" \
  || ! diff -- "${temporary_dir}/stated-dashboard" "${temporary_dir}/ci-dashboard" >&2; then
  echo 'FAIL: the workflow must type-check after npm ci in lint and install Chromium before the browser suite in each shard.' >&2
  exit 1
fi

# Observe the Dockerfile actually sent to `docker build`, rather than a font
# declaration that the recipe could stop consuming. Fake runtime captures and
# independent package expectations are harness inputs, not domain fixtures.
export DOCKER_CALLS=${temporary_dir}/calls DOCKER_IMAGE=${temporary_dir}/image
export DOCKER_RECIPE=${temporary_dir}/Dockerfile DOCKER_CHOWN=${temporary_dir}/chown
export DOCKER_RUN=${temporary_dir}/run
: > "${DOCKER_CALLS}"
PATH="${temporary_dir}/fake-bin:${PATH}" "${BASH}" "${script}" tests/ci-container.sh \
  > "${temporary_dir}/build.log" 2>&1
expect_in_log "${DOCKER_CALLS}" -Fx -- build
image=$(cat -- "${DOCKER_IMAGE}")

# Independent inventory: actions/runner-images ubuntu24/20261101.360,
# sbom.ubuntu-24.04.json.zip, sbom.json package names fonts-*, xfonts-*, ttf-*.
# See tests/ci-container.md for the release source and refresh procedure.
cat > "${temporary_dir}/hosted-fonts" << 'FONTS'
fonts-dejavu
fonts-dejavu-core
fonts-dejavu-extra
fonts-dejavu-mono
fonts-lato
fonts-liberation
fonts-noto-color-emoji
fonts-ubuntu-console
FONTS
# Join Dockerfile continuations, then select packages consumed by apt install
# in RUN commands. Comments or unused declarations cannot satisfy this check.
awk '
  { continued = sub(/\\$/, ""); line = line " " $0 }
  !continued {
    if (line ~ /^ *RUN /) {
      count = split(line, commands, /&&/)
      for (i = 1; i <= count; i++) {
        if (commands[i] !~ /^ *(RUN +)?apt-get install /) continue
        words = split(commands[i], packages, /[[:space:]]+/)
        for (j = 1; j <= words; j++)
          if (packages[j] ~ /^(fonts-|xfonts-|ttf-)/) print packages[j]
      }
    }
    line = ""
  }
' "${DOCKER_RECIPE}" | LC_ALL=C sort -u > "${temporary_dir}/image-fonts"
if ! diff -- "${temporary_dir}/hosted-fonts" "${temporary_dir}/image-fonts" >&2; then
  echo 'FAIL: generated image must install the hosted Ubuntu font inventory.' >&2
  exit 1
fi

# The fresh and cached paths use the same image and preserve host identity,
# checkout/common-Git mounts and container-local dependency storage.
uid=$(id -u)
gid=$(id -g)
user=${uid}:${gid}
common_dir=$(git -C "${source_dir}" rev-parse --path-format=absolute --git-common-dir)
common_dir=$(cd -- "${common_dir}" && pwd -P)
checkout_key=$(printf '%s' "${source_dir}" | cksum | cut -d ' ' -f 1)
modules_volume=open-dough-ci-modules-${checkout_key}
for argument in --rm --user 0 "${user}" "${modules_volume}:/modules" open-dough-ci-npm-cache:/npm-cache \
  "${image}" chown /modules /npm-cache; do
  expect_in_log "${DOCKER_CHOWN}" -Fx -- "${argument}"
done
for argument in --rm --init --user --workdir --env --volume "${user}" "${source_dir}:${source_dir}" \
  "${modules_volume}:${source_dir}/node_modules" open-dough-ci-npm-cache:/npm-cache \
  HOME=/tmp/home npm_config_cache=/npm-cache "SOURCE_DIR=${source_dir}" \
  "COMMON_DIR=${common_dir}" DASHBOARD=false "${image}" tests/ci-container.sh; do
  expect_in_log "${DOCKER_RUN}" -Fx -- "${argument}"
done
case ${common_dir}/ in
  "${source_dir}"/*) ;;
  *) expect_in_log "${DOCKER_RUN}" -Fx -- "${common_dir}:${common_dir}" ;;
esac
if grep -Fx -- --platform "${DOCKER_RUN}"; then
  echo 'FAIL: diagnostic image must keep the host native architecture.' >&2
  exit 1
fi
cp -- "${DOCKER_RUN}" "${temporary_dir}/first-run"
: > "${DOCKER_CALLS}"
PATH="${temporary_dir}/fake-bin:${PATH}" "${BASH}" "${script}" tests/ci-container.sh \
  > "${temporary_dir}/cached.log" 2>&1
if grep -Fx -- build "${DOCKER_CALLS}"; then
  echo 'FAIL: an unchanged recipe must reuse its cached image.' >&2
  exit 1
fi
diff -- "${temporary_dir}/first-run" "${DOCKER_RUN}"
