#!/usr/bin/env bash
# shellcheck disable=SC2034 # Public resolver returns fragment paths through shell variables.
# Host hook settings scenarios and independent assertions. Requires source_dir.
: "${source_dir:?source_dir must be set before sourcing this helper}"

# Retain the public path resolver for callers selecting older/synthetic releases.
# The Claude guard is optional; its resolved path need not exist.
resolve_host_hook_fragments() {
  local fragment_root=${1:-${source_dir}}
  cursor_fragment="${fragment_root}/src/skills/dough-execute-plan/assets/cursor-hooks.json"
  claude_fragment="${fragment_root}/src/skills/dough-execute-plan/assets/claude-hooks.json"
  claude_guard_fragment="${fragment_root}/src/skills/dough-product-backlog/assets/claude-hooks-guard.json"
}

seed_empty_host_settings() {
  node "${source_dir}/tests/helpers/host-hook-scenarios.mjs" empty "$1"
}

seed_mergeable_host_settings() {
  node "${source_dir}/tests/helpers/host-hook-scenarios.mjs" mergeable "$1"
}

seed_exact_manual_registration() {
  node "${source_dir}/tests/helpers/host-hook-scenarios.mjs" exact "$1" "${2:-${source_dir}}"
}

remove_one_cursor_managed_entry() {
  node "${source_dir}/tests/helpers/host-hook-scenarios.mjs" removeCursor "$1" "${2:-${source_dir}}"
}

seed_edited_managed_timeout() {
  node "${source_dir}/tests/helpers/host-hook-scenarios.mjs" editedTimeout "$1" "${2:-${source_dir}}"
}

seed_managed_command_with_local_argument() {
  seed_managed_command_with_suffix "$1" cursor ' --local' "${2-}"
}

seed_managed_command_with_suffix() {
  local host=$2
  [[ "${host}" == cursor ]] || host=claude
  node "${source_dir}/tests/helpers/host-hook-scenarios.mjs" suffix "$1" "${4:-${source_dir}}" "${host}" "$3"
}

seed_similarly_named_unmanaged_script() {
  local host=$2
  [[ "${host}" == cursor ]] || host=claude
  node "${source_dir}/tests/helpers/host-hook-scenarios.mjs" similarlyNamed "$1" "${3:-${source_dir}}" "${host}"
}

seed_duplicate_exact_managed_entry() {
  node "${source_dir}/tests/helpers/host-hook-scenarios.mjs" duplicate "$1" "${2:-${source_dir}}"
}

seed_claude_managed_read_matcher() {
  node "${source_dir}/tests/helpers/host-hook-scenarios.mjs" readMatcher "$1" "${2:-${source_dir}}"
}

assert_unrelated_preserved() {
  node "${source_dir}/tests/helpers/host-hook-assertions.mjs" unrelated "$1"
}

assert_cursor_managed_commands() {
  node "${source_dir}/tests/helpers/host-hook-assertions.mjs" cursorCommands "$1" "${2:-${source_dir}}"
}

assert_managed_host_hooks() {
  node "${source_dir}/tests/helpers/host-hook-assertions.mjs" managed "$1" "${2:-${source_dir}}"
}
