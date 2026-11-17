#!/usr/bin/env bash
# Assessor of the launch-command-tests case (case.md, Assessment), outside the
# agent's workspace. It applies the automatic part of the basis to the fields
# case.bash and case-probes.bash observed on the final workspace, never to the
# agent's report: the owning proof passes, the unrelated perturbation leaves
# the consumer and the ad-hoc boundary green, each promise fault turns its
# owning spec red, and the probes restored the workspace. Mixed cases,
# branches, witnesses, reader guarantees and the report's claims stay with
# ordinary review. Leaves case_assess_status and case_assess_reason for the
# runner; reads fields through native_observation_field.
# shellcheck disable=SC2034,SC2312 # case_assess_* are read by the runner; fields print as observed.
#
# assessor-signal: session turn-1-status
# assessor-signal: owning-proof turn-1-backend turn-1-e2e
# assessor-signal: perturbation turn-1-perturbation-e2e turn-1-perturbation-ad-hoc
# assessor-signal: name-owner turn-1-fault-name
# assessor-signal: instruction-owner turn-1-fault-instruction
# assessor-signal: default-owner turn-1-fault-default
# assessor-signal: restoration turn-1-probes-restored

case_assess_status=
case_assess_reason=

case_assess_fail() {
  case_assess_status=fail
  case_assess_reason=$1
  return 1
}

case_assess() {
  local observations=$1
  turn_field() {
    native_observation_field "${observations}" "turn-1-$1"
  }
  [[ $(turn_field status) == completed ]] \
    || case_assess_fail "the session did not complete ($(turn_field status))" || return 0
  [[ $(turn_field backend) == passed && $(turn_field e2e) == passed ]] \
    || case_assess_fail "the owning proof does not pass (backend $(turn_field backend), e2e $(turn_field e2e))" \
    || return 0
  [[ $(turn_field perturbation-e2e) == green && $(turn_field perturbation-ad-hoc) == green ]] \
    || case_assess_fail "an unrelated default perturbation broke the launch tests (e2e $(turn_field perturbation-e2e), ad hoc $(turn_field perturbation-ad-hoc))" \
    || return 0
  [[ $(turn_field fault-name) == red ]] \
    || case_assess_fail "a wrong launch name left its owning spec $(turn_field fault-name)" || return 0
  [[ $(turn_field fault-instruction) == red ]] \
    || case_assess_fail "a prompt on a blank launch left its owning consumer $(turn_field fault-instruction)" \
    || return 0
  [[ $(turn_field fault-default) == red ]] \
    || case_assess_fail "a wrong default effort left its dedicated proof $(turn_field fault-default)" || return 0
  [[ $(turn_field probes-restored) == true ]] \
    || case_assess_fail 'the probes did not restore the final workspace' || return 0
  case_assess_status=pass
  case_assess_reason='owning proof passed; the unrelated perturbation left the launch tests green; wrong name, blank-launch prompt and wrong default each failed their owner; workspace restored'
}
