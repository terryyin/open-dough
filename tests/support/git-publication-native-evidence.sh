#!/usr/bin/env bash
# Evidence identity and retained native publication attempts. Sourced by runner.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared native runner globals.

git_publication_write_evidence_identity() {
  case $1 in
    publication)
      printf 'helper-identity: tests/support/git-publication-native-run.sh\n'
      native_result_print_adapter_identity
      printf 'fixture-identity: tests/support/git-publication-native-fixture.sh\n'
      printf 'assessor-identity: tests/support/git-publication-native-assess.sh\n'
      native_result_input_hash_line tests/git-publication-native.sh
      native_result_input_hash_line tests/support/git-publication-native-assess.sh
      native_result_input_hash_line tests/support/git-publication-native-startup-assess.sh
      native_result_input_hash_line tests/support/git-publication-native-prose.sh
      native_result_input_hash_line tests/support/git-publication-native-fixture.sh
      native_result_input_hash_line tests/support/git-publication-native-startup-fixture.sh
      native_result_input_hash_line tests/support/git-publication-native-run.sh
      native_result_input_hash_line tests/support/git-publication-native-evidence.sh
      native_result_input_hash_line tests/support/git-publication-native-prompt.sh
      native_result_input_hash_line tests/support/native-run-supervise.sh
      native_result_input_hash_line src/skills/dough-execute-plan/references/publish-the-candidate.md
      ;;
    execution-review)
      printf 'helper-identity: tests/support/ci-completion-native-run.sh\n'
      native_result_print_adapter_identity
      printf 'fixture-identity: tests/support/ci-completion-native-fixture.sh\n'
      printf 'assessor-identity: tests/support/ci-completion-native-run.sh\n'
      native_result_input_hash_line tests/git-publication-native.sh
      native_result_input_hash_line tests/support/git-publication-native-host.sh
      native_result_input_hash_line tests/support/ci-completion-native-run.sh
      native_result_input_hash_line tests/support/ci-completion-native-fixture.sh
      native_result_input_hash_line tests/support/git-publication-native-run.sh
      native_result_input_hash_line tests/support/git-publication-native-evidence.sh
      native_result_input_hash_line tests/support/native-run-supervise.sh
      native_result_input_hash_line src/skills/dough-execute-plan/references/ci-monitor.md
      native_result_input_hash_line src/skills/dough-execute-plan/references/ci-completion-wait.md
      native_result_input_hash_line src/skills/dough-execute-plan/references/finish-or-stop.md
      native_result_input_hash_line src/skills/dough-execution-retrospective/SKILL.md
      ;;
    trunk-closure)
      trunk_closure_write_evidence_identity
      ;;
    story-branch-closure)
      story_closure_write_evidence_identity
      ;;
    delivery-evidence-selection)
      delivery_evidence_selection_write_evidence_identity
      ;;
    delivery-evidence-claims)
      delivery_evidence_claims_write_evidence_identity
      ;;
    *) return 2 ;;
  esac
}

git_publication_retain_attempt() {
  local source_dir=$1
  local prompt=$2
  local transcript=$3
  local output_file=$4
  local native_stderr=$5
  local observations_file=$6
  local evidence_profile=${7-publication}

  before_digest=publication-native
  after_digest=publication-native
  source_before_digest=publication-native
  source_after_digest=publication-native
  before=
  after=
  source_before=
  source_after=
  tag=publication-native
  source_commit=$(git -C "${source_dir}" rev-parse HEAD)
  tool_version=${tool_version:-unknown}
  native_result_allocate_attempt \
    "${native_case_results_dir}" "${native_case_host}" "${native_case_id}"
  native_result_copy_if_present "${transcript}" events.jsonl
  native_result_copy_if_present "${output_file}" response.md
  native_result_copy_if_present "${native_stderr}" stderr.log
  native_result_copy_if_present "${observations_file}" observations.txt
  {
    printf 'host: %s\n' "${native_case_host}"
    printf 'case: %s\n' "${native_case_id}"
    printf 'origin: fresh\n'
    native_result_execution_status_fields
    printf 'assessment-status: %s\n' "${git_publication_assess_status}"
    printf 'assessment-reason: %s\n' "${git_publication_assess_reason}"
    native_result_print_tool_identity
    printf 'fixture-tag: %s\n' "${tag}"
    printf 'fixture-commit: %s\n' "${source_commit}"
    printf 'prompt-identity: %s\n' \
      "$(printf '%s' "${prompt}" | shasum -a 256 | cut -d ' ' -f 1)"
    git_publication_write_evidence_identity "${evidence_profile}"
    printf 'artifact-events: events.jsonl\n'
    printf 'artifact-response: response.md\n'
    printf 'artifact-stderr: stderr.log\n'
    printf 'artifact-observations: observations.txt\n'
  } > "${native_result_attempt_dir}/record"
  printf 'result-path: %s\n' "${native_result_attempt_dir}"
}
