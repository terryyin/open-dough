#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

# Rejected cases from controlled product sequences run through the fixture's
# own commands (delivery-evidence-scheduling-native-checks.sh), against the
# corrected sequence's observation, plus field edits for what no sequence
# below produces.
run_delivery_evidence_scheduling_assessor_counterexamples() {
  local work=$1
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-scheduling-native-assess.sh" "${work}/corrected.txt" \
    --verdict delivery_evidence_scheduling_status \
    delivery_evidence_scheduling_reason -- delivery_evidence_scheduling_verdict
  # The reproduced defect: the same final coverage after a broad run on the
  # pre-move state.
  native_assessor_rejects baseline redundancy "${work}/baseline.txt" \
    fail 'redundant broad run before the refactor move'
  # Final broad proof dropped, or only a stale pre-move green, or an
  # invocation that exited zero without observing the suite's tests, or a
  # filtered run that observed only some of them.
  native_assessor_rejects dropped-final final-coverage \
    "${work}/dropped-final.txt" fail 'required broad proof missing on the final state'
  native_assessor_rejects stale-pre-move final-coverage \
    "${work}/stale-pre-move.txt" fail 'required broad proof missing on the final state'
  native_assessor_rejects invocation-only final-coverage \
    "${work}/invocation-only.txt" fail 'required broad proof missing on the final state'
  native_assessor_rejects partial-suite final-coverage \
    "${work}/partial-suite.txt" fail 'required broad proof missing on the final state'
  # A broken stylesheet consumer fails its observation; accepting anyway
  # cannot pass.
  native_assessor_rejects broken-consumer final-observation \
    "${work}/broken-consumer.txt" fail 'accepted with a failing final observation'
  native_assessor_rejects no-targeted targeted "${work}/no-targeted.txt" \
    fail 'no passing focused implementation proof before the refactor'
  native_assessor_rejects_field_rows << 'EOF'
unaccepted acceptance acceptance: incomplete | final state not accepted
outcome-missing acceptance acceptance: missing | final state not accepted
EOF
  native_assessor_rejects_fields no-extraction extraction \
    'extraction-performed: false' -- inconclusive 'did not reach its boundary'
  native_assessor_rejects_fields upfront-extraction upfront \
    'extraction-in-implementation: true' -- inconclusive 'move boundary was not reached'
  native_assessor_rejects_missing_fields << 'EOF'
final-coverage final-broad-coverage
redundancy broad-runs-before-move
final-observation final-observed-suite
targeted targeted-proof-before-refactor
upfront extraction-in-implementation
acceptance acceptance
EOF
}
