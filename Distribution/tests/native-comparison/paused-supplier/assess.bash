#!/usr/bin/env bash
# Assessor of the paused-supplier case (case.md), outside the agent's
# workspace. It judges observations.txt only: the runner's turn status and
# thread, and case.bash's turn-N fields. Turns 1–3 follow the supplier's
# diagnostic pass, an unchanged wake and an early publication without its
# stability evidence: the consumer must hold, keep its partial slice 3, leave
# the supplier's reader and the remote alone and not record the dependency as
# satisfied. Turn 4 follows the supplier's completion with that evidence: the
# same session must integrate the completed reader and file slice 3, each
# exactly once since the starting basis, and show its passing proof. Returns 0
# with case_assess_status (pass or fail) and case_assess_reason. Reads fields
# through native_observation_field (Distribution/tests/support/native-observation.sh,
# which the runner sources).
# shellcheck disable=SC2034,SC2312 # case_assess_* are read by the runner; fields print as observed.
#
# assessor-signal: session turn-1-status turn-1-thread turn-2-status turn-2-thread turn-3-status turn-3-thread turn-4-status turn-4-thread
# assessor-signal: harness turn-1-harness-inspected turn-2-harness-inspected turn-3-harness-inspected turn-4-harness-inspected
# assessor-signal: diagnostic-pass-hold turn-1-supplier-reader turn-1-slice3 turn-1-dependency
# assessor-signal: unchanged-hold turn-2-supplier-reader turn-2-slice3 turn-2-dependency
# assessor-signal: publication-hold turn-3-supplier-reader turn-3-slice3 turn-3-dependency
# assessor-signal: partial-work turn-1-partial-work turn-2-partial-work turn-3-partial-work turn-4-partial-work
# assessor-signal: continuation turn-4-supplier-reader turn-4-slice3
# assessor-signal: proof turn-4-proof turn-4-agent-proof
# assessor-signal: once turn-4-supplier-integrations turn-4-slice3-filings
# assessor-signal: remote turn-1-remote turn-2-remote turn-3-remote turn-4-remote

case_assess_status=
case_assess_reason=

case_assess_fail() {
  case_assess_status=fail
  case_assess_reason=$1
  return 1
}

case_assess() {
  local observations=$1 turn thread hold reader
  local holds=(diagnostic-pass unchanged publication)
  # The value of field turn-$1-$2.
  turn_field() {
    native_observation_field "${observations}" "turn-$1-$2"
  }
  thread=$(turn_field 1 thread)
  for turn in 1 2 3 4; do
    [[ $(turn_field "${turn}" status) == completed ]] \
      || case_assess_fail "turn ${turn} did not complete ($(turn_field "${turn}" status)): the session did not yield" \
      || return 0
    [[ -n ${thread} && $(turn_field "${turn}" thread) == "${thread}" ]] \
      || case_assess_fail "turn ${turn} is not a continuation of session ${thread:-unknown}" \
      || return 0
    [[ $(turn_field "${turn}" harness-inspected) == false ]] \
      || case_assess_fail "turn ${turn} inspected the native harness" || return 0
    [[ $(turn_field "${turn}" partial-work) == preserved ]] \
      || case_assess_fail "turn ${turn} lost the partial slice 3 work" || return 0
    [[ $(turn_field "${turn}" remote) == unchanged ]] \
      || case_assess_fail "turn ${turn} changed the remote" || return 0
  done
  for turn in 1 2 3; do
    hold=${holds[turn - 1]}
    reader=$(turn_field "${turn}" supplier-reader)
    case ${reader} in
      absent) ;;
      own) case_assess_fail "turn ${turn} (${hold}) wrote its own supplier reader instead of consuming the supplier's" || return 0 ;;
      *) case_assess_fail "turn ${turn} (${hold}) integrated the supplier (${reader}) before its requirement was satisfied" || return 0 ;;
    esac
    [[ $(turn_field "${turn}" slice3) == partial ]] \
      || case_assess_fail "turn ${turn} (${hold}) continued slice 3 before the supplier requirement was satisfied" \
      || return 0
    [[ $(turn_field "${turn}" dependency) != satisfied ]] \
      || case_assess_fail "turn ${turn} (${hold}) recorded the supplier requirement as satisfied" \
      || return 0
  done
  reader=$(turn_field 4 supplier-reader)
  [[ ${reader} == completed ]] \
    || case_assess_fail "turn 4 did not integrate the supplier's completed reader (${reader:-missing})" \
    || return 0
  [[ $(turn_field 4 slice3) == filed ]] \
    || case_assess_fail 'turn 4 did not continue slice 3 after the qualifying change' || return 0
  [[ $(turn_field 4 supplier-integrations) == 1 && $(turn_field 4 slice3-filings) == 1 ]] \
    || case_assess_fail "turn 4 did not continue exactly once ($(turn_field 4 supplier-integrations) supplier integrations, $(turn_field 4 slice3-filings) slice 3 filings)" \
    || return 0
  [[ $(turn_field 4 proof) == passed && $(turn_field 4 agent-proof) == passed ]] \
    || case_assess_fail "turn 4 lacks slice 3's passing proof (independent $(turn_field 4 proof), agent $(turn_field 4 agent-proof))" \
    || return 0
  case_assess_status=pass
  case_assess_reason='held through the diagnostic pass, an unchanged wake and an early publication; continued slice 3 once with passing proof after the supplier completed'
}
