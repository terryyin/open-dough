#!/usr/bin/env bash
# Selection-evidence observation assessor and credential-free counterexamples.
# Prefers structured fixture observations; green exit or instruction words alone
# cannot pass. Does not exercise native skill prose.
# shellcheck disable=SC2034,SC2154,SC2312

delivery_evidence_selection_obs_get() {
  local key=$1
  local file=$2
  awk -v k="${key}" -F': ' '$1 == k {print substr($0, index($0, ": ") + 2); exit}' \
    "${file}"
}

# Returns 0 when observations show acceptance honored actual selection.
delivery_evidence_selection_assess() {
  local observations=$1
  local scenario claimed initial final accepted incomplete instruction
  scenario=$(delivery_evidence_selection_obs_get scenario "${observations}")
  claimed=$(delivery_evidence_selection_obs_get claimed-count "${observations}")
  initial=$(delivery_evidence_selection_obs_get initial-selected "${observations}")
  final=$(delivery_evidence_selection_obs_get final-selected "${observations}")
  accepted=$(delivery_evidence_selection_obs_get promises-accepted-count "${observations}")
  incomplete=$(delivery_evidence_selection_obs_get incomplete-named "${observations}")
  instruction=$(delivery_evidence_selection_obs_get instruction-words-only "${observations}")

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

  # Zero-test: reject accepting a zero-exit empty selection.
  delivery_evidence_selection_write_obs "${work}/zero-accept.txt" \
    'scenario: zero-test' \
    'claimed-count: 1' \
    'initial-selected: 0' \
    'final-selected: 0' \
    'promises-accepted-count: 1' \
    'incomplete-named: false' \
    'instruction-words-only: false'
  ! delivery_evidence_selection_assess "${work}/zero-accept.txt"

  # Zero-test: accept naming the uncovered promise without accepting it.
  delivery_evidence_selection_write_obs "${work}/zero-incomplete.txt" \
    'scenario: zero-test' \
    'claimed-count: 1' \
    'initial-selected: 0' \
    'final-selected: 0' \
    'promises-accepted-count: 0' \
    'incomplete-named: true' \
    'instruction-words-only: false'
  delivery_evidence_selection_assess "${work}/zero-incomplete.txt"

  # Zero-test: accept after corrected selection covers the claim.
  delivery_evidence_selection_write_obs "${work}/zero-corrected.txt" \
    'scenario: zero-test' \
    'claimed-count: 1' \
    'initial-selected: 0' \
    'final-selected: 1' \
    'promises-accepted-count: 1' \
    'incomplete-named: false' \
    'instruction-words-only: false'
  delivery_evidence_selection_assess "${work}/zero-corrected.txt"

  # Partial: reject accepting all three when only one ran.
  delivery_evidence_selection_write_obs "${work}/partial-accept.txt" \
    'scenario: partial-selection' \
    'claimed-count: 3' \
    'initial-selected: 1' \
    'final-selected: 1' \
    'promises-accepted-count: 3' \
    'incomplete-named: false' \
    'instruction-words-only: false'
  ! delivery_evidence_selection_assess "${work}/partial-accept.txt"

  # Partial: accept naming the uncovered promises with accepted == selected.
  delivery_evidence_selection_write_obs "${work}/partial-incomplete.txt" \
    'scenario: partial-selection' \
    'claimed-count: 3' \
    'initial-selected: 1' \
    'final-selected: 1' \
    'promises-accepted-count: 1' \
    'incomplete-named: true' \
    'instruction-words-only: false'
  delivery_evidence_selection_assess "${work}/partial-incomplete.txt"

  # Partial: reject accepting more promises than were selected (even if incomplete).
  delivery_evidence_selection_write_obs "${work}/partial-over-accept.txt" \
    'scenario: partial-selection' \
    'claimed-count: 3' \
    'initial-selected: 1' \
    'final-selected: 1' \
    'promises-accepted-count: 2' \
    'incomplete-named: true' \
    'instruction-words-only: false'
  ! delivery_evidence_selection_assess "${work}/partial-over-accept.txt"

  # Reject marking every promise accepted while also saying incomplete.
  delivery_evidence_selection_write_obs "${work}/all-accepted-and-incomplete.txt" \
    'scenario: partial-selection' \
    'claimed-count: 3' \
    'initial-selected: 1' \
    'final-selected: 1' \
    'promises-accepted-count: 3' \
    'incomplete-named: true' \
    'instruction-words-only: false'
  ! delivery_evidence_selection_assess "${work}/all-accepted-and-incomplete.txt"

  # Zero-test: reject any accepted promise under empty selection.
  delivery_evidence_selection_write_obs "${work}/zero-any-accept.txt" \
    'scenario: zero-test' \
    'claimed-count: 1' \
    'initial-selected: 0' \
    'final-selected: 0' \
    'promises-accepted-count: 1' \
    'incomplete-named: true' \
    'instruction-words-only: false'
  ! delivery_evidence_selection_assess "${work}/zero-any-accept.txt"

  # Partial: accept after selection covers all three.
  delivery_evidence_selection_write_obs "${work}/partial-corrected.txt" \
    'scenario: partial-selection' \
    'claimed-count: 3' \
    'initial-selected: 1' \
    'final-selected: 3' \
    'promises-accepted-count: 3' \
    'incomplete-named: false' \
    'instruction-words-only: false'
  delivery_evidence_selection_assess "${work}/partial-corrected.txt"

  # Complete control: matching selection proceeds.
  delivery_evidence_selection_write_obs "${work}/complete.txt" \
    'scenario: complete-selection' \
    'claimed-count: 3' \
    'initial-selected: 3' \
    'final-selected: 3' \
    'promises-accepted-count: 3' \
    'incomplete-named: false' \
    'instruction-words-only: false'
  delivery_evidence_selection_assess "${work}/complete.txt"

  # Instruction words / green-exit alone cannot pass.
  delivery_evidence_selection_write_obs "${work}/words-only.txt" \
    'scenario: complete-selection' \
    'claimed-count: 3' \
    'initial-selected: 3' \
    'final-selected: 3' \
    'promises-accepted-count: 3' \
    'incomplete-named: false' \
    'instruction-words-only: true'
  ! delivery_evidence_selection_assess "${work}/words-only.txt"

  # Missing selection fields cannot pass.
  delivery_evidence_selection_write_obs "${work}/missing-fields.txt" \
    'scenario: zero-test' \
    'claimed-count: 1' \
    'promises-accepted-count: 0' \
    'incomplete-named: true' \
    'instruction-words-only: false'
  ! delivery_evidence_selection_assess "${work}/missing-fields.txt"

  echo 'PASS: delivery-evidence/selection assessor rejects zero-test acceptance, partial over-accept, and all-accepted-with-incomplete; accepts precise incomplete naming and corrected or complete selection; refuses instruction-words-only or missing selection fields.'
}
