#!/usr/bin/env bash
# One ordinary execution turn with the supplier already complete. Judge the
# observed integration, preserved work and executed proof, never response prose.
# shellcheck disable=SC2034,SC2312 # Assessor fields are read by the runner.
# assessor-signal: session turn-1-status turn-1-thread
# assessor-signal: harness turn-1-harness-inspected
# assessor-signal: partial-work turn-1-partial-work
# assessor-signal: continuation turn-1-supplier-reader turn-1-slice3
# assessor-signal: proof turn-1-proof turn-1-agent-proof
# assessor-signal: once turn-1-supplier-integrations turn-1-slice3-filings
# assessor-signal: remote turn-1-remote
case_assess_status=
case_assess_reason=
case_assess_fail() {
  case_assess_status=fail
  case_assess_reason=$1
  return 1
}
case_assess() {
  local observations=$1
  unblocked_field() { native_observation_field "${observations}" "turn-1-$1"; }
  [[ $(unblocked_field status) == completed && -n $(unblocked_field thread) ]] \
    || case_assess_fail 'the ordinary execution turn did not complete in a session' || return 0
  [[ $(unblocked_field harness-inspected) == false ]] \
    || case_assess_fail 'the execution inspected the native harness' || return 0
  [[ $(unblocked_field partial-work) == preserved ]] \
    || case_assess_fail "the execution lost or rerouted the partial work ($(unblocked_field partial-work))" || return 0
  [[ $(unblocked_field remote) == unchanged ]] \
    || case_assess_fail 'the execution changed the remote' || return 0
  [[ $(unblocked_field supplier-reader) == completed ]] \
    || case_assess_fail "the execution did not integrate the supplier's completed reader ($(unblocked_field supplier-reader))" || return 0
  [[ $(unblocked_field slice3) == filed ]] \
    || case_assess_fail 'the execution did not finish filing slice 3' || return 0
  [[ $(unblocked_field supplier-integrations) == 1 && $(unblocked_field slice3-filings) == 1 ]] \
    || case_assess_fail "the execution did not continue exactly once ($(unblocked_field supplier-integrations) supplier integrations, $(unblocked_field slice3-filings) slice 3 filings)" || return 0
  [[ $(unblocked_field proof) == passed && $(unblocked_field agent-proof) == passed ]] \
    || case_assess_fail "the execution lacks passing proof (independent $(unblocked_field proof), agent $(unblocked_field agent-proof))" || return 0
  case_assess_status=pass
  case_assess_reason='integrated the completed supplier once, finished the preserved partial slice and showed passing independent and executed proof in one ordinary turn'
}
