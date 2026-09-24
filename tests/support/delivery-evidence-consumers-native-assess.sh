#!/usr/bin/env bash
# Consumers-evidence observation assessor and credential-free counterexamples.
# Prefers structured fixture observations; green exit or instruction words alone
# cannot pass. Does not exercise native skill prose.
# shellcheck disable=SC2034,SC2154,SC2312

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

delivery_evidence_consumers_write_obs() {
  local path=$1
  shift
  {
    printf '%s\n' "$@"
  } > "${path}"
}

run_delivery_evidence_consumers_assessor_counterexamples() {
  local work
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN

  # Reject accepting solely on the stale unaffected-suite exclusion.
  delivery_evidence_consumers_write_obs "${work}/stale-accept.txt" \
    'scenario: changed-contract' \
    'promise-accepted: true' \
    'accepted-on-stale-exclusion: true' \
    'required-gap-returned: false' \
    'consumer-aligned: false' \
    'compat-assertion-present: false' \
    'compat-assertion-executed: false' \
    'unrelated-boundary-unchanged: true' \
    'unrelated-proof-retained: false' \
    'instruction-words-only: false'
  ! delivery_evidence_consumers_assess "${work}/stale-accept.txt"

  # Reject accept-without-gap while stand-in remains incompatible.
  delivery_evidence_consumers_write_obs "${work}/accept-unaligned.txt" \
    'scenario: changed-contract' \
    'promise-accepted: true' \
    'accepted-on-stale-exclusion: false' \
    'required-gap-returned: false' \
    'consumer-aligned: false' \
    'compat-assertion-present: false' \
    'compat-assertion-executed: false' \
    'unrelated-boundary-unchanged: true' \
    'unrelated-proof-retained: false' \
    'instruction-words-only: false'
  ! delivery_evidence_consumers_assess "${work}/accept-unaligned.txt"

  # Accept naming the consumer gap without accepting the stale claim.
  delivery_evidence_consumers_write_obs "${work}/incomplete-gap.txt" \
    'scenario: changed-contract' \
    'promise-accepted: false' \
    'accepted-on-stale-exclusion: false' \
    'required-gap-returned: true' \
    'consumer-aligned: false' \
    'compat-assertion-present: false' \
    'compat-assertion-executed: false' \
    'unrelated-boundary-unchanged: true' \
    'unrelated-proof-retained: false' \
    'instruction-words-only: false'
  delivery_evidence_consumers_assess "${work}/incomplete-gap.txt"

  # Accept after aligning the stand-in and executing compatibility proof.
  delivery_evidence_consumers_write_obs "${work}/changed-corrected.txt" \
    'scenario: changed-contract' \
    'promise-accepted: true' \
    'accepted-on-stale-exclusion: false' \
    'required-gap-returned: true' \
    'consumer-aligned: true' \
    'compat-assertion-present: true' \
    'compat-assertion-executed: true' \
    'unrelated-boundary-unchanged: true' \
    'unrelated-proof-retained: false' \
    'instruction-words-only: false'
  delivery_evidence_consumers_assess "${work}/changed-corrected.txt"

  # Reject corrected acceptance without an executed compatibility assertion.
  delivery_evidence_consumers_write_obs "${work}/corrected-no-exec.txt" \
    'scenario: corrected-consumer' \
    'promise-accepted: true' \
    'accepted-on-stale-exclusion: false' \
    'required-gap-returned: false' \
    'consumer-aligned: true' \
    'compat-assertion-present: true' \
    'compat-assertion-executed: false' \
    'unrelated-boundary-unchanged: true' \
    'unrelated-proof-retained: false' \
    'instruction-words-only: false'
  ! delivery_evidence_consumers_assess "${work}/corrected-no-exec.txt"

  # Corrected consumer with matching executed proof is accepted.
  delivery_evidence_consumers_write_obs "${work}/corrected.txt" \
    'scenario: corrected-consumer' \
    'promise-accepted: true' \
    'accepted-on-stale-exclusion: false' \
    'required-gap-returned: false' \
    'consumer-aligned: true' \
    'compat-assertion-present: true' \
    'compat-assertion-executed: true' \
    'unrelated-boundary-unchanged: true' \
    'unrelated-proof-retained: false' \
    'instruction-words-only: false'
  delivery_evidence_consumers_assess "${work}/corrected.txt"

  # Unchanged unrelated boundary retains existing proof.
  delivery_evidence_consumers_write_obs "${work}/unchanged.txt" \
    'scenario: unchanged-boundary' \
    'promise-accepted: true' \
    'accepted-on-stale-exclusion: false' \
    'required-gap-returned: false' \
    'consumer-aligned: false' \
    'compat-assertion-present: false' \
    'compat-assertion-executed: false' \
    'unrelated-boundary-unchanged: true' \
    'unrelated-proof-retained: true' \
    'instruction-words-only: false'
  delivery_evidence_consumers_assess "${work}/unchanged.txt"

  # Reject inventing incompleteness / format pressure on the unrelated control.
  delivery_evidence_consumers_write_obs "${work}/unchanged-reject.txt" \
    'scenario: unchanged-boundary' \
    'promise-accepted: false' \
    'accepted-on-stale-exclusion: false' \
    'required-gap-returned: true' \
    'consumer-aligned: false' \
    'compat-assertion-present: false' \
    'compat-assertion-executed: false' \
    'unrelated-boundary-unchanged: true' \
    'unrelated-proof-retained: false' \
    'instruction-words-only: false'
  ! delivery_evidence_consumers_assess "${work}/unchanged-reject.txt"

  # Instruction words / green-exit alone cannot pass.
  delivery_evidence_consumers_write_obs "${work}/words-only.txt" \
    'scenario: corrected-consumer' \
    'promise-accepted: true' \
    'accepted-on-stale-exclusion: false' \
    'required-gap-returned: false' \
    'consumer-aligned: true' \
    'compat-assertion-present: true' \
    'compat-assertion-executed: true' \
    'unrelated-boundary-unchanged: true' \
    'unrelated-proof-retained: false' \
    'instruction-words-only: true'
  ! delivery_evidence_consumers_assess "${work}/words-only.txt"

  # Missing observation fields cannot pass.
  delivery_evidence_consumers_write_obs "${work}/missing-fields.txt" \
    'scenario: changed-contract' \
    'promise-accepted: false' \
    'accepted-on-stale-exclusion: false' \
    'instruction-words-only: false'
  ! delivery_evidence_consumers_assess "${work}/missing-fields.txt"

  echo 'PASS: delivery-evidence/consumers assessor rejects stale-exclusion acceptance and accept-without-alignment; accepts incomplete gap naming, corrected consumer with executed compatibility proof, and unchanged-boundary retained proof; refuses instruction-words-only and missing fields.'
}
