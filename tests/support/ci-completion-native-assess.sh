#!/usr/bin/env bash
# Execution/review completion assessor.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/native-completion-observation.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-completion-observation.sh"
ci_completion_assess_file="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/ci-completion-native-assess.sh"

# Signals for rejected cases of ci_completion_assess. A fixture forced stop
# always records `product-shutdown: false`, so both fields express one fact.
# assessor-signal: review-started review-started
# assessor-signal: control-order control-order
# assessor-signal: forced-stop forced-stop product-shutdown
# assessor-signal: completion-marker completion-marker
# assessor-signal: failure-report failure-reported
ci_completion_assess() {
  local scenario=$1
  local observations=$2
  local state terminal complete_count stop_count await_count
  local product_shutdown forced_stop worker_alive
  local review_started review_completed marker failure_reported
  state=$(native_observation_field "${observations}" coverage-state)
  terminal=$(native_observation_field "${observations}" observer-terminal)
  complete_count=$(native_observation_field "${observations}" complete-count)
  stop_count=$(native_observation_field "${observations}" stop-count)
  await_count=$(native_observation_field "${observations}" await-count)
  product_shutdown=$(native_observation_field "${observations}" product-shutdown)
  forced_stop=$(native_observation_field "${observations}" forced-stop)
  worker_alive=$(native_observation_field "${observations}" worker-alive)
  review_started=$(native_observation_field "${observations}" review-started)
  review_completed=$(native_observation_field "${observations}" review-completed)
  marker=$(native_observation_field "${observations}" completion-marker)
  failure_reported=$(native_observation_field "${observations}" failure-reported)
  # Fixture fallback stop must never turn a missing product shutdown into a pass.
  [[ ${forced_stop} == false ]] || return 1
  case ${scenario} in
    pending | ready | skip-retro)
      [[ ${complete_count} == 1 && ${stop_count} == 0 && ${await_count} == 0 &&
        ${product_shutdown} == true &&
        (${terminal} == stopped || ${terminal} == finished) ]] || return 1
      ;;
    failure)
      [[ ${complete_count} == 1 && ${stop_count} == 0 &&
        ${product_shutdown} == false && ${terminal} == missing &&
        ${worker_alive} == true ]] || return 1
      ;;
    *) return 2 ;;
  esac
  case ${scenario} in
    pending)
      [[ ${state} == success && ${review_started} == true &&
        ${review_completed} == true && ${marker} == 1 ]] || return 1
      native_completion_control_order "${observations}" \
        review-start complete-start ci-release
      ;;
    ready)
      [[ ${state} == success && ${review_started} == true &&
        ${review_completed} == true && ${marker} == 1 ]] || return 1
      native_completion_control_order "${observations}" \
        review-start ci-release coverage-terminal review-complete
      ;;
    skip-retro)
      [[ ${state} == success && ${review_started} == false && ${marker} == 1 ]]
      ;;
    failure)
      [[ ${state} == failure && ${review_started} == true &&
        ${marker} == 0 && ${failure_reported} == true ]]
      ;;
    *) return 2 ;;
  esac
}
