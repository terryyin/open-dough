#!/usr/bin/env bash
# One-shot refinement with automatic landing for the publication native
# harness: refining a queued story with --one-shot --auto-land starts through
# preparation's `start --one-shot --auto-land --push-authorized`, rechecks the
# story's ownership, and lands only the refined seed and its recorded facts on
# remote trunk: the story stays queued, neither Taken nor completed, and no
# agent profile is published. Prompt, observation, assessment and state
# counterexamples. Sourced by git-publication-native-one-shot.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

# The request in the direct invocation's words, with the workspace authority.
git_publication_one_shot_refinement_auto_land_prompt() {
  printf '%s\n' \
    "Use this project's installed Open Dough guidance to run dough-story-refinement ${NATIVE_ONE_SHOT_IDENTITY} --one-shot --auto-land: refine the queued story Story B2 from the product backlog. The originating and integration checkout is ${git_publication_fixture_integration}; use ${NATIVE_ONE_SHOT_WORKSPACE} on local branch ${NATIVE_ONE_SHOT_BRANCH} as the owned workspace. Remote origin trunk is refs/heads/main. You have explicit authority to create that workspace. Preserve existing local changes. Report the outcome."
}

# Observes the journey after a session whose stream $3 from host $4 ended with
# status $2: how remote trunk holds the story against the base.
git_publication_fixture_observe_one_shot_refinement_auto_land() {
  local journey=$1 stream_status=$2 transcript=$3 host=$4
  local origin=${git_publication_fixture_origin} base=${git_publication_fixture_trunk_sha}
  local human_after tip
  human_after=$(git_publication_fixture_capture_human "${git_publication_fixture_integration}")
  tip=$(git -C "${origin}" rev-parse refs/heads/main)
  printf 'journey: %s\n' "${journey}"
  printf 'stream-status: %s\n' "${stream_status}"
  git_publication_stream_fields "${journey}" "${host}" "${transcript}"
  printf 'story-seed: %s\n' "${git_publication_one_shot_seed}"
  git_publication_one_shot_observe_remote
  printf 'base-ancestor: %s\n' "$(
    git -C "${origin}" merge-base --is-ancestor "${base}" "${tip}" && echo true || echo false
  )"
  printf 'trunk-commit-count: %s\n' "$(git -C "${origin}" rev-list --count "${base}..${tip}")"
  printf 'trunk-changed-paths: %s\n' \
    "$(git -C "${origin}" diff --name-only "${base}" "${tip}" | paste -sd, -)"
  node "${source_dir}/tests/support/git-publication-native-one-shot-refinement-observe.mjs" \
    "${source_dir}" "${origin}" "${base}" "${NATIVE_ONE_SHOT_IDENTITY}" \
    "${git_publication_one_shot_sibling}" "${git_publication_one_shot_seed}"
  printf 'human-edit-preserved: %s\n' \
    "$([[ ${human_after} == "${git_publication_fixture_human_before}" ]] && echo true || echo false)"
}

# Signals for rejected cases. The trunk tip moves with every change to trunk
# content, and the story's facts and queue with the landed seed and backlog.
# assessor-signal: stream stream-status
# assessor-signal: human-edit human-edit-preserved
# assessor-signal: start one-shot-preparation-start-observed one-shot-preparation-auto-land
# assessor-signal: recheck ownership-recheck-observed
# assessor-signal: landing remote-sha base-ancestor trunk-commit-count trunk-changed-paths ref-update-count trunk-push-count pushed-tip pushed-taken forced-trunk-push-count story-refinement story-approach story-assessment story-queued queue-kept sibling-section-kept
# assessor-signal: pushes ref-update-count trunk-push-count pushed-tip pushed-taken forced-trunk-push-count
# assessor-signal: facts remote-sha trunk-changed-paths story-refinement story-approach story-assessment
# assessor-signal: queue remote-sha trunk-changed-paths story-queued queue-kept
# assessor-signal: scope remote-sha trunk-changed-paths
git_publication_assess_one_shot_refinement_auto_land() {
  local obs=$1 key story_seed
  local stream_status human_edit_preserved one_shot_preparation_start_observed
  local one_shot_preparation_auto_land ownership_recheck_observed base_sha
  local remote_sha base_ancestor trunk_commit_count forced_trunk_push_count
  local pushed_taken trunk_changed_paths story_refinement story_queued
  local queue_kept sibling_section_kept
  for key in stream-status human-edit-preserved story-seed \
    one-shot-preparation-start-observed one-shot-preparation-auto-land \
    ownership-recheck-observed base-sha remote-sha base-ancestor \
    trunk-commit-count forced-trunk-push-count pushed-taken \
    trunk-changed-paths story-refinement story-queued queue-kept \
    sibling-section-kept; do
    printf -v "${key//-/_}" '%s' "$(git_publication_assess_field "${obs}" "${key}")"
  done
  if [[ ${stream_status} != complete ]]; then
    git_publication_assess_fail "incomplete or stale native stream (${stream_status})"
  elif [[ ${human_edit_preserved} != true ]]; then
    git_publication_assess_fail 'human edits in the originating checkout changed'
  elif [[ ${one_shot_preparation_start_observed} != true ||
    ${one_shot_preparation_auto_land} != true ]]; then
    git_publication_assess_fail 'the refinement did not start through the one-shot automatic-landing preparation start'
  elif [[ ${ownership_recheck_observed} != true ]]; then
    git_publication_assess_fail "the refinement landed without the story's ownership recheck"
  elif [[ ${remote_sha} == "${base_sha}" || ${base_ancestor} != true ||
    ${trunk_commit_count} -lt 1 || ${forced_trunk_push_count} != 0 ]]; then
    git_publication_assess_fail 'the refinement did not land on remote trunk without force'
  elif [[ -n ${pushed_taken} ]]; then
    git_publication_assess_fail 'a push accepted by remote trunk listed work under Taken'
  elif [[ ${story_refinement} != refined ]]; then
    git_publication_assess_fail "the landed seed does not record the story's refinement"
  elif [[ ${story_queued} != true || ${queue_kept} != true ]]; then
    git_publication_assess_fail 'the story left the Backlog list or the queue changed'
  elif [[ ${sibling_section_kept} != true ]]; then
    git_publication_assess_fail "the sibling story's section changed"
  elif [[ ${trunk_changed_paths} != "${story_seed}" ]]; then
    git_publication_assess_fail "the landed result changed more than the story's seed (${trunk_changed_paths})"
  else
    git_publication_assess_status=pass
    git_publication_assess_reason="the story's refinement landed on remote trunk after its recheck and the story stays queued"
  fi
}

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
    "${source_dir}/tests/support/git-publication-native-one-shot-refinement-auto-land.sh" \
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
