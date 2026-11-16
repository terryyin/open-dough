#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

# Real-state counterexamples on a passing kept fixture of the journey,
# observed through host $2's transcript $1: each mutation alone is a rejected
# case of one signal, and undoing them all passes again.
run_one_shot_default_main_state_counterexamples() {
  local transcript=$1 host=$2 checkout=${git_publication_fixture_integration}
  local origin=${git_publication_fixture_origin} root=${git_publication_fixture_root}
  local base=${git_publication_fixture_trunk_sha} local_sha=${git_publication_one_shot_local_sha}
  local obs="${root}/counterexample.txt" head moved
  local response="${transcript%/*}/response.md" observed=${transcript}
  local report=${response}
  head=$(git -C "${checkout}" rev-parse HEAD)
  # Prints the state as observed now.
  # shellcheck disable=SC2329 # Run by name through the shared counterexample forms.
  default_main_observe() {
    git_publication_fixture_observe_one_shot_default_main one-shot-default-main \
      complete "${observed}" "${host}" "${report}"
  }
  default_main_observe > "${root}/passing.txt"
  git_publication_suite_counterexamples \
    "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native-one-shot-default-main.sh" \
    "${root}/passing.txt"

  cp -- "${root}/push.log" "${root}/push.log.kept"
  git -C "${checkout}" push -q origin HEAD:refs/heads/main
  native_assessor_rejects_observed result-pushed remote \
    "${obs}" default_main_observe -- fail 'the remote changed'
  git -C "${origin}" update-ref refs/heads/main "${base}"
  git -C "${checkout}" update-ref refs/remotes/origin/main "${base}"
  mv -- "${root}/push.log.kept" "${root}/push.log"

  git -C "${checkout}" branch -q one-shot/extra
  native_assessor_rejects_observed extra-branch isolation \
    "${obs}" default_main_observe -- fail 'extra worktree or branch'
  git -C "${checkout}" worktree add -q "${root}/extra" one-shot/extra
  native_assessor_rejects_observed extra-worktree isolation \
    "${obs}" default_main_observe -- fail 'extra worktree or branch'
  git -C "${checkout}" worktree remove "${root}/extra"
  git -C "${checkout}" branch -q -D one-shot/extra

  # The result replayed onto trunk, dropping the earlier local commit.
  moved=$(git -C "${checkout}" commit-tree "${head}^{tree}" -p "${base}" -m 'result')
  git -C "${checkout}" reset -q --hard "${moved}"
  native_assessor_rejects_observed local-commit-lost checkout \
    "${obs}" default_main_observe -- fail 'earlier local commit'
  git -C "${checkout}" reset -q --hard "${head}"

  # The result left uncommitted.
  git -C "${checkout}" reset -q --soft "${local_sha}"
  native_assessor_rejects_observed result-uncommitted checkout \
    "${obs}" default_main_observe -- fail 'not committed in the default checkout'
  # Only the result committed, the existing changes discarded.
  git -C "${checkout}" reset -q
  git -C "${checkout}" commit -q -m 'Add the default line' -- notes.txt
  git -C "${checkout}" checkout -q -- .
  git -C "${checkout}" clean -qfd
  native_assessor_rejects_observed existing-changes-discarded checkout \
    "${obs}" default_main_observe -- fail 'existing changes were not committed'
  git -C "${checkout}" reset -q --hard "${head}"
  # Committed, then a file left beside the commit.
  printf 'later\n' > "${checkout}/later.txt"
  native_assessor_rejects_observed content-left-uncommitted checkout \
    "${obs}" default_main_observe -- fail 'uncommitted content'
  rm -f -- "${checkout}/later.txt"

  # The result commit also records an agent profile.
  mkdir -p "${checkout}/.planning/agents"
  printf '{}\n' > "${checkout}/.planning/agents/native.json"
  git -C "${checkout}" add .planning/agents/native.json
  git -C "${checkout}" commit -q --amend --no-edit
  native_assessor_rejects_observed result-records-profile planning \
    "${obs}" default_main_observe -- fail 'agent profile records'
  git -C "${checkout}" reset -q --hard "${head}"

  observed="${root}/no-default-main.jsonl"
  grep -Fv -e '--default-main' "${transcript}" > "${observed}"
  native_assessor_rejects_observed no-default-main-start one-shot-start \
    "${obs}" default_main_observe -- fail 'one-shot default-checkout start'
  observed="${root}/auto-land-start.jsonl"
  sed 's/--default-main/--default-main --auto-land --push-authorized/g' \
    "${transcript}" > "${observed}"
  native_assessor_rejects_observed auto-land-start one-shot-start \
    "${obs}" default_main_observe -- fail 'claimed push authority'
  observed=${transcript}

  report="${root}/silent-report.md"
  printf 'Done.\n' > "${report}"
  native_assessor_rejects_observed report-silent report \
    "${obs}" default_main_observe -- fail 'does not name the default checkout'
  report=${response}

  git_publication_suite_passes_observed "${obs}" default_main_observe \
    -- 'wait committed in the default checkout'
}
