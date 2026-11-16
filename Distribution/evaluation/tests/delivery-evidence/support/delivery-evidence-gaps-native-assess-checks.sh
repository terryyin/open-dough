#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

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
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-gaps-native-assess.sh" \
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
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-gaps-native-assess.sh" \
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
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-gaps-native-assess.sh" \
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
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-gaps-native-assess.sh" \
    "${work}/sufficient.txt" -- delivery_evidence_gaps_assess
  native_assessor_rejects_field_rows << 'EOF'
sufficient-format format-rerun format-or-blanket-rerun: true
words-only instruction-words instruction-words-only: true
EOF
}
