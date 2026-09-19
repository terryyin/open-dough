#!/usr/bin/env bash
# Read-only check that a repository's native Open Dough installations match the
# immutable local git tags named by their VERSION records. Performs no fetches
# and no writes to the target.
# shellcheck disable=SC2310,SC2312
set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
repo_root=$(cd -- "${script_dir}/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=src/install/open-dough-platform.sh
source "${repo_root}/src/install/open-dough-platform.sh"
# shellcheck disable=SC1091
# shellcheck source=src/install/open-dough-release-version.sh
source "${repo_root}/src/install/open-dough-release-version.sh"

helper="${repo_root}/src/install/open-dough-release.sh"

usage() {
  echo "Usage: $0 [target]" >&2
  exit 1
}

if [[ $# -gt 1 ]]; then
  usage
fi

target=${1:-${repo_root}}
if [[ ! -d "${target}" ]]; then
  echo "Target is not a directory: ${target}" >&2
  exit 1
fi
target=$(cd -- "${target}" && pwd)

if ! git -C "${target}" rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "Target is not a git work tree: ${target}" >&2
  exit 1
fi

tagged_tree=$(mktemp -d)
trap 'rm -rf -- "${tagged_tree}"' EXIT

dests=()
recorded_dest=
recorded_version=
recorded_source=

while IFS=$'\t' read -r _ dest; do
  if [[ ! -d "${dest}" ]]; then
    echo "Missing native installation: ${dest}" >&2
    exit 1
  fi
  version=$(read_record "${dest}/VERSION") || exit 1
  if [[ -z "${version}" ]]; then
    echo "Missing installed version record: ${dest}/VERSION" >&2
    exit 1
  fi
  source_url=$(read_source_record "${dest}/SOURCE") || exit 1
  if [[ -z "${recorded_dest}" ]]; then
    recorded_dest=${dest}
    recorded_version=${version}
    recorded_source=${source_url}
  else
    if [[ "${version}" != "${recorded_version}" ]]; then
      printf 'Self-installation record disagreement: %s %s %s %s\n' \
        "${recorded_dest}/VERSION" "${recorded_version}" \
        "${dest}/VERSION" "${version}" >&2
      exit 1
    fi
    if [[ "${source_url}" != "${recorded_source}" ]]; then
      printf 'SOURCE conflicts with the shared installation: %s %s\n' \
        "${recorded_dest}/SOURCE" "${dest}/SOURCE" >&2
      exit 1
    fi
  fi
  dests+=("${dest}")
done < <(all_destinations_for "${target}")

if [[ ${#dests[@]} -eq 0 ]]; then
  echo "No native Open Dough destinations in ${target}" >&2
  exit 1
fi

if ! git -C "${target}" rev-parse --verify --quiet "refs/tags/v${recorded_version}" > /dev/null; then
  echo "No numeric release tag v${recorded_version} in ${target}" >&2
  exit 1
fi

if ! git -C "${target}" archive --format=tar "v${recorded_version}" | tar -x -C "${tagged_tree}"; then
  echo "Failed to materialize local tag v${recorded_version} from ${target}" >&2
  exit 1
fi

for dest in "${dests[@]}"; do
  bash "${helper}" compare-payload "${dest}" "${tagged_tree}"
done
