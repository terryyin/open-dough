#!/usr/bin/env bash
# A native original-story observation never certifies itself. The reviewer
# supplies the inspected product/workflow facts after reading retained evidence.
# shellcheck disable=SC2154,SC2312

# assessor-signal: review review-complete
# assessor-signal: native native-acceptance-observed
# assessor-signal: product product-boundary-inspected
# assessor-signal: workflow workflow-state-inspected
# assessor-signal: disposition reviewed-disposition
# assessor-signal: contradiction source-contradiction-found
# assessor-signal: corrected source-example-satisfied

delivery_evidence_original_assess() {
  local observations=$1 disposition
  [[ $(delivery_evidence_obs_get review-complete "${observations}") == true ]] || return 1
  [[ $(delivery_evidence_obs_get native-acceptance-observed "${observations}") == true ]] || return 1
  [[ $(delivery_evidence_obs_get product-boundary-inspected "${observations}") == true ]] || return 1
  [[ $(delivery_evidence_obs_get workflow-state-inspected "${observations}") == true ]] || return 1
  disposition=$(delivery_evidence_obs_get reviewed-disposition "${observations}")
  case ${disposition} in
    withheld)
      [[ $(delivery_evidence_obs_get source-contradiction-found "${observations}") == true ]]
      ;;
    corrected-accepted)
      [[ $(delivery_evidence_obs_get source-example-satisfied "${observations}") == true ]]
      ;;
    *) return 1 ;;
  esac
}

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
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
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
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${root}/corrected.txt" -- delivery_evidence_original_assess
  native_assessor_rejects_field_rows << 'EOF'
corrected-false corrected source-example-satisfied: false
EOF
  rm -rf -- "${root}"
}
