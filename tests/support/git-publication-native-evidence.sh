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
      native_result_input_hash_lines \
        tests/git-publication-native.sh \
        tests/support/git-publication-native-assess.sh \
        tests/support/git-publication-native-startup-assess.sh \
        tests/support/git-publication-native-candidate-assess.sh \
        tests/support/git-publication-native-prose.sh \
        tests/support/git-publication-native-fixture.sh \
        tests/support/git-publication-native-startup-fixture.sh \
        tests/support/git-publication-native-shared.sh \
        tests/support/git-publication-native-stream-fields.mjs \
        tests/support/git-publication-native-stream-starts.mjs \
        tests/support/git-publication-native-stream-one-shot.mjs \
        tests/support/git-publication-native-run.sh \
        tests/support/git-publication-native-evidence.sh \
        tests/support/git-publication-native-prompt.sh
      native_result_supervision_input_hash_lines
      native_result_input_hash_lines \
        src/skills/dough-execute-plan/references/publish-the-candidate.md
      ;;
    owned-context)
      git_publication_write_evidence_identity publication
      native_result_input_hash_lines \
        tests/support/git-publication-native-owned-context.sh \
        tests/support/git-publication-native-owned-context-fixture.mjs \
        tests/support/git-publication-native-startup-owned-context.sh \
        tests/support/git-publication-native-preparation-land.sh \
        tests/support/git-publication-native-push-log-observe.mjs \
        tests/support/native-harness-observation.sh \
        tests/support/native-harness-login-shell.sh \
        tests/support/native-node-call-recorder.mjs \
        src/skills/dough-execute-plan/SKILL.md \
        src/skills/dough-story-refinement/references/preparation-assignment.md \
        src/skills/dough-story-refinement/references/preparation-workspace.md
      git_publication_closing_input_hash_lines \
        src/skills/dough-execute-plan/scripts/workspace-publication-select.mjs \
        src/skills/dough-execute-plan/scripts/workspace-publication-ownership.mjs \
        src/skills/dough-story-refinement/scripts/preparation-assignment.mjs
      ;;
    one-shot)
      git_publication_write_evidence_identity publication
      native_result_input_hash_lines \
        tests/support/git-publication-native-one-shot.sh \
        tests/support/git-publication-native-one-shot-fixture.sh \
        tests/support/git-publication-native-one-shot-fixture.mjs \
        tests/support/git-publication-native-one-shot-unobserved.sh \
        tests/support/git-publication-native-one-shot-queued.sh \
        tests/support/git-publication-native-one-shot-queued-observe.mjs \
        tests/support/git-publication-native-one-shot-escalation.sh \
        tests/support/git-publication-native-one-shot-escalation-fixture.mjs \
        tests/support/git-publication-native-one-shot-retained.sh \
        tests/support/git-publication-native-one-shot-review.sh \
        tests/support/git-publication-native-one-shot-refinement.sh \
        tests/support/git-publication-native-one-shot-refinement-observe.mjs \
        tests/support/git-publication-native-one-shot-default-main.sh \
        tests/support/git-publication-native-one-shot-auto-land.sh \
        tests/support/git-publication-native-one-shot-established.sh \
        tests/support/git-publication-native-one-shot-refinement-auto-land.sh \
        src/skills/dough-story-refinement/references/preparation-disposition.md \
        tests/support/git-publication-native-push-log-observe.mjs \
        src/skills/dough-execute-plan/SKILL.md \
        src/skills/dough-execute-plan/references/one-shot.md \
        src/skills/dough-execute-plan/references/established-start.md \
        src/skills/dough-story-refinement/SKILL.md \
        src/skills/dough-story-refinement/references/one-shot-refinement.md
      native_import_closure_input_hash_lines \
        src/skills/dough-execute-plan/scripts/execution-start.mjs \
        src/skills/dough-execute-plan/scripts/execution-increment-delivery.mjs \
        src/skills/dough-execute-plan/scripts/established-start.mjs \
        src/skills/dough-story-refinement/scripts/preparation-assignment.mjs
      ;;
    land-default-checkout)
      git_publication_write_evidence_identity publication
      native_result_input_hash_lines \
        tests/support/git-publication-native-land-default.sh \
        tests/support/git-publication-native-push-log-observe.mjs
      git_publication_closing_input_hash_lines
      ;;
    execution-review)
      printf 'helper-identity: tests/support/ci-completion-native-run.sh\n'
      native_result_print_adapter_identity
      printf 'fixture-identity: tests/support/ci-completion-native-fixture.sh\n'
      printf 'assessor-identity: tests/support/ci-completion-native-assess.sh\n'
      native_result_input_hash_lines \
        tests/git-publication-native.sh \
        tests/support/git-publication-native-host.sh \
        tests/support/ci-completion-native-run.sh \
        tests/support/ci-completion-native-assess.sh \
        tests/support/ci-completion-native-observe.sh \
        tests/support/ci-completion-native-counterexamples.sh \
        tests/support/native-completion-observation.sh \
        tests/support/native-observation.sh \
        tests/support/ci-completion-native-fixture.sh \
        tests/support/native-completion-observation.sh \
        tests/support/native-harness-observation.sh \
        tests/support/native-harness-login-shell.sh \
        tests/support/native-node-call-recorder.mjs \
        tests/support/git-publication-native-run.sh \
        tests/support/git-publication-native-evidence.sh
      native_result_supervision_input_hash_lines
      native_result_input_hash_lines \
        src/skills/dough-execute-plan/references/ci-monitor.md \
        src/skills/dough-execute-plan/references/ci-completion-wait.md \
        src/skills/dough-execute-plan/references/finish-or-stop.md \
        src/skills/dough-execution-retrospective/SKILL.md
      ;;
    trunk-closure)
      trunk_closure_write_evidence_identity
      ;;
    story-branch-closure)
      story_closure_write_evidence_identity
      ;;
    delivery-evidence-selection | delivery-evidence-claims | \
      delivery-evidence-consumers | delivery-evidence-gaps)
      delivery_evidence_write_evidence_identity "${1#delivery-evidence-}"
      ;;
    *) return 2 ;;
  esac
}

# The evidence identity profile that covers journey $1.
git_publication_evidence_profile() {
  if git_publication_owned_context_journey "$1"; then
    echo owned-context
  elif [[ $1 == land-default-checkout ]]; then
    echo land-default-checkout
  elif [[ $1 == one-shot-* ]]; then
    echo one-shot
  else
    echo publication
  fi
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
