#!/usr/bin/env bash
# Native scenarios for proof scheduling around an independent refactor
# (delivery-evidence/scheduling): a stylesheet change that foreseeably needs a
# file-size extraction, focused tests, and a whole dashboard suite that runs
# here in seconds. Scenario stylesheet-extraction is planless work under a
# stated fourteen-minute suite cost; planned-extraction is slice 1 of an
# executable plan with a required suite and no stated cost. Both address a
# coordinator who may implement locally; neither guarantees a historical
# delegated-implementer replay. Compare their inputs and retained outcomes in
# tests/native-publication.md#proof-scheduling-scenarios-compare-inputs-before-launch.
#
# Usage:
#   tests/proof-scheduling-native.sh
#   tests/proof-scheduling-native.sh --native HOST [--scenario NAME] [--results-dir DIR] [--deadline SECONDS]
#
# Default mode is credential-free: product-command checks of the fixture,
# controlled sequences observed through its own commands, the assessor's
# rejected cases, prompt and project-text leakage checks, and substitute-host
# runs through the shared delivery-evidence runner and retention. --native HOST (claude, codex
# or cursor) launches one paid fresh host session per scenario, or only
# --scenario NAME's; run it only when a human authorizes it.
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Sourced helper globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/git-publication-native-run.sh
source "${source_dir}/tests/support/git-publication-native-run.sh"
# shellcheck source=tests/support/git-publication-native-host.sh
source "${source_dir}/tests/support/git-publication-native-host.sh"
# shellcheck source=tests/support/delivery-evidence-native-run.sh
source "${source_dir}/tests/support/delivery-evidence-native-run.sh"
# shellcheck source=tests/support/native-assessor-counterexample.sh
source "${source_dir}/tests/support/native-assessor-counterexample.sh"

usage() {
  cat >&2 << 'EOF'
usage: tests/proof-scheduling-native.sh
   or: tests/proof-scheduling-native.sh --native <claude|codex|cursor> [--scenario NAME] [--results-dir DIR] [--deadline SECONDS]
Credential-free by default. --native launches one paid host session per
delivery-evidence/scheduling scenario, or only --scenario NAME's
(stylesheet-extraction or planned-extraction; default deadline 2700 seconds).
Before selecting a paid run, compare inputs and historical limits in
tests/native-publication.md#proof-scheduling-scenarios-compare-inputs-before-launch.
EOF
}

host_arg=''
results_dir_arg=''
deadline_arg=2700
scenario_arg=''
native_flag=0
while [[ $# -gt 0 ]]; do
  case $1 in
    --native)
      native_flag=1
      host_arg=${2-}
      shift 2 || {
        usage
        exit 2
      }
      ;;
    --results-dir)
      results_dir_arg=${2-}
      shift 2 || {
        usage
        exit 2
      }
      ;;
    --scenario)
      scenario_arg=${2-}
      shift 2 || {
        usage
        exit 2
      }
      ;;
    --deadline)
      deadline_arg=${2-}
      shift 2 || {
        usage
        exit 2
      }
      ;;
    --help | -h)
      usage
      exit 0
      ;;
    *)
      usage
      exit 2
      ;;
  esac
done

if ((native_flag)); then
  case ${host_arg} in
    claude | codex | cursor) ;;
    *)
      usage
      exit 2
      ;;
  esac
  [[ ${deadline_arg} =~ ^[1-9][0-9]*$ ]] || {
    usage
    exit 2
  }
  if [[ -n ${scenario_arg} ]]; then
    delivery_evidence_case_has_scenario scheduling "${scenario_arg}" || {
      usage
      exit 2
    }
    delivery_evidence_only_scenario=${scenario_arg}
  fi
  native_case_deadline=${deadline_arg}
  run_native_host "${host_arg}" delivery-evidence/scheduling "${results_dir_arg}"
  exit
fi
if [[ -n ${results_dir_arg} || -n ${scenario_arg} ]]; then
  echo 'error: --results-dir and --scenario require --native' >&2
  usage
  exit 2
fi

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
cp -- "${source_dir}/tests/support/native-agent-proof-scheduling.sh" \
  "${work}/bin/claude"
chmod a+x "${work}/bin/claude"
export PATH="${work}/bin:${PATH}"
export NATIVE_AGENT_SENTINEL_LOG="${work}/sentinel.log"
export NATIVE_AGENT_SCHEDULING_SUPPORT="${source_dir}/tests/support"
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
grep -q '^input-hash: [0-9a-f]* tests/support/delivery-evidence-scheduling-native-proof-logger.sh$' \
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
