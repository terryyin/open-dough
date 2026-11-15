#!/usr/bin/env bash
# Credential-free automated checks; explicit native options use the case entry.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329
set -Eeuo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
if (($#)); then
  exec bash "${source_dir}/Distribution/evaluation/cases/delivery-evidence/proof-scheduling-native.sh" "$@"
fi
source "${source_dir}/Distribution/tests/support/native-family-checks.sh"
source "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native-host.sh"
source "${source_dir}/Distribution/tests/support/native-assessor-counterexample.sh"
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT

# Product commands observe the foreseeable move and a broken consumer.
run_delivery_evidence_scheduling_product_checks "${work}/product"

# Controlled sequences, observed through the fixture's own commands.
mkdir -p -- "${work}/sequences"
for sequence in ${delivery_evidence_scheduling_sequences}; do
  delivery_evidence_scheduling_observe_sequence "${sequence}" \
    "${work}/sequences" "${work}/${sequence}.txt"
done
# The baseline-shaped trace ran broad proof on the pre-move state and again on
# the final one; the corrected sequence ran it once, on the final state.
grep -Fqx 'trace: targeted:s1:exit0:6/0 suite:s1:exit0:7/0 format:s2*:exit0 suite:s2*:exit0:7/0' \
  "${work}/baseline.txt"
grep -Fqx 'trace: targeted:s1:exit0:6/0 format:s2*:exit0 suite:s2*:exit0:7/0' \
  "${work}/corrected.txt"
run_delivery_evidence_scheduling_assessor_counterexamples "${work}"

# Check neutral tasks and the scenarios' actual cost, layout and plan inputs.
run_delivery_evidence_scheduling_text_checks "${work}"

# Substitute hosts through the shared runner, observer and retention.
mkdir -p -- "${work}/bin" "${work}/results" "${work}/runs"
cp -- "${source_dir}/Distribution/tests/support/native-agent-proof-scheduling.sh" \
  "${work}/bin/claude"
chmod a+x "${work}/bin/claude"
export PATH="${work}/bin:${PATH}"
export NATIVE_AGENT_SENTINEL_LOG="${work}/sentinel.log"
export NATIVE_AGENT_SCHEDULING_SUPPORT="${source_dir}/Distribution/tests/support"
native_case_deadline=120
native_case_grace=5

# Runs SEQUENCE of SCENARIO through the runner; leaves its status in
# substitute_status.
substitute_scheduling() {
  substitute_status=0
  NATIVE_AGENT_SCHEDULING_SEQUENCE=$1 delivery_evidence_run_scenario \
    scheduling "${source_dir}" claude "$2" \
    "${work}/results" "${work}/runs" > "${work}/$1-$2-run.txt" 2>&1 \
    || substitute_status=$?
}
substitute_scheduling corrected stylesheet-extraction
if [[ ${substitute_status} -ne 0 ]]; then
  echo 'FAIL: the corrected substitute sequence did not pass the runner' >&2
  cat "${work}/corrected-stylesheet-extraction-run.txt" >&2
  exit 1
fi
grep -Fq 'assessment-reason: scheduling acceptance honored for stylesheet-extraction: broad proof covers the final state after the refactor move' \
  "${work}/corrected-stylesheet-extraction-run.txt"
grep -Fq 'claude --print --dangerously-skip-permissions' "${work}/sentinel.log"
attempt=$(find "${work}/results" -name record -path '*scheduling/stylesheet-extraction*' \
  -exec dirname {} \; | head -n 1)
for artifact in record prompt.txt proof-runs.log observer-runs.log \
  observations.txt events.jsonl installed-guidance.sha256 \
  acceptance-outcome.md final-product/styles/project-actions.css; do
  if [[ ! -s ${attempt}/${artifact} ]]; then
    printf 'FAIL: retained attempt lacks %s\n' "${artifact}" >&2
    exit 1
  fi
done
grep -q '^input-hash: [0-9a-f]* Distribution/evaluation/cases/delivery-evidence/delivery-evidence-scheduling-native-proof-logger.sh$' \
  "${attempt}/record"
grep -q '\.claude/skills/dough-post-change-refactor/SKILL\.md$' \
  "${attempt}/installed-guidance.sha256"

substitute_scheduling baseline stylesheet-extraction
[[ ${substitute_status} -ne 0 ]]
grep -Fq 'redundant broad run before the refactor move (1); final state covered afterwards' \
  "${work}/baseline-stylesheet-extraction-run.txt"

# The planned scenario, selected alone through the journey a native run uses.
journey_status=0
NATIVE_AGENT_SCHEDULING_SEQUENCE=corrected \
  delivery_evidence_only_scenario=planned-extraction \
  delivery_evidence_run_journey scheduling "${source_dir}" claude \
  "${work}/results" > "${work}/planned-journey.txt" 2>&1 || journey_status=$?
if [[ ${journey_status} -ne 0 ]] \
  || ! grep -Fq 'assessment-reason: scheduling acceptance honored for planned-extraction: broad proof covers the final state after the refactor move' \
    "${work}/planned-journey.txt" \
  || grep -Fq 'delivery-evidence/scheduling stylesheet-extraction' \
    "${work}/planned-journey.txt"; then
  echo 'FAIL: the planned scenario did not run alone and pass the corrected sequence' >&2
  cat "${work}/planned-journey.txt" >&2
  exit 1
fi
attempt=$(find "${work}/results" -name record -path '*scheduling/planned-extraction*' \
  -exec dirname {} \; | head -n 1)
grep -Fq "slice 1 of the executable plan ${delivery_evidence_scheduling_plan_path}" \
  "${attempt}/prompt.txt"
grep -Fq '### 1. Compact action row on project cards' "${attempt}/final-plan.md"
grep -Fqx 'agent-calls: 0' "${attempt}/observations.txt"
journey_status=0
delivery_evidence_only_scenario=no-such-scenario \
  delivery_evidence_run_journey scheduling "${source_dir}" claude \
  "${work}/results" > /dev/null 2>&1 || journey_status=$?
[[ ${journey_status} -eq 2 ]]

substitute_scheduling baseline planned-extraction
[[ ${substitute_status} -ne 0 ]]
grep -Fq 'redundant broad run before the refactor move (1); final state covered afterwards' \
  "${work}/baseline-planned-extraction-run.txt"
