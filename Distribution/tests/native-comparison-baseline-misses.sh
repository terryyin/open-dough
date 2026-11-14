#!/usr/bin/env bash
# Purpose: one acquisition rule obtains fresh evidence for changed or
# insufficient inputs and refuses comparable claims for actual condition gaps.
# shellcheck disable=SC1091,SC2154,SC2310,SC2312 # Fixture globals; expected statuses are asserted.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
source "${source_dir}/Distribution/tests/support/native-comparison-pair-fixture.sh"
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT
native_comparison_pair_fixture "${source_dir}" "${work}"
quiet=$(native_comparison_fixture_rule "${work}" quiet)
baseline=${native_comparison_fixture_baseline}
native_comparison_fixture_capture "${work}" "${baseline}" baseline
original=$(shasum -a 256 "${work}/baseline.json")

# A changed requested payload is a miss; its new observation is reusable later.
before=$(native_comparison_fixture_sessions "${work}")
record=$(native_comparison_fixture_record "${work}" "${quiet}" "${quiet}" concurrent payload --reuse-baseline "${work}/baseline.json")
[[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 2)) ]]
grep -Fqx 'baseline-acquisition: fresh' "${record}"
next=$(dirname -- "${record}")/baseline.json
before=$(native_comparison_fixture_sessions "${work}")
native_comparison_fixture_record "${work}" "${quiet}" "${quiet}" sequential next --reuse-baseline "${next}" > /dev/null
[[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 1)) ]]

# Model and reasoning changes are real new sessions with their actual settings.
for change in model effort; do
  options=(--model other-model)
  [[ ${change} != effort ]] || options=(--effort high)
  before=$(native_comparison_fixture_sessions "${work}")
  record=$(native_comparison_fixture_record "${work}" "${baseline}" "${quiet}" concurrent "${change}" --reuse-baseline "${work}/baseline.json" "${options[@]}")
  [[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 2)) ]]
  grep -Fqx 'baseline-acquisition: fresh' "${record}"
done

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

# A changed task/setup input is material even when an old verdict still passes.
printf '\nUse the current project requirements.\n' >> "${work}/source/Distribution/tests/native-comparison/paused-supplier/task.txt"
native_comparison_fixture_git "${work}/source" add -A
native_comparison_fixture_git "${work}/source" commit -q -m 'Clarify task input'
before=$(native_comparison_fixture_sessions "${work}")
record=$(native_comparison_fixture_record "${work}" "${baseline}" "${quiet}" concurrent task --reuse-baseline "${work}/baseline.json")
[[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 2)) ]]
grep -Fqx 'baseline-acquisition: fresh' "${record}"
