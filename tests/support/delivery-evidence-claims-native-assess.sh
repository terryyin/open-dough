#!/usr/bin/env bash
# Claims-evidence observation assessor and credential-free counterexamples.
# Each rejected case changes one signal, declared beside the assessor, of a
# passing observation (tests/support/native-assessor-counterexample.sh).
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

delivery_evidence_claims_write_obs() {
  local path=$1
  shift
  {
    printf '%s\n' "$@"
  } > "${path}"
}

run_delivery_evidence_claims_assessor_counterexamples() {
  local work
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN

  # Naming the required behavior without calling it covered passes. Telling
  # the developer it is covered, accepting it while still unsupported, or
  # leaving the required behavior unreturned does not.
  delivery_evidence_claims_write_obs "${work}/unsupported-incomplete.txt" \
    'scenario: unsupported-claim' \
    'promise-accepted: false' \
    'relayed-covered: false' \
    'required-behavior-returned: true' \
    'product-no-link: false' \
    'assertion-observes-no-link: false' \
    'format-resend-required: false' \
    'instruction-words-only: false'
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/unsupported-incomplete.txt" -- delivery_evidence_claims_assess
  native_assessor_rejects_field_rows << 'EOF'
unsupported-covered relayed relayed-covered: true
unsupported-accept accepted promise-accepted: true
unsupported-unreturned required-behavior required-behavior-returned: false
EOF
  # Each required field, deleted alone, cannot pass.
  native_assessor_rejects_missing_fields << 'EOF'
required-behavior required-behavior-returned
product product-no-link
assertion assertion-observes-no-link
format-resend format-resend-required
EOF

  # Accept after correction: product and observing assertion agree.
  delivery_evidence_claims_write_obs "${work}/unsupported-corrected.txt" \
    'scenario: unsupported-claim' \
    'promise-accepted: true' \
    'relayed-covered: false' \
    'required-behavior-returned: true' \
    'product-no-link: true' \
    'assertion-observes-no-link: true' \
    'format-resend-required: false' \
    'instruction-words-only: false'
  delivery_evidence_claims_assess "${work}/unsupported-corrected.txt"

  # A corrected no-link observation passes; without the observing assertion,
  # or on instruction words or a green exit alone, it does not.
  delivery_evidence_claims_write_obs "${work}/corrected.txt" \
    'scenario: corrected-no-link' \
    'promise-accepted: true' \
    'relayed-covered: false' \
    'required-behavior-returned: false' \
    'product-no-link: true' \
    'assertion-observes-no-link: true' \
    'format-resend-required: false' \
    'instruction-words-only: false'
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/corrected.txt" -- delivery_evidence_claims_assess
  native_assessor_rejects_field_rows << 'EOF'
corrected-no-assertion assertion assertion-observes-no-link: false
words-only instruction-words instruction-words-only: true
EOF

  # An equivalent substantiated layout passes without a formatting-only
  # resend; demanding one, or leaving the promise unaccepted, does not. A
  # returned required behavior alone is no rejection: the observer reads any
  # mention of an observing assertion as one, and this scenario does not
  # judge it.
  delivery_evidence_claims_write_obs "${work}/equivalent.txt" \
    'scenario: equivalent-layout' \
    'promise-accepted: true' \
    'relayed-covered: false' \
    'required-behavior-returned: false' \
    'product-no-link: true' \
    'assertion-observes-no-link: true' \
    'format-resend-required: false' \
    'instruction-words-only: false'
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/equivalent.txt" -- delivery_evidence_claims_assess
  native_assessor_rejects_field_rows << 'EOF'
equivalent-resend format-resend format-resend-required: true
equivalent-unaccepted accepted promise-accepted: false
EOF

  # Observer reads a status that opens its line, and a leading incomplete
  # status still wins over later accepted words.
  # shellcheck disable=SC2016 # Backticks are literal outcome text.
  printf '%s\n' '- **Accepted — Promise 1: Bare `#anchor` targets are not followable.**' \
    'No promises remain incomplete.' > "${work}/outcome-leading.md"
  [[ $(delivery_evidence_claims_promise_accepted \
    "${work}/outcome-leading.md" '') == true ]]
  printf '%s\n' '**Incomplete — Promise 1: bare anchor still followable.**' \
    'Other checks: accepted.' > "${work}/outcome-leading-incomplete.md"
  [[ $(delivery_evidence_claims_promise_accepted \
    "${work}/outcome-leading-incomplete.md" '') == false ]]
}
