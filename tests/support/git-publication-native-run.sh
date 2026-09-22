#!/usr/bin/env bash
# Shared runner for credential-free and live publication native sessions.
# Builds the fixture, installs skills, launches through the publication host
# command (reusing native supervise/stream helpers), collects observations,
# assesses, and optionally retains.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared globals across sourced helpers.

git_publication_run_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=tests/support/git-publication-native-fixture.sh
# shellcheck disable=SC1091
source "${git_publication_run_support_dir}/git-publication-native-fixture.sh"
# shellcheck source=tests/support/git-publication-native-prompt.sh
# shellcheck disable=SC1091
source "${git_publication_run_support_dir}/git-publication-native-prompt.sh"
# shellcheck source=tests/support/git-publication-native-assess.sh
# shellcheck disable=SC1091
source "${git_publication_run_support_dir}/git-publication-native-assess.sh"
# shellcheck source=tests/support/native-run-supervise.sh
# shellcheck disable=SC1091
source "${git_publication_run_support_dir}/native-run-supervise.sh"
# shellcheck source=tests/support/native-result-retain.sh
# shellcheck disable=SC1091
source "${git_publication_run_support_dir}/native-result-retain.sh"
# shellcheck source=tests/support/native-codex.sh
# shellcheck disable=SC1091
source "${git_publication_run_support_dir}/native-codex.sh"

# Publication sessions need Git mutation tools. Reuse supervise/stream/version
# capture from native-run-supervise.sh with host launch lines suited to that
# contract (Claude ADR sessions intentionally restrict tools; publication does not).
git_publication_run_native_command() {
  local run_target=${native_run_workspace:-${target}}
  local launch_status=0
  tool_version=unknown
  case ${platform} in
    codex | cursor | claude) ;;
    *) return 2 ;;
  esac
  native_run_require_host || return $?
  case ${platform} in
    codex)
      native_codex_prepare "${temporary_dir}" "${candidate}"
      native_run_capture_version codex --version
      native_codex_build_command "${run_target}" "${output_file}" "${prompt}" \
        "${transcript}"
      native_run_owned_or_fail "${transcript}" "${native_stderr}" '' \
        "${native_codex_command[@]}" || launch_status=$?
      ;;
    cursor)
      native_run_capture_version cursor agent --version
      native_run_owned_or_fail "${transcript}" "${native_stderr}" \
        "${run_target}" \
        cursor agent --print --force --trust --sandbox disabled \
        --output-format stream-json --workspace "${run_target}" "${prompt}" \
        || launch_status=$?
      ;;
    claude)
      native_run_capture_version claude --version
      native_run_owned_or_fail "${transcript}" "${native_stderr}" \
        "${run_target}" \
        claude --print --dangerously-skip-permissions \
        --no-session-persistence \
        --output-format stream-json --verbose "${prompt}" || launch_status=$?
      ;;
    *) return 2 ;;
  esac
  # Classify even after a non-zero host exit so auth/API failures remain inspectable.
  native_run_classify_stream "${platform}" "${transcript}"
  if [[ ${native_run_stream_status} != complete ]]; then
    native_run_outcome=incomplete
    native_run_failure_reason=${native_run_stream_reason}
    case ${platform} in
      cursor | claude)
        native_run_write_output 1
        ;;
      *) ;;
    esac
    return 1
  fi
  case ${platform} in
    cursor | claude)
      native_run_write_output 0
      ;;
    *) ;;
  esac
  if [[ ${launch_status} -ne 0 ]]; then
    return "${launch_status}"
  fi
}

git_publication_write_evidence_identity() {
  case $1 in
    publication)
      printf 'helper-identity: tests/support/git-publication-native-run.sh\n'
      native_result_print_adapter_identity
      printf 'fixture-identity: tests/support/git-publication-native-fixture.sh\n'
      printf 'assessor-identity: tests/support/git-publication-native-assess.sh\n'
      native_result_input_hash_line tests/git-publication-native.sh
      native_result_input_hash_line tests/support/git-publication-native-assess.sh
      native_result_input_hash_line tests/support/git-publication-native-fixture.sh
      native_result_input_hash_line tests/support/git-publication-native-run.sh
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

# Run one journey. Sets git_publication_assess_* and optionally retains under
# native_case_results_dir. Leaves fixture cleaned unless GIT_PUBLICATION_KEEP=1.
git_publication_run_journey() {
  local source_dir=$1
  local host=$2
  local journey=$3
  local artifact_root=$4
  local platform=${host}
  local authority prompt stream_status run_status=0
  local observations_file response_file

  authority=$(git_publication_authority_for "${journey}")
  # git_publication_run_native_command reads these call-scope globals.
  prompt=$(git_publication_prompt_for "${journey}")
  native_case_host=${host}
  native_case_id="publication/${journey}"
  temporary_dir=${artifact_root}
  candidate=${source_dir}
  transcript="${artifact_root}/events.jsonl"
  output_file="${artifact_root}/response.md"
  native_stderr="${artifact_root}/stderr.log"
  : > "${native_stderr}"
  : > "${transcript}"

  git_publication_create_fixture_for "${journey}" "${artifact_root}"
  git_publication_fixture_install_skills "${source_dir}" "${host}" \
    "${git_publication_fixture_workspace}"
  target=${git_publication_fixture_workspace}
  native_run_workspace=${git_publication_fixture_workspace}

  export NATIVE_PUBLICATION_JOURNEY=${journey}

  if [[ ${host} == 'codex' ]]; then
    native_codex_prepare "${artifact_root}" "${source_dir}" || true
  fi

  run_status=0
  # Do not toggle shell errexit here: a non-zero return must reach the caller
  # so credential-free counterexamples can assert incomplete streams.
  git_publication_run_native_command || run_status=$?

  stream_status=${native_run_stream_status:-missing}
  if [[ ${native_run_outcome} == timeout ]]; then
    stream_status=stale
  fi

  observations_file="${artifact_root}/observations.txt"
  # Ownership and remote acceptance come only from post-session Git state.
  git_publication_fixture_observe "${journey}" "${authority}" \
    "${stream_status}" "${transcript}" > "${observations_file}"

  response_file=${output_file}
  if [[ ${stream_status} != 'complete' ]]; then
    git_publication_assess_status=fail
    git_publication_assess_reason="incomplete or stale native stream (${stream_status})"
  else
    git_publication_assess "${observations_file}" "${response_file}"
  fi

  if [[ -n ${native_case_results_dir:-} ]]; then
    git_publication_retain_attempt "${source_dir}" "${prompt}" \
      "${transcript}" "${output_file}" "${native_stderr}" \
      "${observations_file}"
  fi

  if [[ -z ${GIT_PUBLICATION_KEEP:-} ]]; then
    git_publication_fixture_cleanup
  fi
  return "${run_status}"
}
