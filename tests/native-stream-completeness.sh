#!/usr/bin/env bash
# Credential-free proof that selected context retains complete streams with
# shared behavior assessment, and keeps truncated, missing, or unknown terminal
# evidence nonpassing without a wording pass. Recorded streams prove adapters.
# shellcheck disable=SC2312 # pipefail covers listings, logs, and result-path parses.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/native-result-retain.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-result-retain.sh"
context_wrapper="${source_dir}/tests/dough-adr-awareness-context.sh"

work_dir=$(mktemp -d)
finish() {
  chmod -R u+w "${work_dir}" 2> /dev/null || true
  rm -rf -- "${work_dir}"
}
trap finish EXIT

sentinel_bin="${work_dir}/bin"
watched_dir="${work_dir}/watched"
results_dir="${work_dir}/results"
run_log="${work_dir}/run.log"
stdout_file="${work_dir}/stdout.txt"
stderr_file="${work_dir}/stderr.txt"
mkdir -p -- "${sentinel_bin}" "${watched_dir}" "${results_dir}"
cp -- "${source_dir}/tests/support/native-agent-recorded.sh" "${sentinel_bin}/codex"
cp -- "${source_dir}/tests/support/native-agent-recorded.sh" "${sentinel_bin}/cursor"
cp -- "${source_dir}/tests/support/native-agent-recorded.sh" "${sentinel_bin}/claude"
chmod a+x "${sentinel_bin}/codex" "${sentinel_bin}/cursor" "${sentinel_bin}/claude"
export PATH="${sentinel_bin}:${PATH}"

assert_watched_empty() {
  local leftover
  leftover=$(find "${watched_dir}" -mindepth 1 ! -name xcrun_db -print)
  if [[ -n ${leftover} ]]; then
    echo 'FAIL: scratch remained after the wrapper returned.' >&2
    printf '%s\n' "${leftover}" >&2
    return 1
  fi
}

assert_not_wording_pass() {
  local attempt=$1

  if grep -Fq 'assessment-status: pass' "${attempt}/record"; then
    echo 'FAIL: incomplete evidence was recorded as a wording pass.' >&2
    cat "${attempt}/record" >&2
    return 1
  fi
  if grep -Fq 'execution-status: completed' "${attempt}/record"; then
    echo 'FAIL: incomplete evidence was recorded as completed.' >&2
    cat "${attempt}/record" >&2
    return 1
  fi
  if grep -Fq 'execution-status: timeout' "${attempt}/record"; then
    echo 'FAIL: incomplete evidence was recorded as a timeout.' >&2
    cat "${attempt}/record" >&2
    return 1
  fi
  grep -Fq 'assessment-status: not-run' "${attempt}/record"
  native_result_assert_no_discovery_fields "${attempt}/record"
}

run_selected_stream() {
  local host=$1
  local stream_kind=$2
  local status attempt

  : > "${run_log}"
  : > "${stdout_file}"
  : > "${stderr_file}"
  set +e
  env TMPDIR="${watched_dir}" PATH="${PATH}" \
    NATIVE_AGENT_SENTINEL_LOG="${run_log}" \
    NATIVE_AGENT_STREAM="${stream_kind}" \
    bash "${context_wrapper}" --native "${host}" clear \
    --results-dir "${results_dir}" > "${stdout_file}" 2> "${stderr_file}"
  status=$?
  set -e
  assert_watched_empty
  if [[ ! -s ${run_log} ]]; then
    echo "FAIL: ${host} ${stream_kind} recorded no native invocations." >&2
    cat "${stdout_file}" >&2
    cat "${stderr_file}" >&2
    return 1
  fi
  attempt=$(awk '/^result-path: / { sub(/^result-path: /, ""); path=$0 } END { if (path=="") exit 1; print path }' \
    "${stdout_file}")
  [[ -d ${attempt} ]]
  [[ -f ${attempt}/record ]]
  grep -Fq "host: ${host}" "${attempt}/record"
  grep -Fq 'case: context/clear' "${attempt}/record"
  grep -Fq 'origin: fresh' "${attempt}/record"
  [[ ! -e ${attempt}/adopter ]]
  [[ ! -e ${attempt}/candidate ]]
  [[ ! -e ${attempt}/codex-state ]]
  printf '%s %s\n' "${status}" "${attempt}"
}

assert_complete() {
  local host=$1
  local status=$2
  local attempt=$3

  if [[ ${status} -ne 0 ]]; then
    echo "FAIL: complete ${host} stream exited ${status}." >&2
    cat "${stdout_file}" >&2
    cat "${stderr_file}" >&2
    return 1
  fi
  grep -Fq 'execution-status: completed' "${attempt}/record"
  grep -Fq 'execution-reason: native command exited 0' "${attempt}/record"
  grep -Fq 'assessment-status: pass' "${attempt}/record"
  grep -Fq 'assessment-reason:' "${attempt}/record"
  grep -Fq 'followed and cited Accepted authority' "${attempt}/record"
  native_result_assert_no_discovery_fields \
    "${attempt}/record" "complete ${host} stream"
  [[ -s ${attempt}/events.jsonl ]]
  [[ -s ${attempt}/response.md ]]
  if [[ ${host} == codex ]]; then
    grep -Fq '"type":"item.completed"' "${attempt}/events.jsonl"
    grep -Fq '"type":"turn.completed"' "${attempt}/events.jsonl"
  fi
}

assert_incomplete() {
  local host=$1
  local stream_kind=$2
  local reason=$3
  local status=$4
  local attempt=$5

  if [[ ${status} -eq 0 ]]; then
    echo "FAIL: ${host} ${stream_kind} stream returned passing." >&2
    cat "${stdout_file}" >&2
    cat "${stderr_file}" >&2
    cat "${attempt}/record" >&2
    return 1
  fi
  if [[ ${status} -eq 124 ]]; then
    echo "FAIL: ${host} ${stream_kind} stream was recorded as a timeout." >&2
    cat "${attempt}/record" >&2
    return 1
  fi
  grep -Fq 'execution-status: incomplete' "${attempt}/record"
  grep -Fq "execution-reason: ${reason}" "${attempt}/record"
  grep -Fq 'assessment-status: not-run' "${attempt}/record"
  grep -Fq 'assessment-reason: behavior not assessed' "${attempt}/record"
  grep -Fq 'execution: incomplete' "${attempt}/observations.txt"
  assert_not_wording_pass "${attempt}"
  [[ -f ${attempt}/events.jsonl ]]
  case ${stream_kind} in
    missing)
      if [[ -s ${attempt}/events.jsonl ]]; then
        echo "FAIL: missing ${host} terminal stream retained nonempty events." >&2
        cat "${attempt}/events.jsonl" >&2
        return 1
      fi
      ;;
    truncated)
      [[ -s ${attempt}/events.jsonl ]]
      if grep -Fq '"type":"result"' "${attempt}/events.jsonl"; then
        echo "FAIL: truncated ${host} stream retained a result event." >&2
        cat "${attempt}/events.jsonl" >&2
        return 1
      fi
      if [[ ${host} == codex ]]; then
        grep -Fq '"type":"item.completed"' "${attempt}/events.jsonl"
        if grep -Fq '"type":"turn.completed"' "${attempt}/events.jsonl"; then
          echo 'FAIL: truncated Codex stream retained terminal turn completion.' >&2
          cat "${attempt}/events.jsonl" >&2
          return 1
        fi
      fi
      ;;
    unknown)
      [[ -s ${attempt}/events.jsonl ]]
      grep -Fq '{"unrecognized":true}' "${attempt}/events.jsonl"
      ;;
    *)
      echo "FAIL: unexpected stream kind ${stream_kind}." >&2
      return 1
      ;;
  esac
}

for host in codex cursor claude; do
  read -r status attempt < <(run_selected_stream "${host}" complete)
  assert_complete "${host}" "${status}" "${attempt}"

  read -r status attempt < <(run_selected_stream "${host}" truncated)
  assert_incomplete "${host}" truncated 'truncated terminal stream' \
    "${status}" "${attempt}"
  if [[ ${host} == codex ]]; then
    grep -Fq '0001-session-state.md' "${attempt}/response.md"
  fi

  read -r status attempt < <(run_selected_stream "${host}" missing)
  assert_incomplete "${host}" missing 'missing terminal stream' \
    "${status}" "${attempt}"

  read -r status attempt < <(run_selected_stream "${host}" unknown)
  assert_incomplete "${host}" unknown 'unknown event shape' \
    "${status}" "${attempt}"
done

echo 'PASS: selected context retains complete streams with shared behavior assessment and keeps truncated, missing, and unknown terminal evidence nonpassing without a wording pass.'
