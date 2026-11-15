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
