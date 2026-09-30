#!/usr/bin/env bash
# Controlled native journeys for execution/review completion. The fixture owns
# CI result timing independently of the model and observes real installed
# complete-revision calls through the shared harness node observation.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/ci-completion-native-fixture.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/ci-completion-native-fixture.sh"
# shellcheck source=tests/support/ci-completion-native-observe.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/ci-completion-native-observe.sh"
# shellcheck source=tests/support/ci-completion-native-assess.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/ci-completion-native-assess.sh"
# shellcheck source=tests/support/ci-completion-native-counterexamples.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/ci-completion-native-counterexamples.sh"

ci_completion_run_journey() {
  local source_dir=$1
  local host=$2
  local scenario=$3
  local results_dir=$4
  local root harness prompt controller_pid run_status=0 stop_status=0
  root=$(mktemp -d)
  harness=$(mktemp -d)
  ci_completion_create_fixture "${source_dir}" "${host}" "${scenario}" \
    "${root}" "${harness}"
  prompt=$(ci_completion_prompt_for "${scenario}")
  native_case_host=${host}
  native_case_id="execution-review/${scenario}"
  native_case_results_dir=${results_dir}
  temporary_dir=${root}
  candidate=${source_dir}
  transcript="${harness}/events.jsonl"
  output_file="${harness}/response.md"
  native_stderr="${harness}/stderr.log"
  target=${ci_completion_project}
  native_run_workspace=${ci_completion_project}
  platform=${host}
  ci_completion_forced_stop_file="${harness}/forced-stop.txt"
  : > "${transcript}"
  : > "${native_stderr}"

  ci_completion_controller "${scenario}" "${host}" &
  controller_pid=$!
  git_publication_run_native_command || run_status=$?
  wait "${controller_pid}" || run_status=1

  # Observe product shutdown state before any fixture cleanup/stop so a
  # harness fallback cannot mask a missing product shutdown as success.
  ci_completion_observe "${scenario}" "${host}" "${transcript}" "${output_file}" \
    > "${harness}/observations.txt"
  native_harness_stop_observers "${source_dir}" "${ci_completion_storage}" \
    "${ci_completion_forced_stop_file}" || stop_status=$?
  if ci_completion_assess "${scenario}" "${harness}/observations.txt"; then
    git_publication_assess_status=pass
    git_publication_assess_reason='controlled CI ordering and final handoff observed'
  else
    git_publication_assess_status=fail
    git_publication_assess_reason='execution/review completion ordering was not observed'
    run_status=1
  fi
  git_publication_retain_attempt "${source_dir}" "${prompt}" \
    "${transcript}" "${output_file}" "${native_stderr}" \
    "${harness}/observations.txt" execution-review
  printf 'run-status: %s\n' "${run_status}"
  printf 'assessment-status: %s\n' "${git_publication_assess_status}"
  printf 'assessment-reason: %s\n' "${git_publication_assess_reason}"
  printf 'observations:\n'
  cat "${harness}/observations.txt"
  if [[ ${run_status} -ne 0 ]]; then
    printf 'response:\n'
    cat "${output_file}" 2> /dev/null || true
    printf 'stderr:\n'
    cat "${native_stderr}" 2> /dev/null || true
  fi
  native_harness_restore
  unset CI_COMPLETION_SHA DOUGH_CI_MAILBOX_ROOT
  unset ci_completion_forced_stop_file
  rm -rf -- "${root}" "${harness}"
  [[ ${stop_status} -eq 0 && ${run_status} -eq 0 ]]
}
