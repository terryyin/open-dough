#!/usr/bin/env bash
# Credential-free counterexample for story_closure_observe: the fixture with no
# host session, observed before and after the integrated commit is recorded
# (fresh, integrated), pins the observation's field names and order that the
# assessor reads. Per-run commits and the branch mailbox path are replaced by
# their names.
# shellcheck disable=SC2154,SC2312

story_closure_normalized_observation() {
  local remote=$1 branch=$2 trunk=$3 mailbox=$4
  sed -e "s|${mailbox}|<branch-mailbox>|" \
    -e "s|${branch}|<branch-sha>|" \
    -e "s|${trunk}|<trunk-before-sha>|" \
    -e "s|${remote}|<remote-sha>|"
}

story_closure_expected_observation() {
  local integrated=$1 parents=$2
  printf '%s\n' \
    'remote-sha: <trunk-before-sha>' \
    'branch-sha: <branch-sha>' \
    'trunk-before-sha: <trunk-before-sha>' \
    "integrated-sha: ${integrated}" \
    "merge-parent-count: ${parents}" \
    'source-resolution-correct: false' \
    'branch-mailbox: <branch-mailbox>' \
    'trunk-mailbox: missing' \
    'branch-target: exec/story' \
    'trunk-target: missing' \
    'observer-count: 1' \
    'branch-terminal: missing' \
    'trunk-terminal: missing' \
    'trunk-coverage-state: missing' \
    'branch-complete-count: 0' \
    'branch-await-count: 0' \
    'branch-stop-count: 0' \
    'trunk-registered: false' \
    'trunk-complete-count: 0' \
    'trunk-await-count: 0' \
    'trunk-stop-count: 0' \
    'branch-product-shutdown: false' \
    'trunk-product-shutdown: false' \
    'forced-stop: false' \
    'retire-command: false' \
    'worktree-present: true' \
    'local-branch-present: true' \
    'cleanup-observer-states: none' \
    'branch-remote: present' \
    'cleanup-complete: false' \
    'human-edit-preserved: true' \
    'control-order:' \
    'harness-inspected: false' \
    'response:'
}

story_closure_observe_fresh_fixture() {
  local scenario=$1 root harness observed
  root=$(mktemp -d)
  harness=$(mktemp -d)
  story_closure_create_fixture "${source_dir}" claude "${root}" "${harness}"
  : > "${harness}/transcript.jsonl"
  : > "${harness}/response.md"
  [[ ${scenario} == fresh ]] \
    || printf '%s\n' "${story_closure_branch_sha}" > "${story_closure_integrated_sha_file}"
  observed=$(story_closure_observe claude "${harness}/transcript.jsonl" \
    "${harness}/response.md" | story_closure_normalized_observation \
    "${story_closure_trunk_sha}" "${story_closure_branch_sha}" \
    "${story_closure_trunk_sha}" "${story_closure_branch_mailbox}")
  native_harness_stop_observers "${source_dir}" "${story_closure_storage}" \
    "${harness}/forced-stop.txt"
  story_closure_cleanup_fixture
  rm -rf -- "${root}" "${harness}"
  printf '%s\n' "${observed}"
}

run_story_closure_observer_counterexamples() {
  local failure='' observed
  observed=$(story_closure_observe_fresh_fixture fresh)
  diff -u <(story_closure_expected_observation missing 0) \
    <(printf '%s\n' "${observed}") >&2 \
    || failure='fresh observation changed its fields or order'
  observed=$(story_closure_observe_fresh_fixture integrated)
  [[ -n ${failure} ]] || diff -u <(story_closure_expected_observation \
    '<branch-sha>' 1) <(printf '%s\n' "${observed}") >&2 \
    || failure='integrated observation changed its fields or order'
  [[ -z ${failure} ]] || printf 'FAIL: Story Branch observer: %s\n' "${failure}" >&2
  [[ -z ${failure} ]]
}
