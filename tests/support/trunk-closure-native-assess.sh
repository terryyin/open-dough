#!/usr/bin/env bash
# Trunk Mode closure observation and assessor counterexamples.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/native-completion-observation.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-completion-observation.sh"
trunk_closure_assess_file="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/trunk-closure-native-assess.sh"

# Installed `finish` calls for final closure $3: the node call log $1, or the
# tool starts transcript $2 shows, whichever sees more.
trunk_closure_finish_count() {
  local node_log=$1 transcript=$2 sha=$3 count transcript_count=0
  count=$(grep -F 'trunk-closure.mjs finish' "${node_log}" | grep -Fc -- "${sha}" || true)
  if [[ -n ${transcript} && -f ${transcript} ]]; then
    transcript_count=$(
      grep -E '"subtype":"started"|"type":"item.started"' "${transcript}" \
        | grep -F 'trunk-closure.mjs' | grep -F 'finish' \
        | grep -Fc -- "${sha}" || true
    )
    ((transcript_count <= count)) || count=${transcript_count}
  fi
  printf '%s\n' "${count}"
}

trunk_closure_observe() {
  local scenario=$1
  local transcript=$2
  local response=$3
  local coverage state=missing basis_state=none terminal=missing
  local finish_count=0 complete_count=0 stop_count=0 await_count=0
  local product_shutdown=false forced_stop=false checkout_present=false
  coverage="${trunk_closure_mailbox}/coverage/${trunk_closure_candidate_sha}.json"
  [[ -f ${coverage} ]] && state=$(jq -r '.state' "${coverage}")
  [[ -f ${coverage} ]] && basis_state=$(jq -r '.basis.state // "none"' "${coverage}")
  [[ -f ${trunk_closure_mailbox}/result.json ]] \
    && terminal=$(jq -r '.status' "${trunk_closure_mailbox}/result.json")
  finish_count=$(trunk_closure_finish_count "${trunk_closure_node_log}" \
    "${transcript}" "${trunk_closure_candidate_sha}")
  complete_count=$(native_completion_call_count \
    "${trunk_closure_node_log}" "${transcript}" \
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

# Signals for rejected cases of trunk_closure_assess, including the owned
# context's (trunk-closure-native-owned-context.sh).
# assessor-signal: finish finish-count
# assessor-signal: complete-revision complete-revision-count
# assessor-signal: control-order control-order
# assessor-signal: registration registered
# assessor-signal: forced-stop forced-stop
# assessor-signal: provider-calls provider-candidate-calls
# assessor-signal: cleanup-observer cleanup-observer-state
# assessor-signal: worktree checkout-present-after
# assessor-signal: branch branch-present
# assessor-signal: repository-intact repository-intact
# assessor-signal: other-checkouts other-checkouts
# assessor-signal: default-checkout default-checkout-present
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
    native_completion_control_order "${observations}" publication \
      registration complete-start ci-release coverage-success shutdown \
      cleanup-complete
  else
    [[ ${state} == not_required && ${basis} == success ]] || return 1
    grep -Fq 'provider-candidate-calls: 0' "${observations}" || return 1
    native_completion_control_order "${observations}" publication \
      registration coverage-not-required complete-start shutdown \
      cleanup-complete
  fi
}

trunk_closure_write_assessor_observation() {
  local path=$1 scenario=$2 state=$3 basis=$4 provider_calls=$5
  local order=${6-normal}
  {
    printf 'scenario: %s\nremote-sha: abc\ncandidate-sha: abc\n' "${scenario}"
    printf 'mailbox-target: main\n'
    printf 'coverage-state: %s\nbasis-state: %s\n' "${state}" "${basis}"
    printf 'observer-terminal: stopped\nfinish-count: 1\n'
    printf 'complete-revision-count: 0\n'
    printf 'await-count: 0\nregistered: true\nstop-count: 0\n'
    printf 'product-shutdown: true\nforced-stop: false\n'
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

# Starts rejected cases of trunk_closure_assess for scenario $1 against
# passing observation $2.
trunk_closure_counterexamples() {
  native_assessor_counterexamples "${trunk_closure_assess_file}" "$2" \
    -- trunk_closure_assess "$1"
}

run_trunk_closure_assessor_counterexamples() {
  local work
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN
  trunk_closure_write_assessor_observation \
    "${work}/source.txt" source success none 1
  trunk_closure_counterexamples source "${work}/source.txt"
  # A missing or second `finish`, the agent's own completion call, a forced
  # stop, no registration, cleanup before the receipt's shutdown, and a
  # surviving worktree or branch.
  native_assessor_rejects_field_rows << 'EOF'
missing-finish finish finish-count: 0
second-finish finish finish-count: 2
agent-complete complete-revision complete-revision-count: 1
forced-stop forced-stop forced-stop: true
unregistered registration registered: false
observer-missing cleanup-observer cleanup-observer-state: missing
observer-running cleanup-observer cleanup-observer-state: running
worktree-kept worktree checkout-present-after: true
branch-kept branch branch-present: true
EOF
  trunk_closure_write_assessor_observation \
    "${work}/early-shutdown.txt" source success none 1 early
  native_assessor_rejects early-shutdown control-order "${work}/early-shutdown.txt"
  trunk_closure_write_assessor_observation \
    "${work}/ignored.txt" ignored-only not_required success 0
  trunk_closure_counterexamples ignored-only "${work}/ignored.txt"
  native_assessor_rejects_field_rows \
    <<< 'ignored-provider provider-calls provider-candidate-calls: 1'
  run_trunk_closure_observation_counterexamples "${work}"
}

# Registration is the mailbox's coverage record, whichever command wrote it,
# and a Codex-shaped transcript counts its complete-revision start once.
run_trunk_closure_observation_counterexamples() {
  local work=$1 mailbox="$1/mailbox" sha=0123456789abcdef0123456789abcdef01234567
  local command
  mkdir -p "${mailbox}/coverage"
  [[ $(native_completion_registered "${mailbox}" "${sha}") == false ]]
  printf '{"sha":"%s","state":"undiscovered"}\n' "${sha}" \
    > "${mailbox}/coverage/${sha}.json"
  [[ $(native_completion_registered "${mailbox}" "${sha}") == true ]]
  : > "${work}/node.log"
  command="/bin/zsh -lc 'node .agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs complete-revision ${mailbox} ${sha}'"
  jq -n -c --arg c "${command}" \
    '{type:"item.started",item:{id:"item_1",type:"command_execution",command:$c,status:"in_progress"}},
     {type:"item.completed",item:{id:"item_1",type:"command_execution",command:$c,status:"completed"}}' \
    > "${work}/codex.jsonl"
  [[ $(native_completion_call_count "${work}/node.log" "${work}/codex.jsonl" \
    "${mailbox}" "${sha}") == 1 ]]
}
