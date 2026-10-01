#!/usr/bin/env bash
# One-shot automatic-landing journeys for the publication native harness.
# one-shot-auto-land: one-shot work requested with --auto-land starts with
# --one-shot --auto-land --push-authorized and lands only its verified result
# on remote trunk, then retires its owned workspace; it is observed and
# assessed with the landing journeys in git-publication-native-one-shot.sh.
# one-shot-auto-land-blocked: a queued story completed that way is Taken by
# another owner once its result is committed, before landing. The fixture
# applies that Take when the first fetch after the result commit reaches the
# remote, so a native session and the substitute meet it at the same point:
# the agent pushes nothing, the competing Take stays on trunk, and the
# committed result stays in its workspace with the stop reported. Prompts,
# preparation, observation, assessment and counterexamples. Sourced by
# git-publication-native-one-shot.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

# The automatic-landing requests in the direct invocation's words.
git_publication_one_shot_auto_land_prompt() {
  local request
  case $1 in
    one-shot-auto-land)
      request="run dough-execute-plan --one-shot --auto-land: add the line 'Auto line' to the end of notes.txt."
      ;;
    one-shot-auto-land-blocked)
      request="run dough-execute-plan ${NATIVE_ONE_SHOT_IDENTITY} --one-shot --auto-land: complete the queued story Story B from the product backlog."
      ;;
    *) return 2 ;;
  esac
  printf '%s\n' \
    "Use this project's installed Open Dough guidance to ${request} The originating and integration checkout is ${git_publication_fixture_integration}; use ${NATIVE_ONE_SHOT_WORKSPACE} on local branch ${NATIVE_ONE_SHOT_BRANCH} as the owned workspace. Remote origin trunk is refs/heads/main. You have explicit authority to create that workspace. Preserve existing local changes. Report the outcome."
}

# Prepares another developer's Take of the queued story, through the
# installed backlog command in a clone, as an unpublished commit the origin
# holds; then makes every fetch from the originating checkout's origin, its
# worktrees included, first publish that Take once the workspace branch holds
# a commit beyond the base.
git_publication_one_shot_blocked_prepare() {
  local root=${git_publication_fixture_root} origin=${git_publication_fixture_origin}
  local integration=${git_publication_fixture_integration} rival
  local base=${git_publication_fixture_trunk_sha} skills=${git_publication_one_shot_skills} common
  rival="${root}/rival"
  git clone -q "${origin}" "${rival}"
  (cd -- "${rival}" && node "${skills}/dough-product-backlog/scripts/product-backlog.mjs" \
    take --identity "${NATIVE_ONE_SHOT_IDENTITY}" --no-plan > /dev/null)
  git -C "${rival}" -c user.name=Rival -c user.email=rival@example.test \
    commit -qam "Take ${NATIVE_ONE_SHOT_IDENTITY}"
  git -C "${origin}" fetch -q "${rival}" HEAD:refs/rival/take
  git_publication_one_shot_rival_sha=$(git -C "${origin}" rev-parse refs/rival/take)
  common=$(git -C "${integration}" rev-parse --path-format=absolute --git-common-dir)
  cat > "${root}/upload-pack" << EOF
#!/bin/sh
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_COMMON_DIR
if [ ! -e '${root}/rival-applied' ]; then
  tip=\$(git --git-dir='${common}' rev-parse -q --verify 'refs/heads/${NATIVE_ONE_SHOT_BRANCH}' 2> /dev/null)
  if [ -n "\${tip}" ] && [ "\${tip}" != '${base}' ]; then
    git --git-dir='${origin}' update-ref refs/heads/main '${git_publication_one_shot_rival_sha}' '${base}' \
      && touch '${root}/rival-applied'
  fi
fi
exec git upload-pack "\$@"
EOF
  chmod +x "${root}/upload-pack"
  git -C "${integration}" config remote.origin.uploadpack "${root}/upload-pack"
}

# Observes the blocked journey after a session whose stream $3 from host $4
# ended with status $2; its report is $5 (by default beside the stream).
git_publication_fixture_observe_one_shot_blocked() {
  local journey=$1 stream_status=$2 transcript=$3 host=$4
  local response=${5:-${3%/*}/response.md} human_after
  human_after=$(git_publication_fixture_capture_human "${git_publication_fixture_integration}")
  printf 'journey: %s\n' "${journey}"
  printf 'stream-status: %s\n' "${stream_status}"
  git_publication_stream_fields "${journey}" "${host}" "${transcript}"
  git_publication_one_shot_observe_remote
  printf 'competing-sha: %s\n' "${git_publication_one_shot_rival_sha}"
  printf 'competing-take-applied: %s\n' \
    "$([[ -e ${git_publication_fixture_root}/rival-applied ]] && echo true || echo false)"
  git_publication_one_shot_observe_retained "${response}"
  git_publication_one_shot_observe_result_line 'Story B line'
  printf 'report-names-stop: %s\n' "$(
    [[ -r ${response} ]] && grep -Eiq 'ownership|taken|another owner|held|holds' "${response}" \
      && echo true || echo false
  )"
  printf 'human-edit-preserved: %s\n' \
    "$([[ ${human_after} == "${git_publication_fixture_human_before}" ]] && echo true || echo false)"
}

# Signals for rejected cases. A remote's trunk tip and accepted updates move
# together; a workspace that is gone takes its result with it.
# assessor-signal: stream stream-status
# assessor-signal: human-edit human-edit-preserved
# assessor-signal: one-shot-start one-shot-start-observed one-shot-auto-land one-shot-push-authorized one-shot-default-main
# assessor-signal: competing competing-take-applied
# assessor-signal: remote remote-sha ref-update-count trunk-push-count pushed-tip pushed-taken forced-trunk-push-count
# assessor-signal: workspace workspace-retained workspace-commit-count workspace-clean workspace-changed-paths result-line-present
# assessor-signal: result workspace-commit-count workspace-clean workspace-changed-paths result-line-present
# assessor-signal: report report-names-retained report-names-stop
git_publication_assess_one_shot_blocked() {
  local obs=$1 key
  local stream_status human_edit_preserved one_shot_start_observed
  local one_shot_auto_land one_shot_push_authorized competing_take_applied
  local competing_sha remote_sha ref_update_count workspace_retained
  local workspace_commit_count workspace_clean result_line_present
  local report_names_retained report_names_stop
  for key in stream-status human-edit-preserved one-shot-start-observed \
    one-shot-auto-land one-shot-push-authorized competing-take-applied \
    competing-sha remote-sha ref-update-count workspace-retained \
    workspace-commit-count workspace-clean result-line-present \
    report-names-retained report-names-stop; do
    printf -v "${key//-/_}" '%s' "$(git_publication_assess_field "${obs}" "${key}")"
  done
  if [[ ${stream_status} != complete ]]; then
    git_publication_assess_fail "incomplete or stale native stream (${stream_status})"
  elif [[ ${human_edit_preserved} != true ]]; then
    git_publication_assess_fail 'human edits in the originating checkout changed'
  elif [[ ${one_shot_start_observed} != true || ${one_shot_auto_land} != true ||
    ${one_shot_push_authorized} != true ]]; then
    git_publication_assess_fail 'the work did not start through the one-shot automatic-landing start'
  elif [[ ${competing_take_applied} != true ]]; then
    git_publication_assess_fail 'the competing Take never reached the remote: no result was committed before landing'
  elif [[ ${remote_sha} != "${competing_sha}" || ${ref_update_count} != 0 ]]; then
    git_publication_assess_fail 'the agent changed the remote after the competing Take'
  elif [[ ${workspace_retained} != true || ${workspace_commit_count} -lt 1 ||
    ${workspace_clean} != true || ${result_line_present} != true ]]; then
    git_publication_assess_fail 'the committed result was not retained in its workspace'
  elif [[ ${report_names_retained} != true || ${report_names_stop} != true ]]; then
    git_publication_assess_fail 'the report does not name the ownership stop and the retained workspace'
  else
    git_publication_assess_status=pass
    git_publication_assess_reason='landing stopped for the competing owner, which kept the remote, and the result waits committed in its workspace'
  fi
}

# Rejected start cases of the auto-land journey, observed through host $2's
# transcript $1 on its kept passing fixture: a start without --auto-land.
run_one_shot_auto_land_stream_counterexamples() {
  local transcript=$1 host=$2 root=${git_publication_fixture_root} observed=$1
  # Prints the state as observed now.
  # shellcheck disable=SC2329 # Run by name through the shared counterexample forms.
  auto_land_observe() {
    git_publication_fixture_observe_one_shot one-shot-auto-land complete \
      "${observed}" "${host}"
  }
  auto_land_observe > "${root}/passing.txt"
  git_publication_suite_counterexamples \
    "${source_dir}/tests/support/git-publication-native-one-shot.sh" \
    "${root}/passing.txt"
  observed="${root}/no-auto-land.jsonl"
  sed 's/ --auto-land//g' "${transcript}" > "${observed}"
  native_assessor_rejects_observed no-auto-land-start auto-land-start \
    "${root}/counterexample.txt" auto_land_observe -- fail 'automatic-landing start'
}

# Real-state counterexamples on a passing kept fixture of the blocked
# journey, observed through host $2's transcript $1: each mutation alone is a
# rejected case of one signal, and undoing them all passes again.
run_one_shot_auto_land_blocked_state_counterexamples() {
  local transcript=$1 host=$2 integration=${git_publication_fixture_integration}
  local workspace=${NATIVE_ONE_SHOT_WORKSPACE} root=${git_publication_fixture_root}
  local origin=${git_publication_fixture_origin} rival=${git_publication_one_shot_rival_sha}
  local obs="${root}/counterexample.txt" head
  local response="${transcript%/*}/response.md" observed=${transcript}
  local report=${response}
  head=$(git -C "${workspace}" rev-parse HEAD)
  # Prints the state as observed now.
  # shellcheck disable=SC2329 # Run by name through the shared counterexample forms.
  blocked_observe() {
    git_publication_fixture_observe_one_shot_blocked one-shot-auto-land-blocked \
      complete "${observed}" "${host}" "${report}"
  }
  blocked_observe > "${root}/passing.txt"
  git_publication_suite_counterexamples \
    "${source_dir}/tests/support/git-publication-native-one-shot-auto-land.sh" \
    "${root}/passing.txt"

  # The result forced over the competing Take.
  cp -- "${root}/push.log" "${root}/push.log.kept"
  git -C "${origin}" fetch -q "${workspace}" HEAD:refs/counterexample/forced
  git -C "${origin}" update-ref refs/heads/main "${head}"
  printf '%s %s refs/heads/main\n' "${rival}" "${head}" >> "${root}/push.log"
  native_assessor_rejects_observed result-forced remote \
    "${obs}" blocked_observe -- fail 'changed the remote'
  git -C "${origin}" update-ref refs/heads/main "${rival}"
  git -C "${origin}" update-ref -d refs/counterexample/forced
  mv -- "${root}/push.log.kept" "${root}/push.log"

  rm -- "${root}/rival-applied"
  native_assessor_rejects_observed take-never-applied competing \
    "${obs}" blocked_observe -- fail 'competing Take never reached'
  touch "${root}/rival-applied"

  git_publication_one_shot_retained_counterexamples blocked_observe 'not retained'
  git -C "${workspace}" reset -q --soft "${git_publication_fixture_trunk_sha}"
  native_assessor_rejects_observed result-uncommitted result \
    "${obs}" blocked_observe -- fail 'not retained'
  git -C "${workspace}" reset -q --hard "${head}"

  observed="${root}/no-auto-land.jsonl"
  sed 's/ --auto-land//g' "${transcript}" > "${observed}"
  native_assessor_rejects_observed no-auto-land-start one-shot-start \
    "${obs}" blocked_observe -- fail 'automatic-landing start'
  observed=${transcript}

  report="${root}/silent-report.md"
  printf 'Done.\n' > "${report}"
  native_assessor_rejects_observed report-silent report \
    "${obs}" blocked_observe -- fail 'ownership stop'
  report="${root}/workspace-only-report.md"
  printf 'The result is in %s.\n' "${workspace}" > "${report}"
  native_assessor_rejects_observed report-without-stop report \
    "${obs}" blocked_observe -- fail 'ownership stop'
  report=${response}

  printf 'human working tree, changed\n' > "${integration}/human-unstaged.txt"
  native_assessor_rejects_observed human-edit human-edit \
    "${obs}" blocked_observe -- fail 'human edits'
  git_publication_fixture_plant_human_edit "${integration}"

  git_publication_suite_passes_observed "${obs}" blocked_observe \
    -- 'landing stopped for the competing owner'
}
