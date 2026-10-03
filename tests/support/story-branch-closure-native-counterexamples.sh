#!/usr/bin/env bash
# Story Branch closure counterexamples: the assessor and the retire-command
# observation on rejected cases, and the observer's field list on a fixture.
# shellcheck disable=SC2034,SC2154,SC2312

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
      'human-edit-preserved: true' "refresh-attention: ${3:-false}" 'control-order:' \
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
  printf '%s\n' '## STORY WRAP-UP COMPLETE' > "${work}/response"
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
  native_assessor_rejects_edit silent-deferred-refresh refresh-attention \
    's/refresh-attention: false/refresh-attention: true/'
  native_assessor_rejects_edit missing-refresh-observation refresh-attention \
    '/^refresh-attention:/d'
  story_closure_response_counterexamples "${work}"
  story_closure_refresh_attention_counterexamples "${work}"
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

story_closure_normalized_observation() {
  local remote=$1 branch=$2 trunk=$3 mailbox=$4
  sed -e "s|${mailbox}|<branch-mailbox>|" \
    -e "s|${branch}|<branch-sha>|" \
    -e "s|${trunk}|<trunk-before-sha>|" \
    -e "s|${remote}|<remote-sha>|"
}

story_closure_expected_observation() {
  local integrated=$1 parents=$2
  printf '%s\n' \
    'remote-sha: <trunk-before-sha>' \
    'branch-sha: <branch-sha>' \
    'trunk-before-sha: <trunk-before-sha>' \
    "integrated-sha: ${integrated}" \
    "merge-parent-count: ${parents}" \
    'source-resolution-correct: false' \
    'branch-mailbox: <branch-mailbox>' \
    'trunk-mailbox: missing' \
    'branch-target: exec/story' \
    'trunk-target: missing' \
    'observer-count: 1' \
    'branch-terminal: missing' \
    'trunk-terminal: missing' \
    'trunk-coverage-state: missing' \
    'branch-complete-count: 0' \
    'branch-await-count: 0' \
    'branch-stop-count: 0' \
    'trunk-registered: false' \
    'trunk-complete-count: 0' \
    'trunk-await-count: 0' \
    'trunk-stop-count: 0' \
    'branch-product-shutdown: false' \
    'trunk-product-shutdown: false' \
    'forced-stop: false' \
    'retire-command: false' \
    'worktree-present: true' \
    'local-branch-present: true' \
    'cleanup-observer-states: none' \
    'branch-remote: present' \
    'cleanup-complete: false' \
    'human-edit-preserved: true' \
    'refresh-attention: true' \
    'control-order:' \
    'harness-inspected: false' \
    'response:'
}

story_closure_observe_fresh_fixture() {
  local scenario=$1 root harness observed
  root=$(mktemp -d)
  harness=$(mktemp -d)
  story_closure_create_fixture "${source_dir}" claude "${root}" "${harness}"
  : > "${harness}/transcript.jsonl"
  : > "${harness}/response.md"
  [[ ${scenario} == fresh ]] \
    || printf '%s\n' "${story_closure_branch_sha}" > "${story_closure_integrated_sha_file}"
  observed=$(story_closure_observe claude "${harness}/transcript.jsonl" \
    "${harness}/response.md" | story_closure_normalized_observation \
    "${story_closure_trunk_sha}" "${story_closure_branch_sha}" \
    "${story_closure_trunk_sha}" "${story_closure_branch_mailbox}")
  native_harness_stop_observers "${source_dir}" "${story_closure_storage}" \
    "${harness}/forced-stop.txt"
  story_closure_cleanup_fixture
  rm -rf -- "${root}" "${harness}"
  printf '%s\n' "${observed}"
}

run_story_closure_observer_counterexamples() {
  local failure='' observed
  observed=$(story_closure_observe_fresh_fixture fresh)
  diff -u <(story_closure_expected_observation missing 0) \
    <(printf '%s\n' "${observed}") >&2 \
    || failure='fresh observation changed its fields or order'
  observed=$(story_closure_observe_fresh_fixture integrated)
  [[ -n ${failure} ]] || diff -u <(story_closure_expected_observation \
    '<branch-sha>' 1) <(printf '%s\n' "${observed}") >&2 \
    || failure='integrated observation changed its fields or order'
  [[ -z ${failure} ]] || printf 'FAIL: Story Branch observer: %s\n' "${failure}" >&2
  [[ -z ${failure} ]]
}

# Actual checkout states decide whether marker-only is sufficient. These
# temporary repositories are starting conditions, not product publication.
story_closure_refresh_attention_counterexamples() {
  local work=$1 checkout="$1/default" sha required
  git init -q -b main "${checkout}"
  printf 'base\n' > "${checkout}/product.txt"
  git -C "${checkout}" add product.txt
  git -C "${checkout}" -c user.name=Fixture \
    -c user.email=fixture@example.invalid commit -qm base
  sha=$(git -C "${checkout}" rev-parse HEAD)
  [[ $(closure_refresh_attention '' "${sha}") == false ]]
  [[ $(closure_refresh_attention "${checkout}" "${sha}") == false ]]
  printf 'human edit\n' >> "${checkout}/product.txt"
  required=$(closure_refresh_attention "${checkout}" "${sha}")
  [[ ${required} == true ]]
  printf '%s\n' '## STORY WRAP-UP COMPLETE' > "${work}/response"
  story_closure_write_assessor_observation "${work}/quiet" "${work}/response"
  native_assessor_counterexamples "${story_closure_assess_file}" "${work}/quiet" \
    -- story_closure_assess
  story_closure_write_assessor_observation "${work}/silent" "${work}/response" "${required}"
  native_assessor_rejects silent-material-refresh refresh-attention "${work}/silent"
  printf '%s\n' \
    'Default checkout /project/main has uncommitted human edits; refresh is deferred. Refresh it once the owner commits those edits.' \
    '## STORY WRAP-UP COMPLETE' > "${work}/response"
  story_closure_write_assessor_observation "${work}/attention" "${work}/response" "${required}"
  story_closure_assess "${work}/attention"
}
