#!/usr/bin/env bash
# Credential-free proof that a selected context launch/failure is retained
# with stderr/reason, no retry, and no overwrite of a prior success.
# shellcheck disable=SC2312 # pipefail covers listings, logs, and result-path parses.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
# shellcheck source=Distribution/evaluation/src/native-result-retain.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/evaluation/src/native-result-retain.sh"
# shellcheck source=Distribution/evaluation/src/product-backlog-native-evidence.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/evaluation/src/product-backlog-native-evidence.sh"
# shellcheck source=Distribution/evaluation/tests/native-harness/support/native-check-expectations.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-check-expectations.sh"
context_wrapper="${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-context.sh"
fail_fixture="${source_dir}/Distribution/evaluation/tests/native-harness/support/native-agent-fail.sh"

work_dir=''
native_check_status=0
missing_attempt='' fail_attempt='' denied_attempt=''
native_check_workspace work_dir

sentinel_bin="${work_dir}/bin"
safe_bin="${work_dir}/safe-bin"
watched_dir="${work_dir}/watched"
results_dir="${work_dir}/results"
run_log="${work_dir}/run.log"
stdout_file="${work_dir}/stdout.txt"
stderr_file="${work_dir}/stderr.txt"
prior="${results_dir}/codex/context/clear/prior-complete"
prior_copy="${work_dir}/prior-copy"
mkdir -p -- "${sentinel_bin}" "${safe_bin}" "${watched_dir}" "${prior}"
cp -- "${fail_fixture}" "${sentinel_bin}/codex"
cp -- "${fail_fixture}" "${sentinel_bin}/cursor"
cp -- "${fail_fixture}" "${sentinel_bin}/claude"
chmod a+x "${sentinel_bin}/codex" "${sentinel_bin}/cursor" "${sentinel_bin}/claude"
printf '%s\n' 'execution-status: completed' 'payload: prior' > "${prior}/record"
printf '%s\n' 'prior events' > "${prior}/events.jsonl"
cp -R -- "${prior}" "${prior_copy}"

# Keep Node available so fixture install can register CI host hooks; still hide
# native host executables for the missing-executable case.
for cmd in git jq rg shasum node; do
  src=$(command -v "${cmd}") || continue
  ln -s "${src}" "${safe_bin}/${cmd}"
done
missing_path="${safe_bin}:/usr/bin:/bin:/usr/sbin:/sbin"

assert_watched_empty() {
  native_check_expect_value 'wrapper scratch removed' '' "$(find "${watched_dir}" -mindepth 1 ! -name xcrun_db -print)"
}

assert_prior_identical() {
  diff -rq "${prior}" "${prior_copy}" > /dev/null
}

assert_failed_attempt() {
  local attempt=$1
  local reason=$2

  [[ -d ${attempt} ]]
  [[ ${attempt} != "${prior}" ]]
  [[ -f ${attempt}/record ]]
  [[ -f ${attempt}/stderr.log ]]
  native_check_expect_field 'failed execution retained' "${attempt}/record" execution-status failed
  native_check_expect_field 'failure reason retained' "${attempt}/record" execution-reason "${reason}"
  native_check_expect_field 'failure not assessed' "${attempt}/record" assessment-status not-run
  native_check_expect_field 'assessment reason retained' "${attempt}/record" assessment-reason 'behavior not assessed'
  native_result_assert_no_discovery_fields "${attempt}/record"
  native_check_expect_absent 'adopter scratch not retained' "${attempt}/adopter"
  native_check_expect_absent 'candidate scratch not retained' "${attempt}/candidate"
  native_check_expect_absent 'codex-state scratch not retained' "${attempt}/codex-state"
}

run_failure() {
  local result_variable=$1 expected_status=$2
  shift 2
  local attempt

  : > "${run_log}"
  : > "${stdout_file}"
  : > "${stderr_file}"
  native_check_run "${sentinel_bin}" "${stdout_file}" "${stderr_file}" \
    env TMPDIR="${watched_dir}" NATIVE_AGENT_SENTINEL_LOG="${run_log}" "$@" \
    "$(command -v bash)" "${context_wrapper}" --native "${host}" clear \
    --results-dir "${results_dir}"
  native_check_expect_status "selected ${host} fails with its status" "${expected_status}" "${native_check_status}" "${stdout_file}" "${stderr_file}" "${run_log}"
  assert_watched_empty
  attempt=$(awk '/^result-path: / { sub(/^result-path: /, ""); path=$0 } END { if (path=="") exit 1; print path }' \
    "${stdout_file}")
  printf -v "${result_variable}" '%s' "${attempt}"
}

for host_command in codex cursor claude; do
  host_path=$(PATH="${missing_path}" command -v "${host_command}" || true)
  native_check_expect_value "${host_command} hidden for missing case" '' "${host_path}"
done

host=codex
run_failure missing_attempt 127 PATH="${missing_path}"
assert_failed_attempt "${missing_attempt}" 'missing executable'
native_check_expect_line 'missing executable stderr retained' "${missing_attempt}/stderr.log" 'error: missing executable: codex'
native_check_expect_field 'missing host version unknown' "${missing_attempt}/record" native-version unknown
native_check_expect_field 'missing host executable unknown' "${missing_attempt}/record" native-executable unknown
native_check_expect_value 'missing executable invokes no host' 0 "$(wc -c < "${run_log}" | tr -d '[:space:]')" "${run_log}"
assert_prior_identical

host=cursor
run_failure fail_attempt 1 \
  PATH="${sentinel_bin}:${PATH}" \
  NATIVE_AGENT_FAIL_CODE=1 \
  NATIVE_AGENT_FAIL_MESSAGE='native agent failed' \
  NATIVE_AGENT_FAIL_VERSION=1
assert_failed_attempt "${fail_attempt}" 'native command exited 1'
native_check_expect_line 'nonzero host stderr retained' "${fail_attempt}/stderr.log" 'native agent failed'
native_check_expect_field 'failed version probe is unknown' "${fail_attempt}/record" native-version unknown
editor_version=$(grep -F 'cursor-editor' "${fail_attempt}/record" || true)
native_check_expect_value 'Cursor editor version not inferred' '' "${editor_version}" "${fail_attempt}/record"
editor_probe=$(grep -Ex 'cursor --version' "${run_log}" || true)
native_check_expect_value 'Cursor editor not probed' '' "${editor_probe}" "${run_log}"
launches=$(grep -v -- '--version' "${run_log}" | grep -c . || true)
native_check_expect_value 'nonzero host launches once without retry' 1 "${launches}" "${run_log}"
assert_prior_identical

host=claude
run_failure denied_attempt 126 \
  PATH="${sentinel_bin}:${PATH}" \
  NATIVE_AGENT_FAIL_CODE=126 \
  NATIVE_AGENT_FAIL_MESSAGE='Permission denied: native operation not permitted'
assert_failed_attempt "${denied_attempt}" 'permission denied'
native_check_expect_line 'permission stderr retained' "${denied_attempt}/stderr.log" 'Permission denied: native operation not permitted'
native_check_expect_field 'denied host version retained' "${denied_attempt}/record" native-version 'claude fail-1'
launches=$(grep -v -- '--version' "${run_log}" | grep -c . || true)
native_check_expect_value 'denied host launches once without retry' 1 "${launches}" "${run_log}"
assert_prior_identical
[[ -d ${missing_attempt} && -d ${fail_attempt} && -d ${denied_attempt} ]]

# The product-backlog native cases share one failure-evidence cleanup: success
# removes the directory; failure prints the evidence and PRESERVED: and keeps it.
cleanup_ok="${work_dir}/cleanup-ok"
cleanup_failed="${work_dir}/cleanup-failed"
mkdir -p -- "${cleanup_ok}" "${cleanup_failed}"
printf '%s\n' 'case evidence' > "${cleanup_failed}/native-x-output.md"
product_backlog_native_cleanup 0 'Fixture case' 'native-x-*' "${cleanup_ok}" \
  2> "${stderr_file}"
native_check_expect_absent 'successful case evidence removed' "${cleanup_ok}"
native_check_expect_value 'successful cleanup is silent' 0 "$(wc -c < "${stderr_file}" | tr -d '[:space:]')" "${stderr_file}"
product_backlog_native_cleanup 3 'Fixture case' 'native-x-*' "${cleanup_failed}" \
  2> "${stderr_file}"
native_check_expect_line 'failed cleanup reports status' "${stderr_file}" 'FAIL: preserving native Fixture case evidence after status 3.'
native_check_expect_line 'failed cleanup prints evidence' "${stderr_file}" 'case evidence'
grep -Fxq "PRESERVED: ${cleanup_failed}" "${stderr_file}"
[[ -f ${cleanup_failed}/native-x-output.md ]]
