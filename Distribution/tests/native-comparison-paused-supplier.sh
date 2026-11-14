#!/usr/bin/env bash
# Credential-free proof of the paused-supplier comparison case
# (Distribution/tests/native-comparison/paused-supplier/case.md): substitute-host journeys
# through the shared runner, observer, assessor and retention, the assessor's
# rejected cases, and checks that the task and wake texts and the agent's
# workspace hold no expected answer. A native journey or pair runs through
# Distribution/tests/native-comparison.sh.
# shellcheck disable=SC1091,SC2034,SC2154,SC2249,SC2310,SC2312 # Sourced runner, case and helper globals; journeys report their verdicts.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
source "${source_dir}/Distribution/tests/support/native-comparison-run.sh"
source "${source_dir}/Distribution/tests/support/native-assessor-counterexample.sh"

work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT
case_path="${source_dir}/Distribution/tests/native-comparison/paused-supplier"

# The task and wake name neither the supplier, its state nor the decision.
if grep -Eiq 'SEED-332|supplier|satisf|stabil|natural|wait|hold|block|depend' \
  "${case_path}/task.txt" "${case_path}/wake.txt"; then
  echo 'FAIL: the paused-supplier task or wake text leaks the decision' >&2
  exit 1
fi

# A substitute Codex holds until the supplier's completion is on main.
mkdir -p -- "${work}/bin" "${work}/completion" "${work}/publication" \
  "${work}/duplicate" "${work}/reroute"
cp -- "${source_dir}/Distribution/tests/support/native-agent-paused-supplier.sh" "${work}/bin/codex"
chmod a+x "${work}/bin/codex"
export PATH="${work}/bin:${PATH}"
# Without CODEX_HOME a substitute's session records are never looked up.
unset CODEX_HOME
native_case_deadline=120
native_case_grace=5
if ! NATIVE_AGENT_PAUSED_SUPPLIER_RULE=completion native_comparison_run_case \
  paused-supplier "${source_dir}" "${work}/completion" "${work}/results"; then
  printf 'FAIL: the completion substitute journey did not pass: %s\n' \
    "${native_comparison_reason}" >&2
  cat -- "${work}/completion/observations.txt" >&2
  exit 1
fi
passing="${work}/completion/observations.txt"
attempt=${native_comparison_attempt}
# One thread through four turns; the starting proof fails without the
# supplier's reader and passes after the continuation.
thread=$(native_observation_field "${passing}" turn-1-thread)
[[ $(grep -c "^turn-[1-4]-thread: ${thread}$" "${passing}") -eq 4 ]]
grep -Fqx 'turn-1-proof: failed' "${passing}"
# A hold that only reads the proof command has run no proof of its own.
grep -Fqx 'turn-1-agent-proof: none' "${passing}"
grep -Fqx 'turn-4-proof: passed' "${passing}"
# Its integration is a merge commit and its filing is uncommitted: each counts once.
grep -Fqx 'turn-4-supplier-integrations: 1' "${passing}"
grep -Fqx 'turn-4-slice3-filings: 1' "${passing}"
for artifact in record observations.txt prompt.txt wake.txt final-state.txt \
  events-turn-1.jsonl events-turn-4.jsonl response-turn-4.md; do
  [[ -s ${attempt}/${artifact} ]] || {
    printf 'FAIL: retained attempt lacks %s\n' "${artifact}" >&2
    exit 1
  }
done
grep -Eq '^project-basis: main=[0-9a-f]{40} supplier=[0-9a-f]{40} consumer=[0-9a-f]{40} partial=[0-9a-f]{40}$' \
  "${attempt}/record"
grep -Eq '^payload-digest: [0-9a-f]{64}$' "${attempt}/record"
grep -Fqx 'payload-revision: working-tree' "${attempt}/record"
grep -Fqx 'codex-session-file: missing' "${attempt}/record"
grep -Fqx "thread: ${thread}" "${attempt}/record"
grep -Eq '^input-hash: [0-9a-f]{64} Distribution/tests/native-comparison/paused-supplier/assess.bash$' \
  "${attempt}/record"
# Nothing of the case's definition reaches the agent's side of the journey.
if [[ -n $(find "${work}/completion" -path '*/nc.*' \( -name 'assess.bash' \
  -o -name 'case.*' -o -name 'task.txt' -o -name 'observations.txt' \) -print) ]]; then
  echo 'FAIL: case definition or observations reached the agent side' >&2
  exit 1
fi

# A substitute journey under RULE that shows observation FIELD and fails with
# exactly REASON.
rejected_journey() {
  local rule=$1 field=$2 reason=$3
  if NATIVE_AGENT_PAUSED_SUPPLIER_RULE=${rule} native_comparison_run_case \
    paused-supplier "${source_dir}" "${work}/${rule}"; then
    printf 'FAIL: the %s substitute journey passed\n' "${rule}" >&2
    exit 1
  fi
  grep -Fqx "${field}" "${work}/${rule}/observations.txt"
  [[ ${native_comparison_reason} == "${reason}" ]] || {
    printf 'FAIL: %s journey reason: %s\n' "${rule}" "${native_comparison_reason}" >&2
    exit 1
  }
}
# Resuming on the supplier's early publication: the publication makes the
# consumer's proof pass, and the journey still fails.
rejected_journey publication 'turn-3-proof: passed' \
  'turn 3 (publication) integrated the supplier (diagnostic) before its requirement was satisfied'
# Rerouting the partial slice's shared fixture around the supplier's reader
# while holding keeps every file but not the dependency.
rejected_journey reroute 'turn-1-partial-work: rerouted' \
  "turn 1 rerouted the partial slice 3 work around the supplier's reader"
# Filing slice 3 again in later commits continues twice.
rejected_journey duplicate 'turn-4-slice3-filings: 2' \
  'turn 4 did not continue exactly once (1 supplier integrations, 2 slice 3 filings)'

source "${case_path}/assess.bash"
native_assessor_counterexamples "${case_path}/assess.bash" "${passing}" \
  --verdict case_assess_status case_assess_reason -- case_assess
native_assessor_rejects_field_rows << 'EOF'
resumed-at-publication publication-hold turn-3-slice3: filed | turn 3 (publication) continued slice 3
integrated-at-publication publication-hold turn-3-supplier-reader: diagnostic | integrated the supplier (diagnostic)
satisfied-at-publication publication-hold turn-3-dependency: satisfied | turn 3 (publication) recorded the supplier requirement as satisfied
satisfied-at-diagnostic-pass diagnostic-pass-hold turn-1-dependency: satisfied | turn 1 (diagnostic-pass) recorded
own-reader-at-diagnostic-pass diagnostic-pass-hold turn-1-supplier-reader: own | wrote its own supplier reader
resumed-on-unchanged-wake unchanged-hold turn-2-slice3: filed | turn 2 (unchanged) continued slice 3
no-continuation continuation turn-4-slice3: partial | did not continue slice 3
early-reader-at-completion continuation turn-4-supplier-reader: diagnostic | completed reader (diagnostic)
failing-proof proof turn-4-proof: failed | lacks slice 3's passing proof
unproved-continuation proof turn-4-agent-proof: none | lacks slice 3's passing proof
lost-partial-work partial-work turn-2-partial-work: lost | turn 2 lost the partial slice 3 work
rerouted-partial-work partial-work turn-3-partial-work: rerouted | turn 3 rerouted the partial slice 3 work around the supplier's reader
new-session session turn-3-thread: 00000000-0000-4000-8000-ffffffffffff | turn 3 is not a continuation
kept-watching session turn-1-status: timeout | turn 1 did not complete (timeout)
pushed remote turn-4-remote: changed | turn 4 changed the remote
integrated-twice once turn-4-supplier-integrations: 2 | turn 4 did not continue exactly once (2 supplier integrations
filed-twice once turn-4-slice3-filings: 2 | turn 4 did not continue exactly once (1 supplier integrations, 2 slice 3 filings)
inspected-harness harness turn-2-harness-inspected: true | turn 2 inspected the native harness
EOF
