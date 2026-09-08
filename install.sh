#!/usr/bin/env bash
set -euo pipefail

original_pwd=$(pwd -P)
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck disable=SC1091
# shellcheck source=src/install/open-dough-platform.sh
source "${source_dir}/src/install/open-dough-platform.sh"

usage() {
  echo "Usage: $0 --target <project> --source <url-or-path> [--platform <codex|cursor|claude>] [--force]" >&2
  exit 1
}

report_incomplete_install() {
  local reason=$1

  echo "${reason} Installed files may be incomplete. The last successful record was left unchanged. Recover with an explicit --force reinstall." >&2
  exit 1
}

write_certified_records() {
  local restore_source=""
  local source_path="${destination}/SOURCE"
  local version_path="${destination}/VERSION"
  local status=0

  if [[ "${OPEN_DOUGH_INSTALL_FAULT:-}" == record ]]; then
    return 1
  fi

  if [[ -f "${source_path}" ]]; then
    restore_source=$(mktemp)
    cp -- "${source_path}" "${restore_source}"
  fi

  if ! printf '%s\n' "${recorded_source}" > "${source_path}" \
    || ! printf '%s\n' "${version}" > "${version_path}"; then
    if [[ -n "${restore_source}" ]]; then
      cp -- "${restore_source}" "${source_path}" || true
    else
      rm -f -- "${source_path}"
    fi
    status=1
  fi

  [[ -n "${restore_source}" ]] && rm -f -- "${restore_source}"
  return "${status}"
}

target=""
recorded_source=""
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
    --source)
      if [[ $# -lt 2 ]]; then
        usage
      fi
      recorded_source=$2
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

if [[ -z "${target}" || -z "${recorded_source}" ]]; then
  usage
fi

if [[ "${recorded_source}" == /* ]]; then
  if [[ -d "${recorded_source}" ]]; then
    recorded_source=$(cd -- "${recorded_source}" && pwd -P)
  fi
elif [[ -d "${original_pwd}/${recorded_source}" ]]; then
  recorded_source=$(cd -- "${original_pwd}/${recorded_source}" && pwd -P)
fi

if [[ ! -d "${target}" ]]; then
  echo "Target project directory does not exist: ${target}" >&2
  exit 1
fi

target=$(cd -- "${target}" && pwd -P)
destination=$(destination_for "${target}" "${platform}")
destination_skill_root=$(dirname -- "${destination}")
managed_skill_paths=(
  "${destination_skill_root}/dough-update"
  "${destination_skill_root}/dough-adr-awareness"
)
managed_files=(
  dough-update/SKILL.md
  dough-adr-awareness/SKILL.md
)
retired_file=dough-adr-awareness/RECOGNITION.md
retired_path="${destination_skill_root}/${retired_file}"

for managed_file in "${managed_files[@]}"; do
  if [[ ! -f "${source_dir}/src/skills/${managed_file}" ]]; then
    echo "Public payload is incomplete: missing ${managed_file}" >&2
    exit 1
  fi
done

release_helper="${source_dir}/src/install/open-dough-release.sh"
if [[ ! -f "${release_helper}" ]]; then
  echo "This installer requires src/install/open-dough-release.sh in the source checkout." >&2
  exit 1
fi

version=$(bash "${release_helper}" validate-checkout "${source_dir}")

for selected_path in "$(dirname -- "${destination_skill_root}")" \
  "${destination_skill_root}"; do
  if [[ -L "${selected_path}" ]]; then
    echo "Unsafe destination: selected platform skill root ${destination_skill_root} uses a symlink at ${selected_path}. Refusing installation because it could escape target ${target}." >&2
    exit 1
  fi
  if [[ -e "${selected_path}" && ! -d "${selected_path}" ]]; then
    echo "Unsafe destination: selected platform skill root ${destination_skill_root} has a non-directory path component at ${selected_path}. Move or remove the collision before installing." >&2
    exit 1
  fi
done

for managed_path in "${managed_skill_paths[@]}"; do
  if [[ -L "${managed_path}" ]] \
    || [[ -e "${managed_path}" && ! -d "${managed_path}" ]]; then
    echo "Unsafe destination collision: expected a managed skill directory at ${managed_path}, but found a non-directory object. Move or remove it before installing." >&2
    exit 1
  fi
done

if [[ -L "${retired_path}" ]] \
  || [[ -e "${retired_path}" && ! -f "${retired_path}" ]]; then
  echo "Unsafe retired-file collision: expected a regular file or absent path at ${retired_path}. Move or remove it before installing." >&2
  exit 1
fi

if [[ ${force} -ne 1 ]]; then
  for managed_path in "${managed_skill_paths[@]}"; do
    if [[ -d "${managed_path}" ]]; then
      managed_skill=${managed_path##*/}
      echo "Warning: ${managed_skill} is already installed in ${managed_path}. Use --force to explicitly reinstall." >&2
      exit 1
    fi
  done
fi

if [[ -n "${OPEN_DOUGH_TRACE:-}" ]]; then
  printf 'install %s\n' "${destination}" >> "${OPEN_DOUGH_TRACE}"
fi

mkdir -p -- "${managed_skill_paths[@]}"
if [[ "${OPEN_DOUGH_INSTALL_FAULT:-}" == copy ]]; then
  printf '%s\n' 'partial-install' > "${destination}/SKILL.md"
  report_incomplete_install 'Copy failed after replacement started.'
fi

for managed_file in "${managed_files[@]}"; do
  if ! cp -- "${source_dir}/src/skills/${managed_file}" \
    "${destination_skill_root}/${managed_file}"; then
    report_incomplete_install 'Copy failed after replacement started.'
  fi
done

if [[ -e "${retired_path}" ]] && ! rm -- "${retired_path}"; then
  report_incomplete_install 'Retirement failed after replacement started.'
fi

verification_failed=0
for managed_file in "${managed_files[@]}"; do
  if ! cmp -s -- "${source_dir}/src/skills/${managed_file}" \
    "${destination_skill_root}/${managed_file}"; then
    verification_failed=1
  fi
done
if [[ -e "${retired_path}" ]] || [[ -L "${retired_path}" ]]; then
  verification_failed=1
fi
if [[ "${OPEN_DOUGH_INSTALL_FAULT:-}" == verify ]] \
  || [[ ${verification_failed} -eq 1 ]]; then
  report_incomplete_install 'Installed payload verification failed.'
fi

# Function used in ! so set -e stays off; failure must report incomplete, not abort.
# shellcheck disable=SC2310
if ! write_certified_records; then
  report_incomplete_install 'Failed to write installation records after replacement started.'
fi
echo "Installed Open Dough public guidance in ${destination_skill_root}"
echo "Recorded version ${version}."
