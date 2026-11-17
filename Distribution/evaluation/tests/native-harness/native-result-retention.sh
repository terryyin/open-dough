#!/usr/bin/env bash
# Credential-free proof that a selected context attempt survives scratch cleanup.
# shellcheck disable=SC2312 # pipefail covers listings, logs, and result-path parses.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
# shellcheck source=Distribution/evaluation/src/native-result-retain.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/evaluation/src/native-result-retain.sh"
# shellcheck source=Distribution/evaluation/src/native-host-stream.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/evaluation/src/native-host-stream.sh"
# shellcheck source=Distribution/evaluation/tests/native-harness/support/native-check-expectations.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-check-expectations.sh"
context_wrapper="${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-context.sh"

work_dir=
native_check_status=0
cursor_clear='' codex_clear='' claude_clear='' cursor_conflict='' codex_conflict='' claude_conflict='' cursor_clear_again=''
native_check_workspace work_dir
# Wrapper runs copy each fixture this check builds once.
export OPEN_DOUGH_TEST_FIXTURE_CACHE="${work_dir}/fixture-cache"

sentinel_bin="${work_dir}/bin"
watched_dir="${work_dir}/watched"
results_dir="${work_dir}/results"
unwritable_dir="${work_dir}/unwritable"
list_log="${work_dir}/list.log"
run_log="${work_dir}/run.log"
stdout_file="${work_dir}/stdout.txt"
stderr_file="${work_dir}/stderr.txt"
mkdir -p -- "${sentinel_bin}" "${watched_dir}" "${results_dir}" "${unwritable_dir}"
chmod a-w "${unwritable_dir}"
cp -- "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-agent-recorded.sh" "${sentinel_bin}/codex"
cp -- "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-agent-recorded.sh" "${sentinel_bin}/cursor"
cp -- "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-agent-recorded.sh" "${sentinel_bin}/claude"
chmod a+x "${sentinel_bin}/codex" "${sentinel_bin}/cursor" "${sentinel_bin}/claude"

assert_watched_empty() {
  local leftover
  leftover=$(find "${watched_dir}" -mindepth 1 ! -name xcrun_db -print)
  native_check_expect_value 'wrapper scratch removed' '' "${leftover}"
}

assert_only_host() {
  local log=$1 host=$2 line
  [[ -s ${log} ]]
  # shellcheck disable=SC2094 # The failure reporter reads the log as evidence; it never writes it.
  while IFS= read -r line; do
    native_check_expect_value 'only selected host invoked' "${host}" "${line%% *}" "${log}"
  done < "${log}"
}

assert_attempt() {
  local attempt=$1
  local host=$2
  local case_id=$3
  local version_command=$4

  [[ -d ${attempt} ]]
  [[ -f ${attempt}/record ]]
  [[ -s ${attempt}/events.jsonl ]]
  [[ -s ${attempt}/response.md ]]
  [[ -f ${attempt}/observations.txt ]]
  [[ -f ${attempt}/before-snapshot.txt ]]
  native_check_expect_absent 'adopter scratch not retained' "${attempt}/adopter"
  native_check_expect_absent 'candidate scratch not retained' "${attempt}/candidate"
  native_check_expect_absent 'codex-state scratch not retained' "${attempt}/codex-state"
  native_check_expect_field 'selected host retained' "${attempt}/record" host "${host}"
  native_check_expect_field 'selected case retained' "${attempt}/record" case "${case_id}"
  native_check_expect_field 'fresh origin retained' "${attempt}/record" origin fresh
  native_check_expect_field 'completed execution retained' "${attempt}/record" execution-status completed
  native_check_expect_field 'execution reason retained' "${attempt}/record" execution-reason 'native command exited 0'
  native_check_expect_value 'retained stream complete' complete "$(native_host_stream "${host}" "${attempt}/events.jsonl" status)" "${attempt}/events.jsonl"
  [[ -n $(native_host_stream "${host}" "${attempt}/events.jsonl" response) ]]
  native_check_expect_field 'version command retained' "${attempt}/record" native-version-command "${version_command}"
  native_check_expect_field 'passing assessment retained' "${attempt}/record" assessment-status pass
  native_check_expect_line 'assessment reason retained' "${attempt}/record" 'assessment-reason:'
  case ${case_id} in
    context/clear)
      native_check_expect_line 'clear authority assessed' "${attempt}/record" 'followed and cited Accepted authority'
      ;;
    context/conflict)
      native_check_expect_line 'conflicting authorities assessed' "${attempt}/record" 'named conflicting authorities and stopped'
      ;;
    *)
      native_check_fail 'supported context case' 'context/clear or context/conflict' "${case_id}" "${attempt}/record"
      ;;
  esac
  native_result_assert_no_discovery_fields "${attempt}/record"
}

assert_unreviewed() {
  local host=$1 case_id=$2 attempt=$3
  local record="${work_dir}/listing-record" certified

  : > "${list_log}"
  native_check_run "${sentinel_bin}" "${stdout_file}" "${stderr_file}" \
    env TMPDIR="${watched_dir}" NATIVE_AGENT_SENTINEL_LOG="${list_log}" \
    bash "${context_wrapper}" --list --results-dir "${results_dir}"
  native_check_expect_status 'listing succeeds' 0 "${native_check_status}" "${stdout_file}" "${stderr_file}"
  native_check_expect_value 'listing invokes no host' 0 "$(wc -c < "${list_log}" | tr -d '[:space:]')" "${list_log}"
  assert_watched_empty
  awk -v h="${host}" -v c="${case_id}" '
    BEGIN { RS = "" }
    index($0, "host: " h "\n") == 1 && $0 ~ ("\ncase: " c "(\n|$)") {
      print
      found = 1
      exit
    }
    END { if (!found) exit 1 }
  ' "${stdout_file}" > "${record}"
  native_check_expect_line 'attempt listed as unreviewed' "${record}" "prior-evidence: unreviewed ${attempt}"
  certified=$(grep -E 'prior-evidence: (pass|certified|accepted)' "${record}" || true)
  native_check_expect_value 'listing does not certify evidence' '' "${certified}" "${record}"
}

run_selected() {
  local result_variable=$1 host=$2 case_id=$3
  shift 3
  local attempt version_command editor_probe

  : > "${run_log}"
  : > "${stdout_file}"
  : > "${stderr_file}"
  native_check_run "${sentinel_bin}" "${stdout_file}" "${stderr_file}" \
    env TMPDIR="${watched_dir}" NATIVE_AGENT_SENTINEL_LOG="${run_log}" \
    bash "${context_wrapper}" "$@"
  native_check_expect_status "selected ${host} ${case_id} succeeds" 0 "${native_check_status}" "${stdout_file}" "${stderr_file}" "${run_log}"
  assert_watched_empty
  assert_only_host "${run_log}" "${host}"
  attempt=$(awk '/^result-path: / { sub(/^result-path: /, ""); path=$0 } END { if (path=="") exit 1; print path }' \
    "${stdout_file}")
  case ${host} in
    cursor) version_command='cursor agent --version' ;;
    claude) version_command='claude --version' ;;
    *) version_command='codex --version' ;;
  esac
  native_check_expect_line 'host version probed' "${run_log}" "${version_command}"
  if [[ ${host} == 'cursor' ]]; then
    editor_probe=$(grep -Ex 'cursor --version' "${run_log}" || true)
    native_check_expect_value 'Cursor editor is not probed' '' "${editor_probe}" "${run_log}"
    native_check_expect_field 'Cursor agent version retained' "${attempt}/record" native-version 'cursor-agent recorded-1'
  fi
  assert_attempt "${attempt}" "${host}" "${case_id}" "${version_command}"
  assert_unreviewed "${host}" "${case_id}" "${attempt}"
  printf -v "${result_variable}" '%s' "${attempt}"
}

: > "${run_log}"
native_check_run "${sentinel_bin}" "${stdout_file}" "${stderr_file}" \
  env TMPDIR="${watched_dir}" NATIVE_AGENT_SENTINEL_LOG="${run_log}" \
  bash "${context_wrapper}" --native cursor clear --results-dir "${unwritable_dir}"
[[ ${native_check_status} -ne 0 ]]
native_check_expect_line 'unwritable destination refused' "${stderr_file}" 'error: --results-dir is not a writable directory'
native_check_expect_value 'unwritable destination invokes no host' 0 "$(wc -c < "${run_log}" | tr -d '[:space:]')" "${run_log}"
assert_watched_empty
native_check_expect_value 'unwritable destination stays empty' '' "$(find "${unwritable_dir}" -mindepth 1 -print)"

run_selected cursor_clear cursor context/clear \
  --native cursor clear --results-dir "${results_dir}" \
  --deadline 3600 --grace 15
run_selected codex_clear codex context/clear \
  --native codex clear --results-dir "${results_dir}"
run_selected claude_clear claude context/clear \
  --native claude clear --results-dir "${results_dir}"
run_selected cursor_conflict cursor context/conflict \
  --native cursor --case context/conflict --results-dir "${results_dir}"
run_selected codex_conflict codex context/conflict \
  --native codex --case context/conflict --results-dir "${results_dir}"
run_selected claude_conflict claude context/conflict \
  --native claude --case context/conflict --results-dir "${results_dir}"

run_selected cursor_clear_again cursor context/clear \
  --native cursor clear --results-dir "${results_dir}"
[[ ${cursor_clear} != "${cursor_clear_again}" ]]
assert_unreviewed cursor context/clear "${cursor_clear}"
assert_unreviewed cursor context/clear "${cursor_clear_again}"
[[ -d ${codex_clear} && -d ${claude_clear} ]]
[[ -d ${cursor_conflict} && -d ${codex_conflict} && -d ${claude_conflict} ]]
clear_prompt=$(awk '/^prompt-identity: / { print; exit }' "${cursor_clear}/record")
conflict_prompt=$(awk '/^prompt-identity: / { print; exit }' \
  "${cursor_conflict}/record")
native_check_expect_value 'clear and conflict use the same prompt' "${clear_prompt}" "${conflict_prompt}" "${cursor_clear}/record" "${cursor_conflict}/record"
