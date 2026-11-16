#!/usr/bin/env bash
# shellcheck disable=SC1091 # Shared helpers are linted separately.
# shellcheck disable=SC2034,SC2154 # native_case_*, native_result_*, native_run_* globals are shared.
# shellcheck disable=SC2312 # pipefail protects snapshot/digest pipelines.
set -Eeuo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
if [[ $# == 0 ]]; then
  exec bash "${source_dir}/Distribution/tests/adr-awareness/dough-adr-awareness-context.sh"
fi
# shellcheck source=Distribution/tests/helpers/public-payload-fixture.bash
source "${source_dir}/Distribution/tests/helpers/public-payload-fixture.bash"
source "${source_dir}/Distribution/tests/helpers/release-fixture.bash"
source "${source_dir}/Distribution/tests/helpers/fixture-cache.bash"
source "${source_dir}/Distribution/evaluation/src/native-codex.sh"
source "${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-proof.sh"
source "${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-use.sh"
# shellcheck source=Distribution/evaluation/src/native-cases.sh
source "${source_dir}/Distribution/evaluation/src/native-cases.sh"
# shellcheck source=Distribution/evaluation/src/native-result-retain.sh
source "${source_dir}/Distribution/evaluation/src/native-result-retain.sh"
# shellcheck source=Distribution/evaluation/src/native-run-supervise.sh
source "${source_dir}/Distribution/evaluation/src/native-run-supervise.sh"

native_case_entry='Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-context.sh'
native_case_parse --wrapper context "$@"
if [[ ${native_case_mode} == 'list' ]]; then
  native_case_print_listing
  exit 0
fi
if [[ ${native_case_mode} == 'native-context' && -n ${native_case_results_dir} ]]; then
  native_result_require_writable "${native_case_results_dir}"
fi

source "${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-context-fixture.sh"

platform=${native_case_host}
scenario=${native_case_id#context/}
skill_root=$(skill_root_for "${platform}")
agent_root=$(mktemp -d)
artifact_root=$(mktemp -d)
transcript="${artifact_root}/native.jsonl"
output_file="${artifact_root}/response.md"
native_stderr="${artifact_root}/stderr.log"
: > "${native_stderr}"
target="${temporary_dir}/adopter"
fixture_cache_fill "context-${platform}" "${temporary_dir}" \
  build_context_adopter "${candidate_build}" "${platform}"
if [[ ${scenario} == 'conflict' ]]; then
  sed 's/| Accepted |/| Proposed |/' "${target}/docs/adrs/README.md" \
    > "${temporary_dir}/index"
  cp -- "${temporary_dir}/index" "${target}/docs/adrs/README.md"
fi
assert_fresh_install "${platform}" "${target}"
before=$(snapshot_path_state "${target}")
cp -R -- "${target}" "${agent_root}/adopter"
native_run_workspace="${agent_root}/adopter"

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
command_log="${artifact_root}/${platform}-${scenario}-commands.txt"
inspection_log="${artifact_root}/${platform}-${scenario}-inspection-targets.txt"
native_host_stream "${platform}" "${transcript}" segments > "${command_log}"
native_host_stream "${platform}" "${transcript}" targets > "${inspection_log}"
assert_no_adr_awareness_maintenance \
  "${command_log}" "${platform} ${scenario} ADR assessment"
if grep -Fq "${candidate}" "${command_log}" \
  || grep -Fq "${candidate}" "${inspection_log}"; then
  echo "FAIL: ${platform} fell back to the candidate source during installed use." >&2
  exit 1
fi
if grep -Eiq 'adr-adoption|migration' "${inspection_log}"; then
  echo "FAIL: ${platform} read migration-support material." >&2
  exit 1
fi
before_digest=$(printf '%s\n' "${before}" | shasum -a 256 | cut -d ' ' -f 1)
after_digest=$(printf '%s\n' "${after}" | shasum -a 256 | cut -d ' ' -f 1)
source_before_digest=$(printf '%s\n' "${source_before}" | shasum -a 256 | cut -d ' ' -f 1)
source_after_digest=$(printf '%s\n' "${source_after}" | shasum -a 256 | cut -d ' ' -f 1)
printf 'Platform: %s\nNative tool version: %s\nScenario: %s\n' \
  "${platform}" "${tool_version}" "${scenario}"
printf 'Candidate tag: %s\nCandidate revision: %s\n' "${tag}" "${source_commit}"
printf 'Install entry point: install.sh --target <clean-client-project> --platform %s\n' \
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
