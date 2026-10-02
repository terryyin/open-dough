#!/usr/bin/env bash
# Trunk Mode closure assessor.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/native-completion-observation.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-completion-observation.sh"
trunk_closure_assess_file="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/trunk-closure-native-assess.sh"

# Signals for rejected cases of trunk_closure_assess, including the owned
# context's (trunk-closure-native-owned-context.sh).
# assessor-signal: finish finish-count
# assessor-signal: complete-revision complete-revision-count
# assessor-signal: control-order control-order
# assessor-signal: registration registered
# assessor-signal: forced-stop forced-stop
# assessor-signal: provider-calls provider-candidate-calls
# assessor-signal: cleanup-observer cleanup-observer-state
# assessor-signal: worktree checkout-present-after
# assessor-signal: branch branch-present
# assessor-signal: repository-intact repository-intact
# assessor-signal: other-checkouts other-checkouts
# assessor-signal: default-checkout default-checkout-present
# assessor-signal: response response-completion-result
trunk_closure_assess() {
  local scenario=$1
  local observations=$2
  local remote candidate state basis terminal finishes completes awaits registered stops
  local cleanup harness product_shutdown forced_stop mailbox_target
  remote=$(native_observation_field "${observations}" remote-sha)
  candidate=$(native_observation_field "${observations}" candidate-sha)
  state=$(native_observation_field "${observations}" coverage-state)
  basis=$(native_observation_field "${observations}" basis-state)
  terminal=$(native_observation_field "${observations}" observer-terminal)
  finishes=$(native_observation_field "${observations}" finish-count)
  completes=$(native_observation_field "${observations}" complete-revision-count)
  awaits=$(native_observation_field "${observations}" await-count)
  registered=$(native_observation_field "${observations}" registered)
  stops=$(native_observation_field "${observations}" stop-count)
  cleanup=$(native_observation_field "${observations}" cleanup-complete)
  harness=$(native_observation_field "${observations}" harness-inspected)
  product_shutdown=$(native_observation_field "${observations}" product-shutdown)
  forced_stop=$(native_observation_field "${observations}" forced-stop)
  mailbox_target=$(native_observation_field "${observations}" mailbox-target)
  # Fixture fallback stop must never turn a missing product shutdown into a pass.
  [[ ${forced_stop} == false && ${product_shutdown} == true ]] || return 1
  # One installed `finish` owns completion; the worktree and its branch are
  # gone, and the observer had shut down when the worktree disappeared.
  grep -Eq '^cleanup-observer-state: (stopped|finished)$' "${observations}" \
    && grep -Fxq 'checkout-present-after: false' "${observations}" \
    && grep -Fxq 'branch-present: false' "${observations}" || return 1
  [[ ${remote} == "${candidate}" && ${finishes} == 1 && ${completes} == 0 &&
    ${awaits} == 0 &&
    ${registered} == true && ${stops} == 0 && ${cleanup} == true &&
    ${mailbox_target} == main &&
    ${harness} == false &&
    (${terminal} == stopped || ${terminal} == finished) ]] || return 1
  grep -Fqx 'response-completion-result: true' "${observations}" || return 1
  [[ ${scenario} != owned-context ]] \
    || trunk_closure_owned_context_assess "${observations}" || return 1
  if [[ ${scenario} == source ]]; then
    [[ ${state} == success ]] || return 1
    native_completion_control_order "${observations}" publication \
      registration complete-start ci-release coverage-success shutdown \
      cleanup-complete
  else
    [[ ${state} == not_required && ${basis} == success ]] || return 1
    grep -Fq 'provider-candidate-calls: 0' "${observations}" || return 1
    native_completion_control_order "${observations}" publication \
      registration coverage-not-required complete-start shutdown \
      cleanup-complete
  fi
}
