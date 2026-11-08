#!/usr/bin/env bash
# Evidence identity and retained native publication attempts. Sourced by runner.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared native runner globals.

# shellcheck source=tests/support/git-publication-native-fixture-identity.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-fixture-identity.sh"

# Prints the evidence identity of profile $1 for the checkout source_dir: the
# helper, adapter, fixture and assessor identities and one input-hash line per
# input. Returns non-zero, even when the caller disabled errexit, when any
# input cannot be read or its import closure cannot be traced.
git_publication_write_evidence_identity() {
  local lines
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
        tests/support/git-publication-native-fixture-identity.sh \
        tests/support/git-publication-native-prompt.sh || return
      native_result_supervision_input_hash_lines || return
      native_result_input_hash_lines \
        src/skills/dough-execute-plan/references/publish-the-candidate.md
      ;;
    startup | admission | owned-context | one-shot)
      # A family's roots overlap the publication inputs and the installed
      # payload; each input keeps its first line.
      lines=$(git_publication_fixture_family_identity "$1") || return
      awk '!/^input-hash: / || !seen[$3]++' <<< "${lines}"
      ;;
    land-default-checkout)
      git_publication_write_evidence_identity publication || return
      native_result_input_hash_lines \
        tests/support/git-publication-native-land-default.sh \
        tests/support/git-publication-native-push-log-observe.mjs || return
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
        tests/support/native-response-field.sh \
        tests/support/native-completion-observation.sh \
        tests/support/native-observation.sh \
        tests/support/ci-completion-native-fixture.sh \
        tests/support/native-completion-observation.sh \
        tests/support/native-harness-observation.sh \
        tests/support/native-harness-login-shell.sh \
        tests/support/native-node-call-recorder.mjs \
        tests/support/git-publication-native-run.sh \
        tests/support/git-publication-native-evidence.sh \
        tests/support/git-publication-native-fixture-identity.sh || return
      native_result_supervision_input_hash_lines || return
      native_result_input_hash_lines \
        src/skills/dough-execute-plan/references/ci-monitor.md \
        src/skills/dough-execute-plan/references/ci-completion-wait.md \
        src/skills/dough-execute-plan/references/finish-or-stop.md \
        src/skills/dough-execution-retrospective/SKILL.md \
        src/skills/dough-land/references/completion-attention.md
      ;;
    trunk-closure)
      trunk_closure_write_evidence_identity
      ;;
    story-branch-closure)
      story_closure_write_evidence_identity
      ;;
    delivery-evidence-*)
      delivery_evidence_case_known "${1#delivery-evidence-}" || return 2
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
  elif [[ $1 == startup-* ]]; then
    echo startup
  elif [[ $1 == one-shot-* ]]; then
    echo one-shot
  elif [[ $1 == admission-* ]]; then
    echo admission
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
  local identity

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
  # An identity that could not read an input would look complete; keep the
  # copied artifacts for diagnosis and write no record.
  if ! identity=$(git_publication_write_evidence_identity "${evidence_profile}"); then
    printf 'error: could not identify the inputs of %s evidence; artifacts kept without a record in %s\n' \
      "${evidence_profile}" "${native_result_attempt_dir}" >&2
    return 1
  fi
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
    printf '%s\n' "${identity}"
    printf 'artifact-events: events.jsonl\n'
    printf 'artifact-response: response.md\n'
    printf 'artifact-stderr: stderr.log\n'
    printf 'artifact-observations: observations.txt\n'
  } > "${native_result_attempt_dir}/record"
  printf 'result-path: %s\n' "${native_result_attempt_dir}"
}
