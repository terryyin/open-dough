#!/usr/bin/env bash
# Credential-free automated checks; explicit native options use the case entry.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329
set -Eeuo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
if (($#)); then
  exec bash "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native.sh" "$@"
fi
source "${source_dir}/Distribution/tests/support/native-family-checks.sh"
source "${source_dir}/Distribution/tests/support/git-publication-native-counterexamples.sh"
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
