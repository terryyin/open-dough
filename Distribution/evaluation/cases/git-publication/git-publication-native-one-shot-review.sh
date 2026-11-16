#!/usr/bin/env bash
# One-shot review journey for the publication native harness: one-shot work
# requested without a landing request starts with --one-shot and workspace
# authority alone, commits its result in the owned workspace, and stops for
# review: nothing reaches the remote, and the workspace and its branch stay.
# Prompt, observation, assessment and state counterexamples, observing the
# kept result through git-publication-native-one-shot-retained.sh. Sourced by
# git-publication-native-one-shot.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

# Names the request, workspace, branch and workspace authority only: what
# happens to the result is for the installed guidance to decide.
git_publication_one_shot_review_prompt() {
  printf '%s\n' \
    "Use this project's installed Open Dough guidance. As one-shot work, add the line 'Review line' to the end of notes.txt. The originating and integration checkout is ${git_publication_fixture_integration}; use ${NATIVE_ONE_SHOT_WORKSPACE} on local branch ${NATIVE_ONE_SHOT_BRANCH} as the owned workspace. Remote origin trunk is refs/heads/main. You have explicit authority to create that workspace. Preserve existing local changes. Report the outcome."
}

# Observes the review journey after a session whose stream $3 from host $4
# ended with status $2; its report is $5 (by default beside the stream).
git_publication_fixture_observe_one_shot_review() {
  local journey=$1 stream_status=$2 transcript=$3 host=$4
  local response=${5:-${3%/*}/response.md} human_after line=
  human_after=$(git_publication_fixture_capture_human "${git_publication_fixture_integration}")
  printf 'journey: %s\n' "${journey}"
  printf 'stream-status: %s\n' "${stream_status}"
  git_publication_stream_fields "${journey}" "${host}" "${transcript}"
  git_publication_one_shot_observe_remote
  git_publication_one_shot_observe_retained "${response}"
  if [[ -d ${NATIVE_ONE_SHOT_WORKSPACE} ]]; then
    line=$(git -C "${NATIVE_ONE_SHOT_WORKSPACE}" show HEAD:notes.txt 2> /dev/null \
      | tail -n 1)
  fi
  printf 'result-line-present: %s\n' \
    "$([[ ${line} == 'Review line' ]] && echo true || echo false)"
  printf 'human-edit-preserved: %s\n' \
    "$([[ ${human_after} == "${git_publication_fixture_human_before}" ]] && echo true || echo false)"
}

# Signals for rejected cases. A remote's trunk tip and accepted updates move
# together; a workspace that is gone takes its result with it.
# assessor-signal: stream stream-status
# assessor-signal: human-edit human-edit-preserved
# assessor-signal: one-shot-start one-shot-start-observed one-shot-push-authorized
# assessor-signal: remote remote-sha ref-update-count trunk-push-count pushed-tip pushed-taken forced-trunk-push-count
# assessor-signal: workspace workspace-retained workspace-commit-count workspace-clean workspace-changed-paths result-line-present
# assessor-signal: result workspace-commit-count workspace-clean workspace-changed-paths result-line-present
# assessor-signal: planning workspace-changed-paths
# assessor-signal: report report-names-retained
git_publication_assess_one_shot_review() {
  local obs=$1 key
  local stream_status human_edit_preserved one_shot_start_observed
  local one_shot_push_authorized base_sha remote_sha ref_update_count
  local workspace_retained workspace_commit_count workspace_clean
  local workspace_changed_paths result_line_present report_names_retained
  for key in stream-status human-edit-preserved one-shot-start-observed \
    one-shot-push-authorized base-sha remote-sha ref-update-count \
    workspace-retained workspace-commit-count workspace-clean \
    workspace-changed-paths result-line-present report-names-retained; do
    printf -v "${key//-/_}" '%s' "$(git_publication_assess_field "${obs}" "${key}")"
  done
  if [[ ${stream_status} != complete ]]; then
    git_publication_assess_fail "incomplete or stale native stream (${stream_status})"
  elif [[ ${human_edit_preserved} != true ]]; then
    git_publication_assess_fail 'human edits in the originating checkout changed'
  elif [[ ${one_shot_start_observed} != true ]]; then
    git_publication_assess_fail 'the work did not start through the one-shot start'
  elif [[ ${one_shot_push_authorized} != false ]]; then
    git_publication_assess_fail 'the one-shot start claimed push authority the request never granted'
  elif [[ ${remote_sha} != "${base_sha}" || ${ref_update_count} != 0 ]]; then
    git_publication_assess_fail 'the remote changed although no landing was requested'
  elif [[ ${workspace_retained} != true ]]; then
    git_publication_assess_fail 'the owned workspace or its branch was not retained for review'
  elif [[ ${workspace_commit_count} -lt 1 || ${workspace_clean} != true ||
    ${result_line_present} != true ]]; then
    git_publication_assess_fail 'the requested result is not committed in the owned workspace'
  elif [[ ,${workspace_changed_paths}, == *,.planning/* ]]; then
    git_publication_assess_fail 'the result touched backlog, seed, plan or agent profile records'
  elif [[ ${report_names_retained} != true ]]; then
    git_publication_assess_fail 'the report does not name the retained workspace or branch for review'
  else
    git_publication_assess_status=pass
    git_publication_assess_reason='the one-shot result waits committed in its retained workspace and nothing reached the remote'
  fi
}
