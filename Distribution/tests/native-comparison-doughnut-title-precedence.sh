#!/usr/bin/env bash
# Credential-free proof of the doughnut-title-precedence comparison case
# (Distribution/tests/native-comparison/doughnut-title-precedence/case.md): its observer
# and assessor over test runs recorded the way record-tests.gradle records
# them, in a stand-in checkout, with no Nix, Doughnut or database. The real
# project, setup and proof run only in a native journey,
# `Distribution/tests/native-comparison.sh --native codex --case doughnut-title-precedence`.
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Sourced runner, case and helper globals; observations print what each command gives.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
source "${source_dir}/Distribution/tests/support/native-comparison-run.sh"
source "${source_dir}/Distribution/tests/support/native-assessor-counterexample.sh"
case_path="${source_dir}/Distribution/tests/native-comparison/doughnut-title-precedence"
source "${case_path}/case.bash"
source "${case_path}/assess.bash"

work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT

# The task names the promise and the fault, never the proof that decides them.
if grep -Eiq 'selectsTitle|NoteControllerShow|every item|destination[- ]ID|test_only|caught|witness|reference' \
  "${case_path}/task.txt"; then
  echo 'FAIL: the doughnut-title-precedence task leaks the expected proof' >&2
  exit 1
fi

root="${work}/calibration" runs="${work}/calibration/gradle/test-runs"
git init -q "${root}/workspace"
mkdir -p -- "${root}/workspace/$(dirname -- "${case_seam}")"
echo 'return titles before aliases' > "${root}/workspace/${case_seam}"
git -C "${root}/workspace" add -A
git -C "${root}/workspace" -c user.name=Case -c user.email=case@example.invalid commit -qm basis
case_basis_seam=$(git -C "${root}/workspace" rev-parse "HEAD:${case_seam}")
assertion=$'com.odde.donut.controllers.NoteControllerShowWikiLinkTitlePrecedenceTests\tselectsTitleBeforeAliasesAcrossAuthoredLinkForms()'
witness=com.odde.donut.controllers.TitleWitnessTests
# Records run NAME: state lines, then results; output comes from standard input.
record() {
  mkdir -p -- "${runs}/$1"
  printf '%s' "$2" > "${runs}/$1/state"
  printf '%s\n' "$3" > "${runs}/$1/results"
  cat > "${runs}/$1/output"
}
record 1-baseline '' "SUCCESS	${assertion}	" < /dev/null
echo "${witness}	authored=color resolution=AMBIGUOUS destination=null" \
  | record 2-faulted "changed 8c8ec871cb ${case_seam}
untracked backend/src/test/java/${witness//.//}.java
" "FAILURE	${assertion}	Expected: every item is <490> but: an item was null
SUCCESS	${witness}	observesDestinations()"
record 3-restored '' "SUCCESS	${assertion}	" < /dev/null
jq -nc '{type:"thread.started",thread_id:"t"}, {type:"item.completed",item:{type:"agent_message",text:"**Verdict: Caught.** ..."}}' \
  > "${root}/stream.jsonl"
observe() {
  printf 'turn-1-status: completed\nturn-1-thread: t\n'
  case_observe "${root}" 1 "${root}/stream.jsonl" "${work}" "${work}/controller"
}
observe > "${root}/passing"
# The recorded runs stay beside the observations for retention.
cmp -s "${runs}/2-faulted/output" "${work}/case-evidence/test-runs-turn-1/2-faulted/output"
native_assessor_counterexamples "${case_path}/assess.bash" "${root}/passing" \
  --verdict case_assess_status case_assess_reason -- case_assess
# Plausible wrong decisions, observed from changed runs and checkout.
sed -i.bak 's/^FAILURE\(.*\)\tExpected.*/SUCCESS\1\t/' "${runs}/2-faulted/results"
native_assessor_rejects_observed green-fault destination-id "${root}/green" observe \
  -- fail 'did not fail under the title/alias fault (green)'
mv -- "${runs}/2-faulted/results.bak" "${runs}/2-faulted/results"
mv -- "${runs}/2-faulted/output" "${root}/output"
native_assessor_rejects_observed silent-witness witness "${root}/silent" observe \
  -- fail 'no independent witness observed the wrong destination (silent)'
mv -- "${root}/output" "${runs}/2-faulted/output"
echo 'union of titles and aliases' > "${root}/workspace/${case_seam}"
native_assessor_rejects_observed unrestored-source restoration "${root}/unrestored" observe \
  -- fail 'the resolver or checkout was not restored'
native_assessor_rejects_field_rows << 'ROWS'
caught-on-another-assertion destination-id turn-1-fault: other-assertion | under the title/alias fault
fault-outside-the-seam destination-id turn-1-fault: none | under the title/alias fault
edited-assertions destination-id turn-1-fault: assertions-changed | under the title/alias fault
no-witness witness turn-1-witness: none | no independent witness
no-baseline baseline turn-1-baseline: none | no passing baseline
failing-baseline baseline turn-1-baseline: failed | no passing baseline
no-restored-proof restored-proof turn-1-restored: none | no restored proof
failing-restored-proof restored-proof turn-1-restored: failed | no restored proof
scratch-in-restored-proof restored-proof turn-1-restored: with-scratch | no restored proof
narrower-restored-proof restored-proof turn-1-baseline-tests: 3111 | no restored proof as broad as the baseline
gap-verdict verdict turn-1-verdict: assertion-gap | reported verdict (assertion-gap)
no-verdict verdict turn-1-verdict: missing | reported verdict (missing)
inspected-harness harness turn-1-harness-inspected: true | inspected the native harness
unfinished-session session turn-1-status: timeout | did not complete (timeout)
ROWS
