#!/usr/bin/env bash
# Purpose: the launch-command-tests fixture leaves the unchanged E2E consumer
# failing on the starting state, the way the frozen effort work left it: the
# observer's own run of it fails every test with the five-argument command.
# shellcheck disable=SC1091,SC2154,SC2312 # Sourced runner and case globals; checks read what each command gives.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
source "${source_dir}/Distribution/evaluation/src/native-guidance-check-run.sh"
case_path="${source_dir}/Distribution/evaluation/cases/guidance-checks/launch-command-tests"
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT

export NATIVE_GUIDANCE_CHECK_OPEN_DOUGH_SOURCE=${source_dir}
source "${case_path}/case.bash"
case_materialize "${work}" "${source_dir}" codex
[[ $(case_run_specs "${work}/workspace" e2e/playwright.config.ts "${work}/e2e.json" \
  "${case_e2e_specs[@]}") == '0 4' ]]
jq -e '[.. | strings | gsub("\u001b\\[[0-9;]*m"; "") | select(contains("Received length: 5"))] | length > 0' \
  "${work}/e2e.json" > /dev/null
