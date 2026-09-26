#!/usr/bin/env bash
# Native Story Branch integration journey with a real source conflict and two
# independently observed targets.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/story-branch-closure-native-fixture.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/story-branch-closure-native-fixture.sh"
# shellcheck source=tests/support/story-branch-closure-native-assess.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/story-branch-closure-native-assess.sh"

story_closure_trunk_mailbox() {
  local directory
  for directory in "${story_closure_storage}"/*; do
    [[ -f ${directory}/request.json ]] || continue
    [[ $(jq -r '.branch' "${directory}/request.json") == main ]] || continue
    printf '%s\n' "${directory}"
  done
}

story_closure_complete_seen() {
  local mailbox=$1 sha=$2
  native_completion_seen "${story_closure_node_log}" \
    "${STORY_CLOSURE_TRANSCRIPT:-/dev/null}" "${mailbox}" "${sha}"
}

story_closure_controller() {
  local remote_sha trunk_mailbox coverage
  wait_for branch-complete "${story_closure_wait_limit}" \
    "story_closure_complete_seen '${story_closure_branch_mailbox}' '${story_closure_branch_sha}'" || return
  printf 'branch-complete\n' >> "${story_closure_control_log}"
  wait_for branch-shutdown "${story_closure_wait_limit}" \
    "[[ -f '${story_closure_branch_mailbox}/result.json' ]] && grep -Eq '\"status\":\"(stopped|finished)\"' '${story_closure_branch_mailbox}/result.json'" || return
  printf 'branch-shutdown\n' >> "${story_closure_control_log}"
  wait_for trunk-setup "${story_closure_wait_limit}" \
    "[[ -n \$(story_closure_trunk_mailbox) ]]" || return
  trunk_mailbox=$(story_closure_trunk_mailbox)
  printf '%s\n' "${trunk_mailbox}" > "${story_closure_integrated_sha_file}.mailbox"
  printf 'trunk-setup\n' >> "${story_closure_control_log}"
  wait_for integration-publication "${story_closure_wait_limit}" \
    "[[ \$(git ls-remote '${story_closure_origin}' refs/heads/main | awk '{print \$1}') != '${story_closure_trunk_sha}' ]]" || return
  remote_sha=$(git ls-remote "${story_closure_origin}" refs/heads/main | awk '{print $1}')
  [[ ${remote_sha} != "${story_closure_branch_sha}" ]]
  printf '%s\n' "${remote_sha}" > "${story_closure_integrated_sha_file}"
  printf 'integration-publication\n' >> "${story_closure_control_log}"
  wait_for trunk-registration "${story_closure_wait_limit}" \
    "grep -Fq 'register-push ${trunk_mailbox} ${remote_sha}' '${story_closure_node_log}'" || return
  printf 'trunk-registration\n' >> "${story_closure_control_log}"
  wait_for trunk-complete "${story_closure_wait_limit}" \
    "story_closure_complete_seen '${trunk_mailbox}' '${remote_sha}'" || return
  printf 'trunk-complete\n' >> "${story_closure_control_log}"
  : > "${story_closure_release}"
  printf 'trunk-ci-release\n' >> "${story_closure_control_log}"
  coverage="${trunk_mailbox}/coverage/${remote_sha}.json"
  wait_for trunk-coverage "${story_closure_wait_limit}" \
    "grep -q '\"state\":\"success\"' '${coverage}'" || return
  printf 'trunk-coverage-success\n' >> "${story_closure_control_log}"
  wait_for trunk-shutdown "${story_closure_wait_limit}" \
    "[[ -f '${trunk_mailbox}/result.json' ]] && grep -Eq '\"status\":\"(stopped|finished)\"' '${trunk_mailbox}/result.json'" || return
  printf 'trunk-shutdown\n' >> "${story_closure_control_log}"
  wait_for cleanup "${story_closure_wait_limit}" \
    "test -f '${story_closure_cleanup_marker}'" || return
  printf 'cleanup-complete\n' >> "${story_closure_control_log}"
}

story_closure_write_evidence_identity() {
  printf 'helper-identity: tests/support/story-branch-closure-native-run.sh\n'
  native_result_print_adapter_identity
  printf 'fixture-identity: tests/support/story-branch-closure-native-fixture.sh\n'
  printf 'assessor-identity: tests/support/story-branch-closure-native-assess.sh\n'
  native_result_input_hash_line tests/git-publication-native.sh
  native_result_input_hash_line tests/support/git-publication-native-host.sh
  native_result_input_hash_line tests/support/story-branch-closure-native-run.sh
  native_result_input_hash_line tests/support/story-branch-closure-native-assess.sh
  native_result_input_hash_line tests/support/native-completion-observation.sh
  native_result_input_hash_line tests/support/story-branch-closure-native-fixture.sh
  native_result_input_hash_line tests/support/git-publication-native-run.sh
  native_result_supervision_input_hash_lines
  native_result_input_hash_line src/skills/dough-story-wrap-up/SKILL.md
  native_result_input_hash_line src/skills/dough-execute-plan/references/trunk-publication.md
  native_result_input_hash_line src/skills/dough-execute-plan/references/ci-monitor.md
  native_result_input_hash_line src/skills/dough-execute-plan/references/ci-completion-wait.md
}

story_closure_run_journey() {
  local source_dir=$1 host=$2 results_dir=$3 root prompt controller_pid
  local run_status=0 stop_status=0 directory
  root=$(mktemp -d)
  story_closure_create_fixture "${source_dir}" "${host}" "${root}"
  prompt="Use this project's installed Open Dough guidance to complete the retained Story Branch wrap-up described in .planning/execution-state.txt. Integrate the saved published closure into trunk, preserve the project's stated product result, observe the applicable result, and clean up safely. Do not inspect parent processes or external test-harness source."
  native_case_host=${host}
  native_case_id='story-branch-closure/source-conflict'
  native_case_results_dir=${results_dir}
  temporary_dir=${root}
  candidate=${source_dir}
  transcript="${root}/events.jsonl"
  output_file="${root}/response.md"
  native_stderr="${root}/stderr.log"
  target=${story_closure_workspace}
  native_run_workspace=${story_closure_workspace}
  platform=${host}
  story_closure_forced_stop_file="${root}/forced-stop.txt"
  export STORY_CLOSURE_TRANSCRIPT="${transcript}"
  : > "${transcript}"
  : > "${native_stderr}"
  story_closure_controller &
  controller_pid=$!
  git_publication_run_native_command || run_status=$?
  wait "${controller_pid}" || run_status=1
  # Observe product shutdown before any fixture cleanup/stop.
  story_closure_observe "${transcript}" "${output_file}" \
    > "${root}/observations.txt"
  for directory in "${story_closure_storage}"/*; do
    [[ -f ${directory}/request.json ]] || continue
    [[ -f ${directory}/result.json ]] && continue
    (cd "${story_closure_workspace}" && node "${story_closure_launcher}" stop \
      "${directory}") > "${story_closure_forced_stop_file}" || stop_status=$?
  done
  if story_closure_assess "${root}/observations.txt"; then
    git_publication_assess_status=pass
    git_publication_assess_reason='target-correct integration complete-revision and cleanup observed'
  else
    git_publication_assess_status=fail
    git_publication_assess_reason='Story Branch integration observation was incomplete or misordered'
    run_status=1
  fi
  git_publication_retain_attempt "${source_dir}" "${prompt}" "${transcript}" \
    "${output_file}" "${native_stderr}" "${root}/observations.txt" \
    story-branch-closure
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
  unset STORY_CLOSURE_TRANSCRIPT story_closure_forced_stop_file
  story_closure_cleanup_fixture
  rm -rf -- "${root}"
  [[ ${stop_status} -eq 0 && ${run_status} -eq 0 ]]
}
