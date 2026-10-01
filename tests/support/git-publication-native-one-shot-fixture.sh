#!/usr/bin/env bash
# The one-shot journeys' fixture for the publication native harness: the
# prepared owned workspace and story, the installed guidance published to
# trunk before the human edit is planted, each journey's extra starting state,
# and stopping CI observers the session left running. Sourced by
# git-publication-native-one-shot.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture globals.

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
# Sets git_publication_one_shot_skills to the installed skills root.
git_publication_one_shot_publish_install() {
  local integration=${git_publication_fixture_integration}
  git_publication_one_shot_skills="${integration}/.claude/skills"
  [[ -d ${git_publication_one_shot_skills} ]] \
    || git_publication_one_shot_skills="${integration}/.agents/skills"
  git -C "${integration}" add -A
  git -C "${integration}" commit -qm 'install Open Dough guidance'
  git -C "${integration}" push -q origin main
  git_publication_fixture_trunk_sha=$(git -C "${integration}" rev-parse HEAD)
  git_publication_record_pushes "${git_publication_fixture_origin}" \
    "${git_publication_fixture_root}"
  git_publication_fixture_plant_human_edit "${integration}"
}

# Prepares one-shot journey $1's starting state beyond the installed
# guidance, before the human edits are captured.
git_publication_one_shot_prepare() {
  case $1 in
    one-shot-escalation) git_publication_one_shot_escalation_prepare ;;
    one-shot-default-main) git_publication_one_shot_default_main_prepare ;;
    one-shot-auto-land-blocked) git_publication_one_shot_blocked_prepare ;;
    one-shot-established) git_publication_one_shot_established_prepare ;;
    *) ;;
  esac
}

# Stops CI observers the session left running in the fixture's mailbox root.
git_publication_one_shot_stop_observers() {
  local mailbox
  local launcher="${git_publication_one_shot_skills}/dough-execute-plan/scripts/ci-mailbox.mjs"
  for mailbox in "${DOUGH_CI_MAILBOX_ROOT}"/*/; do
    [[ -d ${mailbox} && ! -f ${mailbox}result.json ]] || continue
    (cd -- "${git_publication_fixture_integration}" \
      && node "${launcher}" stop "${mailbox%/}") > /dev/null 2>&1 || true
  done
  unset DOUGH_CI_MAILBOX_ROOT
}
