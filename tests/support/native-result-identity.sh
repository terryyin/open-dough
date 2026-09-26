#!/usr/bin/env bash
# What produced a retained native evidence record: the native tool and adapter
# that ran, and the hash of each source input the record depends on.
# shellcheck disable=SC2154 # Wrapper globals come from the sourcing check.
# shellcheck disable=SC2312 # pipefail covers digests and the source revision.

native_result_input_hash_line() {
  local rel=$1
  local digest

  digest=$(shasum -a 256 "${source_dir}/${rel}")
  printf 'input-hash: %s %s\n' "${digest%% *}" "${rel}"
}

# One input-hash line per native supervision input, from the list that
# native-run-supervise.sh declares next to the helpers it sources.
native_result_supervision_input_hash_lines() {
  local rel

  if ! declare -p native_run_supervision_inputs > /dev/null 2>&1; then
    echo 'error: source native-run-supervise.sh before writing an evidence identity' >&2
    return 1
  fi
  for rel in "${native_run_supervision_inputs[@]}"; do
    native_result_input_hash_line "${rel}"
  done
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
