#!/usr/bin/env bash
# Purpose: the launch-command-tests fixture gives the participant only the
# task and the overlaid project, and its observer keeps the final change and
# the backend and E2E results it executed itself. The fixture leaves the
# unchanged E2E consumer failing on the starting state, the way the frozen
# effort work left it: the observer's own run of it fails every test with the
# five-argument command. The probes and the assessor have their own tests
# (native-guidance-check-launch-command-tests-probes.sh, -assessor.sh);
# the whole journey with probes is the case's reference qualification
# (case.md).
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Sourced runner and case globals; observations print what each command gives.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
source "${source_dir}/Distribution/evaluation/src/native-guidance-check-run.sh"
case_path="${source_dir}/Distribution/evaluation/cases/guidance-checks/launch-command-tests"
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT

# The task names the files to refactor, never the expected answer.
if grep -Eiq 'argv|length|medium|--effort|unchanged consumer|expected|fbfaa116|8b9005acc|comparison' \
  "${case_path}/task.txt"; then
  echo 'FAIL: the launch-command-tests task leaks the assessed answer' >&2
  exit 1
fi

# The fixture and the observer's change, backend and E2E proof, without
# probes, on the starting state the participant receives.
export NATIVE_GUIDANCE_CHECK_OPEN_DOUGH_SOURCE=${source_dir}
source "${case_path}/case.bash"
trap 'case_cleanup; rm -rf -- "${work}"' EXIT
root="${work}/run"
mkdir -p -- "${root}"
case_materialize "${root}" "${source_dir}" codex
workspace="${root}/workspace"
evidence="${work}/case-evidence"
case_observe_change "${workspace}" 1 "${evidence}" > "${work}/observations.txt"
grep -Fqx 'turn-1-source: unchanged' "${work}/observations.txt"
[[ -f ${evidence}/final-turn-1.diff && ! -s ${evidence}/final-turn-1.diff ]]
[[ $(case_run_specs "${workspace}" dashboard/backend.playwright.config.ts "${evidence}/backend.json" \
  "${case_backend_specs[@]}") == '28 0' ]]
[[ $(case_run_specs "${workspace}" e2e/playwright.config.ts "${work}/e2e.json" \
  "${case_e2e_specs[@]}") == '0 4' ]]
jq -e '[.. | strings | gsub("\u001b\\[[0-9;]*m"; "") | select(contains("Received length: 5"))] | length > 0' \
  "${work}/e2e.json" > /dev/null

# The participant's workspace holds the pinned project and its overlay, but
# not this case or the assessor-only comparison.
held=$(find "${workspace}" -path "${workspace}/node_modules" -prune -o \( -path '*launch-command-tests*' \
  -o -name claude-comparison.md \) -print)
if [[ -n ${held} ]]; then
  echo "FAIL: the workspace holds ${held}" >&2
  exit 1
fi

# An edited workspace keeps its final change.
case_basis=$(case_tree "${workspace}" "${work}/edited.index")
printf '// refactored\n' >> "${workspace}/e2e/launches/agent-launch-ad-hoc.spec.ts"
case_observe_change "${workspace}" 2 "${work}/edited" > "${work}/edited.txt"
grep -Fqx 'turn-2-source: changed' "${work}/edited.txt"
grep -Fqx 'turn-2-changed-files: e2e/launches/agent-launch-ad-hoc.spec.ts' "${work}/edited.txt"
grep -Fq '+// refactored' "${work}/edited/final-turn-2.diff"
