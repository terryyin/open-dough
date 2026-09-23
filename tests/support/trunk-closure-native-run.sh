#!/usr/bin/env bash
# Controlled native journeys for Trunk Mode completion after final publication.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/trunk-closure-native-fixture.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/trunk-closure-native-fixture.sh"
# shellcheck source=tests/support/trunk-closure-native-assess.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/trunk-closure-native-assess.sh"

trunk_closure_write_evidence_identity() {
  printf 'helper-identity: tests/support/trunk-closure-native-run.sh\n'
  native_result_print_adapter_identity
  printf 'fixture-identity: tests/support/trunk-closure-native-fixture.sh\n'
  printf 'assessor-identity: tests/support/trunk-closure-native-assess.sh\n'
  native_result_input_hash_line tests/git-publication-native.sh
  native_result_input_hash_line tests/support/git-publication-native-host.sh
  native_result_input_hash_line tests/support/trunk-closure-native-run.sh
  native_result_input_hash_line tests/support/trunk-closure-native-assess.sh
  native_result_input_hash_line tests/support/native-completion-observation.sh
  native_result_input_hash_line tests/support/trunk-closure-native-fixture.sh
  native_result_input_hash_line tests/support/git-publication-native-run.sh
  native_result_input_hash_line tests/support/native-run-supervise.sh
  native_result_input_hash_line tests/support/native-run-watchdog.sh
  native_result_input_hash_line src/skills/dough-execute-plan/references/trunk-publication.md
  native_result_input_hash_line src/skills/dough-execute-plan/references/ci-monitor.md
  native_result_input_hash_line src/skills/dough-execute-plan/references/ci-completion-wait.md
  native_result_input_hash_line src/skills/dough-story-wrap-up/SKILL.md
}

trunk_closure_wait_for() {
  local description=$1
  local command=$2
  local deadline=$((SECONDS + 360))
  until eval "${command}"; do
    if ((SECONDS >= deadline)); then
      printf 'error: timed out waiting for %s\n' "${description}" >&2
      return 1
    fi
    sleep 0.05
  done
}

trunk_closure_complete_seen() {
  native_completion_seen "${trunk_closure_node_log}" \
    "${TRUNK_CLOSURE_TRANSCRIPT:-/dev/null}" \
    "${trunk_closure_mailbox}" "${trunk_closure_candidate_sha}"
}

trunk_closure_controller() {
  local scenario=$1
  local remote_sha coverage
  trunk_closure_wait_for publication \
    "[[ \$(git ls-remote '${trunk_closure_origin}' refs/heads/main | awk '{print \$1}') == '${trunk_closure_candidate_sha}' ]]" || return
  printf 'publication\n' >> "${trunk_closure_control_log}"
  trunk_closure_wait_for registration \
    "test -f '${trunk_closure_registered}'" || return
  printf 'registration\n' >> "${trunk_closure_control_log}"
  coverage="${trunk_closure_mailbox}/coverage/${trunk_closure_candidate_sha}.json"
  if [[ ${scenario} == source ]]; then
    trunk_closure_wait_for complete-start \
      "trunk_closure_complete_seen" || return
    printf 'complete-start\n' >> "${trunk_closure_control_log}"
    : > "${trunk_closure_release}"
    printf 'ci-release\n' >> "${trunk_closure_control_log}"
    trunk_closure_wait_for coverage "grep -q '\"state\":\"success\"' '${coverage}'" || return
  else
    trunk_closure_wait_for coverage "grep -q '\"state\":\"not_required\"' '${coverage}'" || return
    printf 'coverage-not-required\n' >> "${trunk_closure_control_log}"
    trunk_closure_wait_for complete-start \
      "trunk_closure_complete_seen" || return
    printf 'complete-start\n' >> "${trunk_closure_control_log}"
  fi
  [[ ${scenario} != source ]] || printf 'coverage-success\n' >> "${trunk_closure_control_log}"
  trunk_closure_wait_for shutdown \
    "[[ -f '${trunk_closure_mailbox}/result.json' ]] && grep -Eq '\"status\":\"(stopped|finished)\"' '${trunk_closure_mailbox}/result.json'" || return
  printf 'shutdown\n' >> "${trunk_closure_control_log}"
  trunk_closure_wait_for cleanup "test -f '${trunk_closure_cleanup_marker}'" || return
  printf 'cleanup-complete\n' >> "${trunk_closure_control_log}"
  remote_sha=$(git ls-remote "${trunk_closure_origin}" refs/heads/main | awk '{print $1}')
  [[ ${remote_sha} == "${trunk_closure_candidate_sha}" ]]
}

trunk_closure_prompt_for() {
  printf '%s\n' "Use this project's installed Open Dough guidance. Complete the retained Trunk Mode final-closure candidate described in .planning/execution-state.txt, including its authorized publication, CI observation handoff, and local resource cleanup. Preserve the pending human edit in the separate default checkout and report the observed closure result. Treat the installed guidance and retained project state as the task inputs; do not inspect parent processes or external test-harness source."
}

trunk_closure_run_journey() {
  local source_dir=$1 host=$2 scenario=$3 results_dir=$4
  local root prompt controller_pid run_status=0 stop_status=0
  root=$(mktemp -d)
  trunk_closure_create_fixture "${source_dir}" "${host}" "${scenario}" "${root}"
  prompt=$(trunk_closure_prompt_for)
  native_case_host=${host}
  native_case_id="trunk-closure/${scenario}"
  native_case_results_dir=${results_dir}
  temporary_dir=${root}
  candidate=${source_dir}
  transcript="${root}/events.jsonl"
  output_file="${root}/response.md"
  native_stderr="${root}/stderr.log"
  target=${trunk_closure_workspace}
  native_run_workspace=${trunk_closure_workspace}
  platform=${host}
  trunk_closure_forced_stop_file="${root}/forced-stop.txt"
  export TRUNK_CLOSURE_TRANSCRIPT="${transcript}"
  : > "${transcript}"
  : > "${native_stderr}"
  trunk_closure_controller "${scenario}" &
  controller_pid=$!
  git_publication_run_native_command || run_status=$?
  wait "${controller_pid}" || run_status=1
  # Observe product shutdown before any fixture cleanup/stop.
  trunk_closure_observe "${scenario}" "${transcript}" "${output_file}" \
    > "${root}/observations.txt"
  if [[ ! -f ${trunk_closure_mailbox}/result.json ]]; then
    (cd "${trunk_closure_workspace}" \
      && node "${trunk_closure_launcher}" stop "${trunk_closure_mailbox}") \
      > "${trunk_closure_forced_stop_file}" || stop_status=$?
  fi
  if trunk_closure_assess "${scenario}" "${root}/observations.txt"; then
    git_publication_assess_status=pass
    git_publication_assess_reason='final publication, one complete-revision, confirmed shutdown, and cleanup order observed'
  else
    git_publication_assess_status=fail
    git_publication_assess_reason='Trunk Mode closure ordering was not observed'
    run_status=1
  fi
  git_publication_retain_attempt "${source_dir}" "${prompt}" \
    "${transcript}" "${output_file}" "${native_stderr}" \
    "${root}/observations.txt" trunk-closure
  printf 'run-status: %s\nassessment-status: %s\nassessment-reason: %s\n' \
    "${run_status}" "${git_publication_assess_status}" \
    "${git_publication_assess_reason}"
  printf 'observations:\n'
  cat "${root}/observations.txt"
  if [[ ${run_status} -ne 0 ]]; then
    printf 'response:\n'
    cat "${output_file}" 2> /dev/null || true
    printf 'stderr:\n'
    cat "${native_stderr}" 2> /dev/null || true
  fi
  unset TRUNK_CLOSURE_TRANSCRIPT trunk_closure_forced_stop_file
  trunk_closure_cleanup_fixture
  rm -rf -- "${root}"
  [[ ${stop_status} -eq 0 && ${run_status} -eq 0 ]]
}
