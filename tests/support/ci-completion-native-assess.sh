#!/usr/bin/env bash
# Execution/review completion assessor and its credential-free rejected cases.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/native-assessor-counterexample.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-assessor-counterexample.sh"
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

# Passing observations of each scenario, as ci-completion-native-run.sh writes
# them: `pending` and `ready` release CI around the review's completion call
# (`ready` also sees the coverage terminal first); `skip-retro` never starts a
# review; `failure` leaves the observer unfinished with the worker alive and
# reports the failure without a marker. Control steps get consecutive stamps.
ci_completion_write_observation() {
  local scenario=$1 state=success terminal=stopped shutdown=true
  local alive=false started=true completed=false marker=1 reported=false
  local steps step n=0 order=
  case ${scenario} in
    pending) completed=true steps='review-start complete-start ci-release' ;;
    ready)
      completed=true
      steps='review-start ci-release coverage-terminal review-complete'
      ;;
    skip-retro) started=false steps='ci-release' ;;
    failure)
      state=failure terminal=missing shutdown=false alive=true marker=0
      reported=true steps='review-start'
      ;;
    *) return 2 ;;
  esac
  for step in ${steps}; do
    n=$((n + 1))
    order+="  ${step} 2026-01-01T00:00:0${n}Z"$'\n'
  done
  printf '%s\n' "scenario: ${scenario}" "coverage-state: ${state}" \
    "observer-terminal: ${terminal}" 'complete-count: 1' 'stop-count: 0' \
    'await-count: 0' "product-shutdown: ${shutdown}" 'forced-stop: false' \
    "worker-alive: ${alive}" "review-started: ${started}" \
    "review-completed: ${completed}" "completion-marker: ${marker}" \
    "failure-reported: ${reported}" 'control-order:' "${order%$'\n'}" \
    'node-completion-calls:' \
    '  node ci-mailbox.mjs complete-revision mailbox abc' > "$2"
}

run_ci_completion_scenario_counterexamples() {
  local work=$1 scenario
  for scenario in ready failure skip-retro; do
    ci_completion_write_observation "${scenario}" "${work}/${scenario}.txt"
    native_assessor_counterexamples "${ci_completion_assess_file}" \
      "${work}/${scenario}.txt" -- ci_completion_assess "${scenario}"
    case ${scenario} in
      ready)
        native_assessor_rejects_edit review-complete-before-coverage control-order \
          '/^  coverage-terminal /{h;d;};/^  review-complete /{G;}'
        ;;
      failure)
        native_assessor_rejects_edit failure-not-reported failure-report \
          's/^failure-reported: true$/failure-reported: false/'
        native_assessor_rejects_edit failure-with-marker completion-marker \
          's/^completion-marker: 0$/completion-marker: 1/'
        ;;
      skip-retro)
        native_assessor_rejects_edit review-started-anyway review-started \
          's/^review-started: false$/review-started: true/'
        ;;
      *) return 2 ;;
    esac
  done
}

run_ci_completion_assessor_counterexamples() {
  local work scenario=pending
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN
  ci_completion_write_observation "${scenario}" "${work}/${scenario}.txt"
  native_assessor_counterexamples "${ci_completion_assess_file}" \
    "${work}/${scenario}.txt" -- ci_completion_assess "${scenario}"
  # The published gate skipped: review never started, or the completion call
  # came first, with the outcome otherwise correct.
  native_assessor_rejects_edit review-not-started review-started \
    's/^review-started: true$/review-started: false/'
  native_assessor_rejects_edit complete-before-review control-order \
    '/^  review-start /d; s/^  complete-start \(.*\)$/  complete-start \1\
  review-start \1/'
  native_assessor_rejects_edit review-start-unstamped control-order \
    '/^  review-start /d'
  # The fixture's fallback stop: the observer looks stopped, but only because
  # the harness stopped it, with the product shutdown it masks.
  native_assessor_rejects_edit fixture-masked-shutdown forced-stop \
    's/^forced-stop: false$/forced-stop: true/; s/^product-shutdown: true$/product-shutdown: false/'
  run_ci_completion_scenario_counterexamples "${work}"
}
