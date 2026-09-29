#!/usr/bin/env bash
# One-shot journeys for the publication native harness: explicitly requested
# one-shot work publishes only its verified result to remote trunk and retires
# its owned workspace; a queued story completed that way reaches trunk as one
# commit holding its result and its closure, never shown Taken.
# Fixture, observation, prompt and assessment. Sourced by the runner.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

# shellcheck source=tests/support/git-publication-native-one-shot-queued.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-one-shot-queued.sh"
# shellcheck source=tests/support/git-publication-native-one-shot-counterexamples.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-one-shot-counterexamples.sh"

git_publication_fixture_create_one_shot() {
  local source_dir=$1 journey=$2 parent=$3
  local prepared
  prepared=$(node "${source_dir}/tests/support/git-publication-native-one-shot-fixture.mjs" \
    "${source_dir}" "${journey}" "${parent}")
  git_publication_fixture_adopt_prepared "${prepared}"
  NATIVE_ONE_SHOT_WORKSPACE=${git_publication_fixture_workspace}
  NATIVE_ONE_SHOT_BRANCH=$(jq -r .branch <<< "${prepared}")
  NATIVE_ONE_SHOT_IDENTITY=$(jq -r '.identity // empty' <<< "${prepared}")
  export NATIVE_ONE_SHOT_WORKSPACE NATIVE_ONE_SHOT_BRANCH NATIVE_ONE_SHOT_IDENTITY
  git_publication_one_shot_sibling=$(jq -r '.sibling // empty' <<< "${prepared}")
  git_publication_one_shot_seed=$(jq -r '.seed // empty' <<< "${prepared}")
  git_publication_one_shot_plan=$(jq -r '.plan // empty' <<< "${prepared}")
  # The session's CI observers live inside the fixture, so a leftover one is
  # found and stopped with it.
  export DOUGH_CI_MAILBOX_ROOT="${git_publication_fixture_root}/mailboxes"
}

# After installing the guidance into the originating checkout: the project
# commits its installed guidance, so an owned workspace at trunk holds the
# runtime delivery needs. Then record every push origin accepts, and plant the
# human edit only now so it stays out of trunk; the runner captures it next.
git_publication_one_shot_publish_install() {
  local integration=${git_publication_fixture_integration}
  git -C "${integration}" add -A
  git -C "${integration}" commit -qm 'install Open Dough guidance'
  git -C "${integration}" push -q origin main
  git_publication_fixture_trunk_sha=$(git -C "${integration}" rev-parse HEAD)
  git_publication_record_pushes "${git_publication_fixture_origin}" \
    "${git_publication_fixture_root}"
  git_publication_fixture_plant_human_edit "${integration}"
}

git_publication_one_shot_prompt() {
  local request
  case $1 in
    one-shot-result)
      request="As one-shot work, add the line 'One-shot line' to the end of notes.txt."
      ;;
    one-shot-queued)
      request="Complete the queued story Story B (${NATIVE_ONE_SHOT_IDENTITY}) from the product backlog as one-shot work."
      ;;
    *) return 2 ;;
  esac
  printf '%s\n' \
    "Use this project's installed Open Dough guidance. ${request} The originating and integration checkout is ${git_publication_fixture_integration}; use ${NATIVE_ONE_SHOT_WORKSPACE} on local branch ${NATIVE_ONE_SHOT_BRANCH} as the owned execution workspace. Remote origin trunk is refs/heads/main. You have explicit authority to create that workspace and publish to remote trunk. Preserve existing local changes. Report the outcome."
}

git_publication_fixture_observe_one_shot() {
  local journey=$1 stream_status=$2 transcript=$3
  local origin=${git_publication_fixture_origin}
  local base=${git_publication_fixture_trunk_sha} tip ancestor=false
  local branch=${NATIVE_ONE_SHOT_BRANCH} human_after commands planning_paths
  tip=$(git -C "${origin}" rev-parse refs/heads/main)
  if git -C "${origin}" merge-base --is-ancestor "${base}" "${tip}"; then
    ancestor=true
  fi
  commands=$(git_publication_transcript_start_commands "${transcript}")
  human_after=$(git_publication_fixture_capture_human "${git_publication_fixture_integration}")
  printf 'journey: %s\n' "${journey}"
  printf 'stream-status: %s\n' "${stream_status}"
  printf 'one-shot-start-observed: %s\n' \
    "$(grep -Fq -- '--one-shot' <<< "${commands}" && echo true || echo false)"
  printf 'base-sha: %s\n' "${base}"
  printf 'remote-sha: %s\n' "${tip}"
  printf 'base-ancestor: %s\n' "${ancestor}"
  printf 'trunk-commit-count: %s\n' \
    "$(git -C "${origin}" rev-list --count "${base}..${tip}")"
  planning_paths=$(
    git -C "${origin}" log --format= --name-only "${base}..${tip}" \
      | grep -E '^\.planning/(PRODUCT-BACKLOG\.md$|seeds/|slice-plans/|agents/)' \
      | LC_ALL=C sort -u || true
  )
  printf 'planning-paths: %s\n' "$(paste -sd, - <<< "${planning_paths}")"
  printf 'result-changed: %s\n' \
    "$(git -C "${origin}" diff --quiet "${base}" "${tip}" -- notes.txt && echo false || echo true)"
  printf 'workspace-present: %s\n' \
    "$([[ -e ${NATIVE_ONE_SHOT_WORKSPACE} ]] && echo true || echo false)"
  printf 'branch-present: %s\n' "$(
    git -C "${git_publication_fixture_integration}" show-ref --quiet --verify "refs/heads/${branch}" \
      || git -C "${origin}" show-ref --quiet --verify "refs/heads/${branch}" \
      && echo true || echo false
  )"
  printf 'human-edit-preserved: %s\n' \
    "$([[ ${human_after} == "${git_publication_fixture_human_before}" ]] && echo true || echo false)"
  node "${source_dir}/tests/support/git-publication-native-push-log-observe.mjs" \
    "${source_dir}" "${origin}" "${git_publication_fixture_root}/push.log"
  if [[ ${journey} == one-shot-queued ]]; then
    git_publication_one_shot_observe_closure "${base}" "${tip}" "${planning_paths}"
  fi
}

# Stops CI observers the session left running in the fixture's mailbox root.
git_publication_one_shot_stop_observers() {
  local mailbox launcher
  launcher="${git_publication_fixture_integration}/.claude/skills/dough-execute-plan/scripts/ci-mailbox.mjs"
  [[ -f ${launcher} ]] \
    || launcher="${git_publication_fixture_integration}/.agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs"
  for mailbox in "${DOUGH_CI_MAILBOX_ROOT}"/*/; do
    [[ -d ${mailbox} && ! -f ${mailbox}result.json ]] || continue
    (cd -- "${git_publication_fixture_integration}" \
      && node "${launcher}" stop "${mailbox%/}") > /dev/null 2>&1 || true
  done
  unset DOUGH_CI_MAILBOX_ROOT
}

# Signals for rejected cases, with the queued story's closure assessed in
# git-publication-native-one-shot-queued.sh. The trunk tip's SHA and the
# planning paths its commits touched move with every change to trunk content.
# assessor-signal: stream stream-status
# assessor-signal: human-edit human-edit-preserved
# assessor-signal: trunk-history remote-sha base-ancestor trunk-commit-count
# assessor-signal: result remote-sha result-changed
# assessor-signal: planning remote-sha planning-paths other-planning-paths
# assessor-signal: pushes ref-update-count trunk-push-count pushed-tip pushed-taken forced-trunk-push-count
# assessor-signal: workspace workspace-present branch-present
# assessor-signal: story-entry remote-sha planning-paths story-listed queue-kept
# assessor-signal: story-section remote-sha planning-paths story-section-present
# assessor-signal: story-plan remote-sha planning-paths plan-present
# assessor-signal: sibling remote-sha planning-paths sibling-section-present queue-kept
git_publication_assess_one_shot() {
  local obs=$1 key
  local journey stream_status human_edit_preserved base_ancestor
  local trunk_commit_count planning_paths result_changed pushed_taken
  local workspace_present branch_present
  for key in journey stream-status human-edit-preserved base-ancestor \
    trunk-commit-count planning-paths result-changed pushed-taken \
    workspace-present branch-present; do
    printf -v "${key//-/_}" '%s' "$(git_publication_assess_field "${obs}" "${key}")"
  done
  if [[ ${stream_status} != complete ]]; then
    git_publication_assess_fail "incomplete or stale native stream (${stream_status})"
  elif [[ ${human_edit_preserved} != true ]]; then
    git_publication_assess_fail 'human edits in the originating checkout changed'
  elif [[ ${base_ancestor} != true || ${trunk_commit_count} != 1 ]]; then
    git_publication_assess_fail 'remote trunk did not gain exactly one commit since the base'
  elif [[ ${result_changed} != true ]]; then
    git_publication_assess_fail 'the trunk commit does not hold the requested result'
  elif [[ -n ${pushed_taken} ]]; then
    git_publication_assess_fail 'a push accepted by remote trunk listed work under Taken'
  elif [[ ${workspace_present} != false || ${branch_present} != false ]]; then
    git_publication_assess_fail 'the owned workspace or its branch survived'
  elif [[ ${journey} == one-shot-queued ]]; then
    git_publication_assess_one_shot_closure "${obs}"
  elif [[ -n ${planning_paths} ]]; then
    git_publication_assess_fail 'the trunk commit touched backlog, seed, plan or agent profile records'
  else
    git_publication_assess_status=pass
    git_publication_assess_reason='only the one-shot result reached remote trunk and its workspace retired'
  fi
}
