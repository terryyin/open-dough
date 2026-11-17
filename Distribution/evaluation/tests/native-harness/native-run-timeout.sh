#!/usr/bin/env bash
# Credential-free proof that a hung selected context attempt times out,
# terminates owned processes, retains partial evidence, and does not retry.
# shellcheck disable=SC1090,SC2312 # Hang state is a generated env file.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
# shellcheck source=Distribution/evaluation/src/native-result-retain.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/evaluation/src/native-result-retain.sh"
# shellcheck source=Distribution/evaluation/tests/native-harness/support/native-check-expectations.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-check-expectations.sh"
context_wrapper="${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-context.sh"
deadline=1
grace=1
bystander=

work_dir=
native_check_status=0
native_check_workspace work_dir

sentinel_bin="${work_dir}/bin"
watched_dir="${work_dir}/watched"
results_dir="${work_dir}/results"
run_log="${work_dir}/run.log"
hang_state="${work_dir}/hang.state"
stdout_file="${work_dir}/stdout.txt"
stderr_file="${work_dir}/stderr.txt"
prior="${results_dir}/codex/context/clear/prior-complete"
prior_copy="${work_dir}/prior-copy"
mkdir -p -- "${sentinel_bin}" "${watched_dir}" "${prior}"
cp -- "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-agent-hang.sh" "${sentinel_bin}/codex"
cp -- "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-agent-hang.sh" "${sentinel_bin}/cursor"
cp -- "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-agent-hang.sh" "${sentinel_bin}/claude"
chmod a+x "${sentinel_bin}/codex" "${sentinel_bin}/cursor" "${sentinel_bin}/claude"
printf '%s\n' 'execution-status: completed' 'payload: prior' > "${prior}/record"
printf '%s\n' 'prior events' > "${prior}/events.jsonl"
cp -R -- "${prior}" "${prior_copy}"

: > "${run_log}"
sleep 120 &
bystander=$!
native_check_own_process "${bystander}"
disown "${bystander}" 2> /dev/null || true

native_check_run "${sentinel_bin}" "${stdout_file}" "${stderr_file}" \
  env TMPDIR="${watched_dir}" \
  NATIVE_AGENT_SENTINEL_LOG="${run_log}" \
  NATIVE_AGENT_HANG_STATE="${hang_state}" \
  bash "${context_wrapper}" --native codex clear \
  --results-dir "${results_dir}" \
  --deadline "${deadline}" --grace "${grace}"
now=$(date +%s)

native_check_expect_status 'hung selected context times out' 124 "${native_check_status}" "${stdout_file}" "${stderr_file}" "${run_log}"
leftover=$(find "${watched_dir}" -mindepth 1 ! -name xcrun_db -print)
native_check_expect_value 'timeout scratch removed' '' "${leftover}"
[[ -f ${hang_state} ]]
hang_pid=
hang_child=
hang_pgid=
hang_started=
# shellcheck source=/dev/null
source "${hang_state}"
[[ -n ${hang_pid:-} && -n ${hang_child:-} && -n ${hang_pgid:-} && -n ${hang_started:-} ]]
native_check_expect_process 'owned hang process stopped' "${hang_pid}" exited "${hang_state}"
native_check_expect_process 'owned child stopped' "${hang_child}" exited "${hang_state}"
native_check_expect_process 'unrelated bystander survives' "${bystander}" running
test_pgid=$(ps -o pgid= -p $$ | tr -d '[:space:]')
[[ ${hang_pgid} != "${test_pgid}" ]]
elapsed=$((now - hang_started))
limit=$((deadline + grace + 15))
((elapsed <= limit))
launches=$(grep -v -- '--version' "${run_log}" | grep -c . || true)
native_check_expect_value 'one launch and no retry' 1 "${launches}" "${run_log}"
native_check_expect_line 'host version probed' "${run_log}" '--version'
diff -rq "${prior}" "${prior_copy}" > /dev/null

attempt=$(awk '/^result-path: / { sub(/^result-path: /, ""); path=$0 } END { if (path=="") exit 1; print path }' \
  "${stdout_file}")
[[ -d ${attempt} ]]
[[ ${attempt} != "${prior}" ]]
[[ -f ${attempt}/record ]]
[[ -f ${attempt}/events.jsonl ]]
native_check_expect_field 'timeout retained' "${attempt}/record" execution-status timeout
native_check_expect_field 'deadline reason retained' "${attempt}/record" execution-reason 'deadline expired'
native_check_expect_field 'behavior not assessed' "${attempt}/record" assessment-status not-run
native_check_expect_field 'assessment reason retained' "${attempt}/record" assessment-reason 'behavior not assessed'
native_result_assert_no_discovery_fields "${attempt}/record"
native_check_expect_line 'partial events retained' "${attempt}/events.jsonl" '{"type":"item","partial":true}'
native_check_expect_line 'partial response retained' "${attempt}/response.md" 'partial hang output'
native_check_expect_absent 'adopter scratch not retained' "${attempt}/adopter"
native_check_expect_absent 'candidate scratch not retained' "${attempt}/candidate"
native_check_expect_absent 'codex-state scratch not retained' "${attempt}/codex-state"
