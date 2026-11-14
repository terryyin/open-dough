#!/usr/bin/env bash
# Credential-free pairs through the maintainer entry
# (Distribution/tests/native-comparison.sh): substitute-host pairs of the
# paused-supplier case from a committed copy of this checkout's harness
# (Distribution/tests/support/native-comparison-pair-fixture.sh), whose
# frozen payloads differ only in the substitute's rule, and the pair judge's
# rejected cases. Paid pairs run through the entry itself.
# shellcheck disable=SC1091,SC2154,SC2310,SC2312 # Sourced fixture and helper globals; journeys report their verdicts.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
source "${source_dir}/Distribution/tests/support/native-comparison-pair-fixture.sh"
source "${source_dir}/Distribution/tests/support/native-observation.sh"
source "${source_dir}/Distribution/tests/support/native-comparison-verdict.sh"
source "${source_dir}/Distribution/tests/support/native-comparison-verdict-counterexamples.sh"

work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT

# Payload revisions: this checkout's commit, and commits whose installed
# guidance tells the substitute to hold more quietly (one command fewer per
# hold, same decisions) or to take a shortcut (push its branch, skip proof).
native_comparison_pair_fixture "${source_dir}" "${work}"
baseline=${native_comparison_fixture_baseline}
quiet=$(native_comparison_fixture_rule "${work}" quiet)
shortcut=$(native_comparison_fixture_rule "${work}" shortcut)

# A quieter candidate keeps the outcome: both arms ran together, with their
# own frozen payloads, one case and project basis, the same settings and
# their own sessions, and the record names each of them.
preserved=$(native_comparison_fixture_record "${work}" "${baseline}" "${quiet}" concurrent preserved)
grep -Fqx 'verdict: preserved' "${preserved}"
grep -Fqx "case-basis-revision: $(git -C "${work}/source" rev-parse HEAD)" "${preserved}"
[[ $(native_observation_value "${preserved}" baseline-payload) == "${baseline} tree=$(git -C "${source_dir}" rev-parse "${baseline}^{tree}") requested=${baseline}" ]]
[[ $(native_observation_value "${preserved}" candidate-payload) == "${quiet} tree="*" requested=${quiet}" ]]
digest=$(native_observation_value "${preserved}" baseline-payload-digest)
[[ ${digest} =~ ^[0-9a-f]{64}$ && ${digest} != "$(native_observation_value "${preserved}" candidate-payload-digest)" ]]
for condition in basis project-basis host settings events; do
  grep -Fqx "condition-${condition}: same" "${preserved}"
done
[[ $(native_observation_value "${preserved}" baseline-project-basis) =~ ^main=[0-9a-f]{40}\ supplier=[0-9a-f]{40}\ consumer=[0-9a-f]{40}\ partial=[0-9a-f]{40}$ ]]
grep -Fqx 'baseline-settings: model=gpt-test effort=low sandbox=danger-full-access approval=never' "${preserved}"
[[ $(native_observation_value "${preserved}" baseline-thread) =~ ^0{8}- && $(native_observation_value "${preserved}" baseline-thread) != "$(native_observation_value "${preserved}" candidate-thread)" ]]
grep -Fqx 'arms: concurrent' "${preserved}"
grep -Fq "case-input-hash: $(shasum -a 256 "${source_dir}/Distribution/tests/native-comparison/paused-supplier/assess.bash" | cut -d ' ' -f 1) Distribution/tests/native-comparison/paused-supplier/assess.bash" "${preserved}"
cmp -s "${source_dir}/Distribution/tests/native-comparison/paused-supplier/task.txt" \
  "$(dirname -- "${preserved}")/case-basis/Distribution/tests/native-comparison/paused-supplier/task.txt"
# The criteria were recorded before either arm's sessions.
[[ $(grep -n '^quality-criteria: ' "${preserved}" | cut -d : -f 1) -lt $(grep -n '^baseline-attempt: ' "${preserved}" | cut -d : -f 1) ]]
for arm in baseline candidate; do
  record="${work}/results/$(native_observation_value "${preserved}" "${arm}-attempt")/record"
  grep -q "^codex-session-file: ${work}/codex-home/sessions/" "${record}"
  grep -Fqx "payload-revision: $(native_observation_value "${preserved}" "${arm}-payload" | cut -d ' ' -f 1)" "${record}"
done
# Each held wake is an empty one; the quieter candidate spends one command
# on each where the baseline spends two.
grep -Eq '^effort-baseline: 4 turns, 3 wakes \(2 empty: 4 commands, ' "${preserved}"
grep -Eq '^effort-candidate: 4 turns, 3 wakes \(2 empty: 2 commands, ' "${preserved}"
grep -Fqx 'effort-difference: candidate -3 commands' <(cut -d , -f 1 "${preserved}" | grep '^effort-difference: ')
grep -q '^effort-unavailable: tokens and cost' "${preserved}"

# A cheaper candidate that pushes and skips its proof regresses the outcome;
# its push leaves the baseline arm's remote unchanged.
regressed=$(native_comparison_fixture_record "${work}" "${baseline}" "${shortcut}" sequential regressed)
grep -Fqx 'verdict: regressed' "${regressed}"
grep -Fqx 'candidate-outcome: fail: turn 4 changed the remote' "${regressed}"
grep -Eq '^baseline-outcome: pass: ' "${regressed}"
grep -Eq '^effort-difference: candidate -[0-9]+ commands' "${regressed}"
grep -q '^effort-standing: not a gain: the outcome is regressed' "${regressed}"
grep -Fqx 'turn-4-remote: changed' "${work}/results/$(native_observation_value "${regressed}" candidate-attempt)/observations.txt"
grep -Fqx 'turn-4-remote: unchanged' "${work}/results/$(native_observation_value "${regressed}" baseline-attempt)/observations.txt"

# A revision that names no commit stops before any arm starts.
status=0
native_comparison_fixture_run "${work}" "${baseline}" no-such-revision concurrent invalid || status=$?
[[ ${status} -eq 2 ]]
grep -q 'the candidate payload no-such-revision names no commit' "${work}/invalid.err"
[[ $(find "${work}/results/codex/native-comparison-pair" -mindepth 2 -maxdepth 2 | wc -l) -eq 2 ]]

# The pair judge's outcomes and rejected cases, from the preserved pair.
native_comparison_verdict_counterexamples "$(dirname -- "${preserved}")/pair-observations.txt" "${work}"
