#!/usr/bin/env bash
# scripts/ci-container.sh [--dashboard] [path…]
#
# Diagnosis only: runs chosen checks (scripts/test.sh with the given paths, or
# the whole suite when none) on CI's platform, or with --dashboard CI's
# dashboard job's commands, unsharded and with CI=true as CI sets it.
# Neither `npm test` nor CI uses it. It builds a cached image once, mounts this
# checkout (and a linked worktree's common Git directory) at their host paths,
# keeps node_modules in a container volume so host modules are neither used
# nor overwritten, and runs as the host user with a container-local HOME. It
# refuses, before any image work, a runtime it cannot reach and a directory or
# path outside the checkout.
set -euo pipefail

# CI's platform, stated once; tests/ci-container.sh checks these against
# .github/workflows/ci.yml.
readonly ubuntu_version=24.04
readonly node_version=24
# CI's dashboard job's commands after `npm ci`, without its --shard argument,
# stated once and checked the same way. The image runs the Playwright install
# as root, pinned to the locked version; the container runs the rest.
readonly dashboard_install='npx playwright install --with-deps chromium'
readonly dashboard_steps='npm run typecheck:dashboard
npm run test:dashboard'

if ! command -v docker > /dev/null 2>&1; then
  printf 'ci-container.sh: no container runtime: docker is not on PATH.\n' >&2
  printf 'Install and start a Docker-compatible runtime (for example Colima on macOS), then rerun.\n' >&2
  exit 1
fi

dashboard=false
if [[ ${1:-} == --dashboard ]]; then
  dashboard=true
  shift
  if (($#)); then
    printf 'ci-container.sh: --dashboard runs the whole dashboard suite and takes no paths.\n' >&2
    exit 2
  fi
fi

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)
# Only the checkout is mounted, so the caller's directory, from which relative
# paths resolve as scripts/test.sh resolves them, and every path must be in it.
work_dir=$(pwd -P)
# Prints DIR's physical path when it exists, or DIR as given, so a missing
# directory whose `..` leaves the checkout is not refused here; it fails later
# in the container as any missing path does.
physical_dir() {
  (cd -- "$1" 2> /dev/null && pwd -P) || printf '%s\n' "$1"
}
refuse_outside() {
  case $2/ in
    "${source_dir}"/*) ;;
    *)
      printf 'ci-container.sh: %s %s is outside this checkout (%s), which is all the container mounts.\n' \
        "$1" "$3" "${source_dir}" >&2
      exit 2
      ;;
  esac
}
refuse_outside 'the current directory' "${work_dir}" "${work_dir}"
for path in "$@"; do
  resolved=${path}
  [[ ${resolved} == /* ]] || resolved=${work_dir}/${resolved}
  parent=$(dirname -- "${resolved}")
  parent=$(physical_dir "${parent}")
  refuse_outside path "${parent}" "${path}"
done

# A runtime whose daemon cannot be reached is as absent as a missing one.
if ! docker info > /dev/null 2>&1; then
  printf 'ci-container.sh: no container runtime: docker cannot reach its daemon (docker info failed).\n' >&2
  printf 'Start the Docker-compatible runtime (for example colima start on macOS), then rerun.\n' >&2
  exit 1
fi

# A linked worktree's `.git` file points into the common Git directory, so it
# is mounted too; in a main checkout it is inside the checkout already.
common_dir=$(git -C "${source_dir}" rev-parse --path-format=absolute --git-common-dir)
common_dir=$(cd -- "${common_dir}" && pwd -P)

# CI installs the Playwright Chromium matching the project's locked version.
playwright_version=$(awk '
  /"node_modules\/@playwright\/test": \{/ { found = 1; next }
  found && /"version":/ { gsub(/[",]/, "", $2); print $2; exit }
' "${source_dir}/package-lock.json")

# Git from the git-core PPA and Node from nodejs.org, as GitHub's runner image
# and actions/setup-node install them; the host's native architecture.
dockerfile=$(
  cat << DOCKERFILE
FROM ubuntu:${ubuntu_version}
ENV DEBIAN_FRONTEND=noninteractive PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN apt-get update \\
 && apt-get install -y --no-install-recommends ca-certificates curl gnupg jq \\
      procps software-properties-common xz-utils \\
 && add-apt-repository -y ppa:git-core/ppa \\
 && apt-get install -y --no-install-recommends git \\
 && rm -rf /var/lib/apt/lists/*
RUN arch=\$(dpkg --print-architecture) && [ "\$arch" != amd64 ] || arch=x64; \\
    base=https://nodejs.org/dist/latest-v${node_version}.x \\
 && file=\$(curl -fsSL "\$base/SHASUMS256.txt" | awk -v a="linux-\$arch.tar.xz" '\$2 ~ a"\$" { print \$2 }') \\
 && curl -fsSL "\$base/\$file" | tar -xJ -C /usr/local --strip-components=1 \\
      --exclude=CHANGELOG.md --exclude=LICENSE --exclude=README.md
RUN ${dashboard_install/npx playwright/npx --yes playwright@${playwright_version}} \\
 && chmod -R a+rX /ms-playwright && rm -rf /root/.npm
DOCKERFILE
)
image=open-dough-ci:$(printf '%s' "${dockerfile}" | cksum | cut -d ' ' -f 1)
if ! docker image inspect "${image}" > /dev/null 2>&1; then
  printf 'ci-container.sh: building %s (once; later runs reuse it).\n' "${image}" >&2
  printf '%s\n' "${dockerfile}" | docker build --tag "${image}" - >&2
fi

# node_modules lives in a volume per checkout, and npm's cache in a shared
# one; both are handed to the host user before the run.
checkout_key=$(printf '%s' "${source_dir}" | cksum | cut -d ' ' -f 1)
modules_volume=open-dough-ci-modules-${checkout_key}
cache_volume=open-dough-ci-npm-cache
uid=$(id -u)
gid=$(id -g)
user=${uid}:${gid}
docker run --rm --user 0 --volume "${modules_volume}:/modules" \
  --volume "${cache_volume}:/npm-cache" "${image}" chown "${user}" /modules /npm-cache

run_args=(run --rm --init --user "${user}" --workdir "${work_dir}"
  --env HOME=/tmp/home --env npm_config_cache=/npm-cache
  --env npm_config_update_notifier=false
  --env "SOURCE_DIR=${source_dir}" --env "COMMON_DIR=${common_dir}"
  --env "DASHBOARD=${dashboard}" --env "DASHBOARD_STEPS=${dashboard_steps}"
  --volume "${source_dir}:${source_dir}"
  --volume "${modules_volume}:${source_dir}/node_modules"
  --volume "${cache_volume}:/npm-cache")
case ${common_dir}/ in
  "${source_dir}"/*) ;;
  *) run_args+=(--volume "${common_dir}:${common_dir}") ;;
esac
if [[ -t 0 && -t 1 ]]; then
  run_args+=(--interactive --tty)
fi

# Inside the container. Colima's virtiofs reports a mount's own directory as
# root-owned until it is read, and Git would then refuse the checkout as
# dubiously owned, so both mounts are read first.
# shellcheck disable=SC2016 # Expanded in the container.
entry='
set -euo pipefail
ls -a -- "${SOURCE_DIR}" "${COMMON_DIR}" > /dev/null
mkdir -p -- "${HOME}"
(cd -- "${SOURCE_DIR}" && npm ci --no-audit --no-fund --loglevel=error)
printf "ci-container: %s, node %s\n" "$(git --version)" "$(node --version)"
if [[ ${DASHBOARD} == true ]]; then
  cd -- "${SOURCE_DIR}"
  CI=true exec bash -euo pipefail -c "${DASHBOARD_STEPS}"
fi
exec bash "${SOURCE_DIR}/scripts/test.sh" "$@"
'
exec docker "${run_args[@]}" "${image}" bash -c "${entry}" ci-container "$@"
