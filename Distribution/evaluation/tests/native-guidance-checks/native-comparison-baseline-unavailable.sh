#!/usr/bin/env bash
# Purpose: missing, truncated or insufficient archived evidence acquires fresh
# arms without changing the supplied record or inventing complete native usage.
# shellcheck disable=SC1091,SC2154,SC2310,SC2312 # Fixture globals; expected statuses are asserted.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
source "${source_dir}/Distribution/evaluation/tests/native-guidance-checks/support/native-comparison-pair-fixture.sh"
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT
native_comparison_pair_fixture "${source_dir}" "${work}"
quiet=$(native_comparison_fixture_rule "${work}" quiet)
baseline=${native_comparison_fixture_baseline}
native_comparison_fixture_capture "${work}" "${baseline}" baseline
original=$(shasum -a 256 "${work}/baseline.json")

# Missing/truncated and complete-but-insufficient saved evidence all acquire
# fresh arms. They never edit the supplied bytes or invent an observed zero.
printf '{"schema":' > "${work}/incomplete.json"
for saved in missing incomplete; do
  before=$(native_comparison_fixture_sessions "${work}")
  record=$(native_comparison_fixture_record "${work}" "${baseline}" "${quiet}" concurrent "${saved}" --reuse-baseline "${work}/${saved}.json")
  [[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 2)) ]]
  grep -Fqx 'baseline-acquisition: fresh' "${record}"
done
before=$(native_comparison_fixture_sessions "${work}")
status=0
native_comparison_fixture_run "${work}" "${baseline}" "${quiet}" concurrent usage --reuse-baseline "${work}/baseline.json" --require-usage || status=$?
[[ ${status} -eq 1 && $(native_comparison_fixture_sessions "${work}") -eq $((before + 2)) ]]
grep -q 'current criterion requires unavailable complete native usage' "${work}/usage.out"
grep -Fqx 'verdict: not-comparable' "${work}/usage.out"
grep -Fqx 'effort-difference: not computed: the pair is not-comparable' "${work}/usage.out"
[[ ${original} == "$(shasum -a 256 "${work}/baseline.json")" ]]
