#!/usr/bin/env bash
# One-shot refinement journey for the publication native harness: refining a
# queued story as one-shot work starts through preparation's
# `start --one-shot`, commits the story's refined seed and recorded facts in
# the owned workspace, and stops for review: nothing reaches the remote, the
# story stays queued, and the workspace and its branch stay. Prompt,
# observation, assessment and state counterexamples, observing the kept
# result through git-publication-native-one-shot-retained.sh. Sourced by
# git-publication-native-one-shot.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

# Names the story, workspace, branch and workspace authority only.
git_publication_one_shot_refinement_prompt() {
  printf '%s\n' \
    "Use this project's installed Open Dough guidance. Refine the queued story Story B2 (${NATIVE_ONE_SHOT_IDENTITY}) from the product backlog as one-shot work. The originating and integration checkout is ${git_publication_fixture_integration}; use ${NATIVE_ONE_SHOT_WORKSPACE} on local branch ${NATIVE_ONE_SHOT_BRANCH} as the owned workspace. Remote origin trunk is refs/heads/main. You have explicit authority to create that workspace. Preserve existing local changes. Report the outcome."
}

# Observes the refinement journey after a session whose stream $3 from host
# $4 ended with status $2; its report is $5 (by default beside the stream).
git_publication_fixture_observe_one_shot_refinement() {
  local journey=$1 stream_status=$2 transcript=$3 host=$4
  local response=${5:-${3%/*}/response.md} human_after
  human_after=$(git_publication_fixture_capture_human "${git_publication_fixture_integration}")
  printf 'journey: %s\n' "${journey}"
  printf 'stream-status: %s\n' "${stream_status}"
  git_publication_stream_fields "${journey}" "${host}" "${transcript}"
  printf 'story-seed: %s\n' "${git_publication_one_shot_seed}"
  git_publication_one_shot_observe_remote
  git_publication_one_shot_observe_retained "${response}"
  node "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native-one-shot-refinement-observe.mjs" \
    "${source_dir}" "${NATIVE_ONE_SHOT_WORKSPACE}" \
    "${git_publication_fixture_trunk_sha}" "${NATIVE_ONE_SHOT_IDENTITY}" \
    "${git_publication_one_shot_sibling}" "${git_publication_one_shot_seed}"
  printf 'human-edit-preserved: %s\n' \
    "$([[ ${human_after} == "${git_publication_fixture_human_before}" ]] && echo true || echo false)"
}

# Signals for rejected cases. A remote's trunk tip and accepted updates move
# together; a workspace that is gone takes its committed facts with it, and
# the paths a result changed move with each record it touches.
# assessor-signal: stream stream-status
# assessor-signal: human-edit human-edit-preserved
# assessor-signal: one-shot-start one-shot-preparation-start-observed
# assessor-signal: remote remote-sha ref-update-count trunk-push-count pushed-tip pushed-taken forced-trunk-push-count
# assessor-signal: workspace workspace-retained workspace-commit-count workspace-clean workspace-changed-paths story-refinement story-approach story-assessment story-queued queue-kept sibling-section-kept
# assessor-signal: result workspace-commit-count workspace-clean workspace-changed-paths story-refinement story-approach story-assessment
# assessor-signal: facts story-refinement story-approach story-assessment
# assessor-signal: queue story-queued queue-kept workspace-changed-paths
# assessor-signal: sibling sibling-section-kept
# assessor-signal: scope workspace-changed-paths
# assessor-signal: report report-names-retained
git_publication_assess_one_shot_refinement() {
  local obs=$1 key story_seed
  local stream_status human_edit_preserved one_shot_preparation_start_observed
  local base_sha remote_sha ref_update_count workspace_retained
  local workspace_commit_count workspace_clean workspace_changed_paths
  local story_refinement story_queued queue_kept sibling_section_kept
  local report_names_retained
  for key in stream-status human-edit-preserved story-seed \
    one-shot-preparation-start-observed base-sha remote-sha ref-update-count \
    workspace-retained workspace-commit-count workspace-clean \
    workspace-changed-paths story-refinement story-queued queue-kept \
    sibling-section-kept report-names-retained; do
    printf -v "${key//-/_}" '%s' "$(git_publication_assess_field "${obs}" "${key}")"
  done
  if [[ ${stream_status} != complete ]]; then
    git_publication_assess_fail "incomplete or stale native stream (${stream_status})"
  elif [[ ${human_edit_preserved} != true ]]; then
    git_publication_assess_fail 'human edits in the originating checkout changed'
  elif [[ ${one_shot_preparation_start_observed} != true ]]; then
    git_publication_assess_fail 'the refinement did not start through the one-shot preparation start'
  elif [[ ${remote_sha} != "${base_sha}" || ${ref_update_count} != 0 ]]; then
    git_publication_assess_fail 'the remote changed although no landing was requested'
  elif [[ ${workspace_retained} != true ]]; then
    git_publication_assess_fail 'the owned workspace or its branch was not retained for review'
  elif [[ ${workspace_commit_count} -lt 1 || ${workspace_clean} != true ]]; then
    git_publication_assess_fail 'the refinement is not committed in the owned workspace'
  elif [[ ${story_refinement} != refined ]]; then
    git_publication_assess_fail "the story's seed does not record its refinement"
  elif [[ ${story_queued} != true || ${queue_kept} != true ]]; then
    git_publication_assess_fail 'the story left the Backlog list or the queue changed'
  elif [[ ${sibling_section_kept} != true ]]; then
    git_publication_assess_fail "the sibling story's section changed"
  elif [[ ${workspace_changed_paths} != "${story_seed}" ]]; then
    git_publication_assess_fail "the result changed more than the story's seed (${workspace_changed_paths})"
  elif [[ ${report_names_retained} != true ]]; then
    git_publication_assess_fail 'the report does not name the retained workspace or branch for review'
  else
    git_publication_assess_status=pass
    git_publication_assess_reason="the story's refinement waits committed in its retained workspace, still queued, and nothing reached the remote"
  fi
}
