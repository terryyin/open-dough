#!/usr/bin/env bash
# Native journey for delivery-evidence/consumers: stale exclusion with
# incompatible stand-in, corrected consumer with compatibility proof, and
# unchanged unrelated-boundary control.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/delivery-evidence-consumers-native-fixture.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/delivery-evidence-consumers-native-fixture.sh"
# shellcheck source=tests/support/delivery-evidence-consumers-native-observe.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/delivery-evidence-consumers-native-observe.sh"
# shellcheck source=tests/support/delivery-evidence-consumers-native-assess.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/delivery-evidence-consumers-native-assess.sh"

delivery_evidence_consumers_write_evidence_identity() {
  printf 'helper-identity: tests/support/delivery-evidence-consumers-native-run.sh\n'
  native_result_print_adapter_identity
  printf 'fixture-identity: tests/support/delivery-evidence-consumers-native-fixture.sh\n'
  printf 'scenario-content-identity: tests/support/delivery-evidence-consumers-native-scenario-content.sh\n'
  printf 'observe-identity: tests/support/delivery-evidence-consumers-native-observe.sh\n'
  printf 'assessor-identity: tests/support/delivery-evidence-consumers-native-assess.sh\n'
  native_result_input_hash_line tests/git-publication-native.sh
  native_result_input_hash_line tests/support/git-publication-native-host.sh
  native_result_input_hash_line \
    tests/support/delivery-evidence-consumers-native-run.sh
  native_result_input_hash_line \
    tests/support/delivery-evidence-consumers-native-assess.sh
  native_result_input_hash_line \
    tests/support/delivery-evidence-consumers-native-observe.sh
  native_result_input_hash_line \
    tests/support/delivery-evidence-consumers-native-fixture.sh
  native_result_input_hash_line \
    tests/support/delivery-evidence-consumers-native-scenario-content.sh
  native_result_input_hash_line tests/support/git-publication-native-run.sh
  native_result_input_hash_line tests/support/native-run-supervise.sh
  native_result_input_hash_line tests/support/native-run-watchdog.sh
  native_result_input_hash_line \
    src/skills/dough-execute-plan/references/wrap-up.md
  native_result_input_hash_line \
    src/skills/dough-execute-plan/references/delegation.md
  native_result_input_hash_line \
    src/skills/dough-story-refinement/references/executable-proof.md
}

delivery_evidence_consumers_prompt_for() {
  printf '%s\n' \
    "Use this project's installed Open Dough guidance. An implementation agent returned uncommitted work and the proof report at .planning/implementation-return.md for the promises in .planning/slice-promises.md. Apply the existing acceptance workflow to that return. Do not commit. Leave a short acceptance outcome in .planning/acceptance-outcome.md naming each promise as accepted or incomplete with the evidence you inspected. Treat the installed guidance and project files as the task inputs; do not inspect parent processes or external test-harness source."
}

delivery_evidence_consumers_run_scenario() {
  local source_dir=$1 host=$2 scenario=$3 results_dir=$4 parent=$5
  local prompt run_status=0 observations_file
  delivery_evidence_consumers_create_fixture \
    "${source_dir}" "${host}" "${scenario}" "${parent}"
  prompt=$(
    set -e
    delivery_evidence_consumers_prompt_for
  )
  native_case_host=${host}
  native_case_id="delivery-evidence/consumers"
  native_case_results_dir=${results_dir}
  temporary_dir=${delivery_evidence_consumers_root}
  candidate=${source_dir}
  transcript="${delivery_evidence_consumers_root}/events-${scenario}.jsonl"
  output_file="${delivery_evidence_consumers_root}/response-${scenario}.md"
  native_stderr="${delivery_evidence_consumers_root}/stderr-${scenario}.log"
  target=${delivery_evidence_consumers_workspace}
  native_run_workspace=${delivery_evidence_consumers_workspace}
  platform=${host}
  : > "${transcript}"
  : > "${native_stderr}"

  git_publication_run_native_command || run_status=$?

  observations_file="${delivery_evidence_consumers_root}/observations-${scenario}.txt"
  delivery_evidence_consumers_observe \
    "${scenario}" \
    "${delivery_evidence_consumers_workspace}" \
    "${output_file}" \
    "${transcript}" > "${observations_file}"

  if [[ ${native_run_stream_status:-missing} != complete ]]; then
    git_publication_assess_status=fail
    git_publication_assess_reason="incomplete or stale native stream (${native_run_stream_status:-missing})"
  elif [[ $(delivery_evidence_consumers_obs_get harness-inspected \
    "${observations_file}") == true ]]; then
    git_publication_assess_status=fail
    git_publication_assess_reason='agent inspected the native harness'
  elif delivery_evidence_consumers_assess "${observations_file}"; then
    git_publication_assess_status=pass
    git_publication_assess_reason="consumers acceptance honored for ${scenario}"
  else
    git_publication_assess_status=fail
    git_publication_assess_reason="consumers acceptance mismatch for ${scenario}"
  fi
  if [[ ${run_status} -ne 0 && ${git_publication_assess_status} == pass ]]; then
    git_publication_assess_status=fail
    git_publication_assess_reason="native host exited ${run_status} before completing ${scenario}"
  fi

  if [[ -n ${native_case_results_dir:-} ]]; then
    native_case_id="delivery-evidence/consumers/${scenario}"
    git_publication_retain_attempt "${source_dir}" "${prompt}" \
      "${transcript}" "${output_file}" "${native_stderr}" \
      "${observations_file}" delivery-evidence-consumers
  fi

  printf 'scenario: %s assessment-status: %s assessment-reason: %s\n' \
    "${scenario}" "${git_publication_assess_status}" \
    "${git_publication_assess_reason}"
  cat "${observations_file}"
  delivery_evidence_consumers_cleanup
  [[ ${git_publication_assess_status} == pass ]]
}

delivery_evidence_consumers_run_journey() {
  local source_dir=$1 host=$2 results_dir=$3
  local root outstanding=0 scenario
  root=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${root}'" RETURN
  for scenario in changed-contract corrected-consumer unchanged-boundary; do
    printf '\n--- delivery-evidence/consumers %s ---\n' "${scenario}"
    set +e
    delivery_evidence_consumers_run_scenario \
      "${source_dir}" "${host}" "${scenario}" "${results_dir}" "${root}"
    status=$?
    set -e
    if [[ ${status} -ne 0 ]]; then
      outstanding=1
    fi
  done
  if [[ ${outstanding} -ne 0 ]]; then
    echo 'PENDING: delivery-evidence/consumers lacks passing fresh proof on one or more scenarios.'
    return 1
  fi
  echo 'PASS: delivery-evidence/consumers assessed from observable consumer applicability.'
}
