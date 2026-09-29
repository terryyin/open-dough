#!/usr/bin/env bash
# Gaps-evidence observation assessor and credential-free counterexamples.
# Each rejected case changes one signal, declared beside the assessor, of a
# passing observation (tests/support/native-assessor-counterexample.sh).
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

  # Naming the required gap without accepting the dependent promise passes.
  # Accepting without obtaining the required observation, or leaving the gap
  # unnamed, does not.
  delivery_evidence_gaps_write_obs "${work}/incomplete-gap.txt" \
    'scenario: repair-and-proceed' \
    'promise-accepted: false' \
    'cleared-by-learning-only: false' \
    'required-gap-named: true' \
    'requeue-observation-obtained: false' \
    'independent-evidence-preserved: true' \
    'format-or-blanket-rerun: false' \
    'instruction-words-only: false'
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/incomplete-gap.txt" -- delivery_evidence_gaps_assess
  native_assessor_rejects_field_rows << 'EOF'
accept-without-proof accepted promise-accepted: true
gap-unnamed required-gap required-gap-named: false
EOF
  # Each required field, deleted alone, cannot pass.
  native_assessor_rejects_missing_fields << 'EOF'
required-gap required-gap-named
requeue-observation requeue-observation-obtained
independent-evidence independent-evidence-preserved
format-rerun format-or-blanket-rerun
EOF

  # Accepting after the missing observation is supplied passes. Accepting
  # solely because the gap was recorded as learning, or still demanding
  # another approval or a blanket rerun, does not.
  delivery_evidence_gaps_write_obs "${work}/repaired.txt" \
    'scenario: repair-and-proceed' \
    'promise-accepted: true' \
    'cleared-by-learning-only: false' \
    'required-gap-named: true' \
    'requeue-observation-obtained: true' \
    'independent-evidence-preserved: true' \
    'format-or-blanket-rerun: false' \
    'instruction-words-only: false'
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/repaired.txt" -- delivery_evidence_gaps_assess
  native_assessor_rejects_field_rows << 'EOF'
learning-clear learning-clearance cleared-by-learning-only: true
repaired-blanket format-rerun format-or-blanket-rerun: true
EOF

  # Unavailable proof: an incomplete dependent promise with independent
  # evidence kept passes, including a truthful "untested" listing. Accepting
  # the dependent promise, or discarding the independent evidence, does not.
  delivery_evidence_gaps_write_obs "${work}/unavailable.txt" \
    'scenario: unavailable-proof' \
    'promise-accepted: false' \
    'cleared-by-learning-only: false' \
    'required-gap-named: true' \
    'requeue-observation-obtained: false' \
    'independent-evidence-preserved: true' \
    'format-or-blanket-rerun: false' \
    'instruction-words-only: false'
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/unavailable.txt" -- delivery_evidence_gaps_assess
  native_assessor_rejects_field_rows << 'EOF'
unavailable-accept accepted promise-accepted: true
unavailable-discard independent-evidence independent-evidence-preserved: false
EOF

  # Sufficient reused evidence proceeds; a format-only retry or blanket rerun,
  # or instruction words or a green exit alone, cannot pass.
  delivery_evidence_gaps_write_obs "${work}/sufficient.txt" \
    'scenario: sufficient-reused' \
    'promise-accepted: true' \
    'cleared-by-learning-only: false' \
    'required-gap-named: false' \
    'requeue-observation-obtained: true' \
    'independent-evidence-preserved: true' \
    'format-or-blanket-rerun: false' \
    'instruction-words-only: false'
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/sufficient.txt" -- delivery_evidence_gaps_assess
  native_assessor_rejects_field_rows << 'EOF'
sufficient-format format-rerun format-or-blanket-rerun: true
words-only instruction-words instruction-words-only: true
EOF
}
