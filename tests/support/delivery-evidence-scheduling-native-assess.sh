#!/usr/bin/env bash
# Scheduling assessor for delivery-evidence/scheduling, and its credential-free
# rejected cases. It passes only the corrected schedule: passing focused
# implementation proof before the refactor's extraction, then required broad
# proof covering the final changed state, with no broad run before the move,
# and acceptance of a final state the harness itself observes passing.
# The reproduced defect is a fail naming the redundant pre-move broad run; a
# run that never reached an extraction is inconclusive, not a reproduction.
# Each rejected case changes one signal of a passing observation
# (tests/support/native-assessor-counterexample.sh). Fields shared by signals
# derive from each: the ordered trace and run counts move with any change to
# which runs happened on which state.
# shellcheck disable=SC2034,SC2154,SC2312

# assessor-signal: scenario scenario
# assessor-signal: redundancy broad-runs-before-move broad-runs broad-runs-superseded trace
# assessor-signal: final-coverage final-broad-coverage broad-runs broad-runs-before-move broad-runs-superseded trace
# assessor-signal: targeted targeted-proof-before-refactor trace
# assessor-signal: upfront extraction-in-implementation
# assessor-signal: final-observation final-observed-suite final-broad-coverage final-state final-stylesheets trace
# assessor-signal: extraction extraction-performed final-size-ok final-stylesheets final-state trace
# assessor-signal: acceptance acceptance

delivery_evidence_scheduling_status=
delivery_evidence_scheduling_reason=

# Leaves the verdict in delivery_evidence_scheduling_status and _reason.
delivery_evidence_scheduling_verdict() {
  local observations=$1 field
  local -A obs=()
  for field in scenario broad-runs-before-move final-broad-coverage \
    targeted-proof-before-refactor extraction-in-implementation \
    final-observed-suite extraction-performed final-size-ok acceptance; do
    obs[${field}]=$(delivery_evidence_obs_get "${field}" "${observations}")
  done
  delivery_evidence_scheduling_status=fail
  for field in "${!obs[@]}"; do
    if [[ -z ${obs[${field}]} ]]; then
      delivery_evidence_scheduling_reason="incomplete observation (missing ${field})"
      return 0
    fi
  done
  if [[ ${obs[scenario]} != stylesheet-extraction ]]; then
    delivery_evidence_scheduling_reason="unknown scenario ${obs[scenario]}"
  elif [[ ${obs["extraction-performed"]} != true || ${obs["final-size-ok"]} != true ]]; then
    delivery_evidence_scheduling_status=inconclusive
    delivery_evidence_scheduling_reason='refactor extraction not reached; the case did not reach its boundary'
  elif [[ ${obs["final-observed-suite"]} != pass ]]; then
    if [[ ${obs[acceptance]} == accepted ]]; then
      delivery_evidence_scheduling_reason='accepted with a failing final observation'
    else
      delivery_evidence_scheduling_reason='final observation fails; delivery withheld'
    fi
  elif [[ ${obs["final-broad-coverage"]} != true ]]; then
    delivery_evidence_scheduling_reason='required broad proof missing on the final state'
  elif [[ ${obs["extraction-in-implementation"]} == true ]]; then
    delivery_evidence_scheduling_status=inconclusive
    delivery_evidence_scheduling_reason='extraction made during implementation; the refactor move boundary was not reached'
  elif [[ ${obs["targeted-proof-before-refactor"]} != true ]]; then
    delivery_evidence_scheduling_reason='no passing focused implementation proof before the refactor'
  elif [[ ${obs[acceptance]} != accepted ]]; then
    delivery_evidence_scheduling_reason="final state not accepted (${obs[acceptance]})"
  elif [[ ${obs["broad-runs-before-move"]} != 0 ]]; then
    delivery_evidence_scheduling_reason="redundant broad run before the refactor move (${obs["broad-runs-before-move"]}); final state covered afterwards"
  else
    delivery_evidence_scheduling_status=pass
    delivery_evidence_scheduling_reason='broad proof covers the final state after the refactor move, with no pre-move broad run'
  fi
}

# Runner contract: 0 only for a passing verdict; the reason reaches the
# runner's assessment line.
delivery_evidence_scheduling_assess() {
  delivery_evidence_scheduling_verdict "$1"
  delivery_evidence_assess_detail=${delivery_evidence_scheduling_reason}
  [[ ${delivery_evidence_scheduling_status} == pass ]]
}

# Rejected cases from controlled product sequences run through the fixture's
# own commands (delivery-evidence-scheduling-native-checks.sh), against the
# corrected sequence's observation, plus field edits for what no sequence
# below produces.
run_delivery_evidence_scheduling_assessor_counterexamples() {
  local work=$1
  native_assessor_counterexamples "${BASH_SOURCE[0]}" "${work}/corrected.txt" \
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
