#!/usr/bin/env bash
# Credential-free proof that a hung selected context attempt times out,
# terminates owned processes, retains partial evidence, and does not retry.
# shellcheck disable=SC1090,SC2312 # Hang state is a generated env file.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
context_wrapper="${source_dir}/tests/dough-adr-awareness-context.sh"
deadline=1
grace=1
bystander=

work_dir=$(mktemp -d)
finish() {
  chmod -R u+w "${work_dir}" 2> /dev/null || true
  if [[ -n ${bystander} ]]; then
    kill "${bystander}" 2> /dev/null || true
    wait "${bystander}" 2> /dev/null || true
  fi
  rm -rf -- "${work_dir}"
}
trap finish EXIT

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
cp -- "${source_dir}/tests/support/native-agent-hang.sh" "${sentinel_bin}/codex"
cp -- "${source_dir}/tests/support/native-agent-hang.sh" "${sentinel_bin}/cursor"
cp -- "${source_dir}/tests/support/native-agent-hang.sh" "${sentinel_bin}/claude"
chmod a+x "${sentinel_bin}/codex" "${sentinel_bin}/cursor" "${sentinel_bin}/claude"
printf '%s\n' 'execution-status: completed' 'payload: prior' > "${prior}/record"
printf '%s\n' 'prior events' > "${prior}/events.jsonl"
cp -R -- "${prior}" "${prior_copy}"

: > "${run_log}"
sleep 120 &
bystander=$!
disown "${bystander}" 2> /dev/null || true

set +e
env TMPDIR="${watched_dir}" PATH="${sentinel_bin}:${PATH}" \
  NATIVE_AGENT_SENTINEL_LOG="${run_log}" \
  NATIVE_AGENT_HANG_STATE="${hang_state}" \
  bash "${context_wrapper}" --native codex clear \
  --results-dir "${results_dir}" \
  --deadline "${deadline}" --grace "${grace}" \
  > "${stdout_file}" 2> "${stderr_file}"
status=$?
set -e
now=$(date +%s)

if [[ ${status} -eq 0 ]]; then
  echo 'FAIL: hung selected context returned passing.' >&2
  cat "${stdout_file}" >&2
  cat "${stderr_file}" >&2
  exit 1
fi
if [[ ${status} -ne 124 ]]; then
  echo "FAIL: hung selected context exited ${status}, expected 124." >&2
  cat "${stdout_file}" >&2
  cat "${stderr_file}" >&2
  cat "${run_log}" >&2
  exit 1
fi

leftover=$(find "${watched_dir}" -mindepth 1 -print)
if [[ -n ${leftover} ]]; then
  echo 'FAIL: scratch remained after the timeout return.' >&2
  printf '%s\n' "${leftover}" >&2
  exit 1
fi

if [[ ! -f ${hang_state} ]]; then
  echo 'FAIL: hang fixture did not record owned pids.' >&2
  cat "${run_log}" >&2
  exit 1
fi
hang_pid=
hang_child=
hang_pgid=
hang_started=
# shellcheck source=/dev/null
source "${hang_state}"
if [[ -z ${hang_pid:-} || -z ${hang_child:-} || -z ${hang_pgid:-} ||
  -z ${hang_started:-} ]]; then
  echo 'FAIL: hang fixture state omitted owned pid, child, pgid, or start time.' >&2
  cat "${hang_state}" >&2
  exit 1
fi
if kill -0 "${hang_pid}" 2> /dev/null; then
  echo "FAIL: owned hang pid ${hang_pid} remains alive." >&2
  exit 1
fi
if kill -0 "${hang_child}" 2> /dev/null; then
  echo "FAIL: owned child pid ${hang_child} remains alive." >&2
  exit 1
fi
if ! kill -0 "${bystander}" 2> /dev/null; then
  echo 'FAIL: an unrelated process was killed; proof is only for owned pids.' >&2
  exit 1
fi
test_pgid=$(ps -o pgid= -p $$ | tr -d '[:space:]')
if [[ ${hang_pgid} == "${test_pgid}" ]]; then
  echo 'FAIL: hang fixture stayed in the caller process group.' >&2
  exit 1
fi

elapsed=$((now - hang_started))
limit=$((deadline + grace + 15))
if ((elapsed > limit)); then
  echo "FAIL: wrapper returned ${elapsed}s after hang start; limit ${limit}s." >&2
  exit 1
fi

launches=$(grep -v -- '--version' "${run_log}" | grep -c . || true)
if [[ ${launches} -ne 1 ]]; then
  echo "FAIL: invocation log shows ${launches} launches; expected one and no retry." >&2
  cat "${run_log}" >&2
  exit 1
fi
if grep -Fq -- '--version' "${run_log}"; then
  :
else
  echo 'FAIL: invocation log omitted the version probe.' >&2
  cat "${run_log}" >&2
  exit 1
fi

if ! diff -rq "${prior}" "${prior_copy}" > /dev/null; then
  echo 'FAIL: previously completed attempt was not byte-identical.' >&2
  diff -rq "${prior}" "${prior_copy}" >&2
  exit 1
fi

attempt=$(awk '/^result-path: / { sub(/^result-path: /, ""); path=$0 } END { if (path=="") exit 1; print path }' \
  "${stdout_file}")
[[ -d ${attempt} ]]
[[ ${attempt} != "${prior}" ]]
[[ -f ${attempt}/record ]]
[[ -f ${attempt}/events.jsonl ]]
grep -Fq 'execution-status: timeout' "${attempt}/record"
grep -Fq 'execution-reason: deadline expired' "${attempt}/record"
grep -Fq 'assessment-status: not-run' "${attempt}/record"
grep -Fq 'assessment-reason: behavior not assessed' "${attempt}/record"
grep -Fq 'prerequisite-result: fail' "${attempt}/record"
if grep -Fq 'assessment-status: pass' "${attempt}/record"; then
  echo 'FAIL: timeout was recorded as a wording pass.' >&2
  cat "${attempt}/record" >&2
  exit 1
fi
if grep -Fq 'assessment-interpretation: limited-wording' "${attempt}/record"; then
  echo 'FAIL: timeout used the success wording interpretation.' >&2
  cat "${attempt}/record" >&2
  exit 1
fi
grep -Fq '{"type":"item","partial":true}' "${attempt}/events.jsonl"
grep -Fq 'partial hang output' "${attempt}/response.md"
[[ ! -e ${attempt}/adopter ]]
[[ ! -e ${attempt}/candidate ]]
[[ ! -e ${attempt}/codex-state ]]

echo 'PASS: hung selected context times out within deadline plus grace, owned processes are gone, partial evidence is retained, a prior attempt is unchanged, and the invocation log shows no retry.'
