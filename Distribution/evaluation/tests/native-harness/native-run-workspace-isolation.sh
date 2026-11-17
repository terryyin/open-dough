#!/usr/bin/env bash
# Prove selected context keeps stream artifacts and the verify fixture when a
# native command removes dirname(--workspace) after emitting a complete stream.
# shellcheck disable=SC2312 # pipefail covers listings, logs, and result-path parses.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
# shellcheck source=Distribution/evaluation/tests/native-harness/support/native-check-expectations.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-check-expectations.sh"
context_wrapper="${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-context.sh"

work_dir=''
harness_dir=''
native_check_status=0
native_check_workspace work_dir

sentinel_bin="${work_dir}/bin"
watched_dir="${work_dir}/watched"
results_dir="${work_dir}/results"
run_log="${work_dir}/run.log"
stdout_file="${work_dir}/stdout.txt"
stderr_file="${work_dir}/stderr.txt"
mkdir -p -- "${sentinel_bin}" "${watched_dir}" "${results_dir}"

cat > "${sentinel_bin}/cursor" << 'EOF'
#!/usr/bin/env bash
set -euo pipefail
if [[ -z ${NATIVE_AGENT_SENTINEL_LOG:-} ]]; then
  printf 'error: NATIVE_AGENT_SENTINEL_LOG must name a writable log file.\n' >&2
  exit 1
fi
{
  printf '%s' "${0##*/}"
  if [[ $# -gt 0 ]]; then
    printf ' %s' "$@"
  fi
  printf '\n'
} >> "${NATIVE_AGENT_SENTINEL_LOG}"

if [[ ${1:-} == 'agent' && ${2:-} == '--version' ]]; then
  printf 'cursor-agent recorded-1\n'
  exit 0
fi
if [[ ${1:-} == 'agent' ]]; then
  shift
fi

workspace=
args=("$@")
idx=0
while [[ ${idx} -lt ${#args[@]} ]]; do
  case ${args[idx]} in
    --workspace)
      idx=$((idx + 1))
      workspace=${args[idx]}
      ;;
  esac
  idx=$((idx + 1))
done
if [[ -z ${workspace} ]]; then
  workspace=${PWD}
fi

response='Accepted ADR 0001-session-state.md keeps session state in Redis. Both backend instances should follow that decision for shared login sessions.'
jq -n -c --arg result "${response}" '{type:"result",result:$result}'
# Delete the agent workspace root only. Fixture + stream artifacts must survive.
rm -rf -- "$(dirname -- "${workspace}")"
EOF
chmod a+x "${sentinel_bin}/cursor"

: > "${run_log}"
: > "${stdout_file}"
: > "${stderr_file}"
native_check_run "${sentinel_bin}" "${stdout_file}" "${stderr_file}" \
  env TMPDIR="${watched_dir}" \
  NATIVE_AGENT_SENTINEL_LOG="${run_log}" \
  bash "${context_wrapper}" --native cursor clear \
  --results-dir "${results_dir}"

native_check_expect_status 'workspace-parent deletion succeeds' 0 "${native_check_status}" "${stdout_file}" "${stderr_file}" "${run_log}"
vanished_parent=$(grep -F 'No such file or directory' "${stderr_file}" || true)
native_check_expect_value 'decode tolerates vanished output parent' '' "${vanished_parent}" "${stderr_file}"
leftover=$(find "${watched_dir}" -mindepth 1 ! -name xcrun_db -print)
native_check_expect_value 'wrapper scratch removed' '' "${leftover}"
attempt=$(awk '/^result-path: / { sub(/^result-path: /, ""); path=$0 } END { if (path=="") exit 1; print path }' \
  "${stdout_file}")
[[ -f ${attempt}/record ]]
[[ -s ${attempt}/response.md ]]
[[ -s ${attempt}/events.jsonl ]]
native_check_expect_field 'completed execution retained' "${attempt}/record" execution-status completed
native_check_expect_field 'passing assessment retained' "${attempt}/record" assessment-status pass
native_check_expect_line 'Accepted authority assessed' "${attempt}/record" 'followed and cited Accepted authority'
native_check_expect_line 'Cursor agent version probed' "${run_log}" 'cursor agent --version'

# Harness: incomplete decode must recreate a vanished output_file parent.
native_check_workspace harness_dir
# shellcheck disable=SC2034 # The host native_run_write_output reads.
platform=cursor
output_file="${harness_dir}/gone/response.md"
transcript="${harness_dir}/events.jsonl"
printf '%s\n' '{"type":"tool_call"}' > "${transcript}"
rm -rf -- "$(dirname -- "${output_file}")"
# shellcheck source=Distribution/evaluation/src/native-run-supervise.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/evaluation/src/native-run-supervise.sh"
native_run_write_output 1
[[ -f ${output_file} ]]
