#!/usr/bin/env bash
# Story Branch closure observation and assessor counterexamples.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/native-completion-observation.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-completion-observation.sh"
# shellcheck source=tests/support/story-branch-closure-native-response.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/story-branch-closure-native-response.sh"
story_closure_assess_file="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/story-branch-closure-native-assess.sh"

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

# Signals for rejected cases of story_closure_assess.
# assessor-signal: integration integrated-sha
# assessor-signal: trunk-target trunk-target
# assessor-signal: observer-count observer-count
# assessor-signal: harness-inspected harness-inspected
# assessor-signal: forced-stop forced-stop
# assessor-signal: trunk-registration trunk-registered
# assessor-signal: retire-command retire-command
# assessor-signal: worktree worktree-present
# assessor-signal: local-branch local-branch-present
# assessor-signal: cleanup-observers cleanup-observer-states
# assessor-signal: remote-branch branch-remote
# assessor-signal: control-order control-order
# assessor-signal: response response
story_closure_assess() {
  local observations=$1 remote branch trunk integrated
  remote=$(native_observation_field "${observations}" remote-sha)
  branch=$(native_observation_field "${observations}" branch-sha)
  trunk=$(native_observation_field "${observations}" trunk-before-sha)
  integrated=$(native_observation_field "${observations}" integrated-sha)
  [[ ${remote} == "${integrated}" && ${integrated} != "${branch}" &&
    ${integrated} != "${trunk}" ]] || return 1
  grep -Fqx 'merge-parent-count: 2' "${observations}" || return 1
  grep -Fqx 'source-resolution-correct: true' "${observations}" || return 1
  grep -Fqx 'branch-target: exec/story' "${observations}" || return 1
  grep -Fqx 'trunk-target: main' "${observations}" || return 1
  grep -Fqx 'observer-count: 2' "${observations}" || return 1
  grep -Eq '^branch-terminal: (stopped|finished)$' "${observations}" || return 1
  grep -Eq '^trunk-terminal: (stopped|finished)$' "${observations}" || return 1
  grep -Fqx 'trunk-coverage-state: success' "${observations}" || return 1
  grep -Fqx 'branch-complete-count: 1' "${observations}" || return 1
  grep -Fqx 'branch-await-count: 0' "${observations}" || return 1
  grep -Fqx 'branch-stop-count: 0' "${observations}" || return 1
  grep -Fqx 'trunk-registered: true' "${observations}" || return 1
  grep -Fqx 'trunk-complete-count: 1' "${observations}" || return 1
  grep -Fqx 'trunk-await-count: 0' "${observations}" || return 1
  grep -Fqx 'trunk-stop-count: 0' "${observations}" || return 1
  grep -Fqx 'branch-product-shutdown: true' "${observations}" || return 1
  grep -Fqx 'trunk-product-shutdown: true' "${observations}" || return 1
  grep -Fqx 'forced-stop: false' "${observations}" || return 1
  grep -Fqx 'retire-command: true' "${observations}" || return 1
  grep -Fqx 'worktree-present: false' "${observations}" || return 1
  grep -Fqx 'local-branch-present: false' "${observations}" || return 1
  grep -Eqx 'cleanup-observer-states: exec/story: (stopped|finished),main: (stopped|finished)' \
    "${observations}" || return 1
  grep -Fqx 'branch-remote: absent' "${observations}" || return 1
  grep -Fqx 'cleanup-complete: true' "${observations}" || return 1
  grep -Fqx 'human-edit-preserved: true' "${observations}" || return 1
  [[ $(story_closure_response_trunk_result \
    <(native_response_field_read "${observations}")) == true ]] || return 1
  grep -Fqx 'harness-inspected: false' "${observations}" || return 1
  native_completion_control_order "${observations}" branch-complete \
    branch-shutdown trunk-setup integration-publication trunk-registration \
    trunk-complete trunk-ci-release trunk-coverage-success trunk-shutdown \
    cleanup-complete
}

# Valid observations at $1 whose response is file $2's text.
story_closure_write_assessor_observation() {
  {
    printf '%s\n' 'remote-sha: integrated' 'branch-sha: branch' \
      'trunk-before-sha: trunk' 'integrated-sha: integrated' \
      'merge-parent-count: 2' 'source-resolution-correct: true' \
      'branch-target: exec/story' 'trunk-target: main' 'observer-count: 2' \
      'branch-terminal: stopped' 'trunk-terminal: stopped' \
      'trunk-coverage-state: success' 'branch-complete-count: 1' \
      'branch-await-count: 0' 'branch-stop-count: 0' 'trunk-registered: true' \
      'trunk-complete-count: 1' 'trunk-await-count: 0' 'trunk-stop-count: 0' \
      'branch-product-shutdown: true' 'trunk-product-shutdown: true' \
      'forced-stop: false' 'retire-command: true' 'worktree-present: false' \
      'local-branch-present: false' \
      'cleanup-observer-states: exec/story: stopped,main: finished' \
      'branch-remote: absent' 'cleanup-complete: true' \
      'human-edit-preserved: true' 'control-order:' \
      '  branch-complete' '  branch-shutdown' '  trunk-setup' \
      '  integration-publication' '  trunk-registration' '  trunk-complete' \
      '  trunk-ci-release' '  trunk-coverage-success' '  trunk-shutdown' \
      '  cleanup-complete' 'harness-inspected: false'
    native_response_field_write "$2"
  } > "$1"
}

run_story_closure_assessor_counterexamples() {
  local work valid
  work=$(mktemp -d)
  valid="${work}/valid"
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN
  printf '%s\n' 'Trunk CI is green on the integrated commit.' > "${work}/response"
  story_closure_write_assessor_observation "${valid}" "${work}/response"
  native_assessor_counterexamples "${story_closure_assess_file}" "${valid}" \
    -- story_closure_assess
  native_assessor_rejects_edit branch-tip integration \
    's/integrated-sha: integrated/integrated-sha: branch/'
  native_assessor_rejects_edit retargeted trunk-target \
    's/trunk-target: main/trunk-target: exec\/story/'
  native_assessor_rejects_edit duplicate observer-count \
    's/observer-count: 2/observer-count: 3/'
  native_assessor_rejects_edit contaminated harness-inspected \
    's/harness-inspected: false/harness-inspected: true/'
  native_assessor_rejects_edit forced forced-stop \
    's/forced-stop: false/forced-stop: true/'
  native_assessor_rejects_edit unregistered trunk-registration \
    's/trunk-registered: true/trunk-registered: false/'
  native_assessor_rejects_edit raw-git-cleanup retire-command \
    's/retire-command: true/retire-command: false/'
  native_assessor_rejects_edit worktree-kept worktree \
    's/worktree-present: false/worktree-present: true/'
  native_assessor_rejects_edit local-branch-kept local-branch \
    's/local-branch-present: false/local-branch-present: true/'
  native_assessor_rejects_edit cleanup-before-shutdown cleanup-observers \
    's/main: finished/main: running/'
  native_assessor_rejects_edit remote-branch-kept remote-branch \
    's/branch-remote: absent/branch-remote: present/'
  # The published gate skipped: trunk CI released before the trunk
  # registration, with the outcome otherwise correct.
  native_assessor_rejects_edit ci-release-before-registration control-order \
    '/^  trunk-ci-release$/d; s/^  trunk-registration$/  trunk-ci-release\
  trunk-registration/'
  story_closure_response_counterexamples "${work}"
  story_closure_retire_counterexamples "${work}"
}

# On every host, the retire command the agent started for exec/story at the
# integrated revision is seen; the same text only in a command's output, or a
# retire of another branch, is not.
story_closure_retire_counterexamples() {
  local work=$1 sha=0123456789abcdef0123456789abcdef01234567 host stream
  local admission_events admission_tool story_closure_node_log="$1/node.log"
  local retire="node .agents/skills/dough-land/scripts/worktree-retirement.mjs retire"
  # Counterexample streams are written in each host's shape by the substitute's
  # recorder, loaded only here so the paid assessor path holds no substitute.
  # shellcheck source=tests/support/native-agent-admission.sh
  # shellcheck disable=SC1091
  source "${story_closure_assess_file%/*}/native-agent-admission.sh"
  : > "${story_closure_node_log}"
  for host in codex cursor claude; do
    admission_events='' admission_tool=0 stream="${work}/${host}.jsonl"
    admission_record "${retire} --remote-branch exec/other --contained ${sha}" ''
    admission_record 'cat notes.txt' \
      "${retire} --remote-branch exec/story --contained ${sha}"
    printf '%s' "${admission_events}" > "${stream}"
    [[ $(story_closure_retire_seen "${host}" "${stream}" "${sha}") == false ]]
    admission_record "${retire} --remote-branch exec/story --contained ${sha}" ''
    printf '%s' "${admission_events}" > "${stream}"
    [[ $(story_closure_retire_seen "${host}" "${stream}" "${sha}") == true ]]
  done
}
