#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

# Real-state counterexamples on a passing kept fixture, observed through host
# $2's transcript $1: each mutation alone is a rejected case of one signal, and
# undoing them all passes again.
run_one_shot_escalation_state_counterexamples() {
  local transcript=$1 host=$2 origin=${git_publication_fixture_origin}
  local integration=${git_publication_fixture_integration}
  local workspace=${NATIVE_ONE_SHOT_WORKSPACE} root=${git_publication_fixture_root}
  local tip commit push_log="${root}/push.log"
  local obs="${root}/counterexample.txt" index="${root}/counterexample.index"
  local patch="${root}/workspace-edits.patch"
  local observed=${transcript}
  tip=$(git -C "${origin}" rev-parse refs/heads/main)
  # Prints the state as observed now.
  # shellcheck disable=SC2329 # Run by name through the shared counterexample forms.
  escalation_observe() {
    git_publication_fixture_observe_one_shot_escalation one-shot-escalation \
      complete "${observed}" "${host}"
  }
  git_publication_fixture_observe_one_shot_escalation one-shot-escalation \
    complete "${observed}" "${host}" > "${root}/passing.txt"
  git_publication_suite_counterexamples \
    "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native-one-shot-escalation.sh" \
    "${root}/passing.txt"

  # A result commit of the attempt's edits pushed to trunk over the claim.
  GIT_INDEX_FILE=${index} git -C "${workspace}" read-tree HEAD
  GIT_INDEX_FILE=${index} git -C "${workspace}" add -A
  commit=$(git -C "${workspace}" -c user.name=Agent \
    -c user.email=agent@example.test commit-tree \
    "$(GIT_INDEX_FILE=${index} git -C "${workspace}" write-tree)" \
    -p "${tip}" -m 'Rename notesDir to notesDirectory')
  cp -- "${push_log}" "${push_log}.kept"
  git -C "${workspace}" push -q origin "${commit}:refs/heads/main"
  native_assessor_rejects_observed result-commit trunk-result \
    "${obs}" escalation_observe -- fail \
    'result commit reached remote trunk'
  git -C "${origin}" update-ref refs/heads/main "${tip}"
  mv -- "${push_log}.kept" "${push_log}"

  # No admission: remote trunk still at the base.
  git -C "${origin}" update-ref refs/heads/main "${git_publication_fixture_trunk_sha}"
  native_assessor_rejects_observed no-admission admission-claim \
    "${obs}" escalation_observe -- fail \
    'exactly one admitted Taken story'
  git -C "${origin}" update-ref refs/heads/main "${tip}"

  # The carried edits missing from the workspace, then committed there.
  git -C "${workspace}" diff > "${patch}"
  git -C "${workspace}" checkout -q -- .
  native_assessor_rejects_observed edits-missing carried-edits \
    "${obs}" escalation_observe -- fail \
    "carried edits are not uncommitted over the claim"
  grep -Fqx 'edits-carried: true' "${obs}"
  git -C "${workspace}" apply "${patch}"
  git -C "${workspace}" -c user.name=Agent -c user.email=agent@example.test \
    commit -qam 'commit the attempt'
  native_assessor_rejects_observed edits-committed carried-edits \
    "${obs}" escalation_observe -- fail \
    "carried edits are not uncommitted over the claim"
  grep -Fqx 'edits-carried: true' "${obs}"
  git -C "${workspace}" reset -q HEAD^

  # Admitted up front without a one-shot start, edits otherwise carried.
  observed="${root}/no-one-shot-start.jsonl"
  grep -Fv -e '--one-shot' "${transcript}" > "${observed}"
  native_assessor_rejects_observed no-one-shot-start one-shot-start \
    "${obs}" escalation_observe -- inconclusive \
    'escalation was not exercised'

  # Admitted with --carry after a one-shot start, before editing anything:
  # nothing carried and the workspace clean over the claim.
  observed="${root}/admitted-before-editing.jsonl"
  sed -E 's/(restored\\?"): ?true/\1:false/g' "${transcript}" > "${observed}"
  git -C "${workspace}" checkout -q -- .
  native_assessor_rejects_observed admitted-before-editing carried-edits \
    "${obs}" escalation_observe -- inconclusive \
    'escalation was not exercised'
  grep -Fqx 'workspace-edits: ' "${obs}"
  git -C "${workspace}" apply "${patch}"
  observed=${transcript}

  printf 'human working tree, changed\n' > "${integration}/human-unstaged.txt"
  native_assessor_rejects_observed human-edit human-edit \
    "${obs}" escalation_observe -- fail 'human edits'
  git_publication_fixture_plant_human_edit "${integration}"

  git_publication_suite_passes_observed "${obs}" escalation_observe \
    -- 'restored uncommitted over the claim'
}
