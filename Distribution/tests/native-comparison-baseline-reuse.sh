#!/usr/bin/env bash
# Purpose: a sufficient historical baseline launches only a new candidate,
# including a failed baseline, and remains distinct from a fresh pair.
# shellcheck disable=SC1091,SC2154,SC2310,SC2312 # Fixture globals; expected statuses are asserted.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
source "${source_dir}/Distribution/tests/support/native-comparison-pair-fixture.sh"
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT
native_comparison_pair_fixture "${source_dir}" "${work}"
quiet=$(native_comparison_fixture_rule "${work}" quiet)
shortcut=$(native_comparison_fixture_rule "${work}" shortcut)
native_comparison_fixture_capture "${work}" "${quiet}" baseline
original=$(shasum -a 256 "${work}/baseline.json")
before=$(native_comparison_fixture_sessions "${work}")
record=$(native_comparison_fixture_record "${work}" "${quiet}" "${quiet}" sequential matched --reuse-baseline "${work}/baseline.json")
[[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 1)) ]]
grep -Fqx 'baseline-acquisition: reused' "${record}"
grep -Fqx 'verdict: preserved' "${record}"
grep -Fqx "baseline-source: ${work}/baseline.json" "${record}"
grep -Eq '^baseline-observed-at: [0-9]{4}-' "${record}"
grep -q '^baseline-source-conditions: .*gpt-test' "${record}"
grep -q '^measurement-limit: reused baseline.*historical.*not a fresh concurrent pair' "${record}"
grep -q '^effort-baseline: 4 turns' "${record}"
[[ -s $(dirname -- "${record}")/baseline-assessment.json ]]

# Outcome/proof precedes effort even when only the cheaper bad candidate runs.
before=$(native_comparison_fixture_sessions "${work}")
record=$(native_comparison_fixture_record "${work}" "${quiet}" "${shortcut}" sequential regressed --reuse-baseline "${work}/baseline.json")
[[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 1)) ]]
grep -Fqx 'verdict: regressed' "${record}"
grep -q '^effort-standing: not a gain:' "${record}"

# A complete observed task failure is sufficient to observe an improvement.
status=0
native_comparison_fixture_capture "${work}" "${shortcut}" failed || status=$?
[[ ${status} -eq 1 ]]
before=$(native_comparison_fixture_sessions "${work}")
record=$(native_comparison_fixture_record "${work}" "${shortcut}" "${quiet}" sequential improved --reuse-baseline "${work}/failed.json")
[[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 1)) ]]
grep -Fqx 'baseline-acquisition: reused' "${record}"
grep -Fqx 'verdict: improved' "${record}"

# Harmless retention changes and a current assessor change do not relabel
# capture provenance or launch another baseline. The new assessment is explicit.
printf '\n# Retention note only.\n' >> "${work}/source/Distribution/tests/support/native-comparison-retain.sh"
printf '\n# Current assessor review.\n' >> "${work}/source/Distribution/tests/native-comparison/paused-supplier/assess.bash"
native_comparison_fixture_git "${work}/source" add -A
native_comparison_fixture_git "${work}/source" commit -q -m 'Review retention and current assessment'
before=$(native_comparison_fixture_sessions "${work}")
record=$(native_comparison_fixture_record "${work}" "${quiet}" "${quiet}" sequential reassessed --reuse-baseline "${work}/baseline.json")
[[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 1)) ]]
grep -Fqx 'baseline-acquisition: reused' "${record}"
jq -e --slurpfile archive "${work}/baseline.json" '.sourceIntegrity == $archive[0].integrity and .assessorHash != $archive[0].exportAssessment.assessorHash' "$(dirname -- "${record}")/baseline-assessment.json" > /dev/null
[[ ${original} == "$(shasum -a 256 "${work}/baseline.json")" ]]

# Explicit fresh comparison runs both sessions and retains a new observation.
before=$(native_comparison_fixture_sessions "${work}")
record=$(native_comparison_fixture_record "${work}" "${quiet}" "${quiet}" concurrent fresh --reuse-baseline "${work}/baseline.json" --fresh-pair)
[[ $(native_comparison_fixture_sessions "${work}") -eq $((before + 2)) ]]
grep -Fqx 'baseline-acquisition-reason: explicit fresh pair' "${record}"
[[ -s $(dirname -- "${record}")/baseline.json ]]
[[ ${original} == "$(shasum -a 256 "${work}/baseline.json")" ]]
