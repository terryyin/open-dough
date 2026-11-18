#!/usr/bin/env bash
# Purpose: from one frozen capture of the fixture baseline, changed payload,
# task, model or reasoning inputs acquire fresh evidence, which remains
# reusable by the next matching comparison; and missing, truncated or
# insufficient archived evidence acquires fresh arms without changing the
# supplied record or inventing complete native usage. The task change commits
# to the harness copy, so it runs last.
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

# A changed requested payload is a miss. Its new observation has complete
# native response counters and is reusable when the next pair requires them.
known_usage=$(native_comparison_fixture_rule "${work}" quiet usage)
before=$(native_comparison_fixture_sessions "${work}")
record=$(native_comparison_fixture_record "${work}" "${known_usage}" "${known_usage}" concurrent payload --reuse-baseline "${work}/baseline.json")
[[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 2)) ]]
grep -Fqx 'baseline-acquisition: fresh' "${record}"
grep -Fqx 'baseline-acquisition-reason: saved baseline insufficient: baseline payload or case differs' "${record}"
next=$(dirname -- "${record}")/baseline.json
before=$(native_comparison_fixture_sessions "${work}")
record=$(native_comparison_fixture_record "${work}" "${known_usage}" "${known_usage}" sequential next --reuse-baseline "${next}" --require-usage)
[[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 1)) ]]
grep -Fqx 'baseline-acquisition: reused' "${record}"
grep -Fqx 'verdict: preserved' "${record}"
grep -Fqx 'condition-criteria: sufficient' "${record}"
# The CLI's cumulative usage does not double the four native responses.
grep -Fqx 'effort-native-usage-baseline: {"input_tokens":4,"cached_input_tokens":0,"output_tokens":4,"total_tokens":8}' "${record}"
grep -Fqx 'effort-native-usage-difference: candidate 0 processed tokens against baseline' "${record}"

# Model and reasoning changes are real new sessions with their actual settings.
for change in model effort; do
  options=(--model other-model)
  [[ ${change} != effort ]] || options=(--effort high)
  before=$(native_comparison_fixture_sessions "${work}")
  record=$(native_comparison_fixture_record "${work}" "${baseline}" "${quiet}" concurrent "${change}" --reuse-baseline "${work}/baseline.json" "${options[@]}")
  [[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 2)) ]]
  grep -Fqx 'baseline-acquisition: fresh' "${record}"
done

[[ ${original} == "$(shasum -a 256 "${work}/baseline.json")" ]]

# A changed task/setup input is material even when an old verdict still passes.
printf '\nUse the current project requirements.\n' >> "${work}/source/Distribution/evaluation/cases/guidance-checks/paused-supplier/task.txt"
native_comparison_fixture_git "${work}/source" add -A
native_comparison_fixture_git "${work}/source" commit -q -m 'Clarify task input'
before=$(native_comparison_fixture_sessions "${work}")
record=$(native_comparison_fixture_record "${work}" "${baseline}" "${quiet}" concurrent task --reuse-baseline "${work}/baseline.json")
[[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 2)) ]]
grep -Fqx 'baseline-acquisition: fresh' "${record}"
