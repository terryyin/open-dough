#!/usr/bin/env bash
# Native proof for the installed Git publication contract.
#
# Usage:
#   Distribution/tests/git-publication-native.sh
#   Distribution/tests/git-publication-native.sh --native codex
#   Distribution/tests/git-publication-native.sh --native cursor
#   Distribution/tests/git-publication-native.sh --native claude
#   Distribution/tests/git-publication-native.sh --native HOST --case CASE
#
# Default mode is credential-free: assessor counterexamples through the shared
# supervisor/stream/retention path. Substitute publish-boundary and remaining
# host journeys run in Distribution/tests/git-publication-native-substitutes.sh;
# one-shot substitutes in Distribution/tests/git-publication-native-one-shot.sh;
# owned-context in Distribution/tests/git-publication-native-owned-context.sh;
# admission in Distribution/tests/git-publication-native-admission.sh.
# --native HOST launches a fresh host session against an installed publication
# candidate.
# shellcheck disable=SC2312
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
# shellcheck source=Distribution/tests/support/git-publication-native-assess.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/support/git-publication-native-assess.sh"
# shellcheck source=Distribution/tests/support/git-publication-native-run.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/support/git-publication-native-run.sh"
# shellcheck source=Distribution/tests/support/git-publication-native-suites.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/support/git-publication-native-suites.sh"
# shellcheck source=Distribution/tests/support/git-publication-native-counterexamples.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/support/git-publication-native-counterexamples.sh"
# shellcheck source=Distribution/tests/support/git-publication-native-host.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/support/git-publication-native-host.sh"
# shellcheck source=Distribution/tests/support/ci-completion-native-run.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/support/ci-completion-native-run.sh"
# shellcheck source=Distribution/tests/support/trunk-closure-native-run.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/support/trunk-closure-native-run.sh"
# shellcheck source=Distribution/tests/support/story-branch-closure-native-run.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/support/story-branch-closure-native-run.sh"
# shellcheck source=Distribution/tests/support/delivery-evidence-native-run.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/support/delivery-evidence-native-run.sh"

usage() {
  cat >&2 << 'EOF'
usage: Distribution/tests/git-publication-native.sh
   or: Distribution/tests/git-publication-native.sh --native <codex|cursor|claude>
   or: Distribution/tests/git-publication-native.sh --native HOST --case publication/JOURNEY
   or: Distribution/tests/git-publication-native.sh --native HOST --case publication/admission-investigation|admission-continuation|admission-correction|admission-closure
   or: Distribution/tests/git-publication-native.sh --native HOST --case publication/one-shot-result|one-shot-queued|one-shot-escalation|one-shot-review
   or: Distribution/tests/git-publication-native.sh --native HOST --case publication/one-shot-default-main|one-shot-auto-land|one-shot-auto-land-blocked|one-shot-established
   or: Distribution/tests/git-publication-native.sh --native HOST --case preparation/one-shot-refinement|one-shot-refinement-auto-land
   or: Distribution/tests/git-publication-native.sh --native HOST --case publication/startup-owned-context|preparation-land|land-default-checkout
   or: Distribution/tests/git-publication-native.sh --native codex --case story-branch-increment
   or: Distribution/tests/git-publication-native.sh --native HOST --case execution-review/pending|ready|failure|skip-retro
   or: Distribution/tests/git-publication-native.sh --native HOST --case trunk-closure/source|ignored-only|owned-context
   or: Distribution/tests/git-publication-native.sh --native HOST --case story-branch-closure/source-conflict
   or: Distribution/tests/git-publication-native.sh --native HOST --case delivery-evidence/selection
   or: Distribution/tests/git-publication-native.sh --native HOST --case delivery-evidence/claims
   or: Distribution/tests/git-publication-native.sh --native HOST --case delivery-evidence/consumers
   or: Distribution/tests/git-publication-native.sh --native HOST --case delivery-evidence/deferred
   or: Distribution/tests/git-publication-native.sh --native HOST --case delivery-evidence/nostore
   or: Distribution/tests/git-publication-native.sh --native HOST --case delivery-evidence/aggregate
   or: Distribution/tests/git-publication-native.sh --native HOST --case delivery-evidence/gaps
   or: Distribution/tests/git-publication-native.sh --native HOST --case delivery-evidence/original
   or: Distribution/tests/git-publication-native.sh --native HOST --case delivery-evidence/terminal
   or: Distribution/tests/git-publication-native.sh --native HOST --case delivery-evidence/release
   or: Distribution/tests/git-publication-native.sh --native HOST --case delivery-evidence/scheduling
   or: Distribution/tests/git-publication-native.sh --native HOST --case delivery-evidence/amended
   or: … --results-dir DIR  (with --native; retains inspectable observations)
Credential-free default exercises the publication assessor counterexamples.
Substitute host journeys run in Distribution/tests/git-publication-native-substitutes.sh.
--native HOST requires that host's CLI and runs the host's assigned
fresh-proof journeys against an installed candidate. --case selects one live
journey and rejects unknown cases before fixture setup.
EOF
}

native_flag=0
host_arg=''
case_arg=''
results_dir_arg=''

while [[ $# -gt 0 ]]; do
  case $1 in
    --native)
      native_flag=1
      shift
      ;;
    --case)
      if [[ $# -lt 2 ]]; then
        echo 'error: missing --case value' >&2
        usage
        exit 2
      fi
      case_arg=$2
      shift 2
      ;;
    --results-dir)
      if [[ $# -lt 2 ]]; then
        echo 'error: missing --results-dir value' >&2
        usage
        exit 2
      fi
      results_dir_arg=$2
      shift 2
      ;;
    --help | -h)
      usage
      exit 0
      ;;
    --*)
      echo "error: unknown option $1" >&2
      usage
      exit 2
      ;;
    *)
      if [[ -n ${host_arg} ]]; then
        echo "error: unexpected argument $1" >&2
        usage
        exit 2
      fi
      host_arg=$1
      shift
      ;;
  esac
done

if [[ ${native_flag} -eq 0 ]]; then
  if [[ -n ${host_arg} || -n ${case_arg} || -n ${results_dir_arg} ]]; then
    echo 'error: a host, --case, and --results-dir require --native' >&2
    usage
    exit 2
  fi
  run_assessor_counterexamples
  run_trunk_closure_assessor_counterexamples
  run_story_closure_assessor_counterexamples
  run_ci_completion_assessor_counterexamples
  run_story_closure_observer_counterexamples
  run_ci_completion_observer_counterexamples
  run_native_harness_counterexamples
  run_story_closure_harness_counterexamples
  run_delivery_evidence_selection_assessor_counterexamples
  run_delivery_evidence_selection_observer_counterexamples
  run_delivery_evidence_claims_assessor_counterexamples
  run_delivery_evidence_consumers_assessor_counterexamples
  run_delivery_evidence_aggregate_checks
  run_delivery_evidence_nostore_checks
  run_delivery_evidence_deferred_checks
  run_delivery_evidence_gaps_assessor_counterexamples
  run_delivery_evidence_gaps_observer_counterexamples
  run_delivery_evidence_observer_layout_counterexamples
  run_admission_assessor_counterexamples
  exit 0
fi

if [[ ${host_arg} != codex && ${host_arg} != cursor && ${host_arg} != claude ]]; then
  echo "error: unsupported or missing host '${host_arg}' (known: codex, cursor, claude)" >&2
  usage
  exit 2
fi

if [[ -n ${case_arg} ]] && ! native_case_known "${case_arg}"; then
  echo "error: unknown native case '${case_arg}'" >&2
  usage
  exit 2
fi

run_native_host "${host_arg}" "${case_arg}" "${results_dir_arg}"
