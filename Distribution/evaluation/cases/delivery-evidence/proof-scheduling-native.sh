#!/usr/bin/env bash
# Native scenarios for proof scheduling around an independent refactor
# (delivery-evidence/scheduling): a stylesheet change that foreseeably needs a
# file-size extraction, focused tests, and a whole dashboard suite that runs
# here in seconds. Scenario stylesheet-extraction is planless work under a
# stated fourteen-minute suite cost; planned-extraction is slice 1 of an
# executable plan with a required suite and no stated cost. Both address a
# coordinator who may implement locally; neither guarantees a historical
# delegated-implementer replay. Compare their inputs and retained outcomes in
# Distribution/tests/git-publication/native-publication.md#proof-scheduling-scenarios-compare-inputs-before-launch.
#
# Usage:
#   Distribution/evaluation/cases/delivery-evidence/proof-scheduling-native.sh
#   Distribution/evaluation/cases/delivery-evidence/proof-scheduling-native.sh --native HOST [--scenario NAME] [--results-dir DIR] [--deadline SECONDS]
#
# Default mode is credential-free: product-command checks of the fixture,
# controlled sequences observed through its own commands, the assessor's
# rejected cases, prompt and project-text leakage checks, and substitute-host
# runs through the shared delivery-evidence runner and retention. --native HOST (claude, codex
# or cursor) launches one paid fresh host session per scenario, or only
# --scenario NAME's; run it only when a human authorizes it.
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Sourced helper globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
# shellcheck source=Distribution/evaluation/cases/git-publication/git-publication-native-run.sh
source "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native-run.sh"
# shellcheck source=Distribution/evaluation/cases/git-publication/git-publication-native-host.sh
source "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native-host.sh"
# shellcheck source=Distribution/evaluation/cases/delivery-evidence/delivery-evidence-native-run.sh
source "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-native-run.sh"

usage() {
  cat >&2 << 'EOF'
usage: Distribution/evaluation/cases/delivery-evidence/proof-scheduling-native.sh
   or: Distribution/evaluation/cases/delivery-evidence/proof-scheduling-native.sh --native <claude|codex|cursor> [--scenario NAME] [--results-dir DIR] [--deadline SECONDS]
Credential-free by default. --native launches one paid host session per
delivery-evidence/scheduling scenario, or only --scenario NAME's
(stylesheet-extraction or planned-extraction; default deadline 2700 seconds).
Before selecting a paid run, compare inputs and historical limits in
Distribution/tests/git-publication/native-publication.md#proof-scheduling-scenarios-compare-inputs-before-launch.
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

exec bash "${source_dir}/Distribution/tests/delivery-evidence/proof-scheduling-native.sh"
