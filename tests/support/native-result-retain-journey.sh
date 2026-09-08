#!/usr/bin/env bash
# Retain combined delivery/updated-use stages as one unreviewed attempt.
# Sourced by the selected journey helper after native-result-retain.sh.
# Prerequisite gate stays here until slice 3 drops journey discovery fields.
# shellcheck disable=SC2034,SC2154 # Journey and prerequisite globals are assigned for sourced helpers.
# shellcheck disable=SC2312 # pipefail covers prompt hashes.

native_result_journey_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=tests/support/native-prerequisite-gate.sh
# shellcheck disable=SC1091
source "${native_result_journey_support_dir}/native-prerequisite-gate.sh"
# shellcheck source=tests/support/native-journey-state.sh
# shellcheck disable=SC1091
source "${native_result_journey_support_dir}/native-journey-state.sh"

native_result_fill_journey_prerequisite() {
  native_prerequisite_host=${native_case_host}
  native_prerequisite_execution=${native_run_outcome:-exited}
  native_prerequisite_stream=${use_transcript-}
  native_prerequisite_response=${use_output-}
  native_prerequisite_stream_artifact=use-events.jsonl
  native_prerequisite_candidate=${delivery_fixture_source-}
  native_prerequisite_installed_skill_path=
  if [[ -n ${delivery_target-} && -n ${delivery_skill_root-} ]]; then
    native_prerequisite_installed_skill_path="${delivery_target}/${delivery_skill_root}/dough-adr-awareness/SKILL.md"
  fi
  native_prerequisite_installed_identity=${delivery_improvement-}
  native_prerequisite_assess
}

native_result_journey_execution_fields() {
  native_result_execution_status_fields
  native_result_fill_journey_prerequisite
  native_prerequisite_print_fields
  native_journey_state_print_fields
  printf 'assessment-interpretation: none\n'
}

native_result_finalize_journey() {
  local record_file

  if [[ -z ${native_case_results_dir} ]]; then
    return 0
  fi

  native_result_allocate_attempt \
    "${native_case_results_dir}" "${native_case_host}" "${native_case_id}"

  native_result_copy_if_present "${update_transcript}" update-events.jsonl
  native_result_copy_if_present "${update_output}" update-response.md
  native_result_copy_if_present "${update_stderr}" update-stderr.log
  native_result_copy_if_present "${use_transcript}" use-events.jsonl
  native_result_copy_if_present "${use_output}" use-response.md
  native_result_copy_if_present "${use_stderr}" use-stderr.log
  native_result_write_if_set update-before-snapshot.txt \
    "${delivery_update_before+1}" "${delivery_update_before-}"
  native_result_write_if_set update-after-snapshot.txt \
    "${delivery_update_after+1}" "${delivery_update_after-}"
  native_result_write_if_set use-before-snapshot.txt \
    "${delivery_use_before+1}" "${delivery_use_before-}"
  native_result_write_if_set use-after-snapshot.txt \
    "${delivery_use_after+1}" "${delivery_use_after-}"
  native_result_write_if_set source-before-snapshot.txt \
    "${delivery_source_before+1}" "${delivery_source_before-}"
  native_result_write_if_set source-after-snapshot.txt \
    "${delivery_source_after+1}" "${delivery_source_after-}"
  native_result_write_text observations.txt "$(delivery_build_journey_observations)"

  record_file="${native_result_attempt_dir}/record"
  {
    printf 'host: %s\n' "${native_case_host}"
    printf 'case: %s\n' "${native_case_id}"
    printf 'origin: fresh\n'
    native_result_journey_execution_fields
    native_result_print_tool_identity
    printf 'fixture-tag: v%s\n' "${delivery_update_version}"
    printf 'fixture-commit: %s\n' "${delivery_source_revision:-unknown}"
    printf 'bootstrap-tag: v%s\n' "${delivery_bootstrap_version}"
    printf 'bootstrap-commit: %s\n' "${delivery_bootstrap_revision:-unknown}"
    printf 'update-prompt-identity: %s\n' \
      "$(printf '%s' "${update_prompt}" | shasum -a 256 | cut -d ' ' -f 1)"
    printf 'use-prompt-identity: %s\n' \
      "$(printf '%s' "${use_prompt}" | shasum -a 256 | cut -d ' ' -f 1)"
    printf 'helper-identity: tests/support/dough-adr-awareness-updated-use.sh\n'
    native_result_print_adapter_identity
    printf 'fixture-identity: tests/fixtures/adr-awareness/alternate-layout\n'
    printf 'assessor-identity: tests/support/native-journey-state.sh\n'
    printf 'artifact-update-events: update-events.jsonl\n'
    printf 'artifact-update-response: update-response.md\n'
    printf 'artifact-update-stderr: update-stderr.log\n'
    printf 'artifact-use-events: use-events.jsonl\n'
    printf 'artifact-use-response: use-response.md\n'
    printf 'artifact-use-stderr: use-stderr.log\n'
    printf 'artifact-observations: observations.txt\n'
    native_result_input_hash_line \
      "tests/dough-adr-awareness-${native_case_host}-delivery-to-use.sh"
    native_result_input_hash_line tests/support/dough-adr-awareness-delivery-to-use.sh
    native_result_input_hash_line tests/support/dough-adr-awareness-updated-use.sh
    native_result_input_hash_line tests/support/native-result-retain.sh
    native_result_input_hash_line tests/support/native-result-retain-journey.sh
    native_result_input_hash_line tests/support/native-journey-state.sh
    native_result_input_hash_line tests/support/native-adr-behavior.sh
    native_result_input_hash_line tests/support/native-prerequisite-gate.sh
    native_result_input_hash_line tests/support/native-activation-decode.sh
    native_result_input_hash_line tests/support/native-activation-path.sh
    native_result_input_hash_line tests/support/native-run-supervise.sh
    native_result_input_hash_line tests/support/native-codex.sh
    native_result_input_hash_line src/skills/dough-update/SKILL.md
    native_result_input_hash_line src/skills/dough-adr-awareness/SKILL.md
  } > "${record_file}"
}

native_result_report_journey() {
  native_result_finalize_journey
  if [[ -n ${native_case_results_dir} ]]; then
    printf 'result-path: %s\n' "${native_result_attempt_dir}"
  fi
}
