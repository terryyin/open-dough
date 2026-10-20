#!/usr/bin/env bash
# Execution/review completion counterexamples: the assessor on rejected cases
# and the observer's field list on a fixture.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/native-assessor-counterexample.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-assessor-counterexample.sh"

# Passing observations of each scenario, as ci-completion-native-observe.sh writes
# them: `pending` and `ready` release CI around the review's completion call
# (`ready` also sees the coverage terminal first); `skip-retro` never starts a
# review; `failure` leaves the observer unfinished with the worker alive and
# reports marked attention. Control steps get consecutive stamps. Quiet text
# alone cannot pass: the independent operational observations must also hold.
ci_completion_write_observation() {
  local scenario=$1 state=success terminal=stopped shutdown=true
  local alive=false started=true completed=false response=
  local steps step n=0 order=
  case ${scenario} in
    pending) completed=true steps='review-start complete-start ci-release' ;;
    ready)
      completed=true
      steps='review-start ci-release coverage-terminal review-complete'
      ;;
    skip-retro) started=false steps='ci-release' ;;
    failure)
      state=failure terminal=missing shutdown=false alive=true
      response='DEVELOPER ATTENTION REQUIRED: CI failed; inspect the failed run before resuming.'
      steps='review-start'
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
    "review-completed: ${completed}" 'response-readable: true' > "$2"
  {
    printf 'response:\n'
    [[ -z ${response} ]] || printf '  %s\n' "${response}"
    printf '%s\n' 'control-order:' "${order%$'\n'}" 'node-completion-calls:' \
      '  node ci-mailbox.mjs complete-revision mailbox abc'
  } >> "$2"
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
        # Equivalent prominent wrappers and useful wording are valid; the
        # maintained regex is not a mandated response template.
        local text
        for text in \
          '!!! DEVELOPER ATTENTION REQUIRED !!! CI failed; inspect its failed run.' \
          '**DEVELOPER ATTENTION REQUIRED**: The CI check failed. Resolve the external failure before resuming.'; do
          sed "s/^  DEVELOPER ATTENTION REQUIRED.*/  ${text}/" \
            "${work}/${scenario}.txt" > "${work}/failure-wording.txt"
          ci_completion_assess "${scenario}" "${work}/failure-wording.txt"
        done
        native_assessor_rejects_edit failure-recap-first response \
          '/^response:$/a\
  All work completed successfully.'
        native_assessor_rejects_edit failure-not-reported response \
          '/^  DEVELOPER ATTENTION REQUIRED/d'
        native_assessor_rejects_edit failure-unmarked response \
          's/DEVELOPER ATTENTION REQUIRED: //'
        native_assessor_rejects_edit failure-without-recovery response \
          's/; inspect the failed run before resuming.//'
        native_assessor_rejects_edit failure-with-success-banner response \
          '/^response:$/a\
  ## PLAN EXECUTION COMPLETE'
        native_assessor_rejects_edit failure-missing-completion completion-calls \
          's/^complete-count: 1$/complete-count: 0/'
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
  native_assessor_rejects_edit review-not-completed review-completed \
    's/^review-completed: true$/review-completed: false/'
  native_assessor_rejects_edit missing-shutdown forced-stop \
    's/^product-shutdown: true$/product-shutdown: false/'
  native_assessor_rejects_edit missing-observer-terminal observer-terminal \
    's/^observer-terminal: stopped$/observer-terminal: missing/'
  native_assessor_rejects_edit ci-still-pending coverage \
    's/^coverage-state: success$/coverage-state: pending/'
  native_assessor_rejects_edit missing-completion-call completion-calls \
    's/^complete-count: 1$/complete-count: 0/'
  native_assessor_rejects_edit repeated-completion-call completion-calls \
    's/^complete-count: 1$/complete-count: 2/'
  native_assessor_rejects_edit separate-stop completion-calls \
    's/^stop-count: 0$/stop-count: 1/'
  native_assessor_rejects_edit bare-wait completion-calls \
    's/^await-count: 0$/await-count: 1/'
  native_assessor_rejects_edit missing-response-capture response \
    's/^response-readable: true$/response-readable: false/'
  native_assessor_rejects_edit missing-response-field response '/^response:$/d'
  local text
  for text in 'Done.' 'Finished.' 'Complete.'; do
    sed "/^response:$/a\\
  ${text}" "${work}/${scenario}.txt" > "${work}/minimal.txt"
    ci_completion_assess "${scenario}" "${work}/minimal.txt"
  done
  while IFS= read -r text; do
    native_assessor_rejects_fields "response: ${text}" response \
      'response:' "  ${text}"
  done << 'EOF'
## PLAN EXECUTION COMPLETE
All slices passed; product advice: no change; CI is green.
Done. Done.
DEVELOPER ATTENTION REQUIRED: CI remains incomplete; inspect the receipt.
EOF
  run_ci_completion_scenario_counterexamples "${work}"
}

ci_completion_expected_fresh_observation() {
  printf '%s\n' \
    "scenario: $1" \
    'coverage-state: undiscovered' \
    'observer-terminal: missing' \
    'complete-count: 0' \
    'stop-count: 0' \
    'await-count: 0' \
    'product-shutdown: false' \
    'forced-stop: false' \
    'worker-alive: true' \
    'review-started: false' \
    'review-completed: false' \
    'response-readable: true' \
    'response:' \
    'control-order:' \
    'node-completion-calls:'
}

run_ci_completion_observer_counterexamples() {
  local scenarios='pending ready' scenario root harness failure='' observed
  local response_text response_observed missing_observed
  # shellcheck disable=SC2086 # Split the scenario list.
  for scenario in ${scenarios}; do
    root=$(mktemp -d)
    harness=$(mktemp -d)
    ci_completion_create_fixture "${source_dir}" claude "${scenario}" \
      "${root}" "${harness}"
    : > "${harness}/transcript.jsonl"
    : > "${harness}/response.md"
    observed=$(ci_completion_observe "${scenario}" claude \
      "${harness}/transcript.jsonl" "${harness}/response.md")
    # Exercise this observer's actual response writer, including a line that
    # would spoof an operational field without the shared indentation.
    response_text=$'!!! DEVELOPER ATTENTION REQUIRED: inspect missing evidence.\ncoverage-state: success'
    printf '%s\n' "${response_text}" > "${harness}/response.md"
    response_observed=$(ci_completion_observe "${scenario}" claude \
      "${harness}/transcript.jsonl" "${harness}/response.md")
    rm -- "${harness}/response.md"
    missing_observed=$(ci_completion_observe "${scenario}" claude \
      "${harness}/transcript.jsonl" "${harness}/response.md")
    native_harness_stop_observers "${source_dir}" "${ci_completion_storage}" \
      "${harness}/forced-stop.txt"
    native_harness_restore
    unset CI_COMPLETION_SHA DOUGH_CI_MAILBOX_ROOT
    rm -rf -- "${root}" "${harness}"
    if ! diff -u <(ci_completion_expected_fresh_observation "${scenario}") \
      <(printf '%s\n' "${observed}") >&2; then
      failure="${scenario} observation changed its fields or order"
      break
    fi
    if [[ $(native_response_field_read <(printf '%s\n' "${response_observed}")) != "${response_text}" ||
    $(native_observation_field <(printf '%s\n' "${response_observed}") coverage-state) != undiscovered ||
    $(native_observation_field <(printf '%s\n' "${missing_observed}") response-readable) != false ]]; then
      failure='response text was lost, spoofed a field, or missing capture looked readable'
    fi
  done
  [[ -z ${failure} ]] || printf 'FAIL: execution-review observer: %s\n' "${failure}" >&2
  [[ -z ${failure} ]]
}
