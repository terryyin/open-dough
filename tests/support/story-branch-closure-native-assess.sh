#!/usr/bin/env bash
# Story Branch closure observation and assessor counterexamples.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/native-completion-observation.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-completion-observation.sh"

story_closure_observe() {
  local transcript=$1 response=$2 candidate=missing trunk_mailbox=missing
  local branch_terminal=missing trunk_terminal=missing trunk_state=missing
  local observer_count parent_count=0 source_ok=false branch_remote=present human_after
  local branch_complete=0 trunk_complete=0 branch_stop=0 trunk_stop=0
  local branch_await=0 trunk_await=0 forced_stop=false
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
  [[ ${candidate} != missing ]] && parent_count=$(git -C "${story_closure_workspace}" \
    cat-file -p "${candidate}" | grep -c '^parent ' || true)
  [[ $(git -C "${story_closure_workspace}" show "${candidate}:product.txt" 2> /dev/null) == $'trunk source\nstory source' ]] && source_ok=true
  [[ -z $(git ls-remote "${story_closure_origin}" refs/heads/exec/story) ]] \
    && branch_remote=absent
  human_after=$(git -C "${story_closure_integration}" status --porcelain)
  observer_count=$(find "${story_closure_storage}" -mindepth 2 -maxdepth 2 \
    -name request.json -exec jq -r 'select(.probe != true) | 1' {} + \
    | wc -l | tr -d ' ')
  branch_complete=$(native_completion_call_count \
    "${story_closure_node_log}" "" \
    "${story_closure_branch_mailbox}" "${story_closure_branch_sha}")
  trunk_complete=$(native_completion_call_count \
    "${story_closure_node_log}" "" "${trunk_mailbox}" "${candidate}")
  branch_await=$(native_completion_await_count \
    "${story_closure_node_log}" "${story_closure_branch_mailbox}" \
    "${story_closure_branch_sha}")
  trunk_await=$(native_completion_await_count \
    "${story_closure_node_log}" "${trunk_mailbox}" "${candidate}")
  branch_stop=$(native_completion_stop_count \
    "${story_closure_node_log}" "${story_closure_branch_mailbox}")
  trunk_stop=$(native_completion_stop_count \
    "${story_closure_node_log}" "${trunk_mailbox}")
  forced_stop=$(native_completion_forced_stop "${story_closure_forced_stop_file-}")
  branch_product_shutdown=$(native_completion_product_shutdown \
    "${branch_complete}" "${story_closure_forced_stop_file-}" "${branch_terminal}")
  trunk_product_shutdown=$(native_completion_product_shutdown \
    "${trunk_complete}" "${story_closure_forced_stop_file-}" "${trunk_terminal}")
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
    printf 'trunk-register-count: %s\n' "$(grep -Fc "register-push ${trunk_mailbox} ${candidate}" "${story_closure_node_log}" || true)"
    printf 'trunk-complete-count: %s\n' "${trunk_complete}"
    printf 'trunk-await-count: %s\n' "${trunk_await}"
    printf 'trunk-stop-count: %s\n' "${trunk_stop}"
    printf 'branch-product-shutdown: %s\ntrunk-product-shutdown: %s\n' \
      "${branch_product_shutdown}" "${trunk_product_shutdown}"
    printf 'forced-stop: %s\n' "${forced_stop}"
    printf 'branch-remote: %s\ncleanup-complete: %s\nhuman-edit-preserved: %s\n' \
      "${branch_remote}" "$([[ -f ${story_closure_cleanup_marker} ]] && echo true || echo false)" \
      "$([[ ${human_after} == "${story_closure_human_before}" ]] && echo true || echo false)"
    printf 'control-order:\n'
    sed 's/^/  /' "${story_closure_control_log}"
    printf 'transcript-complete: %s\n' "$(grep -Fq 'complete-revision' "${transcript}" && echo true || echo false)"
    printf 'response-trunk-result: %s\n' "$(grep -Eiq 'trunk.+(CI|verdict|receipt).+success|success.+trunk|integrat.+success|completion receipt' "${response}" && echo true || echo false)"
    printf 'harness-inspected: %s\n' "$(grep -Eiq 'story-branch-closure-native|native harness|source-conflict' "${transcript}" && echo true || echo false)"
  }
}

story_closure_assess() {
  local observations=$1 remote branch trunk integrated
  remote=$(awk '/^remote-sha:/{print $2}' "${observations}")
  branch=$(awk '/^branch-sha:/{print $2}' "${observations}")
  trunk=$(awk '/^trunk-before-sha:/{print $2}' "${observations}")
  integrated=$(awk '/^integrated-sha:/{print $2}' "${observations}")
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
  grep -Fqx 'trunk-register-count: 1' "${observations}" || return 1
  grep -Fqx 'trunk-complete-count: 1' "${observations}" || return 1
  grep -Fqx 'trunk-await-count: 0' "${observations}" || return 1
  grep -Fqx 'trunk-stop-count: 0' "${observations}" || return 1
  grep -Fqx 'branch-product-shutdown: true' "${observations}" || return 1
  grep -Fqx 'trunk-product-shutdown: true' "${observations}" || return 1
  grep -Fqx 'forced-stop: false' "${observations}" || return 1
  grep -Fqx 'branch-remote: absent' "${observations}" || return 1
  grep -Fqx 'cleanup-complete: true' "${observations}" || return 1
  grep -Fqx 'human-edit-preserved: true' "${observations}" || return 1
  grep -Fqx 'transcript-complete: true' "${observations}" || return 1
  grep -Fqx 'response-trunk-result: true' "${observations}" || return 1
  grep -Fqx 'harness-inspected: false' "${observations}" || return 1
  awk '/branch-complete/{a=NR} /branch-shutdown/{b=NR} /trunk-setup/{c=NR} /integration-publication/{d=NR} /trunk-registration/{e=NR} /trunk-complete/{f=NR} /trunk-ci-release/{g=NR} /trunk-coverage-success/{h=NR} /trunk-shutdown/{i=NR} /cleanup-complete/{j=NR} END{exit !(a<b && b<c && c<d && d<e && e<f && f<g && g<h && h<i && i<j)}' "${observations}"
}

run_story_closure_assessor_counterexamples() {
  local work valid
  work=$(mktemp -d)
  valid="${work}/valid"
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN
  printf '%s\n' 'remote-sha: integrated' 'branch-sha: branch' \
    'trunk-before-sha: trunk' 'integrated-sha: integrated' \
    'merge-parent-count: 2' 'source-resolution-correct: true' \
    'branch-target: exec/story' 'trunk-target: main' 'observer-count: 2' \
    'branch-terminal: stopped' 'trunk-terminal: stopped' \
    'trunk-coverage-state: success' 'branch-complete-count: 1' \
    'branch-await-count: 0' 'branch-stop-count: 0' 'trunk-register-count: 1' \
    'trunk-complete-count: 1' 'trunk-await-count: 0' 'trunk-stop-count: 0' \
    'branch-product-shutdown: true' 'trunk-product-shutdown: true' \
    'forced-stop: false' 'branch-remote: absent' 'cleanup-complete: true' \
    'human-edit-preserved: true' 'transcript-complete: true' \
    'response-trunk-result: true' 'harness-inspected: false' 'control-order:' \
    '  branch-complete' '  branch-shutdown' '  trunk-setup' \
    '  integration-publication' '  trunk-registration' '  trunk-complete' \
    '  trunk-ci-release' '  trunk-coverage-success' '  trunk-shutdown' \
    '  cleanup-complete' > "${valid}"
  story_closure_assess "${valid}"
  sed 's/integrated-sha: integrated/integrated-sha: branch/' "${valid}" \
    > "${work}/branch-tip" && ! story_closure_assess "${work}/branch-tip"
  sed 's/trunk-target: main/trunk-target: exec\/story/' "${valid}" \
    > "${work}/retargeted" && ! story_closure_assess "${work}/retargeted"
  sed 's/observer-count: 2/observer-count: 3/' "${valid}" \
    > "${work}/duplicate" && ! story_closure_assess "${work}/duplicate"
  sed 's/harness-inspected: false/harness-inspected: true/' "${valid}" \
    > "${work}/contaminated" && ! story_closure_assess "${work}/contaminated"
  sed 's/forced-stop: false/forced-stop: true/' "${valid}" \
    > "${work}/forced" && ! story_closure_assess "${work}/forced"
  echo 'PASS: Story Branch closure assessor rejects a green branch tip, retargeted or duplicate observers, fixture-masked shutdown, and a harness-contaminated transcript.'
}
