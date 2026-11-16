#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

run_delivery_evidence_original_assessor_counterexamples() {
  local root
  root=$(mktemp -d)
  cat > "${root}/reviewed.txt" << 'EOF'
review-complete: true
native-acceptance-observed: true
product-boundary-inspected: true
workflow-state-inspected: true
reviewed-disposition: withheld
source-contradiction-found: true
source-example-satisfied: false
EOF
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-original-native-assess.sh" \
    "${root}/reviewed.txt" -- delivery_evidence_original_assess
  native_assessor_rejects_field_rows << 'EOF'
unreviewed review review-complete: false
quote-only native native-acceptance-observed: false
no-product-inspection product product-boundary-inspected: false
fabricated-obligation workflow workflow-state-inspected: false
accept-narrowed-unchanged disposition reviewed-disposition: unchanged-accepted
no-discovery contradiction source-contradiction-found: false
EOF
  sed -e 's/reviewed-disposition: withheld/reviewed-disposition: corrected-accepted/' \
    -e 's/source-example-satisfied: false/source-example-satisfied: true/' \
    "${root}/reviewed.txt" > "${root}/corrected.txt"
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-original-native-assess.sh" \
    "${root}/corrected.txt" -- delivery_evidence_original_assess
  native_assessor_rejects_field_rows << 'EOF'
corrected-false corrected source-example-satisfied: false
EOF
  rm -rf -- "${root}"
}
