#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck disable=SC1091
# shellcheck source=src/install/open-dough-platform.sh
source "${source_dir}/src/install/open-dough-platform.sh"

usage() {
  echo "Usage: $0 --target <project> [--platform <codex|cursor|claude>] [--force]" >&2
  exit 1
}

target=""
platform=codex
force=0

while [[ $# -gt 0 ]]; do
  case $1 in
    --target)
      if [[ $# -lt 2 ]]; then
        usage
      fi
      target=$2
      shift 2
      ;;
    --platform)
      if [[ $# -lt 2 ]]; then
        usage
      fi
      platform=$2
      shift 2
      ;;
    --force)
      force=1
      shift
      ;;
    --version | --tag | --release)
      refuse_requested_version
      ;;
    *)
      if looks_like_version_request "$1"; then
        refuse_requested_version
      fi
      usage
      ;;
  esac
done

if [[ -z "${target}" ]]; then
  usage
fi

if [[ ! -d "${target}" ]]; then
  echo "Target project directory does not exist: ${target}" >&2
  exit 1
fi

destination=$(destination_for "${target}" "${platform}")
if [[ -d "${destination}" && ${force} -ne 1 ]]; then
  echo "Warning: dough-update is already installed in ${destination}. Use --force to explicitly reinstall." >&2
  exit 1
fi

release_helper="${source_dir}/src/install/open-dough-release.sh"
if [[ ! -f "${release_helper}" ]]; then
  echo "This installer requires src/install/open-dough-release.sh in the source checkout." >&2
  exit 1
fi

version=$(bash "${release_helper}" validate-checkout "${source_dir}")
source_skill="${source_dir}/src/skills/dough-update/SKILL.md"
if [[ ! -f "${source_skill}" ]]; then
  echo "Missing source skill: ${source_skill}" >&2
  exit 1
fi

if [[ -n "${OPEN_DOUGH_TRACE:-}" ]]; then
  printf 'install %s\n' "${destination}" >> "${OPEN_DOUGH_TRACE}"
fi

mkdir -p -- "${destination}"
if [[ "${OPEN_DOUGH_INSTALL_FAULT:-}" == copy ]]; then
  printf '%s\n' 'partial-install' > "${destination}/SKILL.md"
  echo "Copy failed after replacement started. Installed files may be incomplete. The last successful record was left unchanged. Recover with an explicit --force reinstall." >&2
  exit 1
fi

cp -- "${source_skill}" "${destination}/SKILL.md"
if [[ "${OPEN_DOUGH_INSTALL_FAULT:-}" == verify ]] \
  || ! cmp -s -- "${source_skill}" "${destination}/SKILL.md"; then
  echo "Installed payload verification failed. Installed files may be incomplete. The last successful record was left unchanged. Recover with an explicit --force reinstall." >&2
  exit 1
fi

printf '%s\n' "${version}" > "${destination}/VERSION"
echo "Installed dough-update in ${destination}"
echo "Recorded version ${version}."
