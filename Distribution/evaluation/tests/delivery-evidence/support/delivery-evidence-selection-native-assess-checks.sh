#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

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
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-selection-native-assess.sh" \
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
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-selection-native-assess.sh" \
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
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-selection-native-assess.sh" \
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
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-selection-native-assess.sh" \
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
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-selection-native-assess.sh" \
    "${work}/complete.txt" -- delivery_evidence_selection_assess
  native_assessor_rejects_fields words-only instruction-words \
    'instruction-words-only: true'
}
