#!/usr/bin/env bash
# Host routing identity for Cursor and Claude Code selected delivery/updated-use
# adapter proofs. Sourced by native-updated-use-adapter-assert.sh after source_dir
# is assigned.
# shellcheck disable=SC2154,SC2249 # Proof global source_dir; require_host rejects unknowns.

native_updated_use_adapter_require_host() {
  case $1 in
    cursor | claude) ;;
    *)
      echo "FAIL: unexpected host $1." >&2
      return 1
      ;;
  esac
}

wrapper_for() {
  native_updated_use_adapter_require_host "$1" || return
  printf '%s\n' \
    "${source_dir}/tests/dough-adr-awareness-$1-delivery-to-use.sh"
}

print_launch() {
  native_updated_use_adapter_require_host "$1" || return
  case $1 in
    cursor) printf 'cursor agent --print\n' ;;
    claude) printf 'claude --print\n' ;;
  esac
}

version_command_for() {
  native_updated_use_adapter_require_host "$1" || return
  case $1 in
    cursor) printf 'cursor agent --version\n' ;;
    claude) printf 'claude --version\n' ;;
  esac
}

adapter_identity_for() {
  native_updated_use_adapter_require_host "$1" || return
  case $1 in
    cursor) printf 'cursor-agent-stream-json\n' ;;
    claude) printf 'claude-stream-json\n' ;;
  esac
}

native_version_for() {
  native_updated_use_adapter_require_host "$1" || return
  case $1 in
    cursor) printf 'cursor-agent journey-1\n' ;;
    claude) printf 'claude journey-1\n' ;;
  esac
}
