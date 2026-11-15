#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

# Real-state counterexamples on a passing kept fixture of the review journey,
# observed through host $2's transcript $1: each mutation alone is a rejected
# case of one signal, and undoing them all passes again.
run_one_shot_review_state_counterexamples() {
  local transcript=$1 host=$2 integration=${git_publication_fixture_integration}
  local workspace=${NATIVE_ONE_SHOT_WORKSPACE} root=${git_publication_fixture_root}
  local obs="${root}/counterexample.txt" head
  local response="${transcript%/*}/response.md" observed=${transcript}
  local report=${response}
  head=$(git -C "${workspace}" rev-parse HEAD)
  # Prints the state as observed now.
  # shellcheck disable=SC2329 # Run by name through the shared counterexample forms.
  review_observe() {
    git_publication_fixture_observe_one_shot_review one-shot-review complete \
      "${observed}" "${host}" "${report}"
  }
  review_observe > "${root}/passing.txt"
  git_publication_suite_counterexamples \
    "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native-one-shot-review.sh" \
    "${root}/passing.txt"

  git_publication_one_shot_remote_counterexamples review_observe
  git_publication_one_shot_retained_counterexamples review_observe \
    'not retained for review'

  # The result left uncommitted, then committed without the requested line.
  git -C "${workspace}" reset -q --soft "${git_publication_fixture_trunk_sha}"
  native_assessor_rejects_observed result-uncommitted result \
    "${obs}" review_observe -- fail 'not committed in the owned workspace'
  git -C "${workspace}" reset -q --hard "${head}"
  printf 'Other line\n' >> "${workspace}/notes.txt"
  git -C "${workspace}" commit -q --amend -a --no-edit
  native_assessor_rejects_observed result-line-missing result \
    "${obs}" review_observe -- fail 'not committed in the owned workspace'
  git -C "${workspace}" reset -q --hard "${head}"

  # The result commit also records an agent profile.
  mkdir -p "${workspace}/.planning/agents"
  printf '{}\n' > "${workspace}/.planning/agents/native.json"
  git -C "${workspace}" add .planning/agents/native.json
  git -C "${workspace}" commit -q --amend --no-edit
  native_assessor_rejects_observed result-records-profile planning \
    "${obs}" review_observe -- fail 'agent profile records'
  git -C "${workspace}" reset -q --hard "${head}"

  observed="${root}/no-one-shot-start.jsonl"
  grep -Fv -e '--one-shot' "${transcript}" > "${observed}"
  native_assessor_rejects_observed no-one-shot-start one-shot-start \
    "${obs}" review_observe -- fail 'did not start through the one-shot start'
  observed="${root}/push-authorized-start.jsonl"
  sed 's/--one-shot/--one-shot --push-authorized/g' "${transcript}" > "${observed}"
  native_assessor_rejects_observed push-authorized-start one-shot-start \
    "${obs}" review_observe -- fail 'claimed push authority'
  observed=${transcript}

  report="${root}/silent-report.md"
  printf 'Done.\n' > "${report}"
  native_assessor_rejects_observed report-silent report \
    "${obs}" review_observe -- fail 'does not name the retained workspace'
  report=${response}

  printf 'human working tree, changed\n' > "${integration}/human-unstaged.txt"
  native_assessor_rejects_observed human-edit human-edit \
    "${obs}" review_observe -- fail 'human edits'
  git_publication_fixture_plant_human_edit "${integration}"

  git_publication_suite_passes_observed "${obs}" review_observe \
    -- 'waits committed in its retained workspace'
}
