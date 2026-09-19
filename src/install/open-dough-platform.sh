#!/usr/bin/env bash
# shellcheck disable=SC2312
# Shared platform destinations and requested-version refusal.
# Sourced by install.sh and open-dough-release.sh.

# Reports an installer failure partway through a replacement and exits;
# the last successful record was left unchanged, so recovery is an explicit
# --force reinstall.
report_incomplete_install() {
  local selected_platform=$1 reason=$2
  echo "${selected_platform}: ${reason} Installed files may be incomplete. The last successful record was left unchanged. Recover with an explicit --force reinstall." >&2
  exit 1
}

# Writes SOURCE and VERSION at destination, restoring the prior SOURCE (or
# removing it) if either write fails partway through.
write_certified_records() {
  local destination=$1 recorded_source=$2 version=$3
  local restore_source='' source_path version_path status=0
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

is_release_version() {
  [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
}

refuse_requested_version() {
  echo "Open Dough installs and updates the latest numeric release only. Requested-version updates are not supported." >&2
  exit 1
}

looks_like_version_request() {
  local arg=$1

  [[ "${arg}" == --version || "${arg}" == --tag || "${arg}" == --release ]] && return 0
  [[ "${arg}" == v*.*.* ]] && return 0
  is_release_version "${arg}"
}

destination_for() {
  local target=$1
  local platform=$2

  case "${platform}" in
    codex)
      printf '%s\n' "${target}/.agents/skills/dough-update"
      ;;
    cursor)
      # Cursor also discovers the shared .agents root. Keep cursor as a
      # supported invoking-tool hint without creating a duplicate payload.
      printf '%s\n' "${target}/.agents/skills/dough-update"
      ;;
    claude)
      printf '%s\n' "${target}/.claude/skills/dough-update"
      ;;
    *)
      echo "Unsupported platform: ${platform}. Supported platforms: codex, cursor, claude." >&2
      return 1
      ;;
  esac
}

all_platforms() {
  printf '%s\n' codex cursor claude
}

# The selected platform is only the invoking-tool hint. Successful operations
# always use the complete native topology below.
all_destinations_for() {
  local target=$1
  local platform destination
  local seen=''

  for platform in $(all_platforms); do
    destination=$(destination_for "${target}" "${platform}")
    if [[ " ${seen} " == *" ${destination} "* ]]; then
      continue
    fi
    seen="${seen} ${destination}"
    printf '%s\t%s\n' "${platform}" "${destination}"
  done
}

# Refuses a skill root (or its parent) that is a symlink or a non-directory
# path component, before any managed file is written under it.
assert_safe_destination_root() {
  local selected_platform=$1
  local root=$2
  local path

  for path in "$(dirname -- "${root}")" "${root}"; do
    [[ ! -L "${path}" ]] || {
      echo "Unsafe destination: ${selected_platform} skill root ${root} uses a symlink at ${path}." >&2
      return 1
    }
    [[ ! -e "${path}" || -d "${path}" ]] || {
      echo "Unsafe destination: ${selected_platform} skill root ${root} has a non-directory path component at ${path}." >&2
      return 1
    }
  done
}

# True when the managed file's top-level skill directory already exists
# under root, regardless of whether it is a complete or safe installation.
destination_has_managed_skill() {
  local root=$1
  local managed_file=$2
  local skill=${managed_file%%/*}

  [[ -e "${root}/${skill}" ]]
}

# Refuses a managed file's directory chain or final path when an existing,
# unmanaged entry (a symlink, or a non-directory/non-file) would collide with
# it, before any managed file is written under root.
assert_no_managed_collision() {
  local root=$1
  local managed_file=$2
  local path directory component

  path="${root}"
  directory=${managed_file%/*}
  while [[ -n "${directory}" ]]; do
    component=${directory%%/*}
    path="${path}/${component}"
    [[ ! -L "${path}" && (! -e "${path}" || -d "${path}") ]] || {
      echo "Unsafe destination collision: expected a managed directory at ${path}." >&2
      return 1
    }
    if [[ "${directory}" == */* ]]; then directory=${directory#*/}; else directory=''; fi
  done
  path="${root}/${managed_file}"
  [[ ! -L "${path}" && (! -e "${path}" || -f "${path}") ]] || {
    echo "Unsafe destination collision: expected a managed file at ${path}." >&2
    return 1
  }
}
