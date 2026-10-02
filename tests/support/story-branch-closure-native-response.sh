#!/usr/bin/env bash
# Story Branch closure response counterexamples against its assessor.
# shellcheck disable=SC2312

# shellcheck source=tests/support/native-response-field.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-response-field.sh"

# shellcheck source=tests/support/closure-native-response.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/closure-native-response.sh"

# With unchanged valid Git/CI/shutdown/cleanup observations, quiet closure and
# useful refresh reminders pass. Recaps, false success, missing markers, and
# completion beside unresolved CI are rejected. These are deterministic assessor
# checks, not proof that a native agent follows the guidance.
story_closure_response_counterexamples() {
  local work=$1 text expected candidate="$1/candidate"
  while IFS='|' read -r expected text; do
    printf '%b\n' "${text}" > "${work}/response"
    story_closure_write_assessor_observation "${candidate}" "${work}/response"
    if [[ ${expected} == false ]]; then
      native_assessor_rejects "response: ${text}" response "${candidate}"
    else
      story_closure_assess "${candidate}" || {
        printf 'FAIL: story closure rejected response: %s\n' "${text}" >&2
        return 1
      }
    fi
  done << 'EOF'
true|## STORY WRAP-UP COMPLETE
true|\n## STORY WRAP-UP COMPLETE\n
true|Default checkout /project/main has uncommitted human edits, so refresh is deferred. Refresh it once those edits are committed.\n## STORY WRAP-UP COMPLETE
true|The integration checkout at /project/main was preserved with a human uncommitted edit. Rerun refresh after the owner commits it.\n## STORY WRAP-UP COMPLETE
false|The closure is merged into trunk and CI passed on the merged commit.\n## STORY WRAP-UP COMPLETE
false|Trunk CI is green on the integrated commit.
false|Cleanup is not applicable because this is the default checkout.\n## STORY WRAP-UP COMPLETE
false|The worktree and branches were already absent.\n## STORY WRAP-UP COMPLETE
false|Default checkout refresh is deferred.\n## STORY WRAP-UP COMPLETE
false|Trunk CI setup failed with HTTP 404, so no trunk receipt exists. Rerun after restoring the bridge.
false|Merged into trunk.\nRemaining CI coverage: unavailable (not a green trunk verdict)\n## STORY WRAP-UP COMPLETE
false|Branch CI passed. Trunk CI failed on the merged commit.\n## STORY WRAP-UP COMPLETE
false|The merge reached trunk.
false|Trunk CI, however, failed after the merge; trunk passed earlier.\n## STORY WRAP-UP COMPLETE
false|Trunk CI passed, but the trunk observer was unavailable so completion is undiscovered.\n## STORY WRAP-UP COMPLETE
false|Merged into trunk successfully. The trunk checks failed.\n## STORY WRAP-UP COMPLETE
false|Trunk CI passed. The watcher failed to start.\n## STORY WRAP-UP COMPLETE
EOF
}
