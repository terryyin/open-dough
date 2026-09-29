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
ci_completion_assess() {
  local scenario=$1
  local observations=$2
  local state terminal complete_count stop_count await_count
  local product_shutdown forced_stop worker_alive
  local review_started review_completed marker failure_reported
  state=$(awk '/^coverage-state:/{print $2}' "${observations}")
  terminal=$(awk '/^observer-terminal:/{print $2}' "${observations}")
  complete_count=$(awk '/^complete-count:/{print $2}' "${observations}")
  stop_count=$(awk '/^stop-count:/{print $2}' "${observations}")
  await_count=$(awk '/^await-count:/{print $2}' "${observations}")
  product_shutdown=$(awk '/^product-shutdown:/{print $2}' "${observations}")
  forced_stop=$(awk '/^forced-stop:/{print $2}' "${observations}")
  worker_alive=$(awk '/^worker-alive:/{print $2}' "${observations}")
  review_started=$(awk '/^review-started:/{print $2}' "${observations}")
  review_completed=$(awk '/^review-completed:/{print $2}' "${observations}")
  marker=$(awk '/^completion-marker:/{print $2}' "${observations}")
  failure_reported=$(awk '/^failure-reported:/{print $2}' "${observations}")
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

# A passing `pending` observation: review started, then the agent's single
# completion call, then CI release, and the product shut its observer down.
ci_completion_write_pending_observation() {
  printf '%s\n' 'scenario: pending' 'coverage-state: success' \
    'observer-terminal: stopped' 'complete-count: 1' 'stop-count: 0' \
    'await-count: 0' 'product-shutdown: true' 'forced-stop: false' \
    'worker-alive: false' 'review-started: true' 'review-completed: true' \
    'completion-marker: 1' 'failure-reported: false' 'control-order:' \
    '  review-start 2026-01-01T00:00:01Z' \
    '  complete-start 2026-01-01T00:00:02Z' \
    '  ci-release 2026-01-01T00:00:03Z' 'node-completion-calls:' \
    '  node ci-mailbox.mjs complete-revision mailbox abc' > "$1"
}

run_ci_completion_assessor_counterexamples() {
  local work
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN
  ci_completion_write_pending_observation "${work}/pending.txt"
  native_assessor_counterexamples "${ci_completion_assess_file}" \
    "${work}/pending.txt" -- ci_completion_assess pending
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
  # the harness stopped it, alone and with the product shutdown it masks.
  native_assessor_rejects_edit forced-stop forced-stop \
    's/^forced-stop: false$/forced-stop: true/'
  native_assessor_rejects_edit fixture-masked-shutdown forced-stop \
    's/^forced-stop: false$/forced-stop: true/; s/^product-shutdown: true$/product-shutdown: false/'
}
