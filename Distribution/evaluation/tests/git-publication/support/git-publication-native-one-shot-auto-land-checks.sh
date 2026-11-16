#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

# Rejected start cases of the auto-land journey, observed through host $2's
# transcript $1 on its kept passing fixture: a start without --auto-land.
run_one_shot_auto_land_stream_counterexamples() {
  local transcript=$1 host=$2 root=${git_publication_fixture_root} observed=$1
  # Prints the state as observed now.
  # shellcheck disable=SC2329 # Run by name through the shared counterexample forms.
  auto_land_observe() {
    git_publication_fixture_observe_one_shot one-shot-auto-land complete \
      "${observed}" "${host}"
  }
  auto_land_observe > "${root}/passing.txt"
  git_publication_suite_counterexamples \
    "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native-one-shot.sh" \
    "${root}/passing.txt"
  observed="${root}/no-auto-land.jsonl"
  sed 's/ --auto-land//g' "${transcript}" > "${observed}"
  native_assessor_rejects_observed no-auto-land-start auto-land-start \
    "${root}/counterexample.txt" auto_land_observe -- fail 'automatic-landing start'
}

# Real-state counterexamples on a passing kept fixture of the blocked
# journey, observed through host $2's transcript $1: each mutation alone is a
# rejected case of one signal, and undoing them all passes again.
run_one_shot_auto_land_blocked_state_counterexamples() {
  local transcript=$1 host=$2 integration=${git_publication_fixture_integration}
  local workspace=${NATIVE_ONE_SHOT_WORKSPACE} root=${git_publication_fixture_root}
  local origin=${git_publication_fixture_origin} rival=${git_publication_one_shot_rival_sha}
  local obs="${root}/counterexample.txt" head
  local response="${transcript%/*}/response.md" observed=${transcript}
  local report=${response}
  head=$(git -C "${workspace}" rev-parse HEAD)
  # Prints the state as observed now.
  # shellcheck disable=SC2329 # Run by name through the shared counterexample forms.
  blocked_observe() {
    git_publication_fixture_observe_one_shot_blocked one-shot-auto-land-blocked \
      complete "${observed}" "${host}" "${report}"
  }
  blocked_observe > "${root}/passing.txt"
  git_publication_suite_counterexamples \
    "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native-one-shot-auto-land.sh" \
    "${root}/passing.txt"

  # The result forced over the competing Take.
  cp -- "${root}/push.log" "${root}/push.log.kept"
  git -C "${origin}" fetch -q "${workspace}" HEAD:refs/counterexample/forced
  git -C "${origin}" update-ref refs/heads/main "${head}"
  printf '%s %s refs/heads/main\n' "${rival}" "${head}" >> "${root}/push.log"
  native_assessor_rejects_observed result-forced remote \
    "${obs}" blocked_observe -- fail 'changed the remote'
  git -C "${origin}" update-ref refs/heads/main "${rival}"
  git -C "${origin}" update-ref -d refs/counterexample/forced
  mv -- "${root}/push.log.kept" "${root}/push.log"

  rm -- "${root}/rival-applied"
  native_assessor_rejects_observed take-never-applied competing \
    "${obs}" blocked_observe -- fail 'competing Take never reached'
  touch "${root}/rival-applied"

  git_publication_one_shot_retained_counterexamples blocked_observe 'not retained'
  git -C "${workspace}" reset -q --soft "${git_publication_fixture_trunk_sha}"
  native_assessor_rejects_observed result-uncommitted result \
    "${obs}" blocked_observe -- fail 'not retained'
  git -C "${workspace}" reset -q --hard "${head}"

  observed="${root}/no-auto-land.jsonl"
  sed 's/ --auto-land//g' "${transcript}" > "${observed}"
  native_assessor_rejects_observed no-auto-land-start one-shot-start \
    "${obs}" blocked_observe -- fail 'automatic-landing start'
  observed=${transcript}

  report="${root}/silent-report.md"
  printf 'Done.\n' > "${report}"
  native_assessor_rejects_observed report-silent report \
    "${obs}" blocked_observe -- fail 'ownership stop'
  report="${root}/workspace-only-report.md"
  printf 'The result is in %s.\n' "${workspace}" > "${report}"
  native_assessor_rejects_observed report-without-stop report \
    "${obs}" blocked_observe -- fail 'ownership stop'
  report=${response}

  printf 'human working tree, changed\n' > "${integration}/human-unstaged.txt"
  native_assessor_rejects_observed human-edit human-edit \
    "${obs}" blocked_observe -- fail 'human edits'
  git_publication_fixture_plant_human_edit "${integration}"

  git_publication_suite_passes_observed "${obs}" blocked_observe \
    -- 'landing stopped for the competing owner'
}
