#!/usr/bin/env bash
# Prove selected context keeps stream artifacts and the verify fixture when a
# native command removes dirname(--workspace) after emitting a complete stream.
# shellcheck disable=SC2312 # pipefail covers listings, logs, and result-path parses.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
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
set +e
env TMPDIR="${watched_dir}" PATH="${sentinel_bin}:${PATH}" \
  NATIVE_AGENT_SENTINEL_LOG="${run_log}" \
  bash "${context_wrapper}" --native cursor clear \
  --results-dir "${results_dir}" > "${stdout_file}" 2> "${stderr_file}"
status=$?
set -e

if [[ ${status} -ne 0 ]]; then
  echo "FAIL: workspace-parent deletion exited ${status}." >&2
  cat "${stdout_file}" >&2
  cat "${stderr_file}" >&2
  cat "${run_log}" >&2
  exit 1
fi
if grep -Fq 'No such file or directory' "${stderr_file}"; then
  echo 'FAIL: incomplete decode hit a vanished output_file parent.' >&2
  cat "${stderr_file}" >&2
  exit 1
fi
leftover=$(find "${watched_dir}" -mindepth 1 ! -name xcrun_db -print)
if [[ -n ${leftover} ]]; then
  echo 'FAIL: scratch remained after the wrapper returned.' >&2
  printf '%s\n' "${leftover}" >&2
  exit 1
fi
attempt=$(awk '/^result-path: / { sub(/^result-path: /, ""); path=$0 } END { if (path=="") exit 1; print path }' \
  "${stdout_file}")
[[ -f ${attempt}/record ]]
[[ -s ${attempt}/response.md ]]
[[ -s ${attempt}/events.jsonl ]]
grep -Fq 'execution-status: completed' "${attempt}/record"
grep -Fq 'assessment-status: pass' "${attempt}/record"
grep -Fq 'followed and cited Accepted authority' "${attempt}/record"
grep -Fq 'cursor agent --version' "${run_log}"

# Harness: incomplete decode must recreate a vanished output_file parent.
harness_dir=$(mktemp -d)
output_file="${harness_dir}/gone/response.md"
transcript="${harness_dir}/events.jsonl"
printf '%s\n' '{"type":"tool_call"}' > "${transcript}"
rm -rf -- "$(dirname -- "${output_file}")"
# shellcheck source=tests/support/native-run-supervise.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-run-supervise.sh"
native_run_write_output 1
[[ -f ${output_file} ]]
rm -rf -- "${harness_dir}"

echo 'PASS: selected context keeps complete stream evidence when dirname(workspace) vanishes, and incomplete decode recreates a missing output_file parent.'
