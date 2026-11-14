#!/usr/bin/env bash
# Credential-free one-shot journeys for tests/git-publication-native-one-shot.sh.
# Sourced by git-publication-native-substitute-suite.sh, whose
# prepare_substitute_hosts, substitute_run and substitute_run_passes it uses.
# shellcheck disable=SC2154 # Globals assigned by sourced helpers.

# The aggregate keeps the literal focused proof command; the suite schedules
# each journey group as its own job (tests/git-publication-native-one-shot-<group>.sh),
# so each stays well within the runner's safety deadline.
run_substitute_one_shot_journeys() {
  run_substitute_one_shot_result_journeys
  run_substitute_one_shot_review_journeys
  run_substitute_one_shot_workspace_journeys
}

# Result, queued and escalation journeys, and a result whose CI stays unobserved.
run_substitute_one_shot_result_journeys() {
  local journey
  prepare_substitute_hosts
  for journey in one-shot-result one-shot-queued one-shot-escalation; do
    run_substitute_one_shot_journey "${journey}"
  done
  substitute_run_passes claude-one-shot-result-unobserved claude one-shot-result \
    GIT_PUBLICATION_KEEP=1 NATIVE_ONE_SHOT_VARIANT=unobserved
  run_one_shot_unobserved_counterexamples \
    "${substitute_artifact}/events.jsonl" claude
  git_publication_fixture_cleanup
}

# Review and refinement journeys, each also against a run that pushes its result.
run_substitute_one_shot_review_journeys() {
  local journey
  prepare_substitute_hosts
  for journey in one-shot-review one-shot-refinement; do
    run_substitute_one_shot_journey "${journey}"
  done
  run_substitute_one_shot_review_pushes one-shot-review \
    git-publication-native-one-shot-review.sh
  run_substitute_one_shot_review_pushes one-shot-refinement \
    git-publication-native-one-shot-refinement.sh
}

run_substitute_one_shot_workspace_journeys() {
  local journey
  prepare_substitute_hosts
  for journey in one-shot-default-main one-shot-auto-land \
    one-shot-auto-land-blocked one-shot-established \
    one-shot-refinement-auto-land; do
    run_substitute_one_shot_journey "${journey}"
  done
}

# Whole-run counterexample for review journey $1, whose assessor file in
# tests/support is $2: a substitute that also pushes its committed result to
# remote trunk, against that journey's passing run above.
run_substitute_one_shot_review_pushes() {
  local journey=$1 work=${substitute_work}
  git_publication_suite_counterexamples "${source_dir}/tests/support/$2" \
    "${work}/claude-${journey}.txt"
  substitute_run "${journey}-pushes" claude "${journey}" \
    NATIVE_ONE_SHOT_VARIANT=pushes
  [[ ${substitute_status} -eq 0 ]]
  native_assessor_rejects "${journey}-pushes" remote \
    "${work}/${journey}-pushes.txt" fail 'the remote changed'
}

# One-shot journey $1 through the installed start, delivery and CI completion
# CLIs (or, escalating, start and admission), then real-state counterexamples
# on its kept fixture.
run_substitute_one_shot_journey() {
  local journey=$1 events counterexamples
  substitute_run_passes "claude-${journey}" claude "${journey}" \
    GIT_PUBLICATION_KEEP=1
  events="${substitute_artifact}/events.jsonl"
  # A journey with its own state counterexamples runs them; the landing
  # journeys share the one-shot ones.
  counterexamples="run_${journey//-/_}_state_counterexamples"
  if declare -F "${counterexamples}" > /dev/null; then
    "${counterexamples}" "${events}" claude
  else
    run_one_shot_state_counterexamples "${events}" "${journey}" claude
  fi
  if [[ ${journey} == one-shot-auto-land ]]; then
    run_one_shot_auto_land_stream_counterexamples "${events}" claude
  fi
  git_publication_fixture_cleanup
}
