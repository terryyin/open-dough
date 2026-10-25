#!/usr/bin/env bash
# A native drift observation never certifies itself. The reviewer supplies the
# inspected product/workflow facts after reading the retained evidence: the
# acceptance must dispose of each returned story commitment against the source
# itself. A plan Current decision is no exclusion, and only the amended control
# carries a human amendment to quote.
# shellcheck disable=SC2154,SC2312

# assessor-signal: review review-complete
# assessor-signal: native native-acceptance-observed
# assessor-signal: product product-boundary-inspected
# assessor-signal: workflow workflow-state-inspected
# assessor-signal: comparison per-commitment-comparison-retained
# assessor-signal: disposition reviewed-disposition
# assessor-signal: basis disposition-basis
# assessor-signal: contradiction source-contradiction-found
# assessor-signal: corrected source-example-satisfied
# assessor-signal: amendment amendment-quoted

delivery_evidence_drift_assess() {
  local observations=$1 field scenario disposition basis
  for field in review-complete native-acceptance-observed product-boundary-inspected \
    workflow-state-inspected per-commitment-comparison-retained; do
    [[ $(delivery_evidence_obs_get "${field}" "${observations}") == true ]] || return 1
  done
  scenario=$(delivery_evidence_obs_get scenario "${observations}")
  disposition=$(delivery_evidence_obs_get reviewed-disposition "${observations}")
  basis=$(delivery_evidence_obs_get disposition-basis "${observations}")
  case ${scenario}:${disposition} in
    narrowed:withheld)
      [[ ${basis} == source-commitment &&
        $(delivery_evidence_obs_get source-contradiction-found "${observations}") == true ]]
      ;;
    narrowed:corrected-accepted)
      [[ ${basis} == source-commitment &&
        $(delivery_evidence_obs_get source-example-satisfied "${observations}") == true ]]
      ;;
    amended-corrected:amended-accepted)
      [[ ${basis} == human-amendment &&
        $(delivery_evidence_obs_get amendment-quoted "${observations}") == true ]]
      ;;
    *) return 1 ;;
  esac
}

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
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
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
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
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
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
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
