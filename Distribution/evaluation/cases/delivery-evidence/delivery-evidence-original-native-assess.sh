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
