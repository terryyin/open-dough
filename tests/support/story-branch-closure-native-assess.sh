#!/usr/bin/env bash
# Story Branch closure assessor.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/native-completion-observation.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-completion-observation.sh"
# shellcheck source=tests/support/story-branch-closure-native-response.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/story-branch-closure-native-response.sh"
story_closure_assess_file="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/story-branch-closure-native-assess.sh"

# Signals for rejected cases of story_closure_assess.
# assessor-signal: integration integrated-sha
# assessor-signal: trunk-target trunk-target
# assessor-signal: observer-count observer-count
# assessor-signal: harness-inspected harness-inspected
# assessor-signal: forced-stop forced-stop
# assessor-signal: trunk-registration trunk-registered
# assessor-signal: retire-command retire-command
# assessor-signal: worktree worktree-present
# assessor-signal: local-branch local-branch-present
# assessor-signal: cleanup-observers cleanup-observer-states
# assessor-signal: remote-branch branch-remote
# assessor-signal: control-order control-order
# assessor-signal: response response
story_closure_assess() {
  local observations=$1 remote branch trunk integrated
  remote=$(native_observation_field "${observations}" remote-sha)
  branch=$(native_observation_field "${observations}" branch-sha)
  trunk=$(native_observation_field "${observations}" trunk-before-sha)
  integrated=$(native_observation_field "${observations}" integrated-sha)
  [[ ${remote} == "${integrated}" && ${integrated} != "${branch}" &&
    ${integrated} != "${trunk}" ]] || return 1
  grep -Fqx 'merge-parent-count: 2' "${observations}" || return 1
  grep -Fqx 'source-resolution-correct: true' "${observations}" || return 1
  grep -Fqx 'branch-target: exec/story' "${observations}" || return 1
  grep -Fqx 'trunk-target: main' "${observations}" || return 1
  grep -Fqx 'observer-count: 2' "${observations}" || return 1
  grep -Eq '^branch-terminal: (stopped|finished)$' "${observations}" || return 1
  grep -Eq '^trunk-terminal: (stopped|finished)$' "${observations}" || return 1
  grep -Fqx 'trunk-coverage-state: success' "${observations}" || return 1
  grep -Fqx 'branch-complete-count: 1' "${observations}" || return 1
  grep -Fqx 'branch-await-count: 0' "${observations}" || return 1
  grep -Fqx 'branch-stop-count: 0' "${observations}" || return 1
  grep -Fqx 'trunk-registered: true' "${observations}" || return 1
  grep -Fqx 'trunk-complete-count: 1' "${observations}" || return 1
  grep -Fqx 'trunk-await-count: 0' "${observations}" || return 1
  grep -Fqx 'trunk-stop-count: 0' "${observations}" || return 1
  grep -Fqx 'branch-product-shutdown: true' "${observations}" || return 1
  grep -Fqx 'trunk-product-shutdown: true' "${observations}" || return 1
  grep -Fqx 'forced-stop: false' "${observations}" || return 1
  grep -Fqx 'retire-command: true' "${observations}" || return 1
  grep -Fqx 'worktree-present: false' "${observations}" || return 1
  grep -Fqx 'local-branch-present: false' "${observations}" || return 1
  grep -Eqx 'cleanup-observer-states: exec/story: (stopped|finished),main: (stopped|finished)' \
    "${observations}" || return 1
  grep -Fqx 'branch-remote: absent' "${observations}" || return 1
  grep -Fqx 'cleanup-complete: true' "${observations}" || return 1
  grep -Fqx 'human-edit-preserved: true' "${observations}" || return 1
  [[ $(story_closure_response_trunk_result \
    <(native_response_field_read "${observations}")) == true ]] || return 1
  grep -Fqx 'harness-inspected: false' "${observations}" || return 1
  native_completion_control_order "${observations}" branch-complete \
    branch-shutdown trunk-setup integration-publication trunk-registration \
    trunk-complete trunk-ci-release trunk-coverage-success trunk-shutdown \
    cleanup-complete
}
