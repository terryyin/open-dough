#!/usr/bin/env bash
# Observation and assessment of preparation landed from an owned repository
# context alone: the session announces Story C's preparation on the fetched
# trunk tip from the clean, behind retained worktree, refines Story C there,
# and lands the draft with the assignment's release through Dough Land, then
# retires the worktree and its branch through the installed retirement command
# for Story C, never raw Git, without creating a default checkout. Sourced by
# the owned-context journeys.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

# Story C's seed up to its section anchor, at revision $1 of origin.
git_publication_preparation_land_preamble() {
  git -C "${git_publication_fixture_origin}" show "$1:.planning/seeds/C.md" 2> /dev/null \
    | awk '$0 == "<a id=\"c\"></a>" { exit } { print }'
}

# Commands the node call log and transcript $1 show, quotes dropped.
git_publication_preparation_land_commands() {
  {
    cat "${git_publication_owned_node_log}" 2> /dev/null || true
    git_publication_transcript_commands "$1"
  } | tr -d "\"'"
}

git_publication_observe_preparation_land() {
  local journey=$1 stream_status=$2 transcript=$3 commands
  local origin=${git_publication_fixture_origin} base=${git_publication_fixture_trunk_sha}
  local repository=${git_publication_owned_repository}
  local seed=.planning/seeds/C.md tip announcement parent=none profile='' changed=''
  local pushes first_push contained=false outside
  tip=$(git -C "${origin}" rev-parse refs/heads/main)
  announcement=$(git -C "${origin}" log --format=%H --full-history \
    --diff-filter=A refs/heads/main -- .planning/agents/ | tail -n 1)
  if [[ -n ${announcement} ]]; then
    parent=$(git -C "${origin}" rev-parse "${announcement}^")
    profile=$(git -C "${origin}" diff-tree --no-commit-id --name-only -r \
      --diff-filter=A "${announcement}" -- .planning/agents/)
    changed=$(git -C "${origin}" diff-tree --no-commit-id --name-only -r "${announcement}")
    git -C "${origin}" merge-base --is-ancestor "${announcement}" "${tip}" \
      && contained=true
  fi
  pushes=$(node "${source_dir}/tests/support/git-publication-native-push-log-observe.mjs" \
    "${source_dir}" "${origin}" "${git_publication_fixture_root}/push.log")
  first_push=$(sed -n 's/^pushed-tip: \([0-9a-f]*\) .*/\1/p' <<< "${pushes}" | head -n 1)
  outside=$(git -C "${origin}" diff --name-only "${base}" "${tip}" \
    | grep -Fvx -e "${seed}" -e "${profile:-${seed}}" | paste -sd, - || true)
  commands=$(git_publication_preparation_land_commands "${transcript}")
  printf 'journey: %s\n' "${journey}"
  printf 'stream-status: %s\n' "${stream_status}"
  printf 'retire-command: %s\n' "$(
    grep -E -- 'worktree-retirement\.mjs +retire( |$)' <<< "${commands}" \
      | sed -nE 's/.* --identity +([^ ]+).*/\1/p' \
      | grep -Fqx -- "${NATIVE_OWNED_IDENTITY}" && echo true || echo false
  )"
  printf 'raw-git-retirement: %s\n' "$(
    grep -Eq '^([A-Za-z_][A-Za-z0-9_]*=[^ ]* +)*git( +-[Cc] +[^ ]+)* +worktree +remove( |$)' \
      <<< "${commands}" && echo true || echo false
  )"
  printf 'fetched-sha: %s\n' "${base}"
  printf 'remote-sha: %s\n' "${tip}"
  printf 'announcement-sha: %s\n' "${announcement:-none}"
  printf 'announcement-parent: %s\n' "${parent}"
  printf 'announcement-profile-only: %s\n' \
    "$([[ -n ${profile} && ${changed} == "${profile}" ]] && echo true || echo false)"
  printf 'announcement-contained: %s\n' "${contained}"
  printf 'first-trunk-push: %s\n' "${first_push:-none}"
  grep '^forced-trunk-push-count: ' <<< "${pushes}" || true
  printf 'release-landed: %s\n' "$(
    [[ -n ${profile} ]] && ! git -C "${origin}" cat-file -e "${tip}:${profile}" 2> /dev/null \
      && echo true || echo false
  )"
  printf 'draft-landed: %s\n' "$(
    git -C "${origin}" diff --quiet "${base}" "${tip}" -- "${seed}" && echo false || echo true
  )"
  printf 'seed-preamble-unchanged: %s\n' "$(
    [[ $(git_publication_preparation_land_preamble "${base}") == "$(git_publication_preparation_land_preamble "${tip}")" ]] \
      && echo true || echo false
  )"
  printf 'changed-outside-story: %s\n' "${outside}"
  printf 'workspace-present: %s\n' \
    "$([[ -e ${git_publication_fixture_workspace} ]] && echo true || echo false)"
  printf 'branch-present: %s\n' "$(
    git -C "${repository}" show-ref --quiet --verify "refs/heads/${NATIVE_OWNED_BRANCH}" \
      || git -C "${origin}" show-ref --quiet --verify "refs/heads/${NATIVE_OWNED_BRANCH}" \
      && echo true || echo false
  )"
  printf 'repository-intact: %s\n' "$(git_publication_repository_intact "${repository}")"
  printf 'other-checkouts: %s\n' \
    "$(git_publication_other_checkouts "${repository}" | paste -sd, -)"
}

git_publication_assess_preparation_land() {
  local obs=$1 key
  local stream_status retire_command raw_git_retirement
  local fetched_sha announcement_sha announcement_parent
  local announcement_profile_only announcement_contained first_trunk_push
  local forced_trunk_push_count release_landed draft_landed
  local seed_preamble_unchanged changed_outside_story workspace_present
  local branch_present repository_intact other_checkouts
  for key in stream-status retire-command raw-git-retirement fetched-sha announcement-sha announcement-parent \
    announcement-profile-only announcement-contained first-trunk-push \
    forced-trunk-push-count release-landed draft-landed \
    seed-preamble-unchanged changed-outside-story workspace-present \
    branch-present repository-intact other-checkouts; do
    printf -v "${key//-/_}" '%s' "$(git_publication_assess_field "${obs}" "${key}")"
  done
  if [[ ${stream_status} != complete ]]; then
    git_publication_assess_fail "incomplete or stale native stream (${stream_status})"
  elif [[ ${announcement_sha} == none || ${announcement_parent} != "${fetched_sha}" ||
    ${announcement_profile_only} != true || ${announcement_contained} != true ]]; then
    git_publication_assess_fail 'remote trunk lacks a profile-only preparation announcement on the fetched trunk tip'
  elif [[ ${first_trunk_push} != "${announcement_sha}" ]]; then
    git_publication_assess_fail 'remote trunk accepted a push before the preparation announcement'
  elif [[ ${forced_trunk_push_count} != 0 ]]; then
    git_publication_assess_fail 'remote trunk received a force push'
  elif [[ -n ${changed_outside_story} || ${seed_preamble_unchanged} != true ]]; then
    git_publication_assess_fail "the landing changed content outside Story C's section and the assignment release"
  elif [[ ${draft_landed} != true || ${release_landed} != true ]]; then
    git_publication_assess_fail 'remote trunk lacks the Story C draft or the assignment release'
  elif [[ ${raw_git_retirement} != false ]]; then
    git_publication_assess_fail 'the worktree was removed through raw Git (git worktree remove)'
  elif [[ ${retire_command} != true ]]; then
    git_publication_assess_fail 'retirement did not run the installed retirement command for Story C'
  elif [[ ${workspace_present} != false || ${branch_present} != false ]]; then
    git_publication_assess_fail 'the landed worktree or its branch survived'
  elif [[ ${repository_intact} != true || -n ${other_checkouts} ]]; then
    git_publication_assess_fail "the repository's Git directory changed or a default checkout was created"
  else
    git_publication_assess_status=pass
    git_publication_assess_reason='preparation announced on fetched trunk, landed only Story C with its release, and retired its worktree through the installed retirement command'
  fi
}
