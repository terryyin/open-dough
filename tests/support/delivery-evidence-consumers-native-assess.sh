#!/usr/bin/env bash
# Consumers-evidence observation assessor and credential-free counterexamples.
# Each rejected case changes one signal, declared beside the assessor, of a
# passing observation (tests/support/native-assessor-counterexample.sh).
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

  # Naming the consumer gap without accepting the stale claim passes.
  # Accepting while the stand-in remains incompatible, or leaving the gap
  # unreturned, does not.
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
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/incomplete-gap.txt" -- delivery_evidence_consumers_assess
  native_assessor_rejects_field_rows << 'EOF'
accept-unaligned accepted promise-accepted: true
gap-unreturned required-gap required-gap-returned: false
EOF
  # Each required field, deleted alone, cannot pass.
  native_assessor_rejects_missing_fields << 'EOF'
required-gap required-gap-returned
consumer-aligned consumer-aligned
compat-present compat-assertion-present
compat-executed compat-assertion-executed
unrelated-boundary unrelated-boundary-unchanged
unrelated-proof unrelated-proof-retained
EOF

  # Accepting after aligning the stand-in and executing compatibility proof
  # passes; accepting solely on the stale unaffected-suite exclusion does not.
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
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/changed-corrected.txt" -- delivery_evidence_consumers_assess
  native_assessor_rejects_fields stale-accept stale-exclusion \
    'accepted-on-stale-exclusion: true'

  # A corrected consumer with matching executed proof passes; without an
  # executed compatibility assertion, or on instruction words or a green exit
  # alone, it does not.
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
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/corrected.txt" -- delivery_evidence_consumers_assess
  native_assessor_rejects_field_rows << 'EOF'
corrected-no-exec compat-executed compat-assertion-executed: false
words-only instruction-words instruction-words-only: true
EOF

  # An unchanged unrelated boundary retains existing proof and passes.
  # Inventing incompleteness on it, or dropping its proof, does not. A
  # returned gap alone is no rejection: the observer reads any mention of a
  # consumer or compatibility as one, and this scenario does not judge it.
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
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/unchanged.txt" -- delivery_evidence_consumers_assess
  native_assessor_rejects_field_rows << 'EOF'
unchanged-unaccepted accepted promise-accepted: false
unchanged-proof-dropped unrelated-proof unrelated-proof-retained: false
EOF

  # Observer reads a status that opens its line, including a numbered item,
  # and a leading incomplete status still wins over later accepted words.
  # shellcheck disable=SC2016 # Backticks are literal outcome text.
  printf '%s\n' '1. **Accepted — `createCommand` requires `(context, releaseTag)`.**' \
    'The exclusion is stale and was not used.' > "${work}/outcome-leading.md"
  [[ $(delivery_evidence_consumers_promise_accepted \
    "${work}/outcome-leading.md" '') == true ]]
  printf '%s\n' '- **Accepted — Promise 1: Status badge labels remain text.**' \
    'No incomplete promises.' > "${work}/outcome-leading-badge.md"
  [[ $(delivery_evidence_consumers_promise_accepted \
    "${work}/outcome-leading-badge.md" '') == true ]]
  printf '%s\n' '1. **Incomplete — the E2E stand-in omits releaseTag.**' \
    'Producer evidence: accepted.' > "${work}/outcome-leading-incomplete.md"
  [[ $(delivery_evidence_consumers_promise_accepted \
    "${work}/outcome-leading-incomplete.md" '') == false ]]
}
