#!/usr/bin/env bash
# Trunk Mode closure observation: the fields the assessor reads.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/native-completion-observation.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-completion-observation.sh"

# Installed `finish` calls for final closure $4, from the node call log $1 or
# the commands host $2 started in stream $3.
trunk_closure_finish_count() {
  local node_log=$1 host=$2 transcript=$3 sha=$4
  native_started_call_count "${node_log}" "${host}" "${transcript}" \
    trunk-closure.mjs finish "${sha}"
}

# shellcheck source=tests/support/closure-native-response.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/closure-native-response.sh"

trunk_closure_observe() {
  local scenario=$1
  local host=$2
  local transcript=$3
  local response=$4
  local coverage state=missing basis_state=none terminal=missing
  local finish_count=0 trunk_complete=0 trunk_stop=0 trunk_await=0
  local refresh_attention=false
  local trunk_product_shutdown=false trunk_forced_stop=false checkout_present=false
  coverage="${trunk_closure_mailbox}/coverage/${trunk_closure_candidate_sha}.json"
  [[ -f ${coverage} ]] && state=$(jq -r '.state' "${coverage}")
  [[ -f ${coverage} ]] && basis_state=$(jq -r '.basis.state // "none"' "${coverage}")
  [[ -f ${trunk_closure_mailbox}/result.json ]] \
    && terminal=$(jq -r '.status' "${trunk_closure_mailbox}/result.json")
  finish_count=$(trunk_closure_finish_count "${trunk_closure_node_log}" \
    "${host}" "${transcript}" "${trunk_closure_candidate_sha}")
  native_completion_measure trunk "${trunk_closure_node_log}" "${host}" \
    "${transcript}" "${trunk_closure_mailbox}" "${trunk_closure_candidate_sha}" \
    "${terminal}" "${trunk_closure_forced_stop_file-}" "${finish_count}"
  [[ -d ${trunk_closure_workspace} ]] && checkout_present=true
  if [[ ${scenario} != owned-context ]]; then
    refresh_attention=$(closure_refresh_attention "${trunk_closure_integration}" \
      "${trunk_closure_candidate_sha}")
  fi
  {
    printf 'scenario: %s\n' "${scenario}"
    printf 'remote-sha: %s\n' "$(git ls-remote "${trunk_closure_origin}" refs/heads/main | awk '{print $1}')"
    printf 'candidate-sha: %s\n' "${trunk_closure_candidate_sha}"
    printf 'mailbox-target: %s\n' "$(jq -r '.branch' "${trunk_closure_mailbox}/request.json")"
    printf 'coverage-state: %s\n' "${state}"
    printf 'basis-state: %s\n' "${basis_state}"
    printf 'observer-terminal: %s\n' "${terminal}"
    printf 'finish-count: %s\n' "${finish_count}"
    printf 'complete-revision-count: %s\n' "${trunk_complete}"
    printf 'await-count: %s\n' "${trunk_await}"
    printf 'registered: %s\n' "$(native_completion_registered \
      "${trunk_closure_mailbox}" "${trunk_closure_candidate_sha}")"
    printf 'stop-count: %s\n' "${trunk_stop}"
    printf 'product-shutdown: %s\n' "${trunk_product_shutdown}"
    printf 'forced-stop: %s\n' "${trunk_forced_stop}"
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
    printf 'response-completion-result: %s\n' "$(closure_response_settled_result "${response}" "${refresh_attention}")"
    printf 'harness-inspected: %s\n' "$(native_harness_inspected 'trunk-closure-native|native harness|trunk-closure/(source|ignored-only|owned-context)' "${transcript}")"
    [[ ${scenario} != owned-context ]] || trunk_closure_owned_context_observe
  }
}
