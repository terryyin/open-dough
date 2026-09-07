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
delivery_platform='cursor'
delivery_skill_root='.cursor/skills'
delivery_baseline_platforms=(codex cursor claude)

delivery_check_fixture
grep -Fq 'cursor agent --print --force --trust --sandbox enabled' "$0"

if [[ ${1:-} != '--native' ]]; then
  delivery_prepare_fixture
  delivery_assert_legacy_install
  delivery_capture_legacy_state
  delivery_bootstrap_candidate
  delivery_publish_improved_release
  delivery_capture_update_state
  deterministic_update_output="${delivery_temporary_dir}/deterministic-update-output.txt"
  bash "${delivery_fixture_source}/src/install/open-dough-release.sh" apply \
    --url "${delivery_source_url}" --target "${delivery_target}" \
    --platform cursor > "${deterministic_update_output}"
  delivery_assert_update "${deterministic_update_output}" 0
  echo 'PASS: the Cursor delivery-to-use fixture starts from the genuine v0.2.0 three-file payload, exposes its contract mismatch with the two-file candidate, bootstraps the inspected v0.2.1 candidate, ordinarily updates to v0.2.2, retires recognition, and preserves coexistence.'
  echo 'PENDING: native Cursor legacy refusal, ordinary update, and improved ADR use; run --native.'
  exit 0
fi

command -v cursor > /dev/null
delivery_prepare_fixture
delivery_assert_legacy_install
delivery_capture_legacy_state

run_native_cursor() {
  local output_file=$1
  local prompt=$2
  (
    cd -- "${delivery_target}"
    cursor agent --print --force --trust --sandbox enabled \
      --workspace "${delivery_target}" "${prompt}"
  ) > "${output_file}"
}

refusal_output="${delivery_temporary_dir}/cursor-legacy-refusal-output.md"
run_native_cursor "${refusal_output}" \
  "Use \$dough-update ${delivery_source_url} to update this genuine v${delivery_legacy_version} three-file Cursor installation. Follow the installed updater exactly. Inspect the pinned candidate's declared installed payload before running anything. The candidate declares two installed skill files and source-only recognition, while your installed updater requires all three as installed payload. Refuse this incompatible smaller candidate without changing any file. Report the two contracts, source, Cursor as the running tool, and that no replacement occurred."
delivery_assert_legacy_refusal "${refusal_output}"

delivery_bootstrap_candidate
delivery_publish_improved_release
delivery_capture_update_state
codex_before=$(delivery_snapshot "${delivery_target}/.agents/skills")
claude_before=$(delivery_snapshot "${delivery_target}/.claude/skills")
update_output="${delivery_temporary_dir}/cursor-update-output.md"
run_native_cursor "${update_output}" \
  "Use \$dough-update ${delivery_source_url} to perform an ordinary newer-release update of this inspected-bootstrap Cursor installation. Follow the installed updater exactly and do not force the update. Report release v${delivery_update_version}, its source and commit, Cursor as the running tool, and every installed path. Recognition is source-only and must not be reported as installed. Do not invoke ADR awareness yet."

delivery_assert_update "${update_output}"
codex_after=$(delivery_snapshot "${delivery_target}/.agents/skills")
claude_after=$(delivery_snapshot "${delivery_target}/.claude/skills")
[[ "${codex_before}" == "${codex_after}" ]]
[[ "${claude_before}" == "${claude_after}" ]]

use_before=$(delivery_snapshot "${delivery_target}")
use_output="${delivery_temporary_dir}/cursor-use-output.md"
run_native_cursor "${use_output}" \
  "Use \$dough-adr-awareness for an explicit ADR check. Your final response must begin exactly with the line Invocation: \$dough-adr-awareness. Assess whether work may switch telemetry history to per-node files. The catalog and ARC-12 record now disagree: demonstrate the installed v${delivery_update_version} improvement by naming each conflicting repository-relative authority and the value it reports before asking who owns precedence. End with exactly: No decision or implementation was changed. Use only this adopter repository, do not read source recognition, and keep the response concise."
use_after=$(delivery_snapshot "${delivery_target}")
if [[ "${use_before}" != "${use_after}" ]]; then
  echo 'FAIL: native Cursor changed adopter files during ADR use.' >&2
  exit 1
fi
delivery_assert_use "${use_output}"

native_tool_version=$(cursor --version)
printf 'Native tool version: %s\n' "${native_tool_version}"
delivery_print_proof "${update_output}" "${use_output}" "${refusal_output}"
printf '%s\n' \
  'PASS: legacy Cursor refused the incompatible smaller candidate unchanged; the explicit inspected bootstrap installed the current two-skill updater; a fresh session ordinarily updated it to the newer release.' \
  'PASS: fresh native Cursor discovered and invoked only the installed dough-adr-awareness skill; no original adr-awareness skill or installed recognition was present.' \
  'PASS: Cursor enumerated both conflicting alternate-layout status authorities and their Adopted/Replaced values, stopped for human precedence, and changed no adopter files.' \
  'PASS: final recognition is absent, and the other platform installations plus companion integration remained byte-identical.'
