#!/usr/bin/env bash
# shellcheck disable=SC1091 # Shared helpers are linted separately.
# shellcheck disable=SC2034,SC2154 # native_case_*, native_result_*, native_run_* globals are shared.
# shellcheck disable=SC2312 # pipefail protects snapshot/digest pipelines.
set -Eeuo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/helpers/public-payload-fixture.bash
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
source "${source_dir}/tests/helpers/release-fixture.bash"
source "${source_dir}/tests/support/native-codex.sh"
source "${source_dir}/tests/support/dough-adr-awareness-proof.sh"
source "${source_dir}/tests/support/dough-adr-awareness-use.sh"
# shellcheck source=tests/support/native-cases.sh
source "${source_dir}/tests/support/native-cases.sh"
# shellcheck source=tests/support/native-result-retain.sh
source "${source_dir}/tests/support/native-result-retain.sh"
# shellcheck source=tests/support/native-run-supervise.sh
source "${source_dir}/tests/support/native-run-supervise.sh"

native_case_entry='tests/dough-adr-awareness-context.sh'
native_case_parse --wrapper context "$@"
if [[ ${native_case_mode} == 'list' ]]; then
  native_case_print_listing
  exit 0
fi
if [[ ${native_case_mode} == 'native-context' && -n ${native_case_results_dir} ]]; then
  native_result_require_writable "${native_case_results_dir}"
fi

skill_root_for() {
  case $1 in
    codex) printf '%s\n' '.agents/skills' ;;
    cursor) printf '%s\n' '.cursor/skills' ;;
    claude) printf '%s\n' '.claude/skills' ;;
    *) return 2 ;;
  esac
}

temporary_dir=$(mktemp -d)
transcript="${temporary_dir}/native.jsonl"
output_file="${temporary_dir}/response.md"
native_stderr="${temporary_dir}/stderr.log"
: > "${native_stderr}"
finish() {
  local status=$?
  if ((status != 0)); then
    [[ ! -f ${transcript} ]] || cat "${transcript}" >&2
    [[ ! -f ${output_file} ]] || cat "${output_file}" >&2
  fi
  rm -rf -- "${temporary_dir}"
  exit "${status}"
}
trap finish EXIT
candidate="${temporary_dir}/candidate"
build_current_tagged_release_fixture "${candidate}" \
  dough-adr-awareness/RECOGNITION.md
version=$(cat "${candidate}/VERSION")
tag="v${version}"
source_commit=$(git -C "${candidate}" rev-parse HEAD)
source_before=$(snapshot_path_state "${candidate}")

assert_fresh_install() {
  local checked_platform=$1
  local checked_target=$2
  local checked_skill_root managed_file

  checked_skill_root=$(skill_root_for "${checked_platform}")
  # shellcheck disable=SC2154 # Assigned by the sourced public-payload fixture.
  for managed_file in "${managed_files[@]}"; do
    # shellcheck disable=SC2312 # pipefail preserves a failed tagged-source read.
    git -C "${candidate}" show "${tag}:src/skills/${managed_file}" \
      | cmp - "${checked_target}/${checked_skill_root}/${managed_file}"
  done
  git -C "${candidate}" cat-file -e \
    "${tag}:src/skills/dough-adr-awareness/RECOGNITION.md"
  [[ ! -e "${checked_target}/${checked_skill_root}/dough-adr-awareness/RECOGNITION.md" ]]
  [[ $(cat "${checked_target}/${checked_skill_root}/dough-update/VERSION") == "${version}" ]]
  grep -Fq 'Do not require policies for situations absent from the current request.' \
    "${checked_target}/${checked_skill_root}/dough-adr-awareness/SKILL.md"
}

if [[ ${native_case_mode} == 'default' ]]; then
  for platform in codex cursor claude; do
    target="${temporary_dir}/${platform}-adopter"
    prepare_installed_adr_awareness_target "${target}" "${candidate}" "${platform}"
    before=$(snapshot_path_state "${target}")
    assert_fresh_install "${platform}" "${target}"
    [[ ${before} == "$(snapshot_path_state "${target}")" ]]
  done
  [[ ${source_before} == "$(snapshot_path_state "${candidate}")" ]]
  echo 'PASS: clean Codex, Cursor, and Claude Code targets receive the exact tagged two-skill payload and VERSION, retain the direct ADR context, contain the current on-demand-context improvement, and omit recognition while the complete candidate source stays unchanged.'
  echo 'PENDING: native fresh-install use in Codex, Cursor, and Claude Code; run each platform with --native and the clear scenario.'
  exit 0
fi

platform=${native_case_host}
scenario=${native_case_id#context/}
skill_root=$(skill_root_for "${platform}")
target="${temporary_dir}/adopter"
prepare_installed_adr_awareness_target "${target}" "${candidate}" "${platform}"
if [[ ${scenario} == 'conflict' ]]; then
  sed 's/| Accepted |/| Proposed |/' "${target}/docs/adrs/README.md" \
    > "${temporary_dir}/index"
  cp -- "${temporary_dir}/index" "${target}/docs/adrs/README.md"
fi
assert_fresh_install "${platform}" "${target}"
before=$(snapshot_path_state "${target}")

# shellcheck disable=SC2016 # The dollar sign is the native skill invocation.
prompt='Use $dough-adr-awareness. Assess how two backend instances should share login sessions. Do not edit files.'
# shellcheck disable=SC2310 # Timeout and launch failure must be observed, not lost to set -e.
native_run_context_command || {
  run_status=$?
  native_result_report_context
  if [[ ${native_run_outcome} == timeout ]]; then
    exit 124
  fi
  exit "${run_status}"
}
after=$(snapshot_path_state "${target}")
source_after=$(snapshot_path_state "${candidate}")
[[ ${before} == "${after}" && ${source_before} == "${source_after}" ]]
command_log="${temporary_dir}/${platform}-${scenario}-commands.txt"
inspection_log="${temporary_dir}/${platform}-${scenario}-inspection-targets.txt"
jq -r '.. | objects |
  (.command? // .args.command? // .input.command? // empty) | strings' \
  "${transcript}" > "${command_log}"
case ${platform} in
  cursor)
    jq -r '.. | objects | select(has("tool_call")) |
      .tool_call | .. | objects | .args? // empty | .. | strings' \
      "${transcript}" > "${inspection_log}"
    ;;
  claude)
    jq -r '.message.content[]? |
      select(.type == "tool_use" and (.name == "Read" or .name == "Glob" or .name == "Grep")) |
      .input | .. | strings' "${transcript}" > "${inspection_log}"
    ;;
  codex) : ;;
  *) exit 2 ;;
esac
assert_no_adr_awareness_maintenance \
  "${command_log}" "${platform} ${scenario} ADR assessment"
if grep -Fq "${candidate}" "${command_log}" \
  || { [[ -f ${inspection_log} ]] && grep -Fq "${candidate}" "${inspection_log}"; }; then
  echo "FAIL: ${platform} fell back to the candidate source during installed use." >&2
  exit 1
fi
if [[ -f ${inspection_log} ]] && grep -Eiq 'RECOGNITION\.md|adr-adoption|migration' \
  "${inspection_log}"; then
  echo "FAIL: ${platform} read source-only recognition or migration support." >&2
  exit 1
fi
before_digest=$(printf '%s\n' "${before}" | shasum -a 256 | cut -d ' ' -f 1)
after_digest=$(printf '%s\n' "${after}" | shasum -a 256 | cut -d ' ' -f 1)
source_before_digest=$(printf '%s\n' "${source_before}" | shasum -a 256 | cut -d ' ' -f 1)
source_after_digest=$(printf '%s\n' "${source_after}" | shasum -a 256 | cut -d ' ' -f 1)
printf 'Platform: %s\nNative tool version: %s\nScenario: %s\n' \
  "${platform}" "${tool_version}" "${scenario}"
printf 'Candidate tag: %s\nCandidate revision: %s\n' "${tag}" "${source_commit}"
printf 'Install entry point: install.sh --target <clean-adopter> --platform %s\n' \
  "${platform}"
printf 'Native entry point: %s\n' "${prompt}"
printf 'Installed paths:\n- %s\n- %s\n- %s\n' \
  "${skill_root}/dough-update/SKILL.md" \
  "${skill_root}/dough-update/VERSION" \
  "${skill_root}/dough-adr-awareness/SKILL.md"
printf 'Before snapshot: %s\nAfter snapshot: %s\n' "${before_digest}" "${after_digest}"
printf 'Before source snapshot: %s\nAfter source snapshot: %s\n' \
  "${source_before_digest}" "${source_after_digest}"
printf 'Installed skill identity: %s\n' \
  "${skill_root}/dough-adr-awareness/SKILL.md"
shasum -a 256 "${target}/${skill_root}/dough-adr-awareness/SKILL.md"
native_adr_behavior_assess "${scenario}" "${output_file}"
native_adr_behavior_print_fields
if [[ ${native_adr_behavior_status} == 'fail' ]]; then
  echo "FAIL: ${platform} ${scenario} ${native_adr_behavior_reason}." >&2
  native_result_report_context
  exit 1
fi
printf '\nNative application evidence:\n'
cat "${output_file}"
printf '\nNative command evidence:\n'
cat "${command_log}"
printf '\nNative transcript for loading and behavior review:\n'
cat "${transcript}"
printf '\nPASS: %s %s native assessment; candidate and complete target unchanged.\n' \
  "${platform}" "${scenario}"
native_result_report_context
