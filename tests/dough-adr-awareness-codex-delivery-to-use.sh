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
delivery_skill_root='.agents/skills'
delivery_baseline_platforms=(codex)

delivery_check_fixture
grep -Fq 'danger-full-access' "$0"
grep -Fq 'PROTECTED_WORKTREES' "$0"

if [[ ${1:-} != '--native' ]]; then
  echo 'PASS: the Codex delivery-to-use fixture covers a previous public skill, a pinned-release improvement, a fresh native invocation, conflicting alternate-layout authorities, recognition support, and coexistence.'
  exit 0
fi

command -v codex > /dev/null
delivery_prepare_fixture
native_codex_prepare "${delivery_temporary_dir}"

run_native_codex() {
  local output_file=$1
  local prompt=$2
  native_codex_run "${delivery_target}" "${output_file}" "${prompt}"
}

delivery_capture_update_state
update_output="${delivery_temporary_dir}/codex-update-output.md"
run_native_codex "${update_output}" \
  "Use \$dough-update ${delivery_source_url} to update this adopter from the supplied cloneable fixture source. Follow the installed updater exactly. Report release v0.1.1, its source and commit, Codex as the running tool, and every installed path. Do not invoke ADR awareness yet."
delivery_assert_update "${update_output}"

use_before=$(delivery_snapshot "${delivery_target}")
use_output="${delivery_temporary_dir}/codex-use-output.md"
run_native_codex "${use_output}" \
  "Use \$dough-adr-awareness for an explicit ADR check. Begin with Invocation: \$dough-adr-awareness. Assess whether work may switch telemetry history to per-node files. The catalog and ARC-12 record now disagree: demonstrate the installed improvement by naming each conflicting repository-relative authority and the value it reports before asking who owns precedence. Report whether you changed any decision or implementation. Use only this adopter repository and keep the response concise."
use_after=$(delivery_snapshot "${delivery_target}")
if [[ "${use_before}" != "${use_after}" ]]; then
  echo 'FAIL: native Codex changed adopter files during ADR use.' >&2
  exit 1
fi
delivery_assert_use "${use_output}"

delivery_print_proof "${update_output}" "${use_output}"
printf '%s\n' \
  'PASS: fresh native Codex discovered and invoked only the installed dough-adr-awareness replacement; no original adr-awareness skill was present.' \
  'PASS: Codex enumerated both conflicting alternate-layout status authorities and their Adopted/Replaced values, stopped for human precedence, and changed no adopter files.' \
  'PASS: the recognition record byte-matches the improved pinned release, and the companion integration remained byte-identical.'
