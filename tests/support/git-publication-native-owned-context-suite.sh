#!/usr/bin/env bash
# Credential-free proof for the owned-context journeys: startup and
# preparation each run once through a substitute host and the Trunk Mode
# closure once on every host, all through the shared
# supervisor/stream/retention path. Each journey's assessor rejects the
# failures that matter, as real-state counterexamples on the kept publication
# fixtures (each mutation alone, observed again, changes one signal of the
# passing observation) and as observation counterexamples for the Trunk Mode
# closure.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals assigned by sourced helpers.

# shellcheck source=tests/support/git-publication-native-owned-context-startup-counterexamples.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-owned-context-startup-counterexamples.sh"
# shellcheck source=tests/support/git-publication-native-owned-context-land-counterexamples.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-owned-context-land-counterexamples.sh"

run_substitute_owned_context_journeys() {
  local host
  prepare_substitute_hosts
  run_substitute_owned_context_journey codex startup-owned-context
  run_substitute_owned_context_journey claude preparation-land
  for host in claude cursor codex; do
    run_substitute_trunk_closure_owned_context "${host}"
  done
  run_trunk_closure_owned_context_counterexamples
}

# Publication journey $2 on substitute host $1, then its counterexamples.
run_substitute_owned_context_journey() {
  local host=$1 journey=$2 artifact status
  artifact=$(mktemp -d "${substitute_work}/${host}-${journey}.XXXXXX")
  set +e
  NATIVE_AGENT_SENTINEL_LOG="${substitute_run_log}" GIT_PUBLICATION_KEEP=1 \
    git_publication_run_journey "${source_dir}" "${host}" "${journey}" \
    "${artifact}"
  status=$?
  set -e
  if [[ ${status} -ne 0 || ${git_publication_assess_status} != 'pass' ]]; then
    echo "FAIL: substitute ${host} ${journey} exited ${status}, assessment ${git_publication_assess_status}: ${git_publication_assess_reason}" >&2
    cat "${artifact}/observations.txt" "${artifact}/events.jsonl" >&2 || true
    git_publication_fixture_cleanup
    exit 1
  fi
  owned_context_obs="${git_publication_fixture_root}/counterexample.txt"
  owned_context_transcript="${artifact}/events.jsonl"
  owned_context_host=${host}
  owned_context_journey=${journey}
  owned_context_observe > "${git_publication_fixture_root}/passing.txt"
  git_publication_suite_counterexamples \
    "${source_dir}/tests/support/git-publication-native-${journey}.sh" \
    "${git_publication_fixture_root}/passing.txt"
  if [[ ${journey} == startup-owned-context ]]; then
    run_startup_owned_context_counterexamples
  else
    run_preparation_land_counterexamples
  fi
  git_publication_fixture_cleanup
}

# Prints the kept fixture, observed again.
owned_context_observe() {
  git_publication_fixture_observe_owned_context "${owned_context_journey}" \
    complete "${owned_context_transcript}" "${owned_context_host}"
}

# Appends shell command $1, started, to the kept transcript in its host's
# stream shape.
owned_context_append_started() {
  case ${owned_context_host} in
    codex)
      jq -n -c --arg c "$1" \
        '{type:"item.started",item:{type:"command_execution",command:$c}}'
      ;;
    cursor)
      jq -n -c --arg c "$1" \
        '{type:"tool_call",subtype:"started",tool_call:{shellToolCall:{args:{command:$c}}}}'
      ;;
    *)
      jq -n -c --arg c "$1" \
        '{type:"assistant",message:{content:[{type:"tool_use",name:"Bash",input:{command:$c}}]}}'
      ;;
  esac >> "${owned_context_transcript}"
}

# The Trunk Mode closure with no default checkout on substitute host $1,
# through its controller: each host's `finish` registers on the observer its
# guidance gives that coordinator.
run_substitute_trunk_closure_owned_context() {
  local host=$1 results status
  results=$(mktemp -d "${substitute_work}/trunk-closure-results.XXXXXX")
  set +e
  NATIVE_AGENT_SENTINEL_LOG="${substitute_run_log}" \
    NATIVE_PUBLICATION_JOURNEY=trunk-closure-owned-context \
    trunk_closure_run_journey "${source_dir}" "${host}" owned-context \
    "${results}" > "${results}/run.txt" 2>&1
  status=$?
  set -e
  if [[ ${status} -ne 0 || ${git_publication_assess_status} != 'pass' ]]; then
    echo "FAIL: substitute ${host} trunk-closure/owned-context exited ${status}, assessment ${git_publication_assess_status}: ${git_publication_assess_reason}" >&2
    cat "${results}/run.txt" >&2
    exit 1
  fi
}
