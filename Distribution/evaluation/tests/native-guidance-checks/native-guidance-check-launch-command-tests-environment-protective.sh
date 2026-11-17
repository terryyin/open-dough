#!/usr/bin/env bash
# Purpose: in the participant environment of the launch-command-tests case
# (case-environment.bash), the existing protective reference outcome, applied
# by this check outside any participant, passes the owning backend specs
# through the real macOS write sandbox, with startup and teardown and no
# skip, flake or global error. Elsewhere no sandbox exists to
# observe, and the observer's own runs cover the reference (case.md,
# Reference qualification). The E2E consumer has its own check
# (native-guidance-check-launch-command-tests-environment-protective-e2e.sh).
# shellcheck disable=SC1091,SC2154,SC2312 # Sourced support, runner and case globals; checks read what each command gives.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
[[ $(uname -s) == Darwin ]] || exit 0
source "${source_dir}/Distribution/evaluation/tests/native-guidance-checks/support/launch-command-tests/environment.bash"
work=$(mktemp -d)
protected=$(mktemp -d)
trap 'case_cleanup; rm -rf -- "${work}" "${protected}"' EXIT

environment_arm "${work}" "${protected}"
apply_outcome protective
run_group protective-backend backend
counts_are protective-backend 28 0
((group_status == 0))
