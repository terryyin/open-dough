#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

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
