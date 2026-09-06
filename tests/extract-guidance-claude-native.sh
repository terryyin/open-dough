#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2034,SC2154 # Shared harness provides and consumes these globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
extract_source_dir=${source_dir}
extract_host_name='Claude Code'
extract_host_upper='CLAUDE CODE'
extract_host_slug='claude'
extract_skill_root='.claude/skills'
extract_existing_name='existing-claude'
extract_command_name='claude'

extract_run_native() {
  local session_root=$1
  local prompt=$2
  local output_file=$3
  (
    cd -- "${session_root}"
    claude --print --dangerously-skip-permissions --no-session-persistence \
      "${prompt}"
  ) > "${output_file}"
}

# shellcheck source=tests/support/extract-guidance-native.sh
source "${source_dir}/tests/support/extract-guidance-native.sh"
extract_guidance_main "${1:-}"
