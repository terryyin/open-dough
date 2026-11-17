#!/usr/bin/env bash
# Purpose: in the participant environment of the launch-command-tests case
# (case-environment.bash), the unchanged E2E consumer on the starting state
# starts its browser, private GitHub owner and dashboard through the real
# macOS write sandbox and fails only at its intended argv assertion
# (`Received length: 5`), with no skip, flake or global error. Elsewhere no
# sandbox exists to observe; the observer's own run is
# native-guidance-check-launch-command-tests-e2e.sh.
# shellcheck disable=SC1091,SC2154,SC2312 # Sourced support, runner and case globals; checks read what each command gives.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
[[ $(uname -s) == Darwin ]] || exit 0
source "${source_dir}/Distribution/evaluation/tests/native-guidance-checks/support/launch-command-tests/environment.bash"
work=$(mktemp -d)
protected=$(mktemp -d)
trap 'case_cleanup; rm -rf -- "${work}" "${protected}"' EXIT

environment_arm "${work}" "${protected}"
run_group starting-e2e e2e
counts_are starting-e2e 0 4
((group_status != 0))
jq -e '[.. | strings | gsub("\u001b\\[[0-9;]*m"; "") | select(contains("Received length: 5"))] | length > 0' \
  "${root}/starting-e2e.json" > /dev/null
