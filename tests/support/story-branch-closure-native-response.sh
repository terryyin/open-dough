#!/usr/bin/env bash
# Story Branch closure response: its observation field, its judgment, and
# its counterexamples.
# shellcheck disable=SC2312

# True when response $1 states the trunk result as a success or pass and no
# sentence reports trunk, CI, its checks, coverage, receipt, verdict, observer,
# or watcher failed or unavailable. Sentences end at `.`, `;`, `!`, or `?`
# before whitespace and at line ends, not at commas. A failure sentence naming
# none of these, such as a failed push or branch delete, is no trunk failure.
story_closure_response_trunk_result() {
  local response
  response=$(cat -- "$1")
  if grep -Eiq 'trunk.+(CI|verdict|receipt).+success|success.+trunk|integrat.+success|completion receipt|trunk.+(passed|green)|(passed|green).+trunk' <<< "${response}" \
    && ! awk '{ gsub(/[.;!?][[:space:]]/, "\n"); print }' <<< "${response}" \
    | grep -Ei 'trunk|(^|[^[:alpha:]])CI([^[:alpha:]]|$)|coverage|receipt|verdict|observer|watcher|checks?([^[:alpha:]]|$)' \
      | grep -Eiq 'failed|failing|unavailable|undiscovered|did not pass|not (a )?green'; then
    printf 'true\n'
  else
    printf 'false\n'
  fi
}

# Prints the `response` field of response file $1: each line indented, so no
# line of the response reads as another observation field.
story_closure_observe_response() {
  printf 'response:\n'
  awk '{ print "  " $0 }' "$1" 2> /dev/null || true
}

# The response text recorded in observations $1.
story_closure_observed_response() {
  awk '/^response:$/ { r = 1; next } r && /^  / { print substr($0, 3); next } { r = 0 }' "$1"
}

# Against the valid observations in $1/valid, a response stating a trunk pass,
# also beside a failed push, is accepted, and each response reporting trunk
# CI, its checks, observer, or watcher failed or unavailable is a rejected
# case of the response signal.
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
true|The closure is merged into trunk and CI passed on the merged commit.
true|- **Trunk (`main`):** I started a watcher for trunk. It passed (run 22).
true|Trunk CI is green on the integrated commit.
false|Trunk CI setup failed with HTTP 404, so no trunk receipt exists.
false|Merged into trunk.\n### Completion receipt (trunk)\n- Remaining CI coverage: unavailable (not a green trunk verdict)
false|Branch CI passed. Trunk CI failed on the merged commit.
false|The merge reached trunk.
true|Trunk CI passed.\nA decision to delete the branch failed once and was retried.
true|The push failed due to zsh colon modifiers, so I pushed from bash; trunk CI passed on the merged commit and the trunk observer stopped after its completion receipt.
false|Trunk CI, however, failed after the merge; trunk passed earlier.
false|Trunk CI passed, but the trunk observer was unavailable so completion is undiscovered.
false|Merged into trunk successfully. The trunk checks failed.
false|Trunk CI passed. The watcher failed to start.
EOF
}
