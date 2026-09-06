#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2034,SC2154 # Shared harness provides and consumes these globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/dough-adr-awareness-delivery-to-use.sh
source "${source_dir}/tests/support/dough-adr-awareness-delivery-to-use.sh"
delivery_source_dir=${source_dir}
delivery_fixture="${source_dir}/tests/fixtures/adr-awareness/alternate-layout"
delivery_host_name='Claude Code'
delivery_host_upper='CLAUDE CODE'
delivery_skill_root='.claude/skills'
delivery_baseline_platforms=(codex cursor claude)

delivery_check_fixture
grep -Fq 'claude --print --dangerously-skip-permissions --no-session-persistence' "$0"

if [[ ${1:-} != '--native' ]]; then
  echo 'PASS: the Claude Code delivery-to-use fixture covers a previous public skill, pinned-release improvement, fresh native use, alternate-layout conflicts, platform isolation, and coexistence.'
  exit 0
fi

command -v claude > /dev/null
delivery_prepare_fixture

run_native_claude() {
  local output_file=$1
  local prompt=$2
  (
    cd -- "${delivery_target}"
    claude --print --dangerously-skip-permissions --no-session-persistence \
      "${prompt}"
  ) > "${output_file}"
}

delivery_capture_update_state
codex_before=$(delivery_snapshot "${delivery_target}/.agents/skills")
cursor_before=$(delivery_snapshot "${delivery_target}/.cursor/skills")
update_output="${delivery_temporary_dir}/claude-update-output.md"
run_native_claude "${update_output}" \
  "Use \$dough-update ${delivery_source_url} to update this adopter from the supplied cloneable fixture source. Follow the installed updater exactly. Report release v0.1.1, its source and commit, Claude Code as the running tool, and every installed path. Do not invoke ADR awareness yet."

delivery_assert_update "${update_output}"
codex_after=$(delivery_snapshot "${delivery_target}/.agents/skills")
cursor_after=$(delivery_snapshot "${delivery_target}/.cursor/skills")
[[ "${codex_before}" == "${codex_after}" ]]
[[ "${cursor_before}" == "${cursor_after}" ]]

use_before=$(delivery_snapshot "${delivery_target}")
use_output="${delivery_temporary_dir}/claude-use-output.md"
run_native_claude "${use_output}" \
  "Use \$dough-adr-awareness for an explicit ADR check. Your final response must begin exactly with the line Invocation: \$dough-adr-awareness. Assess whether work may switch telemetry history to per-node files. The catalog and ARC-12 record now disagree: demonstrate the installed improvement by naming each conflicting repository-relative authority and the value it reports before asking who owns precedence. End with exactly: No decision or implementation was changed. Use only this adopter repository and keep the response concise."
use_after=$(delivery_snapshot "${delivery_target}")
if [[ "${use_before}" != "${use_after}" ]]; then
  echo 'FAIL: native Claude Code changed adopter files during ADR use.' >&2
  exit 1
fi
delivery_assert_use "${use_output}"

delivery_print_proof "${update_output}" "${use_output}"
printf '%s\n' \
  'PASS: fresh native Claude Code invoked only the installed replacement, updated only Claude Code, preserved other platform copies and companion guidance, then stopped on both named conflicting authorities without changing the adopter.'
