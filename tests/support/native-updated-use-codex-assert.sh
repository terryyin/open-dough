#!/usr/bin/env bash
# Shared assertions for Codex selected delivery/updated-use proofs. The proof
# script assigns source_dir, work paths, wrapper paths, and PATH first.
# shellcheck disable=SC2016,SC2154,SC2310,SC2311,SC2312 # Proof globals; pipefail covers logs.

# shellcheck source=tests/support/native-prerequisite-gate.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-prerequisite-gate.sh"
# shellcheck source=tests/support/native-updated-use-prompt-assert.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-updated-use-prompt-assert.sh"

assert_watched_empty() {
  local leftover
  leftover=$(find "${watched_dir}" -mindepth 1 -print)
  if [[ -n ${leftover} ]]; then
    echo 'FAIL: scratch remained after the wrapper returned.' >&2
    printf '%s\n' "${leftover}" >&2
    return 1
  fi
}

assert_no_legacy_or_retry() {
  local log=$1
  local exec_count=$2

  if grep -Eiq 'refus|incompatible smaller|three-file' "${log}"; then
    echo 'FAIL: invocation log contained a legacy-refusal prompt.' >&2
    cat "${log}" >&2
    return 1
  fi
  if [[ $(grep -c 'codex exec --' "${log}" || true) -ne ${exec_count} ]]; then
    echo "FAIL: expected ${exec_count} supervised exec launches, no retry." >&2
    cat "${log}" >&2
    return 1
  fi
  assert_selected_update_omits_source_url "${log}"
}

assert_single_attempt() {
  local attempt=$1

  [[ -d ${attempt} ]]
  [[ ${attempt} == "${results_dir}/codex/delivery/updated-use/"* ]]
  [[ ! -e ${results_dir}/codex/delivery/ordinary-update ]]
  [[ ! -e ${results_dir}/codex/delivery/legacy-refusal ]]
  [[ ! -e ${attempt}/adopter ]]
  [[ ! -e ${attempt}/candidate ]]
  [[ ! -e ${attempt}/codex-state ]]
}

parse_result_path() {
  awk '/^result-path: / { sub(/^result-path: /, ""); path=$0 } END { if (path=="") exit 1; print path }' \
    "${stdout_file}"
}

run_selected() {
  local expected_status=$1
  shift
  local status

  : > "${run_log}"
  : > "${stdout_file}"
  : > "${stderr_file}"
  set +e
  env TMPDIR="${watched_dir}" PATH="${PATH}" \
    NATIVE_AGENT_SENTINEL_LOG="${run_log}" \
    "$@" \
    bash "${codex_wrapper}" --native --case delivery/updated-use \
    --results-dir "${results_dir}" --deadline 3600 --grace 15 \
    > "${stdout_file}" 2> "${stderr_file}"
  status=$?
  set -e
  if [[ ${status} -ne ${expected_status} ]]; then
    echo "FAIL: selected delivery/updated-use exited ${status}, expected ${expected_status}." >&2
    cat "${stdout_file}" >&2
    cat "${stderr_file}" >&2
    cat "${run_log}" >&2
    return 1
  fi
  assert_watched_empty
  parse_result_path
}

assert_record_identity() {
  local attempt=$1

  grep -Fq 'host: codex' "${attempt}/record"
  grep -Fq 'case: delivery/updated-use' "${attempt}/record"
  grep -Fq 'origin: fresh' "${attempt}/record"
  grep -Fq 'native-version-command: codex --version' "${attempt}/record"
  grep -Fq 'helper-identity: tests/support/dough-adr-awareness-updated-use.sh' \
    "${attempt}/record"
  grep -Fq 'adapter-identity: tests/support/native-codex.sh' "${attempt}/record"
  native_prerequisite_assert_record_fields "${attempt}/record" 'journey record'
}
