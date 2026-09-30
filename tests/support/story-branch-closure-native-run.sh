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
# shellcheck source=tests/support/story-branch-closure-native-observer-counterexamples.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/story-branch-closure-native-observer-counterexamples.sh"

story_closure_trunk_mailbox() {
  local directory
  for directory in "${story_closure_storage}"/*; do
    [[ -f ${directory}/request.json ]] || continue
    [[ $(jq -r '.branch' "${directory}/request.json") == main ]] || continue
    printf '%s\n' "${directory}"
  done
}

story_closure_complete_seen() {
  local host=$1 mailbox=$2 sha=$3
  native_completion_seen "${story_closure_node_log}" "${host}" \
    "${transcript:-/dev/null}" "${mailbox}" "${sha}"
}

story_closure_controller() {
  local host=$1 remote_sha trunk_mailbox coverage
  wait_for branch-complete "${story_closure_wait_limit}" \
    "story_closure_complete_seen '${host}' '${story_closure_branch_mailbox}' '${story_closure_branch_sha}'" || return
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
    "[[ \$(native_completion_registered '${trunk_mailbox}' '${remote_sha}') == true ]]" || return
  printf 'trunk-registration\n' >> "${story_closure_control_log}"
  wait_for trunk-complete "${story_closure_wait_limit}" \
    "story_closure_complete_seen '${host}' '${trunk_mailbox}' '${remote_sha}'" || return
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
  native_result_input_hash_lines \
    tests/git-publication-native.sh \
    tests/support/git-publication-native-host.sh \
    tests/support/story-branch-closure-native-run.sh \
    tests/support/story-branch-closure-native-assess.sh \
    tests/support/story-branch-closure-native-observer-counterexamples.sh \
    tests/support/story-branch-closure-native-response.sh \
    tests/support/native-response-field.sh \
    tests/support/native-completion-observation.sh \
    tests/support/story-branch-closure-native-fixture.sh \
    tests/support/native-harness-observation.sh \
    tests/support/native-harness-login-shell.sh \
    tests/support/native-node-call-recorder.mjs \
    tests/support/git-publication-native-run.sh
  native_result_supervision_input_hash_lines
  native_result_input_hash_lines \
    src/skills/dough-story-wrap-up/SKILL.md \
    src/skills/dough-execute-plan/references/trunk-publication.md \
    src/skills/dough-execute-plan/references/wrap-up-closure-publication.md \
    src/skills/dough-execute-plan/references/ci-monitor.md \
    src/skills/dough-execute-plan/references/ci-completion-wait.md \
    src/skills/dough-execute-plan/references/publish-the-candidate.md
  git_publication_closing_input_hash_lines \
    src/skills/dough-execute-plan/scripts/ci-mailbox.mjs \
    src/skills/dough-product-backlog/scripts/product-backlog-git-merge.mjs
}

story_closure_run_journey() {
  local source_dir=$1 host=$2 results_dir=$3 root harness prompt controller_pid
  local run_status=0 stop_status=0
  root=$(mktemp -d)
  harness=$(mktemp -d)
  story_closure_create_fixture "${source_dir}" "${host}" "${root}" "${harness}"
  prompt="Use this project's installed Open Dough guidance to complete the retained Story Branch wrap-up described in .planning/execution-state.txt. Integrate the saved published closure into trunk, preserve the project's stated product result, observe the applicable result, and clean up safely. Do not inspect parent processes or external test-harness source."
  native_case_host=${host}
  native_case_id='story-branch-closure/source-conflict'
  native_case_results_dir=${results_dir}
  temporary_dir=${root}
  candidate=${source_dir}
  transcript="${harness}/events.jsonl"
  output_file="${harness}/response.md"
  native_stderr="${harness}/stderr.log"
  target=${story_closure_workspace}
  native_run_workspace=${story_closure_workspace}
  platform=${host}
  story_closure_forced_stop_file="${harness}/forced-stop.txt"
  : > "${transcript}"
  : > "${native_stderr}"
  story_closure_controller "${host}" &
  controller_pid=$!
  git_publication_run_native_command || run_status=$?
  wait "${controller_pid}" || run_status=1
  # Observe product shutdown before any fixture cleanup/stop.
  story_closure_observe "${host}" "${transcript}" "${output_file}" \
    > "${harness}/observations.txt"
  native_harness_stop_observers "${source_dir}" "${story_closure_storage}" \
    "${story_closure_forced_stop_file}" || stop_status=$?
  if story_closure_assess "${harness}/observations.txt"; then
    git_publication_assess_status=pass
    git_publication_assess_reason='target-correct integration complete-revision and cleanup observed'
  else
    git_publication_assess_status=fail
    git_publication_assess_reason='Story Branch integration observation was incomplete or misordered'
    run_status=1
  fi
  git_publication_retain_attempt "${source_dir}" "${prompt}" "${transcript}" \
    "${output_file}" "${native_stderr}" "${harness}/observations.txt" \
    story-branch-closure
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
  unset story_closure_forced_stop_file
  story_closure_cleanup_fixture
  rm -rf -- "${root}" "${harness}"
  [[ ${stop_status} -eq 0 && ${run_status} -eq 0 ]]
}

# A trunk observer the agent starts from a login shell whose startup files put
# another gh first, as a user's zsh profile can, observes the fixture's CI and
# never calls that gh. The fallback stop then
# still stops the observers the session left running after its cleanup removed
# the worktree that holds the installed launcher.
run_story_closure_harness_counterexamples() {
  local root harness profile failure='' run_in_worktree receipt trunk_mailbox
  root=$(mktemp -d)
  harness=$(mktemp -d)
  profile=$(mktemp -d)
  native_harness_write_decoy_profile "${profile}" gh
  local -x ZDOTDIR=${profile}
  story_closure_create_fixture "${source_dir}" claude "${root}" "${harness}"
  run_in_worktree="cd '${story_closure_workspace}' && node '${story_closure_launcher}'"
  receipt=$(native_harness_login_shell "${run_in_worktree} start --execution owner/project main")
  trunk_mailbox=$(jq -r '.directory' <<< "${receipt#CI_OBSERVER }")
  native_harness_login_shell "${run_in_worktree} register-push '${trunk_mailbox}' '${story_closure_trunk_sha}'" > /dev/null
  wait_for login-shell-trunk-coverage "${story_closure_wait_limit}" \
    "grep -q '\"state\":\"success\"' '${trunk_mailbox}/coverage/${story_closure_trunk_sha}.json'" \
    || failure='the agent-started observer missed the fixture CI'
  [[ ! -s ${profile}/decoy.log ]] || failure='the agent-started observer reached another gh'
  git -C "${story_closure_integration}" worktree remove --force \
    "${story_closure_workspace}"
  native_harness_stop_observers "${source_dir}" "${story_closure_storage}" \
    "${harness}/forced-stop.txt"
  [[ -s ${harness}/forced-stop.txt ]] || failure='no observer stopped by the fallback'
  [[ $(story_closure_mailbox_states | paste -sd, -) =~ ^exec/story:\ (stopped|finished),main:\ (stopped|finished)$ ]] \
    || failure="observers left running: $(story_closure_mailbox_states | paste -sd, -)"
  story_closure_cleanup_fixture
  rm -rf -- "${root}" "${harness}" "${profile}"
  [[ -z ${failure} ]] || printf 'FAIL: Story Branch harness: %s\n' "${failure}" >&2
  [[ -z ${failure} ]]
}
