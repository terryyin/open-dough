#!/usr/bin/env bash
# Story Branch closure response counterexamples against its assessor.
# shellcheck disable=SC2154,SC2312

# shellcheck source=tests/support/native-response-field.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-response-field.sh"

# shellcheck source=tests/support/closure-native-response.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/closure-native-response.sh"

# With unchanged valid Git/CI/shutdown/cleanup observations, quiet closure and
# useful refresh reminders pass. Recaps, retired banners, false success, and
# completion beside unresolved CI are rejected. These are deterministic assessor
# checks, not proof that a native agent follows the guidance.
story_closure_response_counterexamples() {
  local work=$1 text expected required candidate="$1/candidate"
  # Empty captured text is valid; an absent capture is not quiet output. This
  # shared helper also supplies Trunk Mode's response-completion-result.
  [[ $(closure_response_settled_result "${work}/missing-response" 2> /dev/null) == false ]]
  while IFS='|' read -r expected required text; do
    # A passing base with the same independent refresh observation makes each
    # rejected case a response-only change, including required-attention cases.
    if [[ ${required} == true ]]; then
      printf '%s\n' 'Default checkout /project/main has human edits, so refresh is deferred. Refresh it once those edits are committed.' > "${work}/base-response"
    else
      : > "${work}/base-response"
    fi
    story_closure_write_assessor_observation "${work}/base" "${work}/base-response" "${required}"
    native_assessor_counterexamples "${story_closure_assess_file}" "${work}/base" \
      -- story_closure_assess
    printf '%b\n' "${text}" > "${work}/response"
    story_closure_write_assessor_observation "${candidate}" "${work}/response" "${required}"
    if [[ ${expected} == false ]]; then
      native_assessor_rejects "response: ${text}" response "${candidate}"
    else
      story_closure_assess "${candidate}" || {
        printf 'FAIL: story closure rejected response: %s\n' "${text}" >&2
        return 1
      }
    fi
  done << 'EOF'
true|false|
true|false|\n  \n
true|false|Done.
true|false|Finished.
true|false|Complete.
true|true|Default checkout /project/main has uncommitted human edits, so refresh is deferred. Refresh it once those edits are committed.
true|true|The integration checkout at /project/main was preserved with a human uncommitted edit. Rerun refresh after the owner commits it.
false|true|
false|true|Done.
false|true|Default checkout refresh is deferred.
false|false|Default checkout /project/main has human edits, so refresh is deferred. Refresh it once those edits are committed.
false|false|## STORY WRAP-UP COMPLETE
false|false|The closure is merged into trunk and CI passed on the merged commit.
false|false|Trunk CI is green on the integrated commit.
false|false|Cleanup is not applicable because this is the default checkout.
false|false|The worktree and branches were already absent.
false|false|Findings DD-001 and DD-002 were recorded; the follow-up is queued first.
false|false|The removed plan stays recoverable at abc123.
false|false|Done.\nDone.
false|false|Trunk CI setup failed with HTTP 404, so no trunk receipt exists. Rerun after restoring the bridge.
false|false|Merged into trunk.\nRemaining CI coverage: unavailable (not a green trunk verdict)
false|false|Branch CI passed. Trunk CI failed on the merged commit.
false|false|The merge reached trunk.
false|false|Trunk CI, however, failed after the merge; trunk passed earlier.
false|true|Default checkout has human edits; refresh is deferred. Refresh it once committed. Trunk CI passed, but the trunk observer was unavailable so completion is undiscovered.
false|false|Merged into trunk successfully. The trunk checks failed.
false|false|Trunk CI passed. The watcher failed to start.
EOF
}
