#!/usr/bin/env bash
# shellcheck disable=SC2310,SC2312
set -euo pipefail

original_pwd=$(pwd -P)
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck disable=SC1091
source "${source_dir}/src/install/open-dough-platform.sh"

usage() {
  echo "Usage: $0 --target <project> --source <url-or-path> [--platform <codex|cursor|claude>] [--force]" >&2
  exit 1
}

report_incomplete_install() {
  local selected_platform=$1 reason=$2
  echo "${selected_platform}: ${reason} Installed files may be incomplete. The last successful record was left unchanged. Recover with an explicit --force reinstall." >&2
  exit 1
}

write_certified_records() {
  local destination=$1 restore_source='' source_path version_path status=0
  source_path="${destination}/SOURCE"
  version_path="${destination}/VERSION"
  [[ "${OPEN_DOUGH_INSTALL_FAULT:-}" != record ]] || return 1
  if [[ -f "${source_path}" ]]; then
    restore_source=$(mktemp)
    cp -- "${source_path}" "${restore_source}"
  fi
  if ! printf '%s\n' "${recorded_source}" > "${source_path}" || ! printf '%s\n' "${version}" > "${version_path}"; then
    if [[ -n "${restore_source}" ]]; then cp -- "${restore_source}" "${source_path}" || true; else rm -f -- "${source_path}"; fi
    status=1
  fi
  [[ -z "${restore_source}" ]] || rm -f -- "${restore_source}"
  return "${status}"
}

target=''
recorded_source=''
platform=codex
force=0
replace_verified=0
while [[ $# -gt 0 ]]; do
  case $1 in
    --target)
      [[ $# -ge 2 ]] || usage
      target=$2
      shift 2
      ;;
    --source)
      [[ $# -ge 2 ]] || usage
      recorded_source=$2
      shift 2
      ;;
    --platform)
      [[ $# -ge 2 ]] || usage
      platform=$2
      shift 2
      ;;
    --force)
      force=1
      shift
      ;;
    # Internal apply handoff: its caller verified every managed baseline first.
    --replace-verified)
      replace_verified=1
      shift
      ;;
    --version | --tag | --release) refuse_requested_version ;;
    *)
      looks_like_version_request "$1" && refuse_requested_version
      usage
      ;;
  esac
done

[[ -n "${target}" && -n "${recorded_source}" ]] || usage
destination_for /dev/null "${platform}" > /dev/null
if [[ "${recorded_source}" == /* && -d "${recorded_source}" ]]; then
  recorded_source=$(cd -- "${recorded_source}" && pwd -P)
elif [[ -d "${original_pwd}/${recorded_source}" ]]; then recorded_source=$(cd -- "${original_pwd}/${recorded_source}" && pwd -P); fi
[[ -d "${target}" ]] || {
  echo "Target project directory does not exist: ${target}" >&2
  exit 1
}
target=$(cd -- "${target}" && pwd -P)
managed_files=(
  dough-update/SKILL.md
  dough-adr-awareness/SKILL.md
  dough-product-backlog/SKILL.md
)
for managed_file in "${managed_files[@]}"; do [[ -f "${source_dir}/src/skills/${managed_file}" ]] || {
  echo "Public payload is incomplete: missing ${managed_file}" >&2
  exit 1
}; done
release_helper="${source_dir}/src/install/open-dough-release.sh"
[[ -f "${release_helper}" ]] || {
  echo "This installer requires src/install/open-dough-release.sh in the source checkout." >&2
  exit 1
}
version=$(bash "${release_helper}" validate-checkout "${source_dir}")

platforms=() destinations=() roots=() actions=()
while IFS=$'\t' read -r selected_platform destination; do
  root=$(dirname -- "${destination}")
  platforms+=("${selected_platform}")
  destinations+=("${destination}")
  roots+=("${root}")
  for path in "$(dirname -- "${root}")" "${root}"; do
    [[ ! -L "${path}" ]] || {
      echo "Unsafe destination: ${selected_platform} skill root ${root} uses a symlink at ${path}." >&2
      exit 1
    }
    [[ ! -e "${path}" || -d "${path}" ]] || {
      echo "Unsafe destination: ${selected_platform} skill root ${root} has a non-directory path component at ${path}." >&2
      exit 1
    }
  done
  for skill in dough-update dough-adr-awareness dough-product-backlog; do
    path="${root}/${skill}"
    [[ ! -L "${path}" && (! -e "${path}" || -d "${path}") ]] || {
      echo "Unsafe destination collision: expected a managed skill directory at ${path}." >&2
      exit 1
    }
  done
  retired_path="${root}/dough-adr-awareness/RECOGNITION.md"
  [[ ! -L "${retired_path}" && (! -e "${retired_path}" || -f "${retired_path}") ]] || {
    echo "Unsafe retired-file collision: expected a regular file or absent path at ${retired_path}." >&2
    exit 1
  }
  current=0
  if [[ -f "${destination}/SKILL.md" && -f "${destination}/SOURCE" && -f "${destination}/VERSION" && -f "${root}/dough-adr-awareness/SKILL.md" && -f "${root}/dough-product-backlog/SKILL.md" ]] \
    && cmp -s "${source_dir}/src/skills/dough-update/SKILL.md" "${destination}/SKILL.md" \
    && cmp -s "${source_dir}/src/skills/dough-adr-awareness/SKILL.md" "${root}/dough-adr-awareness/SKILL.md" \
    && cmp -s "${source_dir}/src/skills/dough-product-backlog/SKILL.md" "${root}/dough-product-backlog/SKILL.md" \
    && [[ $(cat "${destination}/SOURCE") == "${recorded_source}" && $(cat "${destination}/VERSION") == "${version}" ]]; then current=1; fi
  if [[ ${force} -eq 1 ]]; then
    actions+=(replace)
  elif [[ ${replace_verified} -eq 1 && ${current} -eq 1 ]]; then
    actions+=(skip)
  elif [[ ${replace_verified} -eq 1 ]]; then
    actions+=(replace)
  elif [[ ! -e "${destination}" && ! -e "${root}/dough-adr-awareness" && ! -e "${root}/dough-product-backlog" ]]; then
    actions+=(install)
  elif [[ ${current} -eq 1 ]]; then
    actions+=(skip)
  else
    echo "${selected_platform}: existing managed installation is edited, partial, or unverifiable. Use --force to explicitly reinstall." >&2
    exit 1
  fi
done < <(all_destinations_for "${target}")

for index in "${!platforms[@]}"; do
  [[ ${actions[index]} == skip ]] && {
    echo "${platforms[index]}: already current; left unwritten."
    continue
  }
  destination=${destinations[index]}
  root=${roots[index]}
  [[ -z "${OPEN_DOUGH_TRACE:-}" ]] || printf 'install %s\n' "${destination}" >> "${OPEN_DOUGH_TRACE}"
  mkdir -p -- "${destination}" "${root}/dough-adr-awareness" "${root}/dough-product-backlog"
  [[ "${OPEN_DOUGH_INSTALL_FAULT:-}" != copy ]] || {
    printf '%s\n' partial-install > "${destination}/SKILL.md"
    report_incomplete_install "${platforms[index]}" 'Copy failed after replacement started.'
  }
  for managed_file in "${managed_files[@]}"; do cp -- "${source_dir}/src/skills/${managed_file}" "${root}/${managed_file}" || report_incomplete_install "${platforms[index]}" 'Copy failed after replacement started.'; done
  [[ ! -e "${root}/dough-adr-awareness/RECOGNITION.md" ]] || rm -- "${root}/dough-adr-awareness/RECOGNITION.md" || report_incomplete_install "${platforms[index]}" 'Retirement failed after replacement started.'
  verification_failed=0
  for managed_file in "${managed_files[@]}"; do cmp -s "${source_dir}/src/skills/${managed_file}" "${root}/${managed_file}" || verification_failed=1; done
  [[ ! -e "${root}/dough-adr-awareness/RECOGNITION.md" && "${OPEN_DOUGH_INSTALL_FAULT:-}" != verify && ${verification_failed} -eq 0 ]] || report_incomplete_install "${platforms[index]}" 'Installed payload verification failed.'
  write_certified_records "${destination}" || report_incomplete_install "${platforms[index]}" 'Failed to write installation records after replacement started.'
  echo "${platforms[index]}: installed Open Dough public guidance in ${root} (version ${version})."
done
