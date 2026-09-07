#!/usr/bin/env bash
# Durable per-attempt retention for selected native checks.
# Listing may read these paths as unreviewed prior-evidence; it never certifies reuse.
# shellcheck disable=SC2034,SC2154 # Wrapper and prerequisite globals are assigned for sourced helpers.
# shellcheck disable=SC2312 # pipefail covers attempt IDs and prompt hashes.

native_result_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=tests/support/native-prerequisite-gate.sh
# shellcheck disable=SC1091
source "${native_result_support_dir}/native-prerequisite-gate.sh"
# shellcheck source=tests/support/native-adr-behavior.sh
# shellcheck disable=SC1091
source "${native_result_support_dir}/native-adr-behavior.sh"

native_result_attempt_dir=
native_result_attempt_id=

native_result_unwritable_dir() {
  printf 'error: --results-dir is not a writable directory: %s\n' "$1" >&2
  exit 2
}

native_result_require_writable() {
  local dest=$1

  if [[ -z ${dest} ]]; then
    return 0
  fi
  if [[ ! -d ${dest} ]]; then
    mkdir -p -- "${dest}" || native_result_unwritable_dir "${dest}"
  fi
  if [[ ! -w ${dest} ]]; then
    native_result_unwritable_dir "${dest}"
  fi
  native_case_results_dir=$(cd -- "${dest}" && pwd)
}

native_result_allocate_attempt() {
  local dest=$1
  local host=$2
  local case_id=$3
  local parent attempt_dir

  parent="${dest}/${host}/${case_id}"
  mkdir -p -- "${parent}"
  while true; do
    native_result_attempt_id="$(date -u +%Y%m%dT%H%M%S)-$(printf '%04x' "${RANDOM}")"
    attempt_dir="${parent}/${native_result_attempt_id}"
    if mkdir "${attempt_dir}" 2> /dev/null; then
      native_result_attempt_dir=${attempt_dir}
      return 0
    fi
  done
}

native_result_copy_if_present() {
  local source_file=$1
  local dest_name=$2

  if [[ -n ${source_file} && -f ${source_file} ]]; then
    cp -- "${source_file}" "${native_result_attempt_dir}/${dest_name}"
  fi
}

native_result_write_text() {
  local dest_name=$1
  local text=$2

  printf '%s\n' "${text}" > "${native_result_attempt_dir}/${dest_name}"
}

native_result_input_hash_line() {
  local rel=$1
  local digest

  digest=$(shasum -a 256 "${source_dir}/${rel}")
  printf 'input-hash: %s %s\n' "${digest%% *}" "${rel}"
}

native_result_version_command_for() {
  case $1 in
    cursor) printf '%s\n' 'cursor agent --version' ;;
    claude) printf '%s\n' 'claude --version' ;;
    *) printf '%s\n' 'codex --version' ;;
  esac
}

native_result_adapter_identity() {
  case ${native_case_host} in
    cursor) printf 'cursor-agent-stream-json\n' ;;
    claude) printf 'claude-stream-json\n' ;;
    *) printf 'tests/support/native-codex.sh\n' ;;
  esac
}

native_result_write_if_set() {
  local dest_name=$1
  local is_set=$2
  local text=$3

  if [[ ${is_set} == 1 ]]; then
    native_result_write_text "${dest_name}" "${text}"
  fi
}

native_result_execution_status_fields() {
  case ${native_run_outcome:-exited} in
    timeout)
      printf 'execution-status: timeout\n'
      printf 'execution-reason: deadline expired\n'
      ;;
    failed)
      printf 'execution-status: failed\n'
      printf 'execution-reason: %s\n' \
        "${native_run_failure_reason:-native command failed}"
      ;;
    incomplete)
      printf 'execution-status: incomplete\n'
      printf 'execution-reason: %s\n' \
        "${native_run_failure_reason:-incomplete terminal stream}"
      ;;
    *)
      printf 'execution-status: completed\n'
      printf 'execution-reason: native command exited 0\n'
      ;;
  esac
}

native_result_fill_context_prerequisite() {
  native_prerequisite_host=${native_case_host}
  native_prerequisite_execution=${native_run_outcome:-exited}
  native_prerequisite_stream=${transcript-}
  native_prerequisite_response=${output_file-}
  native_prerequisite_stream_artifact=events.jsonl
  native_prerequisite_candidate=${candidate-}
  native_prerequisite_installed_skill_path=
  if [[ -n ${target-} && -n ${skill_root-} ]]; then
    native_prerequisite_installed_skill_path="${target}/${skill_root}/dough-adr-awareness/SKILL.md"
  fi
  if [[ -z ${native_prerequisite_installed_identity-} ]]; then
    native_prerequisite_installed_identity='Do not require policies for situations absent from the current request.'
  fi
  native_prerequisite_assess
}

native_result_execution_fields() {
  native_result_execution_status_fields
  native_result_fill_context_prerequisite
  native_prerequisite_print_fields
  native_adr_behavior_print_fields
}

native_result_print_tool_identity() {
  local version_command executable source_revision

  version_command=$(native_result_version_command_for "${native_case_host}")
  executable=$(command -v "${native_case_host}" 2> /dev/null) || executable=
  if [[ -z ${executable} ]]; then
    executable=unknown
  fi
  source_revision=$(git -C "${source_dir}" rev-parse HEAD)
  printf 'native-executable: %s\n' "${executable}"
  printf 'native-version-command: %s\n' "${version_command}"
  printf 'native-version: %s\n' "${tool_version:-unknown}"
  printf 'native-model: unknown\n'
  printf 'native-runtime-settings: unknown\n'
  printf 'source-revision: %s\n' "${source_revision}"
}

native_result_print_adapter_identity() {
  printf 'adapter-identity: %s\n' "$(native_result_adapter_identity)"
}

native_result_finalize_context() {
  local record_file

  if [[ -z ${native_case_results_dir} ]]; then
    return 0
  fi

  native_result_allocate_attempt \
    "${native_case_results_dir}" "${native_case_host}" "${native_case_id}"

  native_result_copy_if_present "${transcript}" events.jsonl
  native_result_copy_if_present "${output_file}" response.md
  native_result_copy_if_present "${native_stderr}" stderr.log
  native_result_copy_if_present "${command_log-}" commands.txt
  native_result_copy_if_present "${inspection_log-}" inspection-targets.txt
  native_result_write_if_set before-snapshot.txt "${before+1}" "${before-}"
  native_result_write_if_set after-snapshot.txt "${after+1}" "${after-}"
  native_result_write_if_set source-before-snapshot.txt \
    "${source_before+1}" "${source_before-}"
  native_result_write_if_set source-after-snapshot.txt \
    "${source_after+1}" "${source_after-}"
  case ${native_run_outcome:-exited} in
    timeout | failed | incomplete)
      native_result_write_text observations.txt "$(
        printf 'partial: true\n'
        printf 'execution: %s\n' "${native_run_outcome}"
      )"
      ;;
    *)
      native_result_write_text observations.txt "$(
        printf 'before-digest: %s\n' "${before_digest}"
        printf 'after-digest: %s\n' "${after_digest}"
        printf 'source-before-digest: %s\n' "${source_before_digest}"
        printf 'source-after-digest: %s\n' "${source_after_digest}"
        printf 'target-unchanged: true\n'
        printf 'source-unchanged: true\n'
      )"
      ;;
  esac

  record_file="${native_result_attempt_dir}/record"
  {
    printf 'host: %s\n' "${native_case_host}"
    printf 'case: %s\n' "${native_case_id}"
    printf 'origin: fresh\n'
    native_result_execution_fields
    native_result_print_tool_identity
    printf 'fixture-tag: %s\n' "${tag}"
    printf 'fixture-commit: %s\n' "${source_commit}"
    printf 'prompt-identity: %s\n' "$(printf '%s' "${prompt}" | shasum -a 256 | cut -d ' ' -f 1)"
    printf 'helper-identity: tests/support/dough-adr-awareness-use.sh\n'
    native_result_print_adapter_identity
    printf 'fixture-identity: tests/fixtures/adr-awareness/installed-use\n'
    printf 'assessor-identity: tests/support/native-adr-behavior.sh\n'
    printf 'artifact-events: events.jsonl\n'
    printf 'artifact-response: response.md\n'
    printf 'artifact-stderr: stderr.log\n'
    printf 'artifact-commands: commands.txt\n'
    printf 'artifact-observations: observations.txt\n'
    native_result_input_hash_line tests/dough-adr-awareness-context.sh
    native_result_input_hash_line tests/support/native-result-retain.sh
    native_result_input_hash_line tests/support/native-prerequisite-gate.sh
    native_result_input_hash_line tests/support/native-activation-decode.sh
    native_result_input_hash_line tests/support/native-activation-path.sh
    native_result_input_hash_line tests/support/native-adr-behavior.sh
    native_result_input_hash_line tests/support/dough-adr-awareness-use.sh
    native_result_input_hash_line tests/support/native-codex.sh
    native_result_input_hash_line src/skills/dough-adr-awareness/SKILL.md
  } > "${record_file}"
}

native_result_report_context() {
  native_result_finalize_context
  if [[ -n ${native_case_results_dir} ]]; then
    printf 'result-path: %s\n' "${native_result_attempt_dir}"
  fi
}
