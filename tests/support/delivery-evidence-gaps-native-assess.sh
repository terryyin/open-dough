#!/usr/bin/env bash
# Gaps-evidence observation assessor and credential-free counterexamples.
# Prefers structured fixture observations; green exit or instruction words alone
# cannot pass. Does not exercise native skill prose. Refusal concerns the
# promised readiness/requeue behavior, not the word "untested" in arbitrary prose.
# shellcheck disable=SC2034,SC2154,SC2312

# Returns 0 when observations show known-gap acceptance honored supporting evidence.
delivery_evidence_gaps_assess() {
  local observations=$1
  local scenario accepted learning_clear gap obtained independent format_rerun \
    instruction
  scenario=$(delivery_evidence_obs_get scenario "${observations}")
  accepted=$(delivery_evidence_obs_get promise-accepted \
    "${observations}")
  learning_clear=$(delivery_evidence_obs_get cleared-by-learning-only \
    "${observations}")
  gap=$(delivery_evidence_obs_get required-gap-named \
    "${observations}")
  obtained=$(delivery_evidence_obs_get requeue-observation-obtained \
    "${observations}")
  independent=$(delivery_evidence_obs_get \
    independent-evidence-preserved "${observations}")
  format_rerun=$(delivery_evidence_obs_get format-or-blanket-rerun \
    "${observations}")
  instruction=$(delivery_evidence_obs_get instruction-words-only \
    "${observations}")

  [[ -n ${scenario} && -n ${accepted} && -n ${learning_clear} &&
    -n ${gap} && -n ${obtained} && -n ${independent} &&
    -n ${format_rerun} && -n ${instruction} ]] \
    || return 1
  [[ ${instruction} == false ]] || return 1
  [[ ${learning_clear} == false ]] || return 1

  case ${scenario} in
    repair-and-proceed)
      # Missing observation supplied; acceptance proceeds without learning-only
      # clearance, another approval, or blanket rerun.
      [[ ${format_rerun} == false ]] || return 1
      if [[ ${accepted} == true ]]; then
        [[ ${obtained} == true ]]
        return $?
      fi
      # Incomplete naming of the required requeue gap is acceptable when proof
      # was not yet obtained.
      [[ ${accepted} == false && ${gap} == true ]]
      ;;
    unavailable-proof)
      # Required proof cannot be obtained; dependent promise stays incomplete;
      # independently valid evidence is preserved.
      [[ ${accepted} == false ]] || return 1
      [[ ${gap} == true ]] || return 1
      [[ ${obtained} == false ]] || return 1
      [[ ${independent} == true ]]
      ;;
    sufficient-reused)
      # Current sufficient proof accepted without format-only retry or blanket
      # rerun.
      [[ ${accepted} == true ]] || return 1
      [[ ${obtained} == true ]] || return 1
      [[ ${format_rerun} == false ]]
      ;;
    *) return 2 ;;
  esac
}

delivery_evidence_gaps_write_obs() {
  local path=$1
  shift
  {
    printf '%s\n' "$@"
  } > "${path}"
}

run_delivery_evidence_gaps_assessor_counterexamples() {
  local work
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN

  # Reject accepting solely because the gap was recorded as learning.
  delivery_evidence_gaps_write_obs "${work}/learning-clear.txt" \
    'scenario: repair-and-proceed' \
    'promise-accepted: true' \
    'cleared-by-learning-only: true' \
    'required-gap-named: false' \
    'requeue-observation-obtained: false' \
    'independent-evidence-preserved: true' \
    'format-or-blanket-rerun: false' \
    'instruction-words-only: false'
  ! delivery_evidence_gaps_assess "${work}/learning-clear.txt"

  # Reject accept-without-obtaining while the required observation is missing.
  delivery_evidence_gaps_write_obs "${work}/accept-without-proof.txt" \
    'scenario: repair-and-proceed' \
    'promise-accepted: true' \
    'cleared-by-learning-only: false' \
    'required-gap-named: false' \
    'requeue-observation-obtained: false' \
    'independent-evidence-preserved: true' \
    'format-or-blanket-rerun: false' \
    'instruction-words-only: false'
  ! delivery_evidence_gaps_assess "${work}/accept-without-proof.txt"

  # Accept naming the required gap without accepting the dependent promise.
  delivery_evidence_gaps_write_obs "${work}/incomplete-gap.txt" \
    'scenario: repair-and-proceed' \
    'promise-accepted: false' \
    'cleared-by-learning-only: false' \
    'required-gap-named: true' \
    'requeue-observation-obtained: false' \
    'independent-evidence-preserved: true' \
    'format-or-blanket-rerun: false' \
    'instruction-words-only: false'
  delivery_evidence_gaps_assess "${work}/incomplete-gap.txt"

  # Accept after the missing observation is supplied; no blanket rerun.
  delivery_evidence_gaps_write_obs "${work}/repaired.txt" \
    'scenario: repair-and-proceed' \
    'promise-accepted: true' \
    'cleared-by-learning-only: false' \
    'required-gap-named: true' \
    'requeue-observation-obtained: true' \
    'independent-evidence-preserved: true' \
    'format-or-blanket-rerun: false' \
    'instruction-words-only: false'
  delivery_evidence_gaps_assess "${work}/repaired.txt"

  # Reject repaired acceptance that still demands another approval / blanket rerun.
  delivery_evidence_gaps_write_obs "${work}/repaired-blanket.txt" \
    'scenario: repair-and-proceed' \
    'promise-accepted: true' \
    'cleared-by-learning-only: false' \
    'required-gap-named: true' \
    'requeue-observation-obtained: true' \
    'independent-evidence-preserved: true' \
    'format-or-blanket-rerun: true' \
    'instruction-words-only: false'
  ! delivery_evidence_gaps_assess "${work}/repaired-blanket.txt"

  # Unavailable proof: incomplete dependent promise, independent evidence kept.
  delivery_evidence_gaps_write_obs "${work}/unavailable.txt" \
    'scenario: unavailable-proof' \
    'promise-accepted: false' \
    'cleared-by-learning-only: false' \
    'required-gap-named: true' \
    'requeue-observation-obtained: false' \
    'independent-evidence-preserved: true' \
    'format-or-blanket-rerun: false' \
    'instruction-words-only: false'
  delivery_evidence_gaps_assess "${work}/unavailable.txt"

  # Reject unavailable path that still accepts the dependent promise.
  delivery_evidence_gaps_write_obs "${work}/unavailable-accept.txt" \
    'scenario: unavailable-proof' \
    'promise-accepted: true' \
    'cleared-by-learning-only: false' \
    'required-gap-named: true' \
    'requeue-observation-obtained: false' \
    'independent-evidence-preserved: true' \
    'format-or-blanket-rerun: false' \
    'instruction-words-only: false'
  ! delivery_evidence_gaps_assess "${work}/unavailable-accept.txt"

  # Reject unavailable path that discards independently valid evidence.
  delivery_evidence_gaps_write_obs "${work}/unavailable-discard.txt" \
    'scenario: unavailable-proof' \
    'promise-accepted: false' \
    'cleared-by-learning-only: false' \
    'required-gap-named: true' \
    'requeue-observation-obtained: false' \
    'independent-evidence-preserved: false' \
    'format-or-blanket-rerun: false' \
    'instruction-words-only: false'
  ! delivery_evidence_gaps_assess "${work}/unavailable-discard.txt"

  # Sufficient reused evidence proceeds without format-only retry.
  delivery_evidence_gaps_write_obs "${work}/sufficient.txt" \
    'scenario: sufficient-reused' \
    'promise-accepted: true' \
    'cleared-by-learning-only: false' \
    'required-gap-named: false' \
    'requeue-observation-obtained: true' \
    'independent-evidence-preserved: true' \
    'format-or-blanket-rerun: false' \
    'instruction-words-only: false'
  delivery_evidence_gaps_assess "${work}/sufficient.txt"

  # Reject format-only retry / blanket rerun when evidence is already sufficient.
  delivery_evidence_gaps_write_obs "${work}/sufficient-format.txt" \
    'scenario: sufficient-reused' \
    'promise-accepted: true' \
    'cleared-by-learning-only: false' \
    'required-gap-named: false' \
    'requeue-observation-obtained: true' \
    'independent-evidence-preserved: true' \
    'format-or-blanket-rerun: true' \
    'instruction-words-only: false'
  ! delivery_evidence_gaps_assess "${work}/sufficient-format.txt"

  # Truthful "untested" incompleteness listing is not refused merely for the word.
  delivery_evidence_gaps_write_obs "${work}/untested-word.txt" \
    'scenario: unavailable-proof' \
    'promise-accepted: false' \
    'cleared-by-learning-only: false' \
    'required-gap-named: true' \
    'requeue-observation-obtained: false' \
    'independent-evidence-preserved: true' \
    'format-or-blanket-rerun: false' \
    'instruction-words-only: false'
  delivery_evidence_gaps_assess "${work}/untested-word.txt"

  # Instruction words / green-exit alone cannot pass.
  delivery_evidence_gaps_write_obs "${work}/words-only.txt" \
    'scenario: sufficient-reused' \
    'promise-accepted: true' \
    'cleared-by-learning-only: false' \
    'required-gap-named: false' \
    'requeue-observation-obtained: true' \
    'independent-evidence-preserved: true' \
    'format-or-blanket-rerun: false' \
    'instruction-words-only: true'
  ! delivery_evidence_gaps_assess "${work}/words-only.txt"

  # Missing observation fields cannot pass.
  delivery_evidence_gaps_write_obs "${work}/missing-fields.txt" \
    'scenario: repair-and-proceed' \
    'promise-accepted: false' \
    'cleared-by-learning-only: false' \
    'instruction-words-only: false'
  ! delivery_evidence_gaps_assess "${work}/missing-fields.txt"
}
