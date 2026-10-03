#!/usr/bin/env bash
# Trunk Mode closure counterexamples: the assessor and the completion-call
# observation on rejected cases.
# shellcheck disable=SC2034,SC2154,SC2312

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
    printf 'response-completion-result: true\n'
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
recap response response-completion-result: false
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

# Registration is the mailbox's coverage record, whichever command wrote it.
# On every host, the complete-revision and `finish` commands the agent started
# count once each, and the same text in a command's output does not count.
run_trunk_closure_observation_counterexamples() {
  local work=$1 mailbox="$1/mailbox" sha=0123456789abcdef0123456789abcdef01234567
  local skills=.agents/skills host admission_events admission_tool stream
  # Counterexample streams are written in each host's shape by the substitute's
  # recorder, loaded only here so the paid assessor path holds no substitute.
  # shellcheck source=tests/support/native-agent-admission.sh
  # shellcheck disable=SC1091
  source "${trunk_closure_assess_file%/*}/native-agent-admission.sh"
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
