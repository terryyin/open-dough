#!/usr/bin/env bash
# Claims-evidence observation assessor and credential-free counterexamples.
# Each rejected case changes one signal, declared beside the assessor, of a
# passing observation (Distribution/tests/support/native-assessor-counterexample.sh).
# Prefers structured fixture observations; green exit or instruction words alone
# cannot pass. Does not exercise native skill prose.
# shellcheck disable=SC2034,SC2154,SC2312

# Signals for rejected cases, one observed field each:
# assessor-signal: scenario scenario
# assessor-signal: accepted promise-accepted
# assessor-signal: relayed relayed-covered
# assessor-signal: required-behavior required-behavior-returned
# assessor-signal: product product-no-link
# assessor-signal: assertion assertion-observes-no-link
# assessor-signal: format-resend format-resend-required
# assessor-signal: instruction-words instruction-words-only

# Returns 0 when observations show claim acceptance honored supporting evidence.
delivery_evidence_claims_assess() {
  local observations=$1
  local scenario accepted relayed required product_ok assertion_ok format_resend instruction
  scenario=$(delivery_evidence_obs_get scenario "${observations}")
  accepted=$(delivery_evidence_obs_get promise-accepted "${observations}")
  relayed=$(delivery_evidence_obs_get relayed-covered "${observations}")
  required=$(delivery_evidence_obs_get required-behavior-returned \
    "${observations}")
  product_ok=$(delivery_evidence_obs_get product-no-link "${observations}")
  assertion_ok=$(delivery_evidence_obs_get assertion-observes-no-link \
    "${observations}")
  format_resend=$(delivery_evidence_obs_get format-resend-required \
    "${observations}")
  instruction=$(delivery_evidence_obs_get instruction-words-only \
    "${observations}")

  [[ -n ${scenario} && -n ${accepted} && -n ${relayed} && -n ${required} &&
    -n ${product_ok} && -n ${assertion_ok} && -n ${format_resend} &&
    -n ${instruction} ]] || return 1
  [[ ${instruction} == false ]] || return 1

  case ${scenario} in
    unsupported-claim)
      # Must not tell the developer the unsupported claim is covered.
      [[ ${relayed} == false ]] || return 1
      # Either return the required behavior as incomplete, or accept only after
      # product and observing assertion agree on no-link.
      if [[ ${accepted} == true ]]; then
        [[ ${product_ok} == true && ${assertion_ok} == true &&
          ${required} == true ]]
        return $?
      fi
      [[ ${accepted} == false && ${required} == true ]]
      ;;
    corrected-no-link)
      [[ ${relayed} == false ]] || return 1
      [[ ${product_ok} == true && ${assertion_ok} == true ]] || return 1
      [[ ${accepted} == true && ${format_resend} == false ]]
      ;;
    equivalent-layout)
      # Sufficient control: same valid observation in equivalent prose is
      # accepted without a formatting-only resend. Optional coordinator
      # verification of the named command does not fail this control.
      [[ ${relayed} == false ]] || return 1
      [[ ${product_ok} == true && ${assertion_ok} == true ]] || return 1
      [[ ${accepted} == true && ${format_resend} == false ]]
      ;;
    *) return 2 ;;
  esac
}
