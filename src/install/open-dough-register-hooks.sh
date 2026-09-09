#!/usr/bin/env bash
# Register Cursor and Claude Code CI host hooks from authoritative fragments.
# Sourced by install.sh and open-dough-release.sh. Requires Node for JSON merge;
# checks availability before the caller mutates the target.
# shellcheck disable=SC2310,SC2312

open_dough_register_hooks_helper() {
  local source_root=$1
  printf '%s\n' "${source_root}/src/install/open-dough-register-hooks.mjs"
}

# True when this release still ships the authoritative Cursor and Claude fragments.
# Older tagged fixtures may strip execution assets from managed_files.
host_hook_fragments_present() {
  local source_root=$1
  local assets="${source_root}/src/skills/dough-execute-plan/assets"
  [[ -f "${assets}/cursor-hooks.json" && -f "${assets}/claude-hooks.json" ]]
}

require_node_for_hooks() {
  if ! command -v node > /dev/null 2>&1; then
    echo "Node.js is required to register CI host hooks before installation can continue." >&2
    return 1
  fi
}

run_host_hooks() {
  local mode=$1
  local source_root=$2
  local target_root=$3
  local helper

  require_node_for_hooks || return 1
  helper=$(open_dough_register_hooks_helper "${source_root}")
  [[ -f "${helper}" ]] || {
    echo "This installer requires src/install/open-dough-register-hooks.mjs in the source checkout." >&2
    return 1
  }
  node "${helper}" "${mode}" "${target_root}" "${source_root}"
}

preflight_host_hooks() {
  run_host_hooks preflight "$@"
}

preflight_host_hook_destinations() {
  run_host_hooks preflight-destinations "$@"
}

# Prints complete or repair on stdout; conflicts fail like preflight.
host_hooks_registration_status() {
  run_host_hooks status "$@"
}

apply_host_hooks() {
  run_host_hooks apply "$@"
}
