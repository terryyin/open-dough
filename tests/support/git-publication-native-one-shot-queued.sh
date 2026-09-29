#!/usr/bin/env bash
# Queued one-shot journey pieces for the publication native harness: observing
# and assessing the completed story's closure inside the one result commit,
# with its sibling untouched. Sourced by git-publication-native-one-shot.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

# How remote trunk at $2 holds the queued story's closure against base $1,
# given the planning paths $3 its commits touched (one per line).
git_publication_one_shot_observe_closure() {
  local base=$1 tip=$2 planning_paths=$3
  printf 'other-planning-paths: %s\n' "$(
    grep -Fxv -e .planning/PRODUCT-BACKLOG.md \
      -e "${git_publication_one_shot_seed}" -e "${git_publication_one_shot_plan}" \
      <<< "${planning_paths}" | paste -sd, - || true
  )"
  node "${source_dir}/tests/support/git-publication-native-one-shot-queued-observe.mjs" \
    "${source_dir}" "${git_publication_fixture_origin}" "${base}" "${tip}" \
    "${NATIVE_ONE_SHOT_IDENTITY}" "${git_publication_one_shot_sibling}" \
    "${git_publication_one_shot_seed}" "${git_publication_one_shot_plan}"
}

# The queued story's closure inside that one commit, its sibling untouched.
git_publication_assess_one_shot_closure() {
  local obs=$1 key
  local story_listed story_section_present plan_present other_planning_paths
  local sibling_section_present queue_kept
  for key in story-listed story-section-present plan-present \
    other-planning-paths sibling-section-present queue-kept; do
    printf -v "${key//-/_}" '%s' "$(git_publication_assess_field "${obs}" "${key}")"
  done
  if [[ ${story_listed} != false ]]; then
    git_publication_assess_fail 'the completed story kept its backlog entry'
  elif [[ ${story_section_present} != false ]]; then
    git_publication_assess_fail "the completed story's spent section survived"
  elif [[ ${plan_present} != false ]]; then
    git_publication_assess_fail "the completed story's plan survived"
  elif [[ -n ${other_planning_paths} ]]; then
    git_publication_assess_fail "the trunk commit touched planning records beyond the story's closure"
  elif [[ ${sibling_section_present} != true || ${queue_kept} != true ]]; then
    git_publication_assess_fail 'the sibling or another queued entry moved or left'
  else
    git_publication_assess_status=pass
    git_publication_assess_reason="the queued story's result and closure reached remote trunk as one commit and its workspace retired"
  fi
}
