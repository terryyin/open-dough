#!/usr/bin/env bash
# Native proof that Codex, Cursor, and Claude Code share one project-owned
# execution-worktree readiness gate. The no-argument path is credential-free.
#
# Usage:
#   tests/execution-worktree-preparation-native.sh
#   tests/execution-worktree-preparation-native.sh --list [--results-dir DIR]
#   tests/execution-worktree-preparation-native.sh --native HOST [--case CASE] [--results-dir DIR] [--deadline SECONDS] [--grace SECONDS]
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2312,SC2329
# Trap handlers are invoked through EXIT, not by name.
set -Eeuo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/helpers/public-payload-fixture.bash
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
source "${source_dir}/tests/helpers/release-fixture.bash"
source "${source_dir}/tests/support/native-codex.sh"
source "${source_dir}/tests/support/native-result-retain.sh"
source "${source_dir}/tests/support/native-run-supervise.sh"
source "${source_dir}/tests/support/execution-worktree-prep-native.sh"
source "${source_dir}/tests/support/execution-worktree-prep-native-run.sh"
source "${source_dir}/tests/support/execution-worktree-prep-native-cheap.sh"

prep_native_entry='tests/execution-worktree-preparation-native.sh'
prep_native_parse "$@"

if [[ ${prep_native_mode} == list ]]; then
  prep_native_print_listing
  exit 0
fi

if [[ ${prep_native_mode} == default ]]; then
  cheap_work=$(mktemp -d)
  finish_cheap() {
    rm -rf -- "${cheap_work}"
  }
  trap finish_cheap EXIT
  wrapper="${source_dir}/tests/execution-worktree-preparation-native.sh"
  run_cheap_assessor_contracts
  run_cheap_flag_contracts "${cheap_work}" "${wrapper}"
  run_cheap_isolation "${cheap_work}" "${wrapper}"
  exit 0
fi

if [[ -n ${prep_native_results_dir} ]]; then
  native_result_require_writable "${prep_native_results_dir}"
  prep_native_results_dir=${native_case_results_dir}
fi

native_case_deadline=${prep_native_deadline:-3600}
native_case_grace=${prep_native_grace:-15}
native_case_host=${prep_native_host}
native_case_id=${prep_native_case}
platform=${prep_native_host}

proof_root=$(mktemp -d)
artifact_root=$(mktemp -d)
transcript="${artifact_root}/native.jsonl"
output_file="${artifact_root}/response.md"
native_stderr="${artifact_root}/stderr.log"
: > "${native_stderr}"
fixture_dir="${proof_root}/fixture"
mkdir -p -- "${fixture_dir}"

finish_native() {
  local status=$?
  rm -rf -- "${proof_root}"
  rm -rf -- "${artifact_root}"
  exit "${status}"
}
trap finish_native EXIT

fixture_json=$(node "${prep_native_fixture_js}" "${prep_native_case}" "${fixture_dir}")
prep_native_origin=$(jq -r '.origin' <<< "${fixture_json}")
prep_native_execution=$(jq -r '.execution' <<< "${fixture_json}")
prep_native_trace_path=$(jq -r '.tracePath' <<< "${fixture_json}")
prep_native_artifact_cache=$(jq -r '.artifactCache // empty' <<< "${fixture_json}")
prep_native_setup_count=$(jq -r '.setupCount' <<< "${fixture_json}")
before_file="${artifact_root}/before.json"
jq -c '.before' <<< "${fixture_json}" > "${before_file}"
cp -- "${prep_native_origin}/AGENTS.md" "${fixture_dir}/AGENTS.md"
cp -- "${prep_native_origin}/CLAUDE.md" "${fixture_dir}/CLAUDE.md"
prep_native_install_payload "${fixture_dir}" "${prep_native_host}"
if [[ -d ${fixture_dir}/.agents ]]; then
  rm -rf -- "${prep_native_origin}/.agents" "${prep_native_execution}/.agents"
  cp -R -- "${fixture_dir}/.agents" "${prep_native_origin}/.agents"
  cp -R -- "${fixture_dir}/.agents" "${prep_native_execution}/.agents"
fi
if [[ -d ${fixture_dir}/.claude ]]; then
  rm -rf -- "${prep_native_origin}/.claude" "${prep_native_execution}/.claude"
  cp -R -- "${fixture_dir}/.claude" "${prep_native_origin}/.claude"
  cp -R -- "${fixture_dir}/.claude" "${prep_native_execution}/.claude"
fi

export PREP_TRACE=${prep_native_trace_path}
if [[ -n ${prep_native_artifact_cache} ]]; then
  export ARTIFACT_CACHE=${prep_native_artifact_cache}
fi

temporary_dir=${proof_root}
candidate=${source_dir}
native_run_workspace=${fixture_dir}
target=${fixture_dir}
prompt=$(prep_native_prompt_for "${prep_native_origin}" "${prep_native_execution}")
prep_native_assessment_status=not-run
prep_native_assessment_reason=not-run

if [[ ${platform} == codex ]]; then
  native_codex_prepare "${proof_root}" "${source_dir}"
fi

run_status=0
prep_native_run_command || run_status=$?
prep_native_extract_commands
if [[ ${native_run_outcome} == timeout ]]; then
  prep_native_assessment_status=pending
  prep_native_assessment_reason='deadline expired'
  prep_native_retain
  echo "PENDING: ${prep_native_host} ${prep_native_case}: deadline expired."
  exit 124
fi
if [[ ${native_run_outcome} == failed || ${native_run_outcome} == incomplete ]]; then
  prep_native_assessment_status=pending
  prep_native_assessment_reason=${native_run_failure_reason:-incomplete native stream}
  prep_native_retain
  echo "PENDING: ${prep_native_host} ${prep_native_case}: ${prep_native_assessment_reason}."
  exit 1
fi

prep_native_assess_live "${before_file}"
prep_native_retain
printf 'Platform: %s\nCase: %s\nNative tool version: %s\n' \
  "${prep_native_host}" "${prep_native_case}" "${tool_version:-unknown}"
printf 'Assessment: %s\nReason: %s\n' \
  "${prep_native_assessment_status}" "${prep_native_assessment_reason}"
case ${prep_native_assessment_status} in
  pass)
    echo "PASS: ${prep_native_host} ${prep_native_case} native readiness matched stream and filesystem evidence."
    exit 0
    ;;
  pending)
    echo "PENDING: ${prep_native_host} ${prep_native_case}: ${prep_native_assessment_reason}."
    exit 1
    ;;
  *)
    echo "FAIL: ${prep_native_host} ${prep_native_case}: ${prep_native_assessment_reason}." >&2
    exit 1
    ;;
esac
