#!/usr/bin/env bash
# Gaps-evidence observation assessor and credential-free counterexamples.
# Each rejected case changes one signal, declared beside the assessor, of a
# passing observation (Distribution/evaluation/tests/native-harness/support/native-assessor-counterexample.sh).
# Prefers structured fixture observations; green exit or instruction words alone
# cannot pass. Does not exercise native skill prose. Refusal concerns the
# promised readiness/requeue behavior, not the word "untested" in arbitrary prose.
# shellcheck disable=SC2034,SC2154,SC2312

# Signals for rejected cases, one observed field each:
# assessor-signal: scenario scenario
# assessor-signal: accepted promise-accepted
# assessor-signal: learning-clearance cleared-by-learning-only
# assessor-signal: required-gap required-gap-named
# assessor-signal: requeue-observation requeue-observation-obtained
# assessor-signal: independent-evidence independent-evidence-preserved
# assessor-signal: format-rerun format-or-blanket-rerun
# assessor-signal: instruction-words instruction-words-only

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
