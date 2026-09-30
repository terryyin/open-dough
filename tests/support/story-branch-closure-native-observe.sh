#!/usr/bin/env bash
# Story Branch closure observation: the fields the assessor reads.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/native-completion-observation.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-completion-observation.sh"

# True when the node call log or a command host $1 started in stream $2 shows
# the installed retire command deleting exec/story once trunk holds SHA $3.
story_closure_retire_seen() {
  local host=$1 transcript=$2 sha=$3 count
  count=$(
    {
      cat "${story_closure_node_log}"
      native_stream_started_commands "${host}" "${transcript}" \
        'worktree-retirement.mjs retire'
    } | grep -F 'worktree-retirement.mjs retire' \
      | grep -E -- '--remote-branch[^-]*exec/story' \
      | grep -Ec -- "--contained[^-]*${sha}" || true
  )
  if ((count > 0)); then
    printf 'true\n'
  else
    printf 'false\n'
  fi
}

story_closure_observe() {
  local host=$1 transcript=$2 response=$3 candidate=missing trunk_mailbox=missing
  local branch_terminal=missing trunk_terminal=missing trunk_state=missing
  local observer_count parent_count=0 source_ok=false branch_remote=present human_after
  local branch_complete=0 trunk_complete=0 branch_stop=0 trunk_stop=0
  local branch_await=0 trunk_await=0 branch_forced_stop=false trunk_forced_stop=false
  local branch_product_shutdown=false trunk_product_shutdown=false
  [[ -s ${story_closure_integrated_sha_file} ]] \
    && candidate=$(cat "${story_closure_integrated_sha_file}")
  [[ -s ${story_closure_integrated_sha_file}.mailbox ]] \
    && trunk_mailbox=$(cat "${story_closure_integrated_sha_file}.mailbox")
  [[ -f ${story_closure_branch_mailbox}/result.json ]] \
    && branch_terminal=$(jq -r .status "${story_closure_branch_mailbox}/result.json")
  [[ -f ${trunk_mailbox}/result.json ]] \
    && trunk_terminal=$(jq -r .status "${trunk_mailbox}/result.json")
  [[ -f ${trunk_mailbox}/coverage/${candidate}.json ]] \
    && trunk_state=$(jq -r .state "${trunk_mailbox}/coverage/${candidate}.json")
  # The integration checkout shares the retired worktree's objects.
  [[ ${candidate} != missing ]] && parent_count=$(git -C "${story_closure_integration}" \
    cat-file -p "${candidate}" | grep -c '^parent ' || true)
  [[ $(git -C "${story_closure_integration}" show "${candidate}:product.txt" 2> /dev/null) == $'trunk source\nstory source' ]] && source_ok=true
  [[ -z $(git ls-remote "${story_closure_origin}" refs/heads/exec/story) ]] \
    && branch_remote=absent
  human_after=$(git -C "${story_closure_integration}" status --porcelain)
  observer_count=$(find "${story_closure_storage}" -mindepth 2 -maxdepth 2 \
    -name request.json -exec jq -r 'select(.probe != true) | 1' {} + \
    | wc -l | tr -d ' ')
  native_completion_measure branch "${story_closure_node_log}" "${host}" \
    "${transcript}" "${story_closure_branch_mailbox}" "${story_closure_branch_sha}" \
    "${branch_terminal}" "${story_closure_forced_stop_file-}"
  native_completion_measure trunk "${story_closure_node_log}" "${host}" \
    "${transcript}" "${trunk_mailbox}" "${candidate}" "${trunk_terminal}" \
    "${story_closure_forced_stop_file-}"
  {
    printf 'remote-sha: %s\n' "$(git ls-remote "${story_closure_origin}" refs/heads/main | awk '{print $1}')"
    printf 'branch-sha: %s\ntrunk-before-sha: %s\nintegrated-sha: %s\n' \
      "${story_closure_branch_sha}" "${story_closure_trunk_sha}" "${candidate}"
    printf 'merge-parent-count: %s\nsource-resolution-correct: %s\n' \
      "${parent_count}" "${source_ok}"
    printf 'branch-mailbox: %s\ntrunk-mailbox: %s\n' \
      "${story_closure_branch_mailbox}" "${trunk_mailbox}"
    printf 'branch-target: %s\n' "$(jq -r .branch "${story_closure_branch_mailbox}/request.json")"
    printf 'trunk-target: %s\n' "$(jq -r .branch "${trunk_mailbox}/request.json" 2> /dev/null || echo missing)"
    printf 'observer-count: %s\n' "${observer_count}"
    printf 'branch-terminal: %s\ntrunk-terminal: %s\ntrunk-coverage-state: %s\n' \
      "${branch_terminal}" "${trunk_terminal}" "${trunk_state}"
    printf 'branch-complete-count: %s\n' "${branch_complete}"
    printf 'branch-await-count: %s\n' "${branch_await}"
    printf 'branch-stop-count: %s\n' "${branch_stop}"
    printf 'trunk-registered: %s\n' "$(native_completion_registered "${trunk_mailbox}" "${candidate}")"
    printf 'trunk-complete-count: %s\n' "${trunk_complete}"
    printf 'trunk-await-count: %s\n' "${trunk_await}"
    printf 'trunk-stop-count: %s\n' "${trunk_stop}"
    printf 'branch-product-shutdown: %s\ntrunk-product-shutdown: %s\n' \
      "${branch_product_shutdown}" "${trunk_product_shutdown}"
    printf 'forced-stop: %s\n' "${branch_forced_stop}"
    printf 'retire-command: %s\n' "$(story_closure_retire_seen "${host}" "${transcript}" "${candidate}")"
    printf 'worktree-present: %s\nlocal-branch-present: %s\n' \
      "$([[ -e ${story_closure_workspace} ]] && echo true || echo false)" \
      "$(git -C "${story_closure_integration}" show-ref --quiet --verify \
        refs/heads/exec/story && echo true || echo false)"
    printf 'cleanup-observer-states: %s\n' "$([[ -f ${story_closure_cleanup_states} ]] \
      && paste -sd, - < "${story_closure_cleanup_states}" || echo none)"
    printf 'branch-remote: %s\ncleanup-complete: %s\nhuman-edit-preserved: %s\n' \
      "${branch_remote}" "$([[ -f ${story_closure_cleanup_marker} ]] && echo true || echo false)" \
      "$([[ ${human_after} == "${story_closure_human_before}" ]] && echo true || echo false)"
    printf 'control-order:\n'
    sed 's/^/  /' "${story_closure_control_log}"
    printf 'harness-inspected: %s\n' "$(native_harness_inspected 'story-branch-closure-native|native harness|source-conflict' "${transcript}")"
    native_response_field_write "${response}"
  }
}
