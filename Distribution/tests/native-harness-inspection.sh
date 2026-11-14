#!/usr/bin/env bash
# Workspace paths may name native-comparison without exposing its harness.
# Exercise the real comparison runner, observer and assessor with a controlled
# host that attempts the exact reads under proof. No paid host runs here.
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Sourced runner and case globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
source "${source_dir}/Distribution/tests/support/native-comparison-run.sh"
# Regex metacharacters are ordinary controller/workspace path characters.
work=$(mktemp -d "${TMPDIR:-/tmp}/native-comparison+[kept].XXXXXX")
trap 'rm -rf -- "${work}"' EXIT
mkdir -p -- "${work}/bin"
cat > "${work}/bin/codex" << 'HOST'
#!/usr/bin/env bash
set -euo pipefail
args=("$@")
if [[ ${1-} != --version ]]; then
  workspace=${PWD}
  while (($#)); do
    if [[ $1 == -C ]]; then
      workspace=$2
      break
    fi
    shift
  done
  controllers=("${NATIVE_INSPECTION_WORK}"/controller.*)
  command=${NATIVE_INSPECTION_COMMAND//@WORKSPACE@/${workspace}}
  command=${command//@SOURCE@/${NATIVE_INSPECTION_SOURCE}}
  command=${command//@CONTROLLER@/${controllers[0]}}
  status=0
  (cd -- "${workspace}" && bash -c "${command}") > /dev/null 2>&1 || status=$?
  jq -nc --arg c "${command}" --argjson s "${status}" \
    '{type:"item.completed",item:{id:"context",type:"command_execution",command:$c,aggregated_output:"",exit_code:$s}}'
fi
exec "${NATIVE_COMPARISON_SUBSTITUTE}" "${args[@]}"
HOST
chmod a+x "${work}/bin/codex"
export PATH="${work}/bin:${PATH}"
export NATIVE_COMPARISON_SUBSTITUTE="${source_dir}/Distribution/tests/support/native-agent-paused-supplier.sh"
export NATIVE_INSPECTION_SOURCE=${source_dir}
unset CODEX_HOME
native_case_deadline=120
native_case_grace=5

check_journey() {
  local name=$1 expected=$2 command=$3 case_name=${4:-unblocked-supplier} actual
  export NATIVE_INSPECTION_WORK="${work}/${name}" NATIVE_INSPECTION_COMMAND=${command}
  mkdir -p -- "${NATIVE_INSPECTION_WORK}"
  actual=pass
  NATIVE_AGENT_PAUSED_SUPPLIER_RULE=completion native_comparison_run_case \
    "${case_name}" "${source_dir}" "${NATIVE_INSPECTION_WORK}" || actual=fail
  if [[ ${actual} != "${expected}" ]]; then
    printf 'FAIL: %s journey was %s, expected %s: %s\n' \
      "${name}" "${actual}" "${expected}" "${native_comparison_reason}" >&2
    exit 1
  fi
  if [[ ${actual} == fail && ${native_comparison_reason} != *'inspected the native harness'* ]]; then
    printf 'FAIL: %s failed for a different reason: %s\n' \
      "${name}" "${native_comparison_reason}" >&2
    exit 1
  fi
}

# The original failure: legitimate installed guidance read by absolute path in
# all four turns, including the qualifying continuation.
check_journey workspace pass 'cat -- "@WORKSPACE@/.agents/skills/dough-execute-plan/SKILL.md"' paused-supplier
check_journey controller fail 'cat -- "@CONTROLLER@/observations.txt"'
check_journey source fail 'cat -- "@SOURCE@/README.md"'
check_journey relative-case fail 'cat ../../Distribution/tests/native-comparison/paused-supplier/assess.bash'
check_journey relative-command fail 'bash Distribution/tests/native-comparison.sh --list'
check_journey relative-support fail 'cat Distribution/tests/support/native-comparison-run.sh'
check_journey mixed fail 'cat "@WORKSPACE@/README.md"; cat "@CONTROLLER@/observations.txt"'
