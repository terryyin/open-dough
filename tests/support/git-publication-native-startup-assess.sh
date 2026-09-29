#!/usr/bin/env bash
# Assessment of installed queued startup observations. Sourced by assessor.
# shellcheck disable=SC2034 # Result globals are consumed by the sourcing assessor.

git_publication_startup_assess_file=${BASH_SOURCE[0]}

# Signals for rejected cases. The remote claim is one fact: trunk moved to a
# tip that lists this execution's work under Taken with its provenance.
# Setup-after-claim orders both project markers, so each marker's signal
# carries it.
# assessor-signal: stream stream-status
# assessor-signal: startup-call startup-cli-count
# assessor-signal: human-edit human-edit-preserved
# assessor-signal: selected-source selected-source-preserved
# assessor-signal: remote-claim remote-sha taken-on-remote claim-owned
# assessor-signal: retained-candidate candidate-contained
# assessor-signal: conflict-receipt startup-conflict-observed
# assessor-signal: setup-marker setup-exists setup-after-claim
# assessor-signal: command-marker command-exists setup-after-claim
# assessor-signal: setup-order setup-after-claim
# assessor-signal: first-edit feature-exists first-edit-after-claim
# assessor-signal: workspace-source workspace-source-published
git_publication_assess_startup() {
  local obs=$1 journey=$2
  local stream startup_calls remote_sha trunk_sha taken claim_owned human_preserved
  local source_preserved workspace_source feature setup command setup_after first_edit conflict rival contained
  stream=$(git_publication_assess_field "${obs}" stream-status)
  startup_calls=$(git_publication_assess_field "${obs}" startup-cli-count)
  remote_sha=$(git_publication_assess_field "${obs}" remote-sha)
  trunk_sha=$(git_publication_assess_field "${obs}" trunk-sha)
  taken=$(git_publication_assess_field "${obs}" taken-on-remote)
  claim_owned=$(git_publication_assess_field "${obs}" claim-owned)
  human_preserved=$(git_publication_assess_field "${obs}" human-edit-preserved)
  source_preserved=$(git_publication_assess_field "${obs}" selected-source-preserved)
  workspace_source=$(git_publication_assess_field "${obs}" workspace-source-published)
  feature=$(git_publication_assess_field "${obs}" feature-exists)
  setup=$(git_publication_assess_field "${obs}" setup-exists)
  command=$(git_publication_assess_field "${obs}" command-exists)
  setup_after=$(git_publication_assess_field "${obs}" setup-after-claim)
  conflict=$(git_publication_assess_field "${obs}" startup-conflict-observed)
  rival=$(git_publication_assess_field "${obs}" rival-owned)
  contained=$(git_publication_assess_field "${obs}" candidate-contained)
  first_edit=$(git_publication_assess_field "${obs}" first-edit-after-claim)
  if [[ ${stream} != complete || ! ${startup_calls} =~ ^[1-9][0-9]*$ ]]; then
    git_publication_assess_fail 'native startup command was not observed in a complete stream'
  elif [[ ${human_preserved} != true || ${source_preserved} != true ]]; then
    git_publication_assess_fail 'human or selected source bytes changed'
  elif [[ ${journey} == startup-claim-race ]]; then
    if [[ ${remote_sha} == "${trunk_sha}" || ${taken} != true ||
      ${rival} != true || ${claim_owned} != false || ${contained} != false ||
      ${feature} != false || ${setup} != false || ${command} != false || ${conflict} != true ]]; then
      git_publication_assess_fail 'rival claim did not stop retained startup before implementation'
    else
      git_publication_assess_status=pass
      git_publication_assess_reason='installed startup observed competing Taken provenance and stopped'
    fi
  elif [[ ${journey} == startup-resume && ${contained} != true ]]; then
    git_publication_assess_fail 'retained candidate is absent from remote descendant'
  elif [[ -z ${remote_sha} || ${remote_sha} == "${trunk_sha}" ||
    ${taken} != true || ${claim_owned} != true ]]; then
    git_publication_assess_fail "remote trunk lacks this execution's owned Taken claim"
  elif [[ ${feature} != true || ${setup} != true || ${command} != true || ${setup_after} != true ||
    ${first_edit} != true ]]; then
    git_publication_assess_fail 'implementation or project setup crossed claim boundary incorrectly'
  elif [[ ${journey} == startup-selected-source && ${workspace_source} != true ]]; then
    git_publication_assess_fail 'owned workspace does not hold the published selected source'
  else
    git_publication_assess_status=pass
    git_publication_assess_reason='installed startup invoked before implementation with remote Taken and preserved human work'
  fi
}
