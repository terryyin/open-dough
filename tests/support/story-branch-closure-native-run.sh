#!/usr/bin/env bash
# Native Story Branch integration journey with a real source conflict and two
# independently observed targets.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/story-branch-closure-native-fixture.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/story-branch-closure-native-fixture.sh"

story_closure_trunk_mailbox() {
  local directory
  for directory in "${story_closure_storage}"/*; do
    [[ -f ${directory}/request.json ]] || continue
    [[ $(jq -r '.branch' "${directory}/request.json") == main ]] || continue
    printf '%s\n' "${directory}"
  done
}

story_closure_controller() {
  local remote_sha trunk_mailbox coverage
  story_closure_wait_for branch-await \
    "grep -Fq 'await-revision ${story_closure_branch_mailbox} ${story_closure_branch_sha}' '${story_closure_node_log}'" || return
  printf 'branch-await\n' >> "${story_closure_control_log}"
  story_closure_wait_for branch-shutdown \
    "grep -Fq 'stop ${story_closure_branch_mailbox}' '${story_closure_node_log}'" || return
  printf 'branch-shutdown\n' >> "${story_closure_control_log}"
  story_closure_wait_for trunk-setup \
    "[[ -n \$(story_closure_trunk_mailbox) ]]" || return
  trunk_mailbox=$(story_closure_trunk_mailbox)
  printf '%s\n' "${trunk_mailbox}" > "${story_closure_integrated_sha_file}.mailbox"
  printf 'trunk-setup\n' >> "${story_closure_control_log}"
  story_closure_wait_for integration-publication \
    "[[ \$(git ls-remote '${story_closure_origin}' refs/heads/main | awk '{print \$1}') != '${story_closure_trunk_sha}' ]]" || return
  remote_sha=$(git ls-remote "${story_closure_origin}" refs/heads/main | awk '{print $1}')
  [[ ${remote_sha} != "${story_closure_branch_sha}" ]]
  printf '%s\n' "${remote_sha}" > "${story_closure_integrated_sha_file}"
  printf 'integration-publication\n' >> "${story_closure_control_log}"
  story_closure_wait_for trunk-registration \
    "grep -Fq 'register-push ${trunk_mailbox} ${remote_sha}' '${story_closure_node_log}'" || return
  printf 'trunk-registration\n' >> "${story_closure_control_log}"
  story_closure_wait_for trunk-await \
    "grep -Fq 'await-revision ${trunk_mailbox} ${remote_sha}' '${story_closure_node_log}'" || return
  printf 'trunk-await\n' >> "${story_closure_control_log}"
  : > "${story_closure_release}"
  printf 'trunk-ci-release\n' >> "${story_closure_control_log}"
  coverage="${trunk_mailbox}/coverage/${remote_sha}.json"
  story_closure_wait_for trunk-coverage \
    "grep -q '\"state\":\"success\"' '${coverage}'" || return
  printf 'trunk-coverage-success\n' >> "${story_closure_control_log}"
  story_closure_wait_for trunk-shutdown \
    "grep -Fq 'stop ${trunk_mailbox}' '${story_closure_node_log}'" || return
  printf 'trunk-shutdown\n' >> "${story_closure_control_log}"
  story_closure_wait_for cleanup \
    "test -f '${story_closure_cleanup_marker}'" || return
  printf 'cleanup-complete\n' >> "${story_closure_control_log}"
}

story_closure_observe() {
  local transcript=$1 response=$2 candidate=missing trunk_mailbox=missing
  local branch_terminal=missing trunk_terminal=missing trunk_state=missing
  local observer_count parent_count=0 source_ok=false branch_remote=present human_after
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
    printf 'branch-await-count: %s\n' "$(grep -Fc "await-revision ${story_closure_branch_mailbox} ${story_closure_branch_sha}" "${story_closure_node_log}" || true)"
    printf 'branch-stop-count: %s\n' "$(grep -Fc "stop ${story_closure_branch_mailbox}" "${story_closure_node_log}" || true)"
    printf 'trunk-register-count: %s\n' "$(grep -Fc "register-push ${trunk_mailbox} ${candidate}" "${story_closure_node_log}" || true)"
    printf 'trunk-await-count: %s\n' "$(grep -Fc "await-revision ${trunk_mailbox} ${candidate}" "${story_closure_node_log}" || true)"
    printf 'trunk-stop-count: %s\n' "$(grep -Fc "stop ${trunk_mailbox}" "${story_closure_node_log}" || true)"
    printf 'branch-remote: %s\ncleanup-complete: %s\nhuman-edit-preserved: %s\n' \
      "${branch_remote}" "$([[ -f ${story_closure_cleanup_marker} ]] && echo true || echo false)" \
      "$([[ ${human_after} == "${story_closure_human_before}" ]] && echo true || echo false)"
    printf 'control-order:\n'
    sed 's/^/  /' "${story_closure_control_log}"
    printf 'transcript-await: %s\n' "$(grep -Fq 'await-revision' "${transcript}" && echo true || echo false)"
    printf 'response-trunk-result: %s\n' "$(grep -Eiq 'trunk.+(CI|verdict|receipt).+success|success.+trunk|integrat.+success' "${response}" && echo true || echo false)"
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
  grep -Fqx 'branch-await-count: 1' "${observations}" || return 1
  grep -Fqx 'branch-stop-count: 1' "${observations}" || return 1
  grep -Fqx 'trunk-register-count: 1' "${observations}" || return 1
  grep -Fqx 'trunk-await-count: 1' "${observations}" || return 1
  grep -Fqx 'trunk-stop-count: 1' "${observations}" || return 1
  grep -Fqx 'branch-remote: absent' "${observations}" || return 1
  grep -Fqx 'cleanup-complete: true' "${observations}" || return 1
  grep -Fqx 'human-edit-preserved: true' "${observations}" || return 1
  grep -Fqx 'transcript-await: true' "${observations}" || return 1
  grep -Fqx 'response-trunk-result: true' "${observations}" || return 1
  grep -Fqx 'harness-inspected: false' "${observations}" || return 1
  awk '/branch-await/{a=NR} /branch-shutdown/{b=NR} /trunk-setup/{c=NR} /integration-publication/{d=NR} /trunk-registration/{e=NR} /trunk-await/{f=NR} /trunk-ci-release/{g=NR} /trunk-coverage-success/{h=NR} /trunk-shutdown/{i=NR} /cleanup-complete/{j=NR} END{exit !(a<b && b<c && c<d && d<e && e<f && f<g && g<h && h<i && i<j)}' "${observations}"
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
    'trunk-coverage-state: success' 'branch-await-count: 1' \
    'branch-stop-count: 1' 'trunk-register-count: 1' 'trunk-await-count: 1' \
    'trunk-stop-count: 1' 'branch-remote: absent' 'cleanup-complete: true' \
    'human-edit-preserved: true' 'transcript-await: true' \
    'response-trunk-result: true' 'harness-inspected: false' 'control-order:' \
    '  branch-await' '  branch-shutdown' '  trunk-setup' \
    '  integration-publication' '  trunk-registration' '  trunk-await' \
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
  echo 'PASS: Story Branch closure assessor rejects a green branch tip, retargeted or duplicate observers, and a harness-contaminated transcript.'
}

story_closure_write_evidence_identity() {
  printf 'helper-identity: tests/support/story-branch-closure-native-run.sh\n'
  native_result_print_adapter_identity
  printf 'fixture-identity: tests/support/story-branch-closure-native-fixture.sh\n'
  printf 'assessor-identity: tests/support/story-branch-closure-native-run.sh\n'
  native_result_input_hash_line tests/git-publication-native.sh
  native_result_input_hash_line tests/support/git-publication-native-host.sh
  native_result_input_hash_line tests/support/story-branch-closure-native-run.sh
  native_result_input_hash_line tests/support/story-branch-closure-native-fixture.sh
  native_result_input_hash_line tests/support/git-publication-native-run.sh
  native_result_input_hash_line tests/support/native-run-supervise.sh
  native_result_input_hash_line src/skills/dough-story-wrap-up/SKILL.md
  native_result_input_hash_line src/skills/dough-execute-plan/references/trunk-publication.md
  native_result_input_hash_line src/skills/dough-execute-plan/references/ci-monitor.md
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
  : > "${transcript}"
  : > "${native_stderr}"
  story_closure_controller &
  controller_pid=$!
  git_publication_run_native_command || run_status=$?
  wait "${controller_pid}" || run_status=1
  for directory in "${story_closure_storage}"/*; do
    [[ -f ${directory}/request.json ]] || continue
    [[ -f ${directory}/result.json ]] && continue
    (cd "${story_closure_workspace}" && node "${story_closure_launcher}" stop \
      "${directory}") > /dev/null || stop_status=$?
  done
  story_closure_observe "${transcript}" "${output_file}" \
    > "${root}/observations.txt"
  if story_closure_assess "${root}/observations.txt"; then
    git_publication_assess_status=pass
    git_publication_assess_reason='target-correct integration CI wait and cleanup observed'
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
  story_closure_cleanup_fixture
  rm -rf -- "${root}"
  [[ ${stop_status} -eq 0 && ${run_status} -eq 0 ]]
}
