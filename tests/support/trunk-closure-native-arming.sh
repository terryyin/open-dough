#!/usr/bin/env bash
# How a Trunk Mode closure fixture's coordinator comes to own its CI observer,
# as the installed guidance teaches each host, so the installed `finish`
# registers the final closure with the owner input a coordinator holds. A
# Claude Code or Cursor coordinator is named by its own tool, which only the
# launched session has, and its delivery establishes its observer: the fixture
# arms none and the controller finds the one `finish` registered on. A Codex
# coordinator arms a yielded stream before its first publication and retains
# an observer note: the fixture arms that stream and records that note.
# Sourced by the fixture.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture globals.

# shellcheck source=tests/helpers/wait-for.bash
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../helpers" && pwd)/wait-for.bash"

# The word the Codex coordinator arms its stream with.
trunk_closure_coordinator=trunk-closure-coordinator

# For Codex host $1, arms the coordinator's stream of the target from the
# execution worktree, claimed by `--coordinator`, keeps its output in harness
# directory $2, and sets trunk_closure_mailbox to its directory. Other hosts
# start with no observer.
trunk_closure_arm_observer() {
  local host=$1 stream="$2/observer-stream.log" receipt
  trunk_closure_mailbox=
  [[ ${host} == codex ]] || return 0
  (cd "${trunk_closure_workspace}" && exec node "${trunk_closure_launcher}" \
    stream --execution owner/project main 600000 \
    --coordinator "${trunk_closure_coordinator}") > "${stream}" 2>&1 &
  trunk_closure_stream=$!
  wait_for 'observer stream' 30 "grep -q '^CI_OBSERVER ' '${stream}'" || return
  receipt=$(grep -m 1 '^CI_OBSERVER ' "${stream}")
  trunk_closure_mailbox=$(jq -r '.directory' <<< "${receipt#CI_OBSERVER }")
  trunk_closure_stream_pid=$(jq -r '.pid' <<< "${receipt#CI_OBSERVER }")
  [[ -s ${trunk_closure_mailbox}/owner ]]
}

# Prints the retained state's observer line for host $1: a Codex coordinator's
# observer note, or that no observer is retained.
trunk_closure_observer_record() {
  if [[ $1 == codex ]]; then
    printf 'Observer note: coordinator %s; stream directory %s; PID %s; checkout %s\n' \
      "${trunk_closure_coordinator}" "${trunk_closure_mailbox}" \
      "${trunk_closure_stream_pid}" "${trunk_closure_workspace}"
  else
    printf 'CI observer: none retained\n'
  fi
}

# Sets trunk_closure_mailbox to the observer the final closure is registered
# on: the armed stream, or else the observer in the fixture's storage that
# holds the final closure's coverage record, which only a registration on
# that observer writes. Fails until one does.
trunk_closure_find_observer() {
  local coverage
  [[ -z ${trunk_closure_mailbox} ]] || return 0
  for coverage in "${trunk_closure_storage}"/*/coverage/"${trunk_closure_candidate_sha}.json"; do
    [[ -f ${coverage} ]] || continue
    trunk_closure_mailbox=${coverage%/coverage/*}
    return 0
  done
  return 1
}

# Ends a Codex stream that outlived its observer.
trunk_closure_end_stream() {
  [[ -n ${trunk_closure_stream:-} ]] || return 0
  kill "${trunk_closure_stream}" 2> /dev/null || true
  wait "${trunk_closure_stream}" 2> /dev/null || true
  trunk_closure_stream=
}
