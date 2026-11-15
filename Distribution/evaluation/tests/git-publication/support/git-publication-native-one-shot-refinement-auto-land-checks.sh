#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

# Real-state counterexamples on a passing kept fixture of the journey,
# observed through host $2's transcript $1: each mutation alone is a rejected
# case of one signal, and undoing them all passes again.
run_one_shot_refinement_auto_land_state_counterexamples() {
  local transcript=$1 host=$2 integration=${git_publication_fixture_integration}
  local origin=${git_publication_fixture_origin} root=${git_publication_fixture_root}
  local base=${git_publication_fixture_trunk_sha} seed=${git_publication_one_shot_seed}
  local obs="${root}/counterexample.txt" index="${root}/counterexample.index"
  local backlog=.planning/PRODUCT-BACKLOG.md observed=${transcript} tip taken entry
  tip=$(git -C "${origin}" rev-parse refs/heads/main)
  # Prints the state as observed now.
  # shellcheck disable=SC2329 # Run by name through the shared counterexample forms.
  refinement_land_observe() {
    git_publication_fixture_observe_one_shot_refinement_auto_land \
      one-shot-refinement-auto-land complete "${observed}" "${host}"
  }
  # Trunk as the landed tip's tree with path $1 holding standard input, on
  # the base.
  refinement_land_rewrite() {
    local commit
    GIT_INDEX_FILE=${index} git -C "${origin}" read-tree "${tip}"
    GIT_INDEX_FILE=${index} git -C "${origin}" update-index --add --cacheinfo \
      "100644,$(git -C "${origin}" hash-object -w --stdin),$1"
    commit=$(git -C "${origin}" -c user.name=Other -c user.email=other@example.test \
      commit-tree "$(GIT_INDEX_FILE=${index} git -C "${origin}" write-tree)" \
      -p "${base}" -m 'rewritten refinement')
    git -C "${origin}" update-ref refs/heads/main "${commit}"
  }
  refinement_land_observe > "${root}/passing.txt"
  git_publication_suite_counterexamples \
    "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native-one-shot-refinement-auto-land.sh" \
    "${root}/passing.txt"

  cp -- "${root}/push.log" "${root}/push.log.kept"
  git -C "${origin}" update-ref refs/heads/main "${base}"
  : > "${root}/push.log"
  native_assessor_rejects_observed not-landed landing \
    "${obs}" refinement_land_observe -- fail 'did not land on remote trunk'
  git -C "${origin}" update-ref refs/heads/main "${tip}"

  # A pushed tip that listed the story under Taken, later replaced.
  entry=$(git -C "${origin}" show "${base}:${backlog}" \
    | grep -e "— ${NATIVE_ONE_SHOT_IDENTITY}\$")
  GIT_INDEX_FILE=${index} git -C "${origin}" read-tree "${base}"
  GIT_INDEX_FILE=${index} git -C "${origin}" update-index --add --cacheinfo \
    "100644,$(git -C "${origin}" show "${base}:${backlog}" | awk -v line="${entry}" '
      $0 == line { next } { print } $0 == "## Taken" { print ""; print line }' \
      | git -C "${origin}" hash-object -w --stdin),${backlog}"
  taken=$(git -C "${origin}" -c user.name=Other -c user.email=other@example.test \
    commit-tree "$(GIT_INDEX_FILE=${index} git -C "${origin}" write-tree)" \
    -p "${base}" -m "Take ${NATIVE_ONE_SHOT_IDENTITY}")
  cp -- "${root}/push.log.kept" "${root}/push.log"
  printf '%s %s refs/heads/main\n' "${base}" "${taken}" >> "${root}/push.log"
  native_assessor_rejects_observed pushed-taken pushes \
    "${obs}" refinement_land_observe -- fail 'listed work under Taken'
  mv -- "${root}/push.log.kept" "${root}/push.log"

  # The story's section landed without its story-state block.
  git -C "${origin}" show "${tip}:${seed}" \
    | awk -v start="<a id=\"${NATIVE_ONE_SHOT_IDENTITY#*#}\"></a>" '
      $0 == start { inside = 1 }
      inside && /^<a id="/ && $0 != start { inside = 0 }
      inside && $0 == "```json dough-story-state" { skip = 1 }
      !skip { print }
      skip && $0 == "```" { skip = 0 }' \
    | refinement_land_rewrite "${seed}"
  native_assessor_rejects_observed facts-unrecorded facts \
    "${obs}" refinement_land_observe -- fail "does not record the story's refinement"
  git -C "${origin}" show "${tip}:${backlog}" \
    | grep -v -e "— ${NATIVE_ONE_SHOT_IDENTITY}\$" | refinement_land_rewrite "${backlog}"
  native_assessor_rejects_observed story-completed queue \
    "${obs}" refinement_land_observe -- fail 'left the Backlog list'
  printf '{}\n' | refinement_land_rewrite .planning/agents/native.json
  native_assessor_rejects_observed profile-landed scope \
    "${obs}" refinement_land_observe -- fail "changed more than the story's seed"
  git -C "${origin}" update-ref refs/heads/main "${tip}"

  observed="${root}/no-recheck.jsonl"
  grep -Fv -e 'recheck' "${transcript}" > "${observed}"
  native_assessor_rejects_observed no-recheck recheck \
    "${obs}" refinement_land_observe -- fail 'without the story'
  observed="${root}/no-auto-land.jsonl"
  sed 's/ --auto-land//g' "${transcript}" > "${observed}"
  native_assessor_rejects_observed no-auto-land-start start \
    "${obs}" refinement_land_observe -- fail 'automatic-landing preparation start'
  observed=${transcript}

  printf 'human working tree, changed\n' > "${integration}/human-unstaged.txt"
  native_assessor_rejects_observed human-edit human-edit \
    "${obs}" refinement_land_observe -- fail 'human edits'
  git_publication_fixture_plant_human_edit "${integration}"

  git_publication_suite_passes_observed "${obs}" refinement_land_observe \
    -- 'landed on remote trunk after its recheck'
}
