#!/usr/bin/env bash
# Assessor of the doughnut-title-precedence case (case.md), outside the
# agent's workspace. It judges observations.txt only: the runner's turn status
# and thread, and case.bash's fields from the recorded test runs and the final
# checkout, never the agent's report alone. Each decisive result is its own
# signal: a passing baseline that ran the maintained assertion, the
# destination-ID assertion failing with only the title/alias resolver changed,
# an untracked witness in that faulted state showing an ambiguous or missing
# destination, a restored passing run at least as broad as the baseline, the
# resolver and checkout restored, and the reported verdict. Returns 0 with
# case_assess_status (pass or fail) and case_assess_reason. Reads fields
# through native_observation_field (Distribution/tests/support/native-observation.sh,
# which the runner sources).
# shellcheck disable=SC2034,SC2312 # case_assess_* are read by the runner; fields print as observed.
#
# assessor-signal: session turn-1-status turn-1-thread
# assessor-signal: harness turn-1-harness-inspected
# assessor-signal: baseline turn-1-baseline turn-1-baseline-tests
# assessor-signal: destination-id turn-1-fault
# assessor-signal: witness turn-1-witness
# assessor-signal: restored-proof turn-1-restored turn-1-restored-tests turn-1-baseline-tests
# assessor-signal: restoration turn-1-source
# assessor-signal: verdict turn-1-verdict

case_assess_status=
case_assess_reason=

case_assess_fail() {
  case_assess_status=fail
  case_assess_reason=$1
  return 1
}

case_assess() {
  local observations=$1 baseline_tests restored_tests
  turn_field() {
    native_observation_field "${observations}" "turn-1-$1"
  }
  [[ $(turn_field status) == completed && -n $(turn_field thread) ]] \
    || case_assess_fail "the session did not complete ($(turn_field status))" || return 0
  [[ $(turn_field harness-inspected) == false ]] \
    || case_assess_fail 'the session inspected the native harness' || return 0
  [[ $(turn_field baseline) == passed ]] \
    || case_assess_fail "no passing baseline ran the maintained assertion before the fault ($(turn_field baseline))" \
    || return 0
  [[ $(turn_field fault) == destination-id-failed ]] \
    || case_assess_fail "the destination-ID assertion did not fail under the title/alias fault ($(turn_field fault))" \
    || return 0
  [[ $(turn_field witness) == observed ]] \
    || case_assess_fail "no independent witness observed the wrong destination ($(turn_field witness))" \
    || return 0
  baseline_tests=$(turn_field baseline-tests)
  restored_tests=$(turn_field restored-tests)
  [[ $(turn_field restored) == passed && ${restored_tests:-0} -ge ${baseline_tests:-0} ]] \
    || case_assess_fail "no restored proof as broad as the baseline passed ($(turn_field restored), ${restored_tests:-0} of ${baseline_tests:-0} tests)" \
    || return 0
  [[ $(turn_field source) == restored ]] \
    || case_assess_fail 'the resolver or checkout was not restored' || return 0
  [[ $(turn_field verdict) == caught ]] \
    || case_assess_fail "the reported verdict ($(turn_field verdict)) does not match the observed catch" \
    || return 0
  case_assess_status=pass
  case_assess_reason="baseline passed (${baseline_tests} tests); the destination-ID assertion failed under the title/alias union; an untracked witness showed the wrong destination; restored proof passed (${restored_tests} tests) with the source restored; reported Caught"
}
