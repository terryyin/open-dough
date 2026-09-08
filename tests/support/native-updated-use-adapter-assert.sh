#!/usr/bin/env bash
# Shared assertions for Cursor and Claude Code selected delivery/updated-use
# adapter proofs. The proof script assigns source_dir, work paths, and PATH first.
# shellcheck disable=SC2016,SC2154,SC2249,SC2310,SC2311,SC2312 # Proof globals; pipefail covers logs.

# shellcheck source=tests/support/native-prerequisite-gate.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-prerequisite-gate.sh"
# shellcheck source=tests/support/native-updated-use-prompt-assert.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-updated-use-prompt-assert.sh"

native_updated_use_adapter_require_host() {
  case $1 in
    cursor | claude) ;;
    *)
      echo "FAIL: unexpected host $1." >&2
      return 1
      ;;
  esac
}

wrapper_for() {
  native_updated_use_adapter_require_host "$1" || return
  printf '%s\n' \
    "${source_dir}/tests/dough-adr-awareness-$1-delivery-to-use.sh"
}

print_launch() {
  native_updated_use_adapter_require_host "$1" || return
  case $1 in
    cursor) printf 'cursor agent --print\n' ;;
    claude) printf 'claude --print\n' ;;
  esac
}

version_command_for() {
  native_updated_use_adapter_require_host "$1" || return
  case $1 in
    cursor) printf 'cursor agent --version\n' ;;
    claude) printf 'claude --version\n' ;;
  esac
}

adapter_identity_for() {
  native_updated_use_adapter_require_host "$1" || return
  case $1 in
    cursor) printf 'cursor-agent-stream-json\n' ;;
    claude) printf 'claude-stream-json\n' ;;
  esac
}

native_version_for() {
  native_updated_use_adapter_require_host "$1" || return
  case $1 in
    cursor) printf 'cursor-agent journey-1\n' ;;
    claude) printf 'claude journey-1\n' ;;
  esac
}

assert_watched_empty() {
  local leftover
  leftover=$(find "${watched_dir}" -mindepth 1 ! -name xcrun_db -print)
  if [[ -n ${leftover} ]]; then
    echo 'FAIL: scratch remained after the wrapper returned.' >&2
    printf '%s\n' "${leftover}" >&2
    return 1
  fi
}

assert_no_legacy_or_retry() {
  local log=$1
  local host=$2
  local launch_count=$3
  local launch

  if grep -Eiq 'refus|incompatible smaller|three-file' "${log}"; then
    echo "FAIL: ${host} invocation log contained a legacy-refusal prompt." >&2
    cat "${log}" >&2
    return 1
  fi
  launch=$(print_launch "${host}")
  if [[ $(grep -cF "${launch}" "${log}" || true) -ne ${launch_count} ]]; then
    echo "FAIL: expected ${launch_count} ${host} supervised launches, no retry." >&2
    cat "${log}" >&2
    return 1
  fi
  assert_selected_update_omits_source_url "${log}" "${host}"
}

assert_cursor_agent_identity() {
  local log=$1

  grep -Fq 'cursor agent --version' "${log}"
  if grep -Exq 'cursor --version' "${log}"; then
    echo 'FAIL: Cursor runtime used editor cursor --version.' >&2
    cat "${log}" >&2
    return 1
  fi
}

parse_result_path() {
  awk '/^result-path: / { sub(/^result-path: /, ""); path=$0 } END { if (path=="") exit 1; print path }' \
    "${stdout_file}"
}

run_selected() {
  local host=$1
  local expected_status=$2
  shift 2
  local status wrapper

  wrapper=$(wrapper_for "${host}")
  : > "${run_log}"
  : > "${stdout_file}"
  : > "${stderr_file}"
  set +e
  env TMPDIR="${watched_dir}" PATH="${PATH}" \
    NATIVE_AGENT_SENTINEL_LOG="${run_log}" \
    "$@" \
    bash "${wrapper}" --native --case delivery/updated-use \
    --results-dir "${results_dir}" --deadline 3600 --grace 15 \
    > "${stdout_file}" 2> "${stderr_file}"
  status=$?
  set -e
  if [[ ${status} -ne ${expected_status} ]]; then
    echo "FAIL: ${host} selected delivery/updated-use exited ${status}, expected ${expected_status}." >&2
    cat "${stdout_file}" >&2
    cat "${stderr_file}" >&2
    cat "${run_log}" >&2
    return 1
  fi
  assert_watched_empty
  parse_result_path
}

assert_attempt_layout() {
  local host=$1
  local attempt=$2

  [[ -d ${attempt} ]]
  [[ ${attempt} == "${results_dir}/${host}/delivery/updated-use/"* ]]
  [[ ! -e ${results_dir}/${host}/delivery/ordinary-update ]]
  [[ ! -e ${results_dir}/${host}/delivery/legacy-refusal ]]
  [[ ! -e ${attempt}/adopter ]]
  [[ ! -e ${attempt}/candidate ]]
}

assert_record_identity() {
  local host=$1
  local attempt=$2

  grep -Fq "host: ${host}" "${attempt}/record"
  grep -Fq 'case: delivery/updated-use' "${attempt}/record"
  grep -Fq 'origin: fresh' "${attempt}/record"
  grep -Fq "native-version-command: $(version_command_for "${host}")" \
    "${attempt}/record"
  grep -Fq "native-version: $(native_version_for "${host}")" "${attempt}/record"
  grep -Fq 'helper-identity: tests/support/dough-adr-awareness-updated-use.sh' \
    "${attempt}/record"
  grep -Fq "adapter-identity: $(adapter_identity_for "${host}")" \
    "${attempt}/record"
  native_prerequisite_assert_record_fields \
    "${attempt}/record" "${host} journey record"
}

assert_adapter_success() {
  local host=$1
  local success=$2

  assert_attempt_layout "${host}" "${success}"
  assert_record_identity "${host}" "${success}"
  assert_no_legacy_or_retry "${run_log}" "${host}" 2
  grep -Fq -- '--output-format stream-json' "${run_log}"
  grep -Fq "$(version_command_for "${host}")" "${run_log}"
  if [[ ${host} == 'cursor' ]]; then
    assert_cursor_agent_identity "${run_log}"
    grep -Fq -- '--workspace' "${run_log}"
  fi
  grep -Fq 'execution-status: completed' "${success}/record"
  case ${host} in
    claude)
      grep -Fq 'prerequisite-result: inconclusive' "${success}/record"
      ;;
    *)
      grep -Fq 'prerequisite-result: pass' "${success}/record"
      ;;
  esac
  [[ -f ${success}/update-events.jsonl ]]
  [[ -f ${success}/update-response.md ]]
  [[ -f ${success}/update-stderr.log ]]
  [[ -f ${success}/use-events.jsonl ]]
  [[ -f ${success}/use-response.md ]]
  [[ -f ${success}/use-stderr.log ]]
  [[ -f ${success}/observations.txt ]]
  [[ -f ${success}/update-before-snapshot.txt ]]
  [[ -f ${success}/update-after-snapshot.txt ]]
  grep -Fq '"type":"result"' "${success}/update-events.jsonl"
  grep -Fq '"type":"result"' "${success}/use-events.jsonl"
  grep -Fq 'Outcome: installed or updated the shared Codex/Cursor root and Claude Code to 0.2.2.' "${success}/update-response.md"
  grep -Fq 'assessment-status: pass' "${success}/record"
  grep -Fq 'named conflicting authorities and stopped' "${success}/record"
  grep -Fq 'real-transition: true' "${success}/observations.txt"
  grep -Fq 'update-execution: completed' "${success}/observations.txt"
  grep -Fq 'use-execution: completed' "${success}/observations.txt"
  if cmp -s "${success}/update-before-snapshot.txt" \
    "${success}/update-after-snapshot.txt"; then
    echo "FAIL: ${host} inferred an update without a real target transition." >&2
    return 1
  fi
}

assert_adapter_payload_abort() {
  local host=$1
  local aborted=$2
  local success=$3

  assert_attempt_layout "${host}" "${aborted}"
  assert_record_identity "${host}" "${aborted}"
  assert_no_legacy_or_retry "${run_log}" "${host}" 1
  [[ ${aborted} != "${success}" ]]
  grep -Fq 'execution-status: completed' "${aborted}/record"
  grep -Fq 'update-execution: completed' "${aborted}/observations.txt"
  grep -Fq 'use-execution: unrun' "${aborted}/observations.txt"
  grep -Fq 'use-pending: true' "${aborted}/observations.txt"
  [[ -f ${aborted}/update-events.jsonl ]]
  [[ -f ${aborted}/update-response.md ]]
  [[ -f ${aborted}/update-stderr.log ]]
  [[ -f ${aborted}/update-before-snapshot.txt ]]
  [[ -f ${aborted}/update-after-snapshot.txt ]]
  [[ -f ${aborted}/observations.txt ]]
  [[ ! -e ${aborted}/use-events.jsonl ]]
  [[ ! -e ${aborted}/use-response.md ]]
  if grep -Fq 'dough-adr-awareness' "${run_log}"; then
    echo "FAIL: ${host} payload-abort case started a use session." >&2
    cat "${run_log}" >&2
    return 1
  fi
}

assert_adapter_truncated() {
  local host=$1
  local truncated=$2
  local success=$3

  assert_attempt_layout "${host}" "${truncated}"
  assert_record_identity "${host}" "${truncated}"
  assert_no_legacy_or_retry "${run_log}" "${host}" 1
  [[ ${truncated} != "${success}" ]]
  grep -Fq 'execution-status: incomplete' "${truncated}/record"
  grep -Fq 'execution-reason: truncated terminal stream' "${truncated}/record"
  grep -Fq 'assessment-status: not-run' "${truncated}/record"
  grep -Fq 'prerequisite-result: fail' "${truncated}/record"
  grep -Fq 'update-execution: incomplete' "${truncated}/observations.txt"
  grep -Fq 'use-execution: unrun' "${truncated}/observations.txt"
  grep -Fq 'use-pending: true' "${truncated}/observations.txt"
  [[ -f ${truncated}/update-events.jsonl ]]
  [[ ! -e ${truncated}/use-events.jsonl ]]
  if grep -Fq '"type":"result"' "${truncated}/update-events.jsonl"; then
    echo "FAIL: truncated ${host} stream retained a result event." >&2
    cat "${truncated}/update-events.jsonl" >&2
    return 1
  fi
  if grep -Fq 'dough-adr-awareness' "${run_log}"; then
    echo "FAIL: truncated ${host} update started a use session." >&2
    cat "${run_log}" >&2
    return 1
  fi
}
