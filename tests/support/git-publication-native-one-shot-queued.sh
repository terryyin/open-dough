#!/usr/bin/env bash
# Queued one-shot journey pieces for the publication native harness: observing
# and assessing the completed story's closure inside the one result commit,
# with its sibling untouched, and the counterexamples that break it. Sourced by
# git-publication-native-one-shot.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Assessor globals; locals and helpers of the sourcing counterexamples.

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

# The queued result commit rewritten to leave part of the story's closure
# undone, touch another planning record, or disturb the sibling. Uses the
# helpers and locals of run_one_shot_state_counterexamples.
run_one_shot_queued_closure_counterexamples() {
  local seed=${git_publication_one_shot_seed} plan=${git_publication_one_shot_plan}
  local sibling=${git_publication_one_shot_sibling} entry
  git -C "${origin}" show "${base}:${backlog}" | one_shot_rewrite "${backlog}"
  one_shot_reassess fail 'kept its backlog entry'
  git -C "${origin}" show "${base}:${seed}" | one_shot_rewrite "${seed}"
  one_shot_reassess fail 'spent section survived'
  git -C "${origin}" show "${base}:${plan}" | one_shot_rewrite "${plan}"
  one_shot_reassess fail 'plan survived'
  printf '{}\n' | one_shot_rewrite .planning/agents/native.json
  one_shot_reassess fail "beyond the story's closure"
  # The sibling moved to the front of the queue, then removed.
  entry=$(git -C "${origin}" show "${tip}:${backlog}" | grep -e "— ${sibling}\$")
  git -C "${origin}" show "${tip}:${backlog}" \
    | one_shot_move_entry "${entry}" '## Backlog list' | one_shot_rewrite "${backlog}"
  one_shot_reassess fail 'sibling or another queued entry'
  git -C "${origin}" show "${tip}:${backlog}" | grep -v -e "— ${sibling}\$" \
    | one_shot_rewrite "${backlog}"
  one_shot_reassess fail 'sibling or another queued entry'
  git -C "${origin}" show "${tip}:${seed}" | grep -Fv -- "**Identity:** ${sibling}" \
    | one_shot_rewrite "${seed}"
  one_shot_reassess fail 'sibling or another queued entry'
}
