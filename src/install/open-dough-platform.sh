#!/usr/bin/env bash
# shellcheck disable=SC2312
# Shared platform destinations and requested-version refusal.
# Sourced by install.sh and open-dough-release.sh.

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
      printf '%s\n' "${target}/.cursor/skills/dough-update"
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
  local platform

  for platform in $(all_platforms); do
    printf '%s\t%s\n' "${platform}" "$(destination_for "${target}" "${platform}")"
  done
}
