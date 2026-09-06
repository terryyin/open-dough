#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2034,SC2154 # Shared harness provides and consumes these globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/dough-adr-awareness-delivery-to-use.sh
source "${source_dir}/tests/support/dough-adr-awareness-delivery-to-use.sh"
delivery_source_dir=${source_dir}
delivery_fixture="${source_dir}/tests/fixtures/adr-awareness/alternate-layout"
delivery_host_name='Cursor'
delivery_host_upper='CURSOR'
delivery_skill_root='.cursor/skills'
delivery_baseline_platforms=(codex cursor claude)

delivery_check_fixture
grep -Fq 'cursor agent --print --force --trust --sandbox enabled' "$0"

if [[ ${1:-} != '--native' ]]; then
  echo 'PASS: the Cursor delivery-to-use fixture covers a previous public skill, default-branch improvement, fresh native use, alternate-layout conflicts, platform isolation, and coexistence.'
  exit 0
fi

command -v cursor > /dev/null
delivery_prepare_fixture

run_native_cursor() {
  local output_file=$1
  local prompt=$2
  (
    cd -- "${delivery_target}"
    cursor agent --print --force --trust --sandbox enabled \
      --workspace "${delivery_target}" "${prompt}"
  ) > "${output_file}"
}

delivery_capture_update_state
codex_before=$(delivery_snapshot "${delivery_target}/.agents/skills")
claude_before=$(delivery_snapshot "${delivery_target}/.claude/skills")
update_output="${delivery_temporary_dir}/cursor-update-output.md"
run_native_cursor "${update_output}" \
  "Use \$dough-update ${delivery_source_url} to update this adopter from the supplied cloneable fixture source. Follow the installed updater exactly. Report the source, commit, Cursor as the running tool, every installed path, and that this selects the fixture's current default branch rather than a release or installed version. Do not invoke ADR awareness yet."

delivery_assert_update "${update_output}"
codex_after=$(delivery_snapshot "${delivery_target}/.agents/skills")
claude_after=$(delivery_snapshot "${delivery_target}/.claude/skills")
[[ "${codex_before}" == "${codex_after}" ]]
[[ "${claude_before}" == "${claude_after}" ]]

use_before=$(delivery_snapshot "${delivery_target}")
use_output="${delivery_temporary_dir}/cursor-use-output.md"
run_native_cursor "${use_output}" \
  "Use \$dough-adr-awareness for an explicit ADR check. Your final response must begin exactly with the line Invocation: \$dough-adr-awareness. Assess whether work may switch telemetry history to per-node files. The catalog and ARC-12 record now disagree: demonstrate the installed improvement by naming each conflicting repository-relative authority and the value it reports before asking who owns precedence. End with exactly: No decision or implementation was changed. Use only this adopter repository and keep the response concise."
use_after=$(delivery_snapshot "${delivery_target}")
if [[ "${use_before}" != "${use_after}" ]]; then
  echo 'FAIL: native Cursor changed adopter files during ADR use.' >&2
  exit 1
fi
delivery_assert_use "${use_output}"

delivery_print_proof "${update_output}" "${use_output}"
printf '%s\n' \
  'PASS: fresh native Cursor invoked only the installed replacement, updated only Cursor, preserved other platform copies and companion guidance, then stopped on both named conflicting authorities without changing the adopter.'
