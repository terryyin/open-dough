#!/usr/bin/env bash
# Real-state counterexamples for the one-shot journeys of the publication
# native harness, each a rejected case of one signal declared beside the
# assessor in git-publication-native-one-shot.sh. Sourced by that file.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

# Real-state counterexamples on a passing fixture of one-shot journey $2: each
# mutation alone is a rejected case of one signal, and undoing them all passes
# again.
run_one_shot_state_counterexamples() {
  local transcript=$1 journey=$2 origin=${git_publication_fixture_origin}
  local integration=${git_publication_fixture_integration}
  local base=${git_publication_fixture_trunk_sha} tip commit path entry
  local obs="${git_publication_fixture_root}/counterexample.txt"
  local passing="${git_publication_fixture_root}/passing.txt"
  local index="${git_publication_fixture_root}/counterexample.index"
  local push_log="${git_publication_fixture_root}/push.log"
  local backlog=.planning/PRODUCT-BACKLOG.md taken=${NATIVE_ONE_SHOT_IDENTITY:-SEED-A#a}
  tip=$(git -C "${origin}" rev-parse refs/heads/main)
  # Requires the state, observed again, to pass with a reason holding $1.
  one_shot_passes() {
    git_publication_fixture_observe_one_shot "${journey}" complete \
      "${transcript}" > "${obs}"
    git_publication_assess "${obs}"
    git_publication_suite_expect_pass "$1"
  }
  # Rejected case $1 of signal $2 on the state observed now, failing with a
  # reason holding $3.
  one_shot_rejects() {
    git_publication_fixture_observe_one_shot "${journey}" complete \
      "${transcript}" > "${obs}"
    native_assessor_rejects "$1" "$2" "${obs}" fail "$3"
  }
  # Another writer's commit of tree $1 on parent $2 with message $3.
  one_shot_commit() {
    git -C "${origin}" -c user.name=Other -c user.email=other@example.test \
      commit-tree "$1" -p "$2" -m "$3"
  }
  # The trunk tip's tree with path $1 holding standard input.
  one_shot_tip_tree_with() {
    GIT_INDEX_FILE=${index} git -C "${origin}" read-tree "${tip}"
    GIT_INDEX_FILE=${index} git -C "${origin}" update-index --add --cacheinfo \
      "100644,$(git -C "${origin}" hash-object -w --stdin),$1"
    GIT_INDEX_FILE=${index} git -C "${origin}" write-tree
  }
  # Trunk as the one result commit with path $1 holding standard input.
  one_shot_rewrite() {
    commit=$(one_shot_commit "$(one_shot_tip_tree_with "$1")" "${base}" 'rewritten result')
    git -C "${origin}" update-ref refs/heads/main "${commit}"
  }
  # Standard input's backlog with entry line $1 moved under heading $2.
  one_shot_move_entry() {
    awk -v line="$1" -v heading="$2" \
      '$0 == line { next } { print } $0 == heading { print ""; print line }'
  }
  git_publication_fixture_observe_one_shot "${journey}" complete \
    "${transcript}" > "${passing}"
  git_publication_suite_counterexamples \
    "${source_dir}/tests/support/git-publication-native-one-shot.sh" "${passing}"

  commit=$(one_shot_commit "${tip}^{tree}" "${tip}" 'second commit')
  git -C "${origin}" update-ref refs/heads/main "${commit}"
  one_shot_rejects second-commit trunk-history 'exactly one commit'

  git -C "${origin}" show "${base}:notes.txt" | one_shot_rewrite notes.txt
  one_shot_rejects result-undone result 'does not hold the requested result'

  if [[ ${journey} == one-shot-queued ]]; then
    run_one_shot_queued_closure_counterexamples
  else
    # The result commit rewritten to also change one planning record.
    for path in "${backlog}" .planning/seeds/one-shot.md \
      .planning/slice-plans/one-shot/PLAN.md .planning/agents/native.json; do
      printf 'changed\n' | one_shot_rewrite "${path}"
      one_shot_rejects "planning-${path}" planning \
        'touched backlog, seed, plan or agent profile'
    done
  fi
  git -C "${origin}" update-ref refs/heads/main "${tip}"

  # A pushed tip that listed the work under Taken, later replaced.
  entry=$(git -C "${origin}" show "${base}:${backlog}" | grep -e "— ${taken}\$")
  commit=$(one_shot_commit "$(
    git -C "${origin}" show "${base}:${backlog}" \
      | one_shot_move_entry "${entry}" '## Taken' \
      | one_shot_tip_tree_with "${backlog}"
  )" "${base}" "Take ${taken}")
  cp -- "${push_log}" "${push_log}.kept"
  printf '%s %s refs/heads/main\n' "${base}" "${commit}" >> "${push_log}"
  one_shot_rejects pushed-taken pushes 'listed work under Taken'
  mv -- "${push_log}.kept" "${push_log}"

  git -C "${integration}" worktree add -q -b "${NATIVE_ONE_SHOT_BRANCH}" \
    "${NATIVE_ONE_SHOT_WORKSPACE}" "${tip}"
  one_shot_rejects workspace-and-branch workspace 'workspace or its branch survived'
  git -C "${integration}" worktree remove "${NATIVE_ONE_SHOT_WORKSPACE}"
  one_shot_rejects branch-left workspace 'workspace or its branch survived'
  git -C "${integration}" branch -q -D "${NATIVE_ONE_SHOT_BRANCH}"
  git -C "${origin}" update-ref "refs/heads/${NATIVE_ONE_SHOT_BRANCH}" "${tip}"
  one_shot_rejects remote-branch-left workspace 'workspace or its branch survived'
  git -C "${origin}" update-ref -d "refs/heads/${NATIVE_ONE_SHOT_BRANCH}"

  printf 'human working tree, changed\n' > "${integration}/human-unstaged.txt"
  one_shot_rejects human-edit human-edit 'human edits'
  git_publication_fixture_plant_human_edit "${integration}"

  one_shot_passes 'reached remote trunk'
}

# The queued result commit rewritten to leave part of the story's closure
# undone, touch another planning record, or disturb the sibling. Uses the
# helpers and locals of run_one_shot_state_counterexamples above.
run_one_shot_queued_closure_counterexamples() {
  local seed=${git_publication_one_shot_seed} plan=${git_publication_one_shot_plan}
  local sibling=${git_publication_one_shot_sibling} entry
  git -C "${origin}" show "${base}:${backlog}" | one_shot_rewrite "${backlog}"
  one_shot_rejects story-entry-kept story-entry 'kept its backlog entry'
  git -C "${origin}" show "${base}:${seed}" | one_shot_rewrite "${seed}"
  one_shot_rejects story-section-kept story-section 'spent section survived'
  git -C "${origin}" show "${base}:${plan}" | one_shot_rewrite "${plan}"
  one_shot_rejects story-plan-kept story-plan 'plan survived'
  printf '{}\n' | one_shot_rewrite .planning/agents/native.json
  one_shot_rejects agent-profile-changed planning "beyond the story's closure"
  # The sibling moved to the front of the queue, then removed.
  entry=$(git -C "${origin}" show "${tip}:${backlog}" | grep -e "— ${sibling}\$")
  git -C "${origin}" show "${tip}:${backlog}" \
    | one_shot_move_entry "${entry}" '## Backlog list' | one_shot_rewrite "${backlog}"
  one_shot_rejects sibling-moved sibling 'sibling or another queued entry'
  git -C "${origin}" show "${tip}:${backlog}" | grep -v -e "— ${sibling}\$" \
    | one_shot_rewrite "${backlog}"
  one_shot_rejects sibling-entry-removed sibling 'sibling or another queued entry'
  git -C "${origin}" show "${tip}:${seed}" | grep -Fv -- "**Identity:** ${sibling}" \
    | one_shot_rewrite "${seed}"
  one_shot_rejects sibling-section-removed sibling 'sibling or another queued entry'
}
