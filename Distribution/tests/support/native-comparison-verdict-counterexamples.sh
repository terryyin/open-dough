#!/usr/bin/env bash
# Counterexamples of the pair judge (native-comparison-verdict.sh): from a
# passing pair observation, a baseline failure stays an outcome (improved, or
# neither-passed with the candidate's), and lower effort cannot make a missed
# decision or proof, unmatched or unknown conditions, an incomplete arm or a
# label instead of a frozen payload count as an equivalent outcome.
#
#   native_comparison_verdict_counterexamples PASSING SCRATCH
# shellcheck disable=SC1091,SC2154 # Sourced helpers; the judge leaves its verdict globals.

native_comparison_verdict_counterexamples_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "${native_comparison_verdict_counterexamples_dir}/native-assessor-counterexample.sh"

native_comparison_verdict_counterexamples() {
  local passing=$1 scratch=$2
  # A baseline's failure stays a comparison result: the outcome names it.
  sed 's/^baseline-assessment: passed$/baseline-assessment: failed/' "${passing}" > "${scratch}/improved"
  native_comparison_judge "${scratch}/improved"
  [[ ${native_comparison_verdict_outcome} == improved ]]
  sed 's/-assessment: passed$/-assessment: failed/' "${passing}" > "${scratch}/neither"
  native_comparison_judge "${scratch}/neither"
  [[ ${native_comparison_verdict_outcome} == neither-passed ]]

  # Lower effort cannot make a missed decision or proof, unmatched or unknown
  # conditions, an incomplete arm or a label instead of a frozen payload count
  # as an equivalent outcome.
  native_assessor_counterexamples \
    "${native_comparison_verdict_counterexamples_dir}/native-comparison-verdict.sh" "${passing}" \
    --verdict native_comparison_verdict_status native_comparison_verdict_reason -- native_comparison_judge
  native_assessor_rejects_field_rows << 'EOF'
cheaper-candidate-missed-proof candidate-outcome candidate-assessment: failed | lower effort cannot offset
candidate-without-assessment candidate-outcome candidate-assessment: missing | has no case assessment
incomplete-candidate completion candidate-complete: no | the candidate arm did not complete
incomplete-baseline completion baseline-complete: no | the baseline arm did not complete
mutable-candidate-label payloads candidate-payload: candidate | a label does not identify it
working-tree-baseline payloads baseline-payload: working-tree | a label does not identify it
changed-case-basis basis basis: differs | the case basis was not the same
other-project-state basis project-basis: differs | different project states
other-settings conditions settings: differs | settings were not matched
unknown-settings conditions settings: unavailable | settings were not matched (unavailable)
other-host conditions host: differs | host were not matched
other-events conditions events: differs | events were not matched
EOF
}
