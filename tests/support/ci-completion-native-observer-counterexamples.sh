#!/usr/bin/env bash
# Credential-free counterexample for ci_completion_observe: a fixture with no
# host session, observed as it stands, pins the observation's field names and
# order that the completion assessor and the retained evidence read.
# shellcheck disable=SC2154,SC2312

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
    'completion-marker: 0' \
    'failure-reported: false' \
    'control-order:' \
    'node-completion-calls:'
}

run_ci_completion_observer_counterexamples() {
  local scenarios='pending ready' scenario root harness failure='' observed
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
  done
  [[ -z ${failure} ]] || printf 'FAIL: execution-review observer: %s\n' "${failure}" >&2
  [[ -z ${failure} ]]
}
