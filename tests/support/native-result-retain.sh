#!/usr/bin/env bash
# Durable per-attempt retention for selected native checks.
# Listing may read these paths as unreviewed prior-evidence; it never certifies reuse.
# shellcheck disable=SC2154 # Wrapper globals are assigned before finalize.
# shellcheck disable=SC2312 # pipefail covers attempt IDs and prompt hashes.

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

native_result_finalize_context() {
  local record_file version_command executable source_revision
  local adapter_identity

  if [[ -z ${native_case_results_dir} ]]; then
    return 0
  fi

  native_result_allocate_attempt \
    "${native_case_results_dir}" "${native_case_host}" "${native_case_id}"

  native_result_copy_if_present "${transcript}" events.jsonl
  native_result_copy_if_present "${output_file}" response.md
  native_result_copy_if_present "${native_stderr}" stderr.log
  native_result_copy_if_present "${command_log}" commands.txt
  native_result_copy_if_present "${inspection_log:-}" inspection-targets.txt
  native_result_write_text before-snapshot.txt "${before}"
  native_result_write_text after-snapshot.txt "${after}"
  native_result_write_text source-before-snapshot.txt "${source_before}"
  native_result_write_text source-after-snapshot.txt "${source_after}"
  native_result_write_text observations.txt "$(
    printf 'before-digest: %s\n' "${before_digest}"
    printf 'after-digest: %s\n' "${after_digest}"
    printf 'source-before-digest: %s\n' "${source_before_digest}"
    printf 'source-after-digest: %s\n' "${source_after_digest}"
    printf 'target-unchanged: true\n'
    printf 'source-unchanged: true\n'
  )"

  version_command=$(native_result_version_command_for "${native_case_host}")
  executable=$(command -v "${native_case_host}")
  source_revision=$(git -C "${source_dir}" rev-parse HEAD)
  case ${native_case_host} in
    cursor) adapter_identity='cursor-agent-stream-json' ;;
    claude) adapter_identity='claude-stream-json' ;;
    *) adapter_identity='tests/support/native-codex.sh' ;;
  esac

  record_file="${native_result_attempt_dir}/record"
  {
    printf 'host: %s\n' "${native_case_host}"
    printf 'case: %s\n' "${native_case_id}"
    printf 'origin: fresh\n'
    printf 'execution-status: completed\n'
    printf 'execution-reason: native command exited 0\n'
    printf 'assessment-status: pass\n'
    printf 'assessment-interpretation: limited-wording\n'
    printf 'native-executable: %s\n' "${executable}"
    printf 'native-version-command: %s\n' "${version_command}"
    printf 'native-version: %s\n' "${tool_version}"
    printf 'native-model: unknown\n'
    printf 'native-runtime-settings: unknown\n'
    printf 'source-revision: %s\n' "${source_revision}"
    printf 'fixture-tag: %s\n' "${tag}"
    printf 'fixture-commit: %s\n' "${source_commit}"
    printf 'prompt-identity: %s\n' "$(printf '%s' "${prompt}" | shasum -a 256 | cut -d ' ' -f 1)"
    printf 'helper-identity: tests/support/dough-adr-awareness-use.sh\n'
    printf 'adapter-identity: %s\n' "${adapter_identity}"
    printf 'fixture-identity: tests/fixtures/adr-awareness/installed-use\n'
    printf 'assessor-identity: tests/dough-adr-awareness-context.sh wording-assertions\n'
    printf 'artifact-events: events.jsonl\n'
    printf 'artifact-response: response.md\n'
    printf 'artifact-stderr: stderr.log\n'
    printf 'artifact-commands: commands.txt\n'
    printf 'artifact-observations: observations.txt\n'
    native_result_input_hash_line tests/dough-adr-awareness-context.sh
    native_result_input_hash_line tests/support/native-result-retain.sh
    native_result_input_hash_line tests/support/dough-adr-awareness-use.sh
    native_result_input_hash_line tests/support/native-codex.sh
    native_result_input_hash_line src/skills/dough-adr-awareness/SKILL.md
  } > "${record_file}"
}
