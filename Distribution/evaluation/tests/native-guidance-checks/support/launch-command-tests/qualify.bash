#!/usr/bin/env bash
# Reference qualification of the launch-command-tests case (case.md,
# Reference qualification), run by hand, never by the test runner:
#   bash Distribution/evaluation/tests/native-guidance-checks/support/launch-command-tests/qualify.bash [OUTCOME...]
# For each OUTCOME (default: protective mechanical weakened unchanged) it runs
# the whole journey through the entry with the real fixture, observer and
# probes, and prints the outcome, its duration and load, the probe fields and
# the assessment. A substitute codex leaves the participant's final state:
# OUTCOME.diff of this directory applied, or the workspace unchanged. The
# reference outcomes are controller material, never in the task or the
# workspace before the turn.
# shellcheck disable=SC1091,SC2154,SC2312 # Sourced runner and its globals; reports print what each command gives.
set -euo pipefail
support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source_dir=$(cd -- "${support_dir}/../../../../../.." && pwd)
source "${source_dir}/Distribution/evaluation/src/native-guidance-check-run.sh"

# Writes WORK/bin/codex: it applies $LAUNCH_COMMAND_TESTS_OUTCOME (when set)
# to its -C workspace and reports $LAUNCH_COMMAND_TESTS_MESSAGE.
write_substitute_codex() {
  mkdir -p -- "$1/bin"
  cat > "$1/bin/codex" << 'HOST'
#!/usr/bin/env bash
[[ ${1-} == --version ]] && { echo 'codex-cli launch-command-substitute'; exit 0; }
output='' target=''
while (($#)); do
  case $1 in -o) output=$2 ;; -C) target=$2 ;; esac
  shift
done
[[ -z ${LAUNCH_COMMAND_TESTS_OUTCOME} ]] || git -C "${target}" apply "${LAUNCH_COMMAND_TESTS_OUTCOME}"
jq -nc '{type:"thread.started",thread_id:"00000000-0000-4000-8000-000000000674"}'
jq -nc --arg m "${LAUNCH_COMMAND_TESTS_MESSAGE}" '{type:"item.completed",item:{id:"m",type:"agent_message",text:$m}}'
jq -nc '{type:"turn.completed",usage:{input_tokens:1,cached_input_tokens:0,output_tokens:1}}'
[[ -z ${output} ]] || echo "${LAUNCH_COMMAND_TESTS_MESSAGE}" > "${output}"
HOST
  chmod a+x "$1/bin/codex"
}

(($#)) || set -- protective mechanical weakened unchanged
for outcome in "$@"; do
  work=$(mktemp -d)
  start=${SECONDS}
  load=$(sysctl -n vm.loadavg 2> /dev/null || uptime)
  reference="${support_dir}/${outcome}.diff"
  [[ ${outcome} != unchanged ]] || reference=''
  write_substitute_codex "${work}"
  mkdir -p -- "${work}/run"
  (
    export PATH="${work}/bin:/opt/homebrew/bin:${PATH}" NATIVE_GUIDANCE_CHECK_OPEN_DOUGH_SOURCE=${source_dir} \
      LAUNCH_COMMAND_TESTS_OUTCOME=${reference} \
      LAUNCH_COMMAND_TESTS_MESSAGE='Refactored the launch tests; all tests are focused.'
    unset CODEX_HOME
    native_guidance_check_run_case launch-command-tests "${source_dir}" "${work}/run" "${work}/results" || true
  )
  printf 'outcome: %s\nseconds: %s\nload-before: %s\nload-after: %s\n' "${outcome}" \
    "$((SECONDS - start))" "${load}" "$(sysctl -n vm.loadavg 2> /dev/null || uptime)"
  grep -E '^turn-1-(status|source|backend|e2e|perturbation|fault|probes)|^assessment-' "${work}/run/observations.txt"
  rm -rf -- "${work}"
done
