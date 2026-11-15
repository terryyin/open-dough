#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

run_delivery_evidence_drift_assessor_counterexamples() {
  local root rc=0
  root=$(mktemp -d)
  cat > "${root}/withheld.txt" << 'OBS'
scenario: narrowed
review-complete: true
native-acceptance-observed: true
product-boundary-inspected: true
workflow-state-inspected: true
per-commitment-comparison-retained: true
reviewed-disposition: withheld
disposition-basis: source-commitment
source-contradiction-found: true
source-example-satisfied: false
amendment-quoted: false
OBS
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-drift-native-assess.sh" \
    "${root}/withheld.txt" -- delivery_evidence_drift_assess || rc=1
  native_assessor_rejects_field_rows << 'ROWS' || rc=1
unreviewed review review-complete: false
quote-only native native-acceptance-observed: false
no-product-inspection product product-boundary-inspected: false
no-workflow-inspection workflow workflow-state-inspected: false
no-comparison comparison per-commitment-comparison-retained: false
unchanged-accepted disposition reviewed-disposition: unchanged-accepted
fabricated-amendment disposition reviewed-disposition: amended-accepted
plan-decision-as-exclusion basis disposition-basis: plan-current-decision
no-discovery contradiction source-contradiction-found: false
ROWS
  sed -e 's/reviewed-disposition: withheld/reviewed-disposition: corrected-accepted/' \
    -e 's/source-example-satisfied: false/source-example-satisfied: true/' \
    "${root}/withheld.txt" > "${root}/corrected.txt"
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-drift-native-assess.sh" \
    "${root}/corrected.txt" -- delivery_evidence_drift_assess || rc=1
  native_assessor_rejects_field_rows << 'ROWS' || rc=1
corrected-false corrected source-example-satisfied: false
corrected-by-plan basis disposition-basis: plan-current-decision
ROWS
  sed -e 's/^scenario: narrowed/scenario: amended-corrected/' \
    -e 's/reviewed-disposition: withheld/reviewed-disposition: amended-accepted/' \
    -e 's/disposition-basis: source-commitment/disposition-basis: human-amendment/' \
    -e 's/source-contradiction-found: true/source-contradiction-found: false/' \
    -e 's/amendment-quoted: false/amendment-quoted: true/' \
    "${root}/withheld.txt" > "${root}/amended.txt"
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-drift-native-assess.sh" \
    "${root}/amended.txt" -- delivery_evidence_drift_assess || rc=1
  native_assessor_rejects_field_rows << 'ROWS' || rc=1
unquoted-amendment amendment amendment-quoted: false
amendment-as-plan-decision basis disposition-basis: plan-current-decision
invented-work disposition reviewed-disposition: withheld
amended-unchanged disposition reviewed-disposition: unchanged-accepted
amended-no-comparison comparison per-commitment-comparison-retained: false
ROWS
  rm -rf -- "${root}"
  return "${rc}"
}
