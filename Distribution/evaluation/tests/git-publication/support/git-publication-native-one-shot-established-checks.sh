#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

# Real-state counterexamples on a passing kept fixture of the journey,
# observed through host $2's transcript $1: each mutation alone is a rejected
# case of one signal, and undoing them all passes again.
run_one_shot_established_state_counterexamples() {
  local transcript=$1 host=$2 integration=${git_publication_fixture_integration}
  local workspace=${NATIVE_ONE_SHOT_WORKSPACE} root=${git_publication_fixture_root}
  local obs="${root}/counterexample.txt" head
  local response="${transcript%/*}/response.md" observed=${transcript}
  local report=${response}
  head=$(git -C "${workspace}" rev-parse HEAD)
  # Prints the state as observed now.
  # shellcheck disable=SC2329 # Run by name through the shared counterexample forms.
  established_observe() {
    git_publication_fixture_observe_one_shot_established one-shot-established \
      complete "${observed}" "${host}" "${report}"
  }
  established_observe > "${root}/passing.txt"
  git_publication_suite_counterexamples \
    "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native-one-shot-established.sh" \
    "${root}/passing.txt"

  git_publication_one_shot_remote_counterexamples established_observe
  git_publication_one_shot_retained_counterexamples established_observe \
    'not committed in the established workspace'

  git -C "${workspace}" reset -q --soft "${git_publication_fixture_trunk_sha}"
  native_assessor_rejects_observed result-uncommitted result \
    "${obs}" established_observe -- fail 'not committed in the established workspace'
  git -C "${workspace}" reset -q --hard "${head}"

  mkdir -p "${workspace}/.planning/agents"
  printf '{}\n' > "${workspace}/.planning/agents/native.json"
  git -C "${workspace}" add .planning/agents/native.json
  git -C "${workspace}" commit -q --amend --no-edit
  native_assessor_rejects_observed result-records-profile planning \
    "${obs}" established_observe -- fail 'agent profile'
  git -C "${workspace}" reset -q --hard "${head}"

  # The session ran the start again before committing.
  observed="${root}/second-start.jsonl"
  sed 's/git commit/node execution-start.mjs start --one-shot \&\& git commit/' \
    "${transcript}" > "${observed}"
  native_assessor_rejects_observed second-start second-start \
    "${obs}" established_observe -- fail 'second start'
  observed=${transcript}

  report="${root}/silent-report.md"
  printf 'Done.\n' > "${report}"
  native_assessor_rejects_observed report-silent report \
    "${obs}" established_observe -- fail 'does not name the retained workspace'
  report=${response}

  printf 'human working tree, changed\n' > "${integration}/human-unstaged.txt"
  native_assessor_rejects_observed human-edit human-edit \
    "${obs}" established_observe -- fail 'human edits'
  git_publication_fixture_plant_human_edit "${integration}"

  git_publication_suite_passes_observed "${obs}" established_observe \
    -- 'continued its established start'
}
