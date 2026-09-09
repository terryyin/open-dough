#!/usr/bin/env bash
# Credential-free proof that a selected context launch/failure is retained
# with stderr/reason, no retry, and no overwrite of a prior success.
# shellcheck disable=SC2312 # pipefail covers listings, logs, and result-path parses.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/native-result-retain.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-result-retain.sh"
context_wrapper="${source_dir}/tests/dough-adr-awareness-context.sh"
fail_fixture="${source_dir}/tests/support/native-agent-fail.sh"

work_dir=$(mktemp -d)
finish() {
  chmod -R u+w "${work_dir}" 2> /dev/null || true
  rm -rf -- "${work_dir}"
}
trap finish EXIT

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
  local leftover
  leftover=$(find "${watched_dir}" -mindepth 1 ! -name xcrun_db -print)
  if [[ -n ${leftover} ]]; then
    echo 'FAIL: scratch remained after the wrapper returned.' >&2
    printf '%s\n' "${leftover}" >&2
    return 1
  fi
}

assert_prior_identical() {
  if ! diff -rq "${prior}" "${prior_copy}" > /dev/null; then
    echo 'FAIL: previously completed attempt was not byte-identical.' >&2
    diff -rq "${prior}" "${prior_copy}" >&2
    return 1
  fi
}

assert_failed_attempt() {
  local attempt=$1
  local reason=$2

  [[ -d ${attempt} ]]
  [[ ${attempt} != "${prior}" ]]
  [[ -f ${attempt}/record ]]
  [[ -f ${attempt}/stderr.log ]]
  grep -Fq 'execution-status: failed' "${attempt}/record"
  grep -Fq "execution-reason: ${reason}" "${attempt}/record"
  grep -Fq 'assessment-status: not-run' "${attempt}/record"
  grep -Fq 'assessment-reason: behavior not assessed' "${attempt}/record"
  if grep -Fq 'execution-status: completed' "${attempt}/record"; then
    echo 'FAIL: failure was recorded as completed.' >&2
    cat "${attempt}/record" >&2
    return 1
  fi
  if grep -Fq 'assessment-status: pass' "${attempt}/record"; then
    echo 'FAIL: failure was recorded as a wording pass.' >&2
    cat "${attempt}/record" >&2
    return 1
  fi
  native_result_assert_no_discovery_fields "${attempt}/record"
  [[ ! -e ${attempt}/adopter ]]
  [[ ! -e ${attempt}/candidate ]]
  [[ ! -e ${attempt}/codex-state ]]
}

run_failure() {
  local expected_status=$1
  shift
  local status attempt

  : > "${run_log}"
  : > "${stdout_file}"
  : > "${stderr_file}"
  set +e
  env TMPDIR="${watched_dir}" NATIVE_AGENT_SENTINEL_LOG="${run_log}" "$@" \
    "$(command -v bash)" "${context_wrapper}" --native "${host}" clear \
    --results-dir "${results_dir}" > "${stdout_file}" 2> "${stderr_file}"
  status=$?
  set -e
  if [[ ${status} -eq 0 ]]; then
    echo "FAIL: selected ${host} launch failure returned passing." >&2
    cat "${stdout_file}" >&2
    cat "${stderr_file}" >&2
    return 1
  fi
  if [[ ${status} -ne ${expected_status} ]]; then
    echo "FAIL: selected ${host} exited ${status}, expected ${expected_status}." >&2
    cat "${stdout_file}" >&2
    cat "${stderr_file}" >&2
    cat "${run_log}" >&2
    return 1
  fi
  assert_watched_empty
  attempt=$(awk '/^result-path: / { sub(/^result-path: /, ""); path=$0 } END { if (path=="") exit 1; print path }' \
    "${stdout_file}")
  printf '%s\n' "${attempt}"
}

if env PATH="${missing_path}" command -v codex > /dev/null 2>&1 \
  || env PATH="${missing_path}" command -v cursor > /dev/null 2>&1 \
  || env PATH="${missing_path}" command -v claude > /dev/null 2>&1; then
  echo 'FAIL: could not hide native host executables for the missing case.' >&2
  env PATH="${missing_path}" command -v codex cursor claude >&2 || true
  exit 1
fi

host=codex
missing_attempt=$(run_failure 127 PATH="${missing_path}")
assert_failed_attempt "${missing_attempt}" 'missing executable'
grep -Fq 'error: missing executable: codex' "${missing_attempt}/stderr.log"
grep -Fq 'native-version: unknown' "${missing_attempt}/record"
grep -Fq 'native-executable: unknown' "${missing_attempt}/record"
if [[ -s ${run_log} ]]; then
  echo 'FAIL: missing executable invoked a native command.' >&2
  cat "${run_log}" >&2
  exit 1
fi
assert_prior_identical

host=cursor
fail_attempt=$(run_failure 1 \
  PATH="${sentinel_bin}:${PATH}" \
  NATIVE_AGENT_FAIL_CODE=1 \
  NATIVE_AGENT_FAIL_MESSAGE='native agent failed' \
  NATIVE_AGENT_FAIL_VERSION=1)
assert_failed_attempt "${fail_attempt}" 'native command exited 1'
grep -Fq 'native agent failed' "${fail_attempt}/stderr.log"
grep -Fq 'native-version: unknown' "${fail_attempt}/record"
if grep -Fq 'cursor-editor' "${fail_attempt}/record"; then
  echo 'FAIL: Cursor runtime was inferred from the editor version.' >&2
  cat "${fail_attempt}/record" >&2
  exit 1
fi
if grep -Exq 'cursor --version' "${run_log}"; then
  echo 'FAIL: Cursor runtime used editor cursor --version.' >&2
  cat "${run_log}" >&2
  exit 1
fi
launches=$(grep -v -- '--version' "${run_log}" | grep -c . || true)
if [[ ${launches} -ne 1 ]]; then
  echo "FAIL: nonzero launch log shows ${launches} launches; expected one and no retry." >&2
  cat "${run_log}" >&2
  exit 1
fi
assert_prior_identical

host=claude
denied_attempt=$(run_failure 126 \
  PATH="${sentinel_bin}:${PATH}" \
  NATIVE_AGENT_FAIL_CODE=126 \
  NATIVE_AGENT_FAIL_MESSAGE='Permission denied: native operation not permitted')
assert_failed_attempt "${denied_attempt}" 'permission denied'
grep -Fq 'Permission denied: native operation not permitted' \
  "${denied_attempt}/stderr.log"
grep -Fq 'native-version: claude fail-1' "${denied_attempt}/record"
launches=$(grep -v -- '--version' "${run_log}" | grep -c . || true)
if [[ ${launches} -ne 1 ]]; then
  echo "FAIL: denied launch log shows ${launches} launches; expected one and no retry." >&2
  cat "${run_log}" >&2
  exit 1
fi
assert_prior_identical
[[ -d ${missing_attempt} && -d ${fail_attempt} && -d ${denied_attempt} ]]

echo 'PASS: missing executable, nonzero launch, and denied operation stay nonpassing with stderr/reason, unknown runtime is not inferred, a prior attempt is unchanged, and the invocation log shows no retry.'
