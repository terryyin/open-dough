#!/usr/bin/env bash
# Purpose: a maintainer selects the launch-command-tests case by its workflow
# and runs its controlled journey through the entry; the participant gets only
# the task and the overlaid project, and the observer keeps the final change
# and the backend and E2E results it executed itself.
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Sourced runner and case globals; observations print what each command gives.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
source "${source_dir}/Distribution/evaluation/src/native-guidance-check-run.sh"
case_path="${source_dir}/Distribution/evaluation/cases/guidance-checks/launch-command-tests"
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT

PATH=/opt/homebrew/bin:${PATH} bash "${source_dir}/Distribution/evaluation/src/native-guidance-check.sh" \
  --list --where 'workflow=test refactoring' > "${work}/catalog"
[[ $(head -n 1 "${work}/catalog") == launch-command-tests ]]

# The task names the files to refactor, never the expected answer.
if grep -Eiq 'argv|length|medium|--effort|unchanged consumer|expected|fbfaa116|8b9005acc|comparison' \
  "${case_path}/task.txt"; then
  echo 'FAIL: the launch-command-tests task leaks the assessed answer' >&2
  exit 1
fi

# A substitute codex that leaves the workspace as it found it.
mkdir -p -- "${work}/bin" "${work}/run"
cat > "${work}/bin/codex" << 'HOST'
#!/usr/bin/env bash
[[ ${1-} == --version ]] && { echo 'codex-cli launch-command-substitute'; exit 0; }
output=''
while (($#)); do [[ $1 == -o ]] && output=$2; shift; done
thread=00000000-0000-4000-8000-000000000674
jq -nc --arg t "${thread}" '{type:"thread.started",thread_id:$t}'
jq -nc '{type:"item.completed",item:{id:"m",type:"agent_message",text:"Left unchanged."}}'
jq -nc '{type:"turn.completed",usage:{input_tokens:1,cached_input_tokens:0,output_tokens:1}}'
[[ -z ${output} ]] || echo 'Left unchanged.' > "${output}"
HOST
chmod a+x "${work}/bin/codex"
export PATH="${work}/bin:${PATH}" NATIVE_GUIDANCE_CHECK_OPEN_DOUGH_SOURCE=${source_dir}
unset CODEX_HOME
native_guidance_check_run_case launch-command-tests "${source_dir}" "${work}/run" "${work}/results" || true
observations="${work}/run/observations.txt"
grep -Fqx 'turn-1-status: completed' "${observations}"
grep -Fqx 'turn-1-source: unchanged' "${observations}"
grep -Fqx 'turn-1-backend: passed' "${observations}"
# The frozen effort work leaves the unchanged E2E consumer failing.
grep -Fqx 'turn-1-e2e: failed' "${observations}"
grep -Fqx 'assessment-reason: no refactoring assessment is defined yet' "${observations}"
evidence="${native_guidance_check_attempt}/case-evidence"
[[ -f ${evidence}/final-turn-1.diff && ! -s ${evidence}/final-turn-1.diff ]]
jq -e '.stats.unexpected == 0 and .stats.expected > 0' "${evidence}/backend-turn-1.json" > /dev/null
jq -e '[.. | strings | gsub("\u001b\\[[0-9;]*m"; "") | select(contains("Received length: 5"))] | length > 0' \
  "${evidence}/e2e-turn-1.json" > /dev/null

# The participant's workspace holds the pinned project and its overlay, but
# not this case or the assessor-only comparison; observations stay outside it.
workspace=$(find "${work}/run" -maxdepth 2 -type d -name workspace | head -n 1)
[[ -n ${workspace} ]]
held=$(find "${workspace}" -path "${workspace}/node_modules" -prune -o \( -path '*launch-command-tests*' \
  -o -name claude-comparison.md \) -print)
if [[ -n ${held} ]]; then
  echo "FAIL: the workspace holds ${held}" >&2
  exit 1
fi

# An edited workspace keeps its final change.
source "${case_path}/case.bash"
case_basis=$(case_tree "${workspace}" "${work}/edited.index")
printf '// refactored\n' >> "${workspace}/e2e/launches/agent-launch-ad-hoc.spec.ts"
case_observe_change "${workspace}" 2 "${work}/edited" > "${work}/edited.txt"
grep -Fqx 'turn-2-source: changed' "${work}/edited.txt"
grep -Fqx 'turn-2-changed-files: e2e/launches/agent-launch-ad-hoc.spec.ts' "${work}/edited.txt"
grep -Fq '+// refactored' "${work}/edited/final-turn-2.diff"
