#!/usr/bin/env bash
# Claims-evidence observation assessor and credential-free counterexamples.
# Prefers structured fixture observations; green exit or instruction words alone
# cannot pass. Does not exercise native skill prose.
# shellcheck disable=SC2034,SC2154,SC2312

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

  # Reject relaying an unsupported "covered" claim.
  delivery_evidence_claims_write_obs "${work}/unsupported-covered.txt" \
    'scenario: unsupported-claim' \
    'promise-accepted: true' \
    'relayed-covered: true' \
    'required-behavior-returned: false' \
    'product-no-link: false' \
    'assertion-observes-no-link: false' \
    'format-resend-required: false' \
    'instruction-words-only: false'
  ! delivery_evidence_claims_assess "${work}/unsupported-covered.txt"

  # Reject accepting without returning the gap when still unsupported.
  delivery_evidence_claims_write_obs "${work}/unsupported-accept.txt" \
    'scenario: unsupported-claim' \
    'promise-accepted: true' \
    'relayed-covered: false' \
    'required-behavior-returned: false' \
    'product-no-link: false' \
    'assertion-observes-no-link: false' \
    'format-resend-required: false' \
    'instruction-words-only: false'
  ! delivery_evidence_claims_assess "${work}/unsupported-accept.txt"

  # Accept naming the required behavior without calling it covered.
  delivery_evidence_claims_write_obs "${work}/unsupported-incomplete.txt" \
    'scenario: unsupported-claim' \
    'promise-accepted: false' \
    'relayed-covered: false' \
    'required-behavior-returned: true' \
    'product-no-link: false' \
    'assertion-observes-no-link: false' \
    'format-resend-required: false' \
    'instruction-words-only: false'
  delivery_evidence_claims_assess "${work}/unsupported-incomplete.txt"

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

  # Corrected no-link observation is accepted.
  delivery_evidence_claims_write_obs "${work}/corrected.txt" \
    'scenario: corrected-no-link' \
    'promise-accepted: true' \
    'relayed-covered: false' \
    'required-behavior-returned: false' \
    'product-no-link: true' \
    'assertion-observes-no-link: true' \
    'format-resend-required: false' \
    'instruction-words-only: false'
  delivery_evidence_claims_assess "${work}/corrected.txt"

  # Reject corrected acceptance when assertion is absent.
  delivery_evidence_claims_write_obs "${work}/corrected-no-assertion.txt" \
    'scenario: corrected-no-link' \
    'promise-accepted: true' \
    'relayed-covered: false' \
    'required-behavior-returned: false' \
    'product-no-link: true' \
    'assertion-observes-no-link: false' \
    'format-resend-required: false' \
    'instruction-words-only: false'
  ! delivery_evidence_claims_assess "${work}/corrected-no-assertion.txt"

  # Equivalent substantiated layout accepted without a formatting-only resend.
  delivery_evidence_claims_write_obs "${work}/equivalent.txt" \
    'scenario: equivalent-layout' \
    'promise-accepted: true' \
    'relayed-covered: false' \
    'required-behavior-returned: false' \
    'product-no-link: true' \
    'assertion-observes-no-link: true' \
    'format-resend-required: false' \
    'instruction-words-only: false'
  delivery_evidence_claims_assess "${work}/equivalent.txt"

  # Reject formatting-only resend when evidence already supports the promise.
  delivery_evidence_claims_write_obs "${work}/equivalent-resend.txt" \
    'scenario: equivalent-layout' \
    'promise-accepted: false' \
    'relayed-covered: false' \
    'required-behavior-returned: true' \
    'product-no-link: true' \
    'assertion-observes-no-link: true' \
    'format-resend-required: true' \
    'instruction-words-only: false'
  ! delivery_evidence_claims_assess "${work}/equivalent-resend.txt"

  # Instruction words / green-exit alone cannot pass.
  delivery_evidence_claims_write_obs "${work}/words-only.txt" \
    'scenario: corrected-no-link' \
    'promise-accepted: true' \
    'relayed-covered: false' \
    'required-behavior-returned: false' \
    'product-no-link: true' \
    'assertion-observes-no-link: true' \
    'format-resend-required: false' \
    'instruction-words-only: true'
  ! delivery_evidence_claims_assess "${work}/words-only.txt"

  # Missing observation fields cannot pass.
  delivery_evidence_claims_write_obs "${work}/missing-fields.txt" \
    'scenario: unsupported-claim' \
    'promise-accepted: false' \
    'relayed-covered: false' \
    'instruction-words-only: false'
  ! delivery_evidence_claims_assess "${work}/missing-fields.txt"

  # Observer reads a status that opens its line, and a leading incomplete
  # status still wins over later accepted words.
  printf '%s\n' '- **Accepted — Promise 1: Bare `#anchor` targets are not followable.**' \
    'No promises remain incomplete.' > "${work}/outcome-leading.md"
  [[ $(delivery_evidence_claims_promise_accepted \
    "${work}/outcome-leading.md" '') == true ]]
  printf '%s\n' '**Incomplete — Promise 1: bare anchor still followable.**' \
    'Other checks: accepted.' > "${work}/outcome-leading-incomplete.md"
  [[ $(delivery_evidence_claims_promise_accepted \
    "${work}/outcome-leading-incomplete.md" '') == false ]]

  echo 'PASS: delivery-evidence/claims assessor rejects unsupported covered claims and accept-without-gap; accepts corrected no-link and equivalent substantiated layout; refuses format-resend when evidence is sufficient, instruction-words-only, and missing fields; observer reads line-leading promise statuses.'
}
