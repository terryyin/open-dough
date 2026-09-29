#!/usr/bin/env bash
# Selection-evidence observation assessor and credential-free counterexamples.
# Each rejected case changes one signal, declared beside the assessor, of a
# passing observation (tests/support/native-assessor-counterexample.sh).
# Prefers structured fixture observations; green exit or instruction words alone
# cannot pass. Does not exercise native skill prose.
# shellcheck disable=SC2034,SC2154,SC2312

# Signals for rejected cases, one observed field each:
# assessor-signal: scenario scenario
# assessor-signal: claimed claimed-count
# assessor-signal: initial-selection initial-selected
# assessor-signal: final-selection final-selected
# assessor-signal: accepted promises-accepted-count
# assessor-signal: incomplete incomplete-named
# assessor-signal: instruction-words instruction-words-only

# Returns 0 when observations show acceptance honored actual selection.
delivery_evidence_selection_assess() {
  local observations=$1
  local scenario claimed initial final accepted incomplete instruction
  scenario=$(delivery_evidence_obs_get scenario "${observations}")
  claimed=$(delivery_evidence_obs_get claimed-count "${observations}")
  initial=$(delivery_evidence_obs_get initial-selected "${observations}")
  final=$(delivery_evidence_obs_get final-selected "${observations}")
  accepted=$(delivery_evidence_obs_get promises-accepted-count "${observations}")
  incomplete=$(delivery_evidence_obs_get incomplete-named "${observations}")
  instruction=$(delivery_evidence_obs_get instruction-words-only "${observations}")

  [[ -n ${scenario} && -n ${claimed} && -n ${initial} && -n ${final} &&
    -n ${accepted} && -n ${incomplete} && -n ${instruction} ]] || return 1
  [[ ${instruction} == false ]] || return 1
  # Contradictory: every promise accepted while also incomplete.
  if ((accepted >= claimed)) && [[ ${incomplete} == true ]]; then
    return 1
  fi

  case ${scenario} in
    zero-test)
      # Empty selection: any accepted promise fails; name the gap instead.
      if ((final == 0)); then
        ((accepted == 0)) || return 1
        [[ ${incomplete} == true ]]
        return $?
      fi
      # Corrected selection then accept the matching promise.
      [[ ${incomplete} == false ]] || return 1
      ((final >= claimed && accepted == claimed && accepted > 0))
      ;;
    partial-selection)
      if ((final < claimed)); then
        [[ ${incomplete} == true ]] || return 1
        # Do not accept more promises than observations that were selected.
        ((accepted <= final)) || return 1
        # Precise incomplete naming: accepted equals selected; uncovered named.
        ((accepted == final))
        return $?
      fi
      # Corrected selection covers all claims.
      [[ ${incomplete} == false ]] || return 1
      ((final >= claimed && accepted == claimed))
      ;;
    complete-selection)
      # Sufficient control: matching selection proceeds without a gap return.
      [[ ${incomplete} == false ]] || return 1
      ((initial >= claimed && final >= claimed && accepted == claimed))
      ;;
    *) return 2 ;;
  esac
}

delivery_evidence_selection_write_obs() {
  local path=$1
  shift
  {
    printf '%s\n' "$@"
  } > "${path}"
}

run_delivery_evidence_selection_assessor_counterexamples() {
  local work
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN

  # Zero-test: naming the uncovered promise without accepting it passes.
  delivery_evidence_selection_write_obs "${work}/zero-incomplete.txt" \
    'scenario: zero-test' \
    'claimed-count: 1' \
    'initial-selected: 0' \
    'final-selected: 0' \
    'promises-accepted-count: 0' \
    'incomplete-named: true' \
    'instruction-words-only: false'
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/zero-incomplete.txt" -- delivery_evidence_selection_assess
  # Any accepted promise under empty selection, or leaving the gap unnamed.
  native_assessor_rejects_field_rows << 'EOF'
zero-any-accept accepted promises-accepted-count: 1
zero-gap-unnamed incomplete incomplete-named: false
EOF
  # Each required field, deleted alone, cannot pass.
  native_assessor_rejects_missing_fields << 'EOF'
initial-selection initial-selected
final-selection final-selected
EOF

  # Zero-test: accepting after a corrected selection covers the claim passes;
  # accepting a zero-exit empty selection does not.
  delivery_evidence_selection_write_obs "${work}/zero-corrected.txt" \
    'scenario: zero-test' \
    'claimed-count: 1' \
    'initial-selected: 0' \
    'final-selected: 1' \
    'promises-accepted-count: 1' \
    'incomplete-named: false' \
    'instruction-words-only: false'
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/zero-corrected.txt" -- delivery_evidence_selection_assess
  native_assessor_rejects_fields zero-accept final-selection 'final-selected: 0'

  # Partial: naming the uncovered promises with accepted == selected passes;
  # accepting more promises than were selected does not, even if incomplete,
  # nor marking every promise accepted while also saying incomplete.
  delivery_evidence_selection_write_obs "${work}/partial-incomplete.txt" \
    'scenario: partial-selection' \
    'claimed-count: 3' \
    'initial-selected: 1' \
    'final-selected: 1' \
    'promises-accepted-count: 1' \
    'incomplete-named: true' \
    'instruction-words-only: false'
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/partial-incomplete.txt" -- delivery_evidence_selection_assess
  native_assessor_rejects_field_rows << 'EOF'
partial-over-accept accepted promises-accepted-count: 2
all-accepted-and-incomplete accepted promises-accepted-count: 3
EOF

  # Partial: accepting after selection covers all three passes; accepting all
  # three when only one ran does not.
  delivery_evidence_selection_write_obs "${work}/partial-corrected.txt" \
    'scenario: partial-selection' \
    'claimed-count: 3' \
    'initial-selected: 1' \
    'final-selected: 3' \
    'promises-accepted-count: 3' \
    'incomplete-named: false' \
    'instruction-words-only: false'
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/partial-corrected.txt" -- delivery_evidence_selection_assess
  native_assessor_rejects_fields partial-accept final-selection 'final-selected: 1'

  # Complete control: matching selection proceeds; instruction words or a
  # green exit alone cannot pass.
  delivery_evidence_selection_write_obs "${work}/complete.txt" \
    'scenario: complete-selection' \
    'claimed-count: 3' \
    'initial-selected: 3' \
    'final-selected: 3' \
    'promises-accepted-count: 3' \
    'incomplete-named: false' \
    'instruction-words-only: false'
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/complete.txt" -- delivery_evidence_selection_assess
  native_assessor_rejects_fields words-only instruction-words \
    'instruction-words-only: true'
}
