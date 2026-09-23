#!/usr/bin/env bash
# Assessment of installed queued startup observations. Sourced by assessor.
# shellcheck disable=SC2034 # Result globals are consumed by the sourcing assessor.

git_publication_assess_startup() {
  local obs=$1 journey=$2
  local stream startup_calls remote_sha trunk_sha taken claim_owned human_preserved
  local source_preserved feature setup setup_after first_edit refusal
  stream=$(git_publication_assess_field "${obs}" stream-status)
  startup_calls=$(git_publication_assess_field "${obs}" startup-cli-count)
  remote_sha=$(git_publication_assess_field "${obs}" remote-sha)
  trunk_sha=$(git_publication_assess_field "${obs}" trunk-sha)
  taken=$(git_publication_assess_field "${obs}" taken-on-remote)
  claim_owned=$(git_publication_assess_field "${obs}" claim-owned)
  human_preserved=$(git_publication_assess_field "${obs}" human-edit-preserved)
  source_preserved=$(git_publication_assess_field "${obs}" selected-source-preserved)
  feature=$(git_publication_assess_field "${obs}" feature-exists)
  setup=$(git_publication_assess_field "${obs}" setup-exists)
  setup_after=$(git_publication_assess_field "${obs}" setup-after-claim)
  refusal=$(git_publication_assess_field "${obs}" startup-refusal-observed)
  first_edit=$(git_publication_assess_field "${obs}" first-edit-after-claim)
  if [[ ${stream} != complete || ! ${startup_calls} =~ ^[1-9][0-9]*$ ]]; then
    git_publication_assess_fail 'native startup command was not observed in a complete stream'
  elif [[ ${human_preserved} != true || ${source_preserved} != true ]]; then
    git_publication_assess_fail 'human or selected source bytes changed'
  elif [[ ${journey} == startup-selected-source ]]; then
    if [[ ${remote_sha} != "${trunk_sha}" || ${taken} != false || ${feature} != false ||
      ${refusal} != true ]]; then
      git_publication_assess_fail 'selected local source was published or implementation started'
    else
      git_publication_assess_status=pass
      git_publication_assess_reason='selected source stopped before claim with preserved bytes'
    fi
  elif [[ -z ${remote_sha} || ${remote_sha} == "${trunk_sha}" ||
    ${taken} != true || ${claim_owned} != true ]]; then
    git_publication_assess_fail "remote trunk lacks this execution's owned Taken claim"
  elif [[ ${feature} != true || ${setup} != true || ${setup_after} != true ||
    ${first_edit} != true ]]; then
    git_publication_assess_fail 'implementation or project setup crossed claim boundary incorrectly'
  else
    git_publication_assess_status=pass
    git_publication_assess_reason='installed startup invoked before implementation with remote Taken and preserved human work'
  fi
}
