#!/usr/bin/env bash
# Credential-free proof that selected context keeps truncated, missing, or
# unknown terminal evidence nonpassing without a wording pass; complete streams
# are proved by native-result-retention.sh. Recorded streams prove adapters.
# shellcheck disable=SC2310 # The reader call is a value check, not a set -e step.
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

work_dir=''
attempt=''
native_check_status=0
native_check_workspace work_dir
# Wrapper runs copy each fixture this check builds once.
export OPEN_DOUGH_TEST_FIXTURE_CACHE="${work_dir}/fixture-cache"

sentinel_bin="${work_dir}/bin"
watched_dir="${work_dir}/watched"
results_dir="${work_dir}/results"
run_log="${work_dir}/run.log"
stdout_file="${work_dir}/stdout.txt"
stderr_file="${work_dir}/stderr.txt"
mkdir -p -- "${sentinel_bin}" "${watched_dir}" "${results_dir}"
cp -- "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-agent-recorded.sh" "${sentinel_bin}/codex"
cp -- "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-agent-recorded.sh" "${sentinel_bin}/cursor"
chmod a+x "${sentinel_bin}/codex" "${sentinel_bin}/cursor"

assert_watched_empty() {
  native_check_expect_value 'wrapper scratch removed' '' "$(find "${watched_dir}" -mindepth 1 ! -name xcrun_db -print)"
}

run_selected_stream() {
  local result_variable=$1 host=$2 stream_kind=$3
  local retained_attempt

  : > "${run_log}"
  : > "${stdout_file}"
  : > "${stderr_file}"
  native_check_run "${sentinel_bin}" "${stdout_file}" "${stderr_file}" \
    env TMPDIR="${watched_dir}" NATIVE_AGENT_SENTINEL_LOG="${run_log}" \
    NATIVE_AGENT_STREAM="${stream_kind}" \
    bash "${context_wrapper}" --native "${host}" clear --results-dir "${results_dir}"
  assert_watched_empty
  [[ -s ${run_log} ]]
  retained_attempt=$(awk '/^result-path: / { sub(/^result-path: /, ""); path=$0 } END { if (path=="") exit 1; print path }' \
    "${stdout_file}")
  [[ -d ${retained_attempt} ]]
  [[ -f ${retained_attempt}/record ]]
  native_check_expect_field 'selected host retained' "${retained_attempt}/record" host "${host}"
  native_check_expect_field 'selected case retained' "${retained_attempt}/record" case context/clear
  native_check_expect_field 'fresh origin retained' "${retained_attempt}/record" origin fresh
  native_check_expect_absent 'adopter scratch not retained' "${retained_attempt}/adopter"
  native_check_expect_absent 'candidate scratch not retained' "${retained_attempt}/candidate"
  native_check_expect_absent 'codex-state scratch not retained' "${retained_attempt}/codex-state"
  printf -v "${result_variable}" '%s' "${retained_attempt}"
}

assert_incomplete() {
  local host=$1 stream_kind=$2 reason=$3 status=$4 attempt=$5

  [[ ${status} -ne 0 && ${status} -ne 124 ]]
  native_check_expect_field 'incomplete execution retained' "${attempt}/record" execution-status incomplete
  native_check_expect_field 'incomplete reason retained' "${attempt}/record" execution-reason "${reason}"
  native_check_expect_field 'incomplete evidence not assessed' "${attempt}/record" assessment-status not-run
  native_check_expect_field 'assessment reason retained' "${attempt}/record" assessment-reason 'behavior not assessed'
  native_check_expect_line 'incomplete observation retained' "${attempt}/observations.txt" 'execution: incomplete'
  native_result_assert_no_discovery_fields "${attempt}/record"
  [[ -f ${attempt}/events.jsonl ]]
  case ${stream_kind} in
    missing)
      native_check_expect_value 'missing stream retains empty events' 0 "$(wc -c < "${attempt}/events.jsonl" | tr -d '[:space:]')" "${attempt}/events.jsonl"
      ;;
    truncated)
      [[ -s ${attempt}/events.jsonl ]]
      native_check_expect_value 'retained stream stays truncated' truncated "$(native_host_stream "${host}" "${attempt}/events.jsonl" status)" "${attempt}/events.jsonl"
      if [[ ${host} == codex ]]; then
        [[ -n $(native_host_stream codex "${attempt}/events.jsonl" response) ]]
      fi
      ;;
    unknown)
      [[ -s ${attempt}/events.jsonl ]]
      native_check_expect_line 'unknown event retained' "${attempt}/events.jsonl" '{"unrecognized":true}'
      ;;
    *)
      native_check_fail 'supported stream kind' 'missing, truncated or unknown' "${stream_kind}"
      ;;
  esac
}

# Codex and Cursor each keep a truncated run because they end in different
# response branches (Codex's -o file, Cursor's reader). Missing and unknown are
# classified the same way for every host, so one run of each stands for them:
# Distribution/evaluation/tests/native-harness/native-host-stream.test.mjs proves both for every host, and
# native-stream-replay.sh replays real truncated streams for every host.
for host in codex cursor; do
  run_selected_stream attempt "${host}" truncated
  assert_incomplete "${host}" truncated 'truncated terminal stream' \
    "${native_check_status}" "${attempt}"
  if [[ ${host} == codex ]]; then
    native_check_expect_line 'partial Codex response retained' "${attempt}/response.md" '0001-session-state.md'
  fi
done

run_selected_stream attempt cursor missing
assert_incomplete cursor missing 'missing terminal stream' \
  "${native_check_status}" "${attempt}"

run_selected_stream attempt codex unknown
assert_incomplete codex unknown 'unknown event shape' \
  "${native_check_status}" "${attempt}"
