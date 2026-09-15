#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2034,SC2154 # Shared harness provides and consumes these globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/dough-adr-awareness-delivery-to-use.sh
source "${source_dir}/tests/support/dough-adr-awareness-delivery-to-use.sh"
# shellcheck source=tests/support/native-codex.sh
source "${source_dir}/tests/support/native-codex.sh"
delivery_source_dir=${source_dir}
delivery_fixture="${source_dir}/tests/fixtures/adr-awareness/alternate-layout"
delivery_host_name='Codex'
delivery_host_upper='CODEX'
delivery_platform='codex'
delivery_skill_root='.agents/skills'

delivery_check_fixture
grep -Fq 'danger-full-access' "$0"
grep -Fq 'PROTECTED_WORKTREES' "$0"
delivery_parse_native_case_args "$@"

if [[ ${native_case_mode} == 'default' ]]; then
  delivery_run_deterministic_transition
  exit 0
fi

command -v codex > /dev/null
delivery_prepare_fixture
delivery_assert_baseline_install
native_codex_prepare "${delivery_temporary_dir}" "${delivery_fixture_source}"

run_native_codex() {
  local output_file=$1
  local prompt=$2
  local transcript=${3:-}
  native_codex_run \
    "${delivery_target}" "${output_file}" "${prompt}" "${transcript}"
}

delivery_capture_update_state
update_output="${delivery_temporary_dir}/codex-update-output.md"
update_transcript="${delivery_temporary_dir}/codex-update.jsonl"
run_native_codex "${update_output}" \
  "Use \$dough-update to perform an ordinary newer-release update of this Codex installation. Follow the installed updater exactly and do not force the update. Report release v${delivery_update_version}, its source and commit, Codex as the running tool, and every installed path. Do not invoke ADR awareness yet." \
  "${update_transcript}"
delivery_assert_update "${update_output}"

use_before=$(delivery_snapshot "${delivery_target}")
use_output="${delivery_temporary_dir}/codex-use-output.md"
use_transcript="${delivery_temporary_dir}/codex-use.jsonl"
run_native_codex "${use_output}" \
  "Use \$dough-adr-awareness for an explicit ADR check. Begin with Invocation: \$dough-adr-awareness. Assess whether work may switch telemetry history to per-node files. The catalog and ARC-12 record now disagree: demonstrate the installed v${delivery_update_version} improvement by naming each conflicting repository-relative authority and the value it reports before asking who owns precedence. Report whether you changed any decision or implementation. Use only this client project and keep the response concise." \
  "${use_transcript}"
use_after=$(delivery_snapshot "${delivery_target}")
if [[ "${use_before}" != "${use_after}" ]]; then
  echo 'FAIL: native Codex changed client project files during ADR use.' >&2
  exit 1
fi
delivery_assert_use "${use_output}"

native_tool_version=$(codex --version)
printf 'Native tool version: %s\n' "${native_tool_version}"
delivery_print_proof "${update_output}" "${use_output}"
printf '%s\n' \
  'PASS: a fresh session ordinarily updated the verified older current-contract install to the newer release from recorded SOURCE.' \
  'PASS: fresh native Codex discovered and invoked the installed dough-adr-awareness skill.' \
  'PASS: Codex enumerated both conflicting alternate-layout status authorities and their Adopted/Replaced values, stopped for human precedence, and changed no client project files.' \
  'PASS: the companion integration remained byte-identical.'
