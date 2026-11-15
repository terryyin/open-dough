#!/usr/bin/env bash
# Workspace paths may name native-comparison without exposing its harness.
# Exercise the real comparison runner, observer and assessor with a controlled
# host that attempts the exact reads under proof. No paid host runs here.
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Sourced runner and case globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
source "${source_dir}/Distribution/tests/support/native-comparison-run.sh"
source "${source_dir}/Distribution/tests/support/native-assessor-counterexample.sh"
# Regex metacharacters are ordinary controller/workspace path characters.
work=$(mktemp -d "${TMPDIR:-/tmp}/native-comparison+[kept].XXXXXX")
trap 'rm -rf -- "${work}"' EXIT
mkdir -p -- "${work}/bin"
cp -- "${source_dir}/Distribution/tests/support/native-agent-paused-supplier.sh" "${work}/bin/codex"
chmod a+x "${work}/bin/codex"
cat > "${work}/context-command" << 'COMMAND'
#!/usr/bin/env bash
set -euo pipefail
controllers=("${NATIVE_INSPECTION_WORK}"/controller.*)
command=${NATIVE_INSPECTION_COMMAND//@WORKSPACE@/$1}
command=${command//@SOURCE@/${NATIVE_INSPECTION_SOURCE}}
command=${command//@CONTROLLER@/${controllers[0]}}
printf '%s\n' "${command}"
COMMAND
chmod a+x "${work}/context-command"
export PATH="${work}/bin:${PATH}"
export NATIVE_AGENT_PAUSED_SUPPLIER_CONTEXT_COMMAND="${work}/context-command"
export NATIVE_INSPECTION_SOURCE=${source_dir}
unset CODEX_HOME
native_case_deadline=120
native_case_grace=5

run_inspection() {
  local name=$1 command=$2 case_name=${3:-unblocked-supplier}
  export NATIVE_INSPECTION_WORK="${work}/${name}" NATIVE_INSPECTION_COMMAND=${command}
  mkdir -p -- "${NATIVE_INSPECTION_WORK}"
  NATIVE_AGENT_PAUSED_SUPPLIER_RULE=completion native_comparison_run_case \
    "${case_name}" "${source_dir}" "${NATIVE_INSPECTION_WORK}" || :
}

# The original failure: legitimate installed guidance read by absolute path in
# all four turns, including the qualifying continuation.
run_inspection workspace 'cat -- "@WORKSPACE@/.agents/skills/dough-execute-plan/SKILL.md"' paused-supplier
[[ ${native_comparison_status} == pass ]]
run_inspection ordinary 'cat -- "@WORKSPACE@/.agents/skills/dough-execute-plan/SKILL.md"'
[[ ${native_comparison_status} == pass ]]
passing="${NATIVE_INSPECTION_WORK}/observations.txt"
assessor="${source_dir}/Distribution/tests/native-comparison/unblocked-supplier/assess.bash"
# shellcheck source=Distribution/tests/native-comparison/unblocked-supplier/assess.bash
source "${assessor}"
native_assessor_counterexamples "${assessor}" "${passing}" \
  --verdict case_assess_status case_assess_reason -- case_assess

# Reuse the passing case's unrelated facts. Only the inspection signal comes
# from each real runner/observer journey; a missed inspection leaves the base
# unchanged, which the shared counterexample helper refuses.
observe_inspection() {
  local inspected
  run_inspection "$@"
  inspected=$(native_observation_field "${NATIVE_INSPECTION_WORK}/observations.txt" turn-1-harness-inspected)
  case ${inspected} in
    true | false) ;;
    *) echo 'FAIL: the inspection journey produced no boolean observation' >&2 && return 1 ;;
  esac
  sed '/^turn-1-harness-inspected:/d' "${passing}"
  printf 'turn-1-harness-inspected: %s\n' "${inspected}"
}

native_assessor_rejects_observed controller harness "${work}/controller-observed" \
  observe_inspection controller 'cat -- "@CONTROLLER@/observations.txt"' -- fail 'inspected the native harness'
native_assessor_rejects_observed source harness "${work}/source-observed" \
  observe_inspection source 'cat -- "@SOURCE@/README.md"' -- fail 'inspected the native harness'
native_assessor_rejects_observed relative-case harness "${work}/relative-case-observed" \
  observe_inspection relative-case 'cat ../../Distribution/tests/native-comparison/paused-supplier/assess.bash' -- fail 'inspected the native harness'
native_assessor_rejects_observed relative-command harness "${work}/relative-command-observed" \
  observe_inspection relative-command 'bash Distribution/tests/native-comparison.sh --list' -- fail 'inspected the native harness'
native_assessor_rejects_observed relative-support harness "${work}/relative-support-observed" \
  observe_inspection relative-support 'cat Distribution/tests/support/native-comparison-run.sh' -- fail 'inspected the native harness'
native_assessor_rejects_observed mixed harness "${work}/mixed-observed" \
  observe_inspection mixed 'cat "@WORKSPACE@/README.md"; cat "@CONTROLLER@/observations.txt"' -- fail 'inspected the native harness'
