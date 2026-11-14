#!/usr/bin/env bash
# Purpose: an already completed supplier leaves the consumer's real partial
# execution to finish once, with executed proof and no controller wake turns.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2312 # Shared case/fixture globals; expected failures are inspected.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
source "${source_dir}/Distribution/tests/support/native-comparison-pair-fixture.sh"
source "${source_dir}/Distribution/tests/support/native-comparison-run.sh"
source "${source_dir}/Distribution/tests/support/native-assessor-counterexample.sh"
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT
case_path="${source_dir}/Distribution/tests/native-comparison/unblocked-supplier"

# Observe the actual materialization boundary before a model is started: remote
# completion exists, while local consumer integration and proof are still owed.
mkdir -p -- "${work}/start" "${work}/proof" "${work}/bin" "${work}/complete" "${work}/duplicate" "${work}/claim"
source "${case_path}/case.bash"
case_materialize "${work}/start" "${source_dir}" codex
workspace="${work}/start/workspace"
git -C "${work}/start/remote.git" cat-file -e main:.planning/done/SEED-332_answer-fake-gh-reads-in-process.json
[[ $(case_supplier_reader "${workspace}") == absent ]]
[[ $(case_continuations "${workspace}") == '0 0' ]]
for file in ${case_partial_files}; do cmp -s "${workspace}/${file}" "${supplier_case_dir}/partial/${file}"; done
[[ $(case_independent_proof "${workspace}" "${work}/proof" start) == failed ]]
grep -q '^Supplier: .* completed on origin/main;' "${workspace}/.planning/execution-state.txt"
if grep -q '^Supplier: .*Taken' "${workspace}/.planning/execution-state.txt"; then
  echo 'FAIL: completed supplier still described as Taken' >&2
  exit 1
fi
[[ ${case_project_basis} == "main=$(git -C "${work}/start/remote.git" rev-parse main) "* ]]

cp -- "${source_dir}/Distribution/tests/support/native-agent-paused-supplier.sh" "${work}/bin/codex"
chmod a+x "${work}/bin/codex"
export PATH="${work}/bin:${PATH}"
unset CODEX_HOME
native_case_deadline=120
native_case_grace=5
NATIVE_AGENT_PAUSED_SUPPLIER_RULE=completion native_comparison_run_case \
  unblocked-supplier "${source_dir}" "${work}/complete" "${work}/results"
passing="${work}/complete/observations.txt"
grep -Fqx 'turn-1-status: completed' "${passing}"
grep -Fqx 'turn-1-supplier-reader: completed' "${passing}"
grep -Fqx 'turn-1-partial-work: preserved' "${passing}"
grep -Fqx 'turn-1-supplier-integrations: 1' "${passing}"
grep -Fqx 'turn-1-slice3-filings: 1' "${passing}"
grep -Fqx 'turn-1-proof: passed' "${passing}"
grep -Fqx 'turn-1-agent-proof: passed' "${passing}"
if grep -Eq '^turn-[2-9][0-9]*-|^turn-1-event:' "${passing}"; then
  echo 'FAIL: ordinary execution required a controller wake' >&2
  exit 1
fi
[[ ! -e ${native_comparison_attempt}/events-turn-2.jsonl ]]

# A real duplicate filing is rejected even with passing final proof.
if NATIVE_AGENT_PAUSED_SUPPLIER_RULE=duplicate native_comparison_run_case \
  unblocked-supplier "${source_dir}" "${work}/duplicate"; then
  echo 'FAIL: duplicate continuation passed' >&2
  exit 1
fi
grep -Fqx 'turn-1-slice3-filings: 2' "${work}/duplicate/observations.txt"
[[ ${native_comparison_reason} == *'did not continue exactly once'* ]]

# A completed response claims success but performs no integration. The observed
# workspace, not that prose, wins.
if NATIVE_AGENT_PAUSED_SUPPLIER_RULE=claim-only native_comparison_run_case \
  unblocked-supplier "${source_dir}" "${work}/claim" "${work}/results"; then
  echo 'FAIL: terminal-looking prose supplied missing execution' >&2
  exit 1
fi
grep -Fqx 'turn-1-status: completed' "${work}/claim/observations.txt"
[[ -n $(native_observation_field "${work}/claim/observations.txt" turn-1-thread) ]]
[[ $(native_host_stream codex "${native_comparison_attempt}/events-turn-1.jsonl" response) == 'Execution completed; all proof passed.' ]]
grep -Fqx 'turn-1-supplier-reader: absent' "${work}/claim/observations.txt"
grep -Fqx 'turn-1-agent-proof: none' "${work}/claim/observations.txt"
[[ ${native_comparison_reason} == "the execution did not integrate the supplier's completed reader (absent)" ]]

source "${case_path}/assess.bash"
native_assessor_counterexamples "${case_path}/assess.bash" "${passing}" \
  --verdict case_assess_status case_assess_reason -- case_assess
native_assessor_rejects_field_rows << 'CASES'
lost-work partial-work turn-1-partial-work: lost | lost or rerouted
rerouted-work partial-work turn-1-partial-work: rerouted | lost or rerouted
no-independent-proof proof turn-1-proof: failed | lacks passing proof
no-executed-proof proof turn-1-agent-proof: none | lacks passing proof
own-reader continuation turn-1-supplier-reader: own | did not integrate
unfinished-stage continuation turn-1-slice3: partial | did not finish filing
integrated-twice once turn-1-supplier-integrations: 2 | did not continue exactly once
filed-twice once turn-1-slice3-filings: 2 | did not continue exactly once
published remote turn-1-remote: changed | changed the remote
harness-inspection harness turn-1-harness-inspected: true | inspected the native harness
CASES

# Both schedules hash the same real shared owner. A dirty shared input refuses
# frozen capture for either case before any substitute session can start.
native_comparison_pair_fixture "${source_dir}" "${work}/identity"
quiet=$(native_comparison_fixture_rule "${work}/identity" quiet)
printf '\n# Shared observation change.\n' >> "${work}/identity/source/Distribution/tests/support/native-comparison-supplier.sh"
for selected in paused-supplier unblocked-supplier; do
  before=$(native_comparison_fixture_sessions "${work}/identity")
  status=0
  native_comparison_fixture_capture "${work}/identity" "${quiet}" "${selected}" --case "${selected}" || status=$?
  [[ ${status} -eq 2 ]]
  grep -q 'the case basis is not committed' "${work}/identity/${selected}.err"
  grep -q 'Distribution/tests/support/native-comparison-supplier.sh' "${work}/identity/${selected}.err"
  [[ $(native_comparison_fixture_sessions "${work}/identity") -eq ${before} ]]
done

# Once the shared basis is committed, the same supported frozen capture runs
# exactly one ordinary session and exports replayable decisive proof.
native_comparison_fixture_git "${work}/identity/source" add -A
native_comparison_fixture_git "${work}/identity/source" commit -q -m 'Commit shared observation input'
before=$(native_comparison_fixture_sessions "${work}/identity")
native_comparison_fixture_capture "${work}/identity" "${quiet}" ordinary --case unblocked-supplier
[[ $(native_comparison_fixture_sessions "${work}/identity") -eq $((before + 1)) ]]
jq -e --arg rev "${quiet}" '.payload.revision == $rev and .case == "unblocked-supplier" and .exportAssessment.status == "pass" and (.evidence.turns | length == 1) and .evidence.turns[0].independent.status == "passed"' "${work}/identity/ordinary.json" > /dev/null
