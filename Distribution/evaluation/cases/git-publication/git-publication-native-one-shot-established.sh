#!/usr/bin/env bash
# Established one-shot journey for the publication native harness: as a
# dashboard launch does, the harness runs the installed one-shot start for a
# queued story and hands the session the installed formatter's established
# block (`established-start.mjs`) with the skill invocation. The session
# continues in that workspace without a second start, commits the result, and
# stops for review under the block's `landing: review`: nothing reaches the
# remote and the workspace and its branch stay. Preparation, prompt,
# observation, assessment and state counterexamples, observing the kept
# result through git-publication-native-one-shot-retained.sh. Sourced by
# git-publication-native-one-shot.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

# Runs the installed one-shot start for the queued story on the session's
# host and formats its established block with the installed formatter.
git_publication_one_shot_established_prepare() {
  local integration=${git_publication_fixture_integration} receipt
  local skills=${git_publication_one_shot_skills}
  receipt=$(cd -- "${integration}" && node \
    "${skills}/dough-execute-plan/scripts/execution-start.mjs" start \
    --integration "${integration}" --workspace "${NATIVE_ONE_SHOT_WORKSPACE}" \
    --branch "${NATIVE_ONE_SHOT_BRANCH}" --identity "${NATIVE_ONE_SHOT_IDENTITY}" \
    --mode story-branch --remote origin --target main --workspace-authorized \
    --one-shot --host "${native_case_host}" | tail -n 1)
  # shellcheck disable=SC2016 # JavaScript template literal, not shell.
  git_publication_one_shot_established_block=$(
    node --input-type=module -e '
      const [formatter, receipt, identity, workspace, branch] = process.argv.slice(1);
      const { formatEstablishedStart } = await import(formatter);
      const result = JSON.parse(receipt);
      if (result.ok !== true) throw new Error(`one-shot start refused: ${receipt}`);
      process.stdout.write(formatEstablishedStart({
        tracking: "one-shot", identity, workspace,
        role: result.role ?? "isolated", branch, mode: "story-branch",
        remote: "origin", target: "main", landing: result.landing ?? "review",
        startingRevision: result.startingRevision, fetched: result.fetched,
      }));
    ' "${skills}/dough-execute-plan/scripts/established-start.mjs" "${receipt}" \
      "${NATIVE_ONE_SHOT_IDENTITY}" "${NATIVE_ONE_SHOT_WORKSPACE}" "${NATIVE_ONE_SHOT_BRANCH}"
  )
}

# The skill invocation and established block, as a dashboard launch writes
# them.
git_publication_one_shot_established_prompt() {
  printf '%s\n\n%s\n' \
    "Use this project's installed Open Dough guidance to run dough-execute-plan ${NATIVE_ONE_SHOT_IDENTITY} --one-shot." \
    "${git_publication_one_shot_established_block}"
}

# Observes the established journey after a session whose stream $3 from host
# $4 ended with status $2; its report is $5 (by default beside the stream).
git_publication_fixture_observe_one_shot_established() {
  local journey=$1 stream_status=$2 transcript=$3 host=$4
  local response=${5:-${3%/*}/response.md} human_after
  human_after=$(git_publication_fixture_capture_human "${git_publication_fixture_integration}")
  printf 'journey: %s\n' "${journey}"
  printf 'stream-status: %s\n' "${stream_status}"
  git_publication_stream_fields "${journey}" "${host}" "${transcript}"
  git_publication_one_shot_observe_remote
  git_publication_one_shot_observe_retained "${response}"
  git_publication_one_shot_observe_result_line 'Story B line'
  printf 'human-edit-preserved: %s\n' \
    "$([[ ${human_after} == "${git_publication_fixture_human_before}" ]] && echo true || echo false)"
}

# Signals for rejected cases. A remote's trunk tip and accepted updates move
# together; a workspace that is gone takes its result with it.
# assessor-signal: stream stream-status
# assessor-signal: human-edit human-edit-preserved
# assessor-signal: second-start startup-cli-count
# assessor-signal: remote remote-sha ref-update-count trunk-push-count pushed-tip pushed-taken forced-trunk-push-count
# assessor-signal: workspace workspace-retained workspace-commit-count workspace-clean workspace-changed-paths result-line-present
# assessor-signal: result workspace-commit-count workspace-clean workspace-changed-paths result-line-present
# assessor-signal: planning workspace-changed-paths
# assessor-signal: report report-names-retained
git_publication_assess_one_shot_established() {
  local obs=$1 key
  local stream_status human_edit_preserved startup_cli_count base_sha
  local remote_sha ref_update_count workspace_retained workspace_commit_count
  local workspace_clean workspace_changed_paths result_line_present
  local report_names_retained
  for key in stream-status human-edit-preserved startup-cli-count base-sha \
    remote-sha ref-update-count workspace-retained workspace-commit-count \
    workspace-clean workspace-changed-paths result-line-present \
    report-names-retained; do
    printf -v "${key//-/_}" '%s' "$(git_publication_assess_field "${obs}" "${key}")"
  done
  if [[ ${stream_status} != complete ]]; then
    git_publication_assess_fail "incomplete or stale native stream (${stream_status})"
  elif [[ ${human_edit_preserved} != true ]]; then
    git_publication_assess_fail 'human edits in the originating checkout changed'
  elif [[ ${startup_cli_count} != 0 ]]; then
    git_publication_assess_fail 'the session ran a second start despite its established one-shot start'
  elif [[ ${remote_sha} != "${base_sha}" || ${ref_update_count} != 0 ]]; then
    git_publication_assess_fail 'the remote changed although no landing was requested'
  elif [[ ${workspace_retained} != true || ${workspace_commit_count} -lt 1 ||
    ${workspace_clean} != true || ${result_line_present} != true ]]; then
    git_publication_assess_fail 'the requested result is not committed in the established workspace'
  elif [[ ,${workspace_changed_paths}, == *,.planning/agents/* ]]; then
    git_publication_assess_fail 'the result recorded an agent profile'
  elif [[ ${report_names_retained} != true ]]; then
    git_publication_assess_fail 'the report does not name the retained workspace or branch for review'
  else
    git_publication_assess_status=pass
    git_publication_assess_reason='the session continued its established start and the result waits committed in that workspace'
  fi
}
