#!/usr/bin/env bash
# Consumers-evidence observation assessor and credential-free counterexamples.
# Each rejected case changes one signal, declared beside the assessor, of a
# passing observation (Distribution/tests/support/native-assessor-counterexample.sh).
# Prefers structured fixture observations; green exit or instruction words alone
# cannot pass. Does not exercise native skill prose.
# shellcheck disable=SC2034,SC2154,SC2312

# Signals for rejected cases, one observed field each:
# assessor-signal: scenario scenario
# assessor-signal: accepted promise-accepted
# assessor-signal: stale-exclusion accepted-on-stale-exclusion
# assessor-signal: required-gap required-gap-returned
# assessor-signal: consumer-aligned consumer-aligned
# assessor-signal: compat-present compat-assertion-present
# assessor-signal: compat-executed compat-assertion-executed
# assessor-signal: unrelated-boundary unrelated-boundary-unchanged
# assessor-signal: unrelated-proof unrelated-proof-retained
# assessor-signal: instruction-words instruction-words-only

# Returns 0 when observations show consumer acceptance honored supporting evidence.
delivery_evidence_consumers_assess() {
  local observations=$1
  local scenario accepted stale gap aligned compat_present compat_executed \
    unrelated proof_retained instruction
  scenario=$(delivery_evidence_obs_get scenario "${observations}")
  accepted=$(delivery_evidence_obs_get promise-accepted \
    "${observations}")
  stale=$(delivery_evidence_obs_get accepted-on-stale-exclusion \
    "${observations}")
  gap=$(delivery_evidence_obs_get required-gap-returned \
    "${observations}")
  aligned=$(delivery_evidence_obs_get consumer-aligned \
    "${observations}")
  compat_present=$(delivery_evidence_obs_get \
    compat-assertion-present "${observations}")
  compat_executed=$(delivery_evidence_obs_get \
    compat-assertion-executed "${observations}")
  unrelated=$(delivery_evidence_obs_get \
    unrelated-boundary-unchanged "${observations}")
  proof_retained=$(delivery_evidence_obs_get \
    unrelated-proof-retained "${observations}")
  instruction=$(delivery_evidence_obs_get instruction-words-only \
    "${observations}")

  [[ -n ${scenario} && -n ${accepted} && -n ${stale} && -n ${gap} &&
    -n ${aligned} && -n ${compat_present} && -n ${compat_executed} &&
    -n ${unrelated} && -n ${proof_retained} && -n ${instruction} ]] \
    || return 1
  [[ ${instruction} == false ]] || return 1

  case ${scenario} in
    changed-contract)
      # Must not accept solely on the stale unaffected-suite claim.
      [[ ${stale} == false ]] || return 1
      if [[ ${accepted} == true ]]; then
        [[ ${aligned} == true && ${compat_present} == true &&
          ${compat_executed} == true && ${gap} == true ]]
        return $?
      fi
      # Incomplete naming of the consumer/contract gap is acceptable.
      [[ ${accepted} == false && ${gap} == true ]]
      ;;
    corrected-consumer)
      [[ ${stale} == false ]] || return 1
      [[ ${aligned} == true && ${compat_present} == true ]] || return 1
      [[ ${compat_executed} == true ]] || return 1
      [[ ${accepted} == true ]]
      ;;
    unchanged-boundary)
      [[ ${unrelated} == true && ${proof_retained} == true ]] || return 1
      [[ ${accepted} == true && ${stale} == false ]]
      ;;
    *) return 2 ;;
  esac
}
