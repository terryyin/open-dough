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
# shellcheck source=tests/support/git-publication-native-admission.sh
# shellcheck disable=SC1091
source "${git_publication_run_support_dir}/git-publication-native-admission.sh"
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

# shellcheck source=tests/support/git-publication-native-evidence.sh
# shellcheck disable=SC1091
source "${git_publication_run_support_dir}/git-publication-native-evidence.sh"

# Run one journey. Sets git_publication_assess_* and optionally retains under
# native_case_results_dir. Leaves fixture cleaned unless GIT_PUBLICATION_KEEP=1.
git_publication_fixture_install_skills() {
  local source_dir=$1
  local host=$2
  local target=$3
  bash "${source_dir}/install.sh" --target "${target}" \
    --source "${source_dir}" --platform "${host}" > /dev/null
}

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
  prompt=$(git_publication_prompt_for "${journey}")
  if [[ ${journey} == startup-* || ${journey} == admission-* ]]; then
    git_publication_fixture_install_skills "${source_dir}" "${host}" \
      "${git_publication_fixture_integration}"
    git_publication_fixture_human_before=$(
      git_publication_fixture_capture_human "${git_publication_fixture_integration}"
    )
    target=${git_publication_fixture_integration}
    native_run_workspace=${git_publication_fixture_integration}
  else
    git_publication_fixture_install_skills "${source_dir}" "${host}" \
      "${git_publication_fixture_workspace}"
    target=${git_publication_fixture_workspace}
    native_run_workspace=${git_publication_fixture_workspace}
  fi

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
  if [[ ${journey} == startup-* ]]; then
    git_publication_fixture_observe_startup "${journey}" \
      "${stream_status}" "${transcript}" > "${observations_file}"
  elif [[ ${journey} == admission-* ]]; then
    git_publication_fixture_observe_admission "${journey}" \
      "${stream_status}" "${transcript}" > "${observations_file}"
  else
    git_publication_fixture_observe "${journey}" "${authority}" \
      "${stream_status}" "${transcript}" > "${observations_file}"
  fi

  response_file=${output_file}
  if [[ ${stream_status} != 'complete' ]]; then
    git_publication_assess_status=fail
    git_publication_assess_reason="incomplete or stale native stream (${stream_status})"
  else
    git_publication_assess "${observations_file}" "${response_file}"
  fi
  if [[ ${run_status} -ne 0 && ${git_publication_assess_status} == pass ]]; then
    git_publication_assess_status=fail
    git_publication_assess_reason="native host exited ${run_status} before completing the journey"
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
