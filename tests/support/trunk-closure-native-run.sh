#!/usr/bin/env bash
# Controlled native journeys for Trunk Mode completion after final publication.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/trunk-closure-native-fixture.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/trunk-closure-native-fixture.sh"
# shellcheck source=tests/support/trunk-closure-native-assess.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/trunk-closure-native-assess.sh"
# shellcheck source=tests/helpers/wait-for.bash
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../helpers" && pwd)/wait-for.bash"

trunk_closure_write_evidence_identity() {
  printf 'helper-identity: tests/support/trunk-closure-native-run.sh\n'
  native_result_print_adapter_identity
  printf 'fixture-identity: tests/support/trunk-closure-native-fixture.sh\n'
  printf 'assessor-identity: tests/support/trunk-closure-native-assess.sh\n'
  native_result_input_hash_lines \
    tests/git-publication-native.sh \
    tests/support/git-publication-native-host.sh \
    tests/support/trunk-closure-native-run.sh \
    tests/support/trunk-closure-native-assess.sh \
    tests/support/native-completion-observation.sh \
    tests/support/trunk-closure-native-fixture.sh \
    tests/support/trunk-closure-native-owned-context.sh \
    tests/support/native-harness-observation.sh \
    tests/support/native-harness-login-shell.sh \
    tests/support/native-node-call-recorder.mjs \
    tests/support/git-publication-native-shared.sh \
    tests/support/git-publication-native-run.sh
  native_result_supervision_input_hash_lines
  native_result_input_hash_lines \
    src/skills/dough-execute-plan/references/trunk-publication.md \
    src/skills/dough-execute-plan/references/wrap-up-closure-publication.md \
    src/skills/dough-execute-plan/references/ci-monitor.md \
    src/skills/dough-execute-plan/references/ci-completion-wait.md \
    src/skills/dough-execute-plan/references/publish-the-candidate.md \
    src/skills/dough-story-wrap-up/SKILL.md
  git_publication_closing_input_hash_lines \
    src/skills/dough-story-wrap-up/scripts/trunk-closure.mjs \
    src/skills/dough-execute-plan/scripts/execution-increment-delivery.mjs \
    src/skills/dough-execute-plan/scripts/ci-mailbox.mjs
}

# Per-step controller bound; each step awaits one action of the native agent.
trunk_closure_wait_limit=360

# The installed `finish`, which runs completion, has started, as the node log
# or the runner's transcript shows.
trunk_closure_complete_seen() {
  [[ $(trunk_closure_finish_count "${trunk_closure_node_log}" \
    "${transcript:-/dev/null}" \
    "${trunk_closure_candidate_sha}") -ge 1 ]]
}

trunk_closure_controller() {
  local scenario=$1
  local remote_sha coverage
  wait_for publication "${trunk_closure_wait_limit}" \
    "[[ \$(git ls-remote '${trunk_closure_origin}' refs/heads/main | awk '{print \$1}') == '${trunk_closure_candidate_sha}' ]]" || return
  printf 'publication\n' >> "${trunk_closure_control_log}"
  wait_for registration "${trunk_closure_wait_limit}" \
    "[[ \$(native_completion_registered '${trunk_closure_mailbox}' '${trunk_closure_candidate_sha}') == true ]]" || return
  printf 'registration\n' >> "${trunk_closure_control_log}"
  coverage="${trunk_closure_mailbox}/coverage/${trunk_closure_candidate_sha}.json"
  if [[ ${scenario} == source ]]; then
    wait_for complete-start "${trunk_closure_wait_limit}" \
      "trunk_closure_complete_seen" || return
    printf 'complete-start\n' >> "${trunk_closure_control_log}"
    : > "${trunk_closure_release}"
    printf 'ci-release\n' >> "${trunk_closure_control_log}"
    wait_for coverage "${trunk_closure_wait_limit}" "grep -q '\"state\":\"success\"' '${coverage}'" || return
  else
    wait_for coverage "${trunk_closure_wait_limit}" "grep -q '\"state\":\"not_required\"' '${coverage}'" || return
    printf 'coverage-not-required\n' >> "${trunk_closure_control_log}"
    wait_for complete-start "${trunk_closure_wait_limit}" \
      "trunk_closure_complete_seen" || return
    printf 'complete-start\n' >> "${trunk_closure_control_log}"
  fi
  [[ ${scenario} != source ]] || printf 'coverage-success\n' >> "${trunk_closure_control_log}"
  wait_for shutdown "${trunk_closure_wait_limit}" \
    "[[ -f '${trunk_closure_mailbox}/result.json' ]] && grep -Eq '\"status\":\"(stopped|finished)\"' '${trunk_closure_mailbox}/result.json'" || return
  printf 'shutdown\n' >> "${trunk_closure_control_log}"
  wait_for cleanup "${trunk_closure_wait_limit}" "test -f '${trunk_closure_cleanup_marker}'" || return
  printf 'cleanup-complete\n' >> "${trunk_closure_control_log}"
  remote_sha=$(git ls-remote "${trunk_closure_origin}" refs/heads/main | awk '{print $1}')
  [[ ${remote_sha} == "${trunk_closure_candidate_sha}" ]]
}

trunk_closure_prompt_for() {
  if [[ $1 == owned-context ]]; then
    trunk_closure_owned_context_prompt
    return
  fi
  printf '%s\n' "Use this project's installed Open Dough guidance. Complete the retained Trunk Mode final-closure candidate described in .planning/execution-state.txt, including its authorized publication, CI observation handoff, and local resource cleanup. Preserve the pending human edit in the separate default checkout and report the observed closure result. Treat the installed guidance and retained project state as the task inputs; do not inspect parent processes or external test-harness source."
}

trunk_closure_run_journey() {
  local source_dir=$1 host=$2 scenario=$3 results_dir=$4
  local root harness prompt controller_pid run_status=0 stop_status=0
  root=$(mktemp -d)
  harness=$(mktemp -d)
  trunk_closure_create_fixture "${source_dir}" "${host}" "${scenario}" \
    "${root}" "${harness}"
  prompt=$(trunk_closure_prompt_for "${scenario}")
  native_case_host=${host}
  native_case_id="trunk-closure/${scenario}"
  native_case_results_dir=${results_dir}
  temporary_dir=${root}
  candidate=${source_dir}
  transcript="${harness}/events.jsonl"
  output_file="${harness}/response.md"
  native_stderr="${harness}/stderr.log"
  target=${trunk_closure_workspace}
  native_run_workspace=${trunk_closure_workspace}
  platform=${host}
  trunk_closure_forced_stop_file="${harness}/forced-stop.txt"
  : > "${transcript}"
  : > "${native_stderr}"
  trunk_closure_controller "${scenario}" &
  controller_pid=$!
  git_publication_run_native_command || run_status=$?
  wait "${controller_pid}" || run_status=1
  # Observe product shutdown before any fixture cleanup/stop.
  trunk_closure_observe "${scenario}" "${transcript}" "${output_file}" \
    > "${harness}/observations.txt"
  native_harness_stop_observers "${source_dir}" "${trunk_closure_storage}" \
    "${trunk_closure_forced_stop_file}" || stop_status=$?
  if trunk_closure_assess "${scenario}" "${harness}/observations.txt"; then
    git_publication_assess_status=pass
    git_publication_assess_reason='one installed finish: final publication, completion with confirmed shutdown, then worktree and branch retired'
  else
    git_publication_assess_status=fail
    git_publication_assess_reason='Trunk Mode closure ordering was not observed'
    run_status=1
  fi
  git_publication_retain_attempt "${source_dir}" "${prompt}" \
    "${transcript}" "${output_file}" "${native_stderr}" \
    "${harness}/observations.txt" trunk-closure
  printf 'run-status: %s\nassessment-status: %s\nassessment-reason: %s\n' \
    "${run_status}" "${git_publication_assess_status}" \
    "${git_publication_assess_reason}"
  printf 'observations:\n'
  cat "${harness}/observations.txt"
  if [[ ${run_status} -ne 0 ]]; then
    printf 'response:\n'
    cat "${output_file}" 2> /dev/null || true
    printf 'stderr:\n'
    cat "${native_stderr}" 2> /dev/null || true
  fi
  unset trunk_closure_forced_stop_file
  trunk_closure_cleanup_fixture
  rm -rf -- "${root}" "${harness}"
  [[ ${stop_status} -eq 0 && ${run_status} -eq 0 ]]
}
