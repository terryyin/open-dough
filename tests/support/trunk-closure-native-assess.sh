#!/usr/bin/env bash
# Trunk Mode closure observation and assessor counterexamples.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/native-completion-observation.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-completion-observation.sh"
# Counterexample streams are written in each host's shape by the substitute's
# recorder.
# shellcheck source=tests/support/native-agent-admission.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-agent-admission.sh"

# Installed `finish` calls for final closure $4, from the node call log $1 or
# the commands host $2 started in stream $3.
trunk_closure_finish_count() {
  local node_log=$1 host=$2 transcript=$3 sha=$4
  native_started_call_count "${node_log}" "${host}" "${transcript}" \
    trunk-closure.mjs finish "${sha}"
}

trunk_closure_observe() {
  local scenario=$1
  local host=$2
  local transcript=$3
  local response=$4
  local coverage state=missing basis_state=none terminal=missing
  local finish_count=0 complete_count=0 stop_count=0 await_count=0
  local product_shutdown=false forced_stop=false checkout_present=false
  coverage="${trunk_closure_mailbox}/coverage/${trunk_closure_candidate_sha}.json"
  [[ -f ${coverage} ]] && state=$(jq -r '.state' "${coverage}")
  [[ -f ${coverage} ]] && basis_state=$(jq -r '.basis.state // "none"' "${coverage}")
  [[ -f ${trunk_closure_mailbox}/result.json ]] \
    && terminal=$(jq -r '.status' "${trunk_closure_mailbox}/result.json")
  finish_count=$(trunk_closure_finish_count "${trunk_closure_node_log}" \
    "${host}" "${transcript}" "${trunk_closure_candidate_sha}")
  complete_count=$(native_completion_call_count \
    "${trunk_closure_node_log}" "${host}" "${transcript}" \
    "${trunk_closure_mailbox}" "${trunk_closure_candidate_sha}")
  stop_count=$(native_completion_stop_count \
    "${trunk_closure_node_log}" "${trunk_closure_mailbox}")
  await_count=$(native_completion_await_count \
    "${trunk_closure_node_log}" "${trunk_closure_mailbox}" \
    "${trunk_closure_candidate_sha}")
  forced_stop=$(native_completion_forced_stop "${trunk_closure_forced_stop_file-}")
  product_shutdown=$(native_completion_product_shutdown \
    "${finish_count}" "${trunk_closure_forced_stop_file-}" "${terminal}")
  [[ -d ${trunk_closure_workspace} ]] && checkout_present=true
  {
    printf 'scenario: %s\n' "${scenario}"
    printf 'remote-sha: %s\n' "$(git ls-remote "${trunk_closure_origin}" refs/heads/main | awk '{print $1}')"
    printf 'candidate-sha: %s\n' "${trunk_closure_candidate_sha}"
    printf 'mailbox-target: %s\n' "$(jq -r '.branch' "${trunk_closure_mailbox}/request.json")"
    printf 'coverage-state: %s\n' "${state}"
    printf 'basis-state: %s\n' "${basis_state}"
    printf 'observer-terminal: %s\n' "${terminal}"
    printf 'finish-count: %s\n' "${finish_count}"
    printf 'complete-revision-count: %s\n' "${complete_count}"
    printf 'await-count: %s\n' "${await_count}"
    printf 'registered: %s\n' "$(native_completion_registered \
      "${trunk_closure_mailbox}" "${trunk_closure_candidate_sha}")"
    printf 'stop-count: %s\n' "${stop_count}"
    printf 'product-shutdown: %s\n' "${product_shutdown}"
    printf 'forced-stop: %s\n' "${forced_stop}"
    printf 'checkout-present-after: %s\n' "${checkout_present}"
    printf 'cleanup-observer-state: %s\n' \
      "$(cat "${trunk_closure_harness}/cleanup-observer-state" 2> /dev/null || echo none)"
    printf 'branch-present: %s\n' "$(
      git -C "${trunk_closure_repository}" show-ref --quiet --verify \
        refs/heads/exec/trunk && echo true || echo false
    )"
    printf 'cleanup-complete: %s\n' "$([[ -f ${trunk_closure_cleanup_marker} ]] && echo true || echo false)"
    printf 'provider-candidate-calls: %s\n' "$(grep -Fc "${trunk_closure_candidate_sha}" "${trunk_closure_gh_log}" || true)"
    printf 'control-order:\n'
    sed 's/^/  /' "${trunk_closure_control_log}"
    printf 'response-completion-result: %s\n' "$(grep -Eiq 'CI.+(success|not.required)|success.+CI|not.required|completion receipt|shutdown' "${response}" && echo true || echo false)"
    printf 'transcript-finish: %s\n' "$(grep -Fq 'trunk-closure.mjs' "${transcript}" && echo true || echo false)"
    printf 'harness-inspected: %s\n' "$(grep -Eiq 'trunk-closure-native|native harness|trunk-closure/(source|ignored-only|owned-context)' "${transcript}" && echo true || echo false)"
    [[ ${scenario} != owned-context ]] || trunk_closure_owned_context_observe
  }
}

trunk_closure_assess() {
  local scenario=$1
  local observations=$2
  local remote candidate state basis terminal finishes completes awaits registered stops
  local cleanup harness product_shutdown forced_stop mailbox_target
  remote=$(awk '/^remote-sha:/{print $2}' "${observations}")
  candidate=$(awk '/^candidate-sha:/{print $2}' "${observations}")
  state=$(awk '/^coverage-state:/{print $2}' "${observations}")
  basis=$(awk '/^basis-state:/{print $2}' "${observations}")
  terminal=$(awk '/^observer-terminal:/{print $2}' "${observations}")
  finishes=$(awk '/^finish-count:/{print $2}' "${observations}")
  completes=$(awk '/^complete-revision-count:/{print $2}' "${observations}")
  awaits=$(awk '/^await-count:/{print $2}' "${observations}")
  registered=$(awk '/^registered:/{print $2}' "${observations}")
  stops=$(awk '/^stop-count:/{print $2}' "${observations}")
  cleanup=$(awk '/^cleanup-complete:/{print $2}' "${observations}")
  harness=$(awk '/^harness-inspected:/{print $2}' "${observations}")
  product_shutdown=$(awk '/^product-shutdown:/{print $2}' "${observations}")
  forced_stop=$(awk '/^forced-stop:/{print $2}' "${observations}")
  mailbox_target=$(awk '/^mailbox-target:/{print $2}' "${observations}")
  # Fixture fallback stop must never turn a missing product shutdown into a pass.
  [[ ${forced_stop} == false && ${product_shutdown} == true ]] || return 1
  # One installed `finish` owns completion; the worktree and its branch are
  # gone, and the observer had shut down when the worktree disappeared.
  grep -Eq '^cleanup-observer-state: (stopped|finished)$' "${observations}" \
    && grep -Fxq 'checkout-present-after: false' "${observations}" \
    && grep -Fxq 'branch-present: false' "${observations}" || return 1
  [[ ${remote} == "${candidate}" && ${finishes} == 1 && ${completes} == 0 &&
    ${awaits} == 0 &&
    ${registered} == true && ${stops} == 0 && ${cleanup} == true &&
    ${mailbox_target} == main &&
    ${harness} == false &&
    (${terminal} == stopped || ${terminal} == finished) ]] || return 1
  [[ ${scenario} != owned-context ]] \
    || trunk_closure_owned_context_assess "${observations}" || return 1
  if [[ ${scenario} == source ]]; then
    [[ ${state} == success ]] || return 1
    awk '/publication/{a=NR} /registration/{b=NR} /complete-start/{c=NR} /ci-release/{d=NR} /coverage-success/{e=NR} /shutdown/{f=NR} /cleanup-complete/{g=NR} END{exit !(a<b && b<c && c<d && d<e && e<f && f<g)}' "${observations}"
  else
    [[ ${state} == not_required && ${basis} == success ]] || return 1
    grep -Fq 'provider-candidate-calls: 0' "${observations}" || return 1
    awk '/publication/{a=NR} /registration/{b=NR} /coverage-not-required/{c=NR} /complete-start/{d=NR} /shutdown/{e=NR} /cleanup-complete/{f=NR} END{exit !(a<b && b<c && c<d && d<e && e<f)}' "${observations}"
  fi
}

trunk_closure_write_assessor_observation() {
  local path=$1 scenario=$2 state=$3 basis=$4 provider_calls=$5
  local finish_count=${6-1}
  local order=${7-normal}
  local forced_stop=${8-false}
  {
    printf 'scenario: %s\nremote-sha: abc\ncandidate-sha: abc\n' "${scenario}"
    printf 'mailbox-target: main\n'
    printf 'coverage-state: %s\nbasis-state: %s\n' "${state}" "${basis}"
    printf 'observer-terminal: stopped\nfinish-count: %s\n' "${finish_count}"
    printf 'complete-revision-count: 0\n'
    printf 'await-count: 0\nregistered: %s\nstop-count: 0\n' "${9-true}"
    printf 'product-shutdown: true\nforced-stop: %s\n' "${forced_stop}"
    printf 'checkout-present-after: false\ncleanup-complete: true\n'
    printf 'cleanup-observer-state: stopped\nbranch-present: false\n'
    printf 'provider-candidate-calls: %s\nharness-inspected: false\ncontrol-order:\n' "${provider_calls}"
    if [[ ${scenario} == source ]]; then
      if [[ ${order} == normal ]]; then
        printf '  publication\n  registration\n  complete-start\n  ci-release\n  coverage-success\n  shutdown\n  cleanup-complete\n'
      else
        printf '  publication\n  registration\n  shutdown\n  complete-start\n  ci-release\n  coverage-success\n  cleanup-complete\n'
      fi
    else
      printf '  publication\n  registration\n  coverage-not-required\n  complete-start\n  shutdown\n  cleanup-complete\n'
    fi
  } > "${path}"
}

run_trunk_closure_assessor_counterexamples() {
  local work
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN
  trunk_closure_write_assessor_observation \
    "${work}/source.txt" source success none 1
  trunk_closure_assess source "${work}/source.txt"
  trunk_closure_write_assessor_observation \
    "${work}/ignored.txt" ignored-only not_required success 0
  trunk_closure_assess ignored-only "${work}/ignored.txt"
  trunk_closure_write_assessor_observation \
    "${work}/missing-complete.txt" source success none 1 0
  git_publication_suite_expect_rejected trunk_closure_assess source "${work}/missing-complete.txt"
  trunk_closure_write_assessor_observation \
    "${work}/early-shutdown.txt" source success none 1 1 early
  git_publication_suite_expect_rejected trunk_closure_assess source "${work}/early-shutdown.txt"
  trunk_closure_write_assessor_observation \
    "${work}/ignored-provider.txt" ignored-only not_required success 1
  git_publication_suite_expect_rejected trunk_closure_assess ignored-only "${work}/ignored-provider.txt"
  trunk_closure_write_assessor_observation \
    "${work}/forced-stop.txt" source success none 1 1 normal true
  git_publication_suite_expect_rejected trunk_closure_assess source "${work}/forced-stop.txt"
  trunk_closure_write_assessor_observation \
    "${work}/unregistered.txt" source success none 1 1 normal false false
  git_publication_suite_expect_rejected trunk_closure_assess source "${work}/unregistered.txt"
  run_trunk_closure_cleanup_counterexamples "${work}"
  run_trunk_closure_observation_counterexamples "${work}"
}

# Cleanup before the receipt's shutdown, a surviving worktree or branch, a
# second `finish`, and the agent's own completion call are each rejected.
run_trunk_closure_cleanup_counterexamples() {
  local work=$1 field
  trunk_closure_write_assessor_observation \
    "${work}/cleanup.txt" source success none 1
  for field in 'cleanup-observer-state: missing' \
    'cleanup-observer-state: running' 'checkout-present-after: true' \
    'branch-present: true' 'finish-count: 2' 'complete-revision-count: 1'; do
    sed "s|^${field%%: *}: .*|${field}|" "${work}/cleanup.txt" > "${work}/bad.txt"
    git_publication_suite_expect_rejected trunk_closure_assess source "${work}/bad.txt"
  done
}

# Registration is the mailbox's coverage record, whichever command wrote it.
# On every host, the complete-revision and `finish` commands the agent started
# count once each, and the same text in a command's output does not count.
run_trunk_closure_observation_counterexamples() {
  local work=$1 mailbox="$1/mailbox" sha=0123456789abcdef0123456789abcdef01234567
  local skills=.agents/skills host admission_events admission_tool stream
  mkdir -p "${mailbox}/coverage"
  [[ $(native_completion_registered "${mailbox}" "${sha}") == false ]]
  printf '{"sha":"%s","state":"undiscovered"}\n' "${sha}" \
    > "${mailbox}/coverage/${sha}.json"
  [[ $(native_completion_registered "${mailbox}" "${sha}") == true ]]
  : > "${work}/node.log"
  for host in codex cursor claude; do
    admission_events='' admission_tool=0 stream="${work}/${host}.jsonl"
    admission_record "/bin/zsh -lc 'node ${skills}/dough-execute-plan/scripts/ci-mailbox.mjs complete-revision ${mailbox} ${sha}'" ''
    admission_record "node ${skills}/dough-story-wrap-up/scripts/trunk-closure.mjs finish --final ${sha}" ''
    admission_record 'cat notes.txt' \
      "complete-revision ${mailbox} ${sha}; trunk-closure.mjs finish --final ${sha}"
    printf '%s' "${admission_events}" > "${stream}"
    [[ $(native_completion_call_count "${work}/node.log" "${host}" "${stream}" \
      "${mailbox}" "${sha}") == 1 ]]
    native_completion_seen "${work}/node.log" "${host}" "${stream}" \
      "${mailbox}" "${sha}"
    [[ $(trunk_closure_finish_count "${work}/node.log" "${host}" "${stream}" \
      "${sha}") == 1 ]]
  done
}
