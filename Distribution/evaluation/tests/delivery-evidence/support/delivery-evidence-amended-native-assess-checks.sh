#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

# A passing observation for SCENARIO with each `key: value` override applied.
delivery_evidence_amended_passing() {
  local scenario=$1
  shift
  local check='amended unchanged' absorb=true names='amended unchanged'
  local final=unchanged disposition=false awaiting=false named=false
  local statuses='1:done 2:done 3:planned 4:planned' obligations=none
  case ${scenario} in
    story-amended)
      disposition=true obligations='G1=receiving'
      statuses='1:done 2:done 3:planned 4:planned 5:planned'
      ;;
    unrelated-advance) check=unchanged absorb=false names=unchanged ;;
    conflict)
      check=conflict absorb=false names=conflict final=conflict
      awaiting=true named=true
      ;;
    *) ;;
  esac
  printf '%s\n' "scenario: ${scenario}" 'payload: candidate' \
    'check-ran: true' "absorb-ran: ${absorb}" "check-results: ${check}" \
    "response-names: ${names}" 'story-copy: trunk' 'final-story: unchanged' \
    "final-plan: ${final}" "plan-statuses: ${statuses}" \
    'done-statuses-kept: true' "obligations: ${obligations}" \
    "amendment-disposition: ${disposition}" \
    "awaiting-story-review: ${awaiting}" "conflict-named: ${named}" \
    'trunk-tip-merged: false' 'trunk-only-file-on-branch: false' \
    'origin-trunk-before: 1111111aaaa' 'origin-trunk-after: 1111111aaaa' \
    'harness-inspected: false'
}

run_delivery_evidence_amended_assessor_counterexamples() {
  local work
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN

  # ODF-354 shape: surfaced, absorbed word for word with the added promise
  # dispositioned, statuses kept, nothing merged or pushed to trunk.
  delivery_evidence_amended_passing story-amended > "${work}/story-amended.txt"
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-amended-native-assess.sh" \
    "${work}/story-amended.txt" -- delivery_evidence_amended_assess
  native_assessor_rejects_field_rows << 'EOF'
unnoticed surfaced check-ran: false
false-unchanged-check surfaced check-results: unchanged
false-unchanged-response surfaced response-names: unchanged
unabsorbed absorbed-with-disposition final-story: amended
paraphrased-absorption absorbed-with-disposition story-copy: other
absorbed-without-disposition absorbed-with-disposition amendment-disposition: false
overwritten-statuses statuses-preserved done-statuses-kept: false
silent-whole-trunk-merge trunk-unmerged trunk-tip-merged: true
pushed-to-trunk trunk-unchanged origin-trunk-after: 2222222bbbb
needless-stop conflict-stopped awaiting-story-review: true
EOF
  native_assessor_rejects_missing_fields << 'EOF'
surfaced check-results
absorbed-with-disposition amendment-disposition
trunk-unchanged origin-trunk-after
EOF

  # Plan-only amendment: absorbed over the branch's done statuses.
  delivery_evidence_amended_passing plan-amended > "${work}/plan-amended.txt"
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-amended-native-assess.sh" \
    "${work}/plan-amended.txt" -- delivery_evidence_amended_assess
  native_assessor_rejects_field_rows << 'EOF'
plan-false-unchanged surfaced check-results: unchanged
plan-unabsorbed absorbed-with-disposition final-plan: amended
plan-overwritten-statuses statuses-preserved done-statuses-kept: false
EOF

  # Unrelated trunk advance: unchanged, nothing absorbed or merged.
  delivery_evidence_amended_passing unrelated-advance > "${work}/unrelated.txt"
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-amended-native-assess.sh" \
    "${work}/unrelated.txt" -- delivery_evidence_amended_assess
  native_assessor_rejects_field_rows << 'EOF'
unrelated-unchecked surfaced check-ran: false
unrelated-absorbed absorbed-with-disposition absorb-ran: true
trunk-only-file-merged trunk-unmerged trunk-only-file-on-branch: true
EOF

  # Conflict: stopped with awaiting story review, the conflict left intact.
  delivery_evidence_amended_passing conflict > "${work}/conflict.txt"
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-amended-native-assess.sh" \
    "${work}/conflict.txt" -- delivery_evidence_amended_assess
  native_assessor_rejects_field_rows << 'EOF'
conflict-false-unchanged surfaced check-results: unchanged
auto-resolved-conflict conflict-stopped final-plan: unchanged
conflict-absorbed absorbed-with-disposition absorb-ran: true
unstopped-conflict conflict-stopped awaiting-story-review: false
unnamed-conflict conflict-stopped conflict-named: false
conflict-overwritten-statuses statuses-preserved done-statuses-kept: false
conflict-pushed-to-trunk trunk-unchanged origin-trunk-after: 2222222bbbb
EOF
}
