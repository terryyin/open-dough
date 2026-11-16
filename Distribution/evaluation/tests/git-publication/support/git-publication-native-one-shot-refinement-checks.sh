#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

# Real-state counterexamples on a passing kept fixture of the refinement
# journey, observed through host $2's transcript $1: each mutation alone is a
# rejected case of one signal, and undoing them all passes again.
run_one_shot_refinement_state_counterexamples() {
  local transcript=$1 host=$2 integration=${git_publication_fixture_integration}
  local workspace=${NATIVE_ONE_SHOT_WORKSPACE} root=${git_publication_fixture_root}
  local seed=${git_publication_one_shot_seed} identity=${NATIVE_ONE_SHOT_IDENTITY}
  local obs="${root}/counterexample.txt" head anchor
  local response="${transcript%/*}/response.md" observed=${transcript}
  local report=${response}
  local backlog_cli="${source_dir}/Distribution/src/skills/dough-product-backlog/scripts/product-backlog.mjs"
  head=$(git -C "${workspace}" rev-parse HEAD)
  # Prints the state as observed now.
  # shellcheck disable=SC2329 # Run by name through the shared counterexample forms.
  refinement_observe() {
    git_publication_fixture_observe_one_shot_refinement one-shot-refinement \
      complete "${observed}" "${host}" "${report}"
  }
  # Amends the result commit with the workspace's tracked changes.
  refinement_amend() {
    git -C "${workspace}" commit -q --amend -a --no-edit
  }
  refinement_observe > "${root}/passing.txt"
  git_publication_suite_counterexamples \
    "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native-one-shot-refinement.sh" \
    "${root}/passing.txt"

  git_publication_one_shot_remote_counterexamples refinement_observe
  git_publication_one_shot_retained_counterexamples refinement_observe \
    'not retained for review'

  git -C "${workspace}" reset -q --soft "${git_publication_fixture_trunk_sha}"
  native_assessor_rejects_observed refinement-uncommitted result \
    "${obs}" refinement_observe -- fail 'not committed in the owned workspace'
  git -C "${workspace}" reset -q --hard "${head}"

  # The story's section committed without its story-state block.
  anchor="<a id=\"${identity#*#}\"></a>"
  awk -v start="${anchor}" '
    $0 == start { inside = 1 }
    inside && /^<a id="/ && $0 != start { inside = 0 }
    inside && $0 == "```json dough-story-state" { skip = 1 }
    !skip { print }
    skip && $0 == "```" { skip = 0 }
  ' "${workspace}/${seed}" > "${root}/seed.next"
  cp -- "${root}/seed.next" "${workspace}/${seed}"
  refinement_amend
  native_assessor_rejects_observed facts-unrecorded facts \
    "${obs}" refinement_observe -- fail 'does not record its refinement'
  git -C "${workspace}" reset -q --hard "${head}"

  # The story completed in the result.
  (cd -- "${workspace}" && node "${backlog_cli}" complete --identity "${identity}") \
    > /dev/null
  git -C "${workspace}" add -A -- .planning/done
  refinement_amend
  native_assessor_rejects_observed story-completed queue \
    "${obs}" refinement_observe -- fail 'left the Backlog list'
  git -C "${workspace}" reset -q --hard "${head}"

  # The sibling's section changed in the result.
  sed "s/'Story B line'/'Story B changed line'/" "${workspace}/${seed}" \
    > "${root}/seed.next"
  cp -- "${root}/seed.next" "${workspace}/${seed}"
  refinement_amend
  native_assessor_rejects_observed sibling-changed sibling \
    "${obs}" refinement_observe -- fail "sibling story's section changed"
  git -C "${workspace}" reset -q --hard "${head}"

  # The result also changed a product file.
  printf 'Refined line\n' >> "${workspace}/notes.txt"
  refinement_amend
  native_assessor_rejects_observed product-changed scope \
    "${obs}" refinement_observe -- fail "changed more than the story's seed"
  git -C "${workspace}" reset -q --hard "${head}"

  observed="${root}/no-one-shot-start.jsonl"
  grep -Fv -e '--one-shot' "${transcript}" > "${observed}"
  native_assessor_rejects_observed no-one-shot-start one-shot-start \
    "${obs}" refinement_observe -- fail 'one-shot preparation start'
  observed=${transcript}

  report="${root}/silent-report.md"
  printf 'Done.\n' > "${report}"
  native_assessor_rejects_observed report-silent report \
    "${obs}" refinement_observe -- fail 'does not name the retained workspace'
  report=${response}

  printf 'human working tree, changed\n' > "${integration}/human-unstaged.txt"
  native_assessor_rejects_observed human-edit human-edit \
    "${obs}" refinement_observe -- fail 'human edits'
  git_publication_fixture_plant_human_edit "${integration}"

  git_publication_suite_passes_observed "${obs}" refinement_observe \
    -- 'waits committed in its retained workspace'
}
