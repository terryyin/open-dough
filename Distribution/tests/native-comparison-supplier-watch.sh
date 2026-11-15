#!/usr/bin/env bash
# Controlled in-flight publications exercise the real journey, supplier Git
# fixture, observation and retention. No model choice or real wait is simulated.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2312 # Case/journey globals and observed states.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
source "${source_dir}/Distribution/tests/support/native-comparison-run.sh"
source "${source_dir}/Distribution/tests/support/native-assessor-counterexample.sh"
work=$(mktemp -d)
driver=''
finish() {
  if [[ -n ${driver} ]]; then
    kill "${driver}" 2> /dev/null || true
    wait "${driver}" 2> /dev/null || true
  fi
  rm -rf -- "${work}"
}
trap finish EXIT
mkdir -p "${work}/bin" "${work}/pass" "${work}/early" "${work}/native"
cp "${source_dir}/Distribution/tests/support/native-agent-paused-supplier.sh" "${work}/bin/codex"
cp "${source_dir}/Distribution/tests/helpers/wait-for.bash" "${work}/bin/wait-for.bash"
cat > "${work}/bin/context" << 'SCRIPT'
#!/usr/bin/env bash
if [[ $2 == false || ${WATCH_TEST_EARLY-} == true ]]; then printf true; exit; fi
printf '%q %q %q' "$(dirname "$0")/block" "$1" "${NATIVE_COMPARISON_CONTROL_CLOCK}"
SCRIPT
cat > "${work}/bin/block" << 'SCRIPT'
#!/usr/bin/env bash
set -euo pipefail
workspace=$1 clock=$2
printf '%s\n' "${workspace}" > "${clock}/workspace"
printf '%s\n' "${BASHPID}" > "${clock}/model-pid"
exec 8<> "${clock}/model-hold"
read -r -u 8 _
SCRIPT
chmod +x "${work}/bin/codex" "${work}/bin/context" "${work}/bin/block"
export PATH="${work}/bin:${PATH}"
export NATIVE_AGENT_PAUSED_SUPPLIER_CONTEXT_COMMAND="${work}/bin/context"
unset CODEX_HOME
native_case_deadline=30
native_case_grace=0
clock() {
  mkdir -p "$1"
  mkfifo "$1/advance" "$1/model-hold"
}
clock "${work}/clock"
export NATIVE_COMPARISON_CONTROL_CLOCK="${work}/clock"

# The external controlled clock progresses without any model poll. The
# scripted host is genuinely alive at both publications and emits no polls.
(
  wait_for watch-command 10 "test -s '${work}/clock/model-pid'"
  workspace=$(< "${work}/clock/workspace")
  grep -q dough-story-dependencies "${workspace}/.planning/seeds/SEED-324-landed-ci-repeat-checks.md" && exit 1
  grep -q 'required stability evidence and real native CLI controls intact' "${workspace}/.planning/seeds/SEED-324-landed-ci-repeat-checks.md"
  kill -0 "$(< "${work}/clock/model-pid")"
  printf 'nonqualifying\n' > "${work}/clock/advance"
  wait_for early-publication 10 "test -s '${work}/clock/nonqualifying'"
  kill -0 "$(< "${work}/clock/model-pid")"
  [[ -e ${workspace}/tests/repeat-checks.test.mjs && ! -e ${workspace}/tests/repeat-verdict-stage.test.mjs ]]
  printf 'qualifying\n' > "${work}/clock/advance"
  wait_for qualification 10 "test -s '${work}/clock/qualifying'"
  kill -0 "$(< "${work}/clock/model-pid")"
  wait_for controller-exit 10 "! kill -0 $(< "${work}/clock/controller-pid") 2>/dev/null"
  printf 'release\n' > "${work}/clock/model-hold"
) > "${work}/driver.out" 2> "${work}/driver.err" &
driver=$!
native_comparison_run_case supplier-watch "${source_dir}" "${work}/pass" "${work}/results"
wait "${driver}"
driver=''
passing="${work}/pass/observations.txt"
attempt=${native_comparison_attempt}
grep -Fqx 'turn-2-status: completed' "${passing}"
grep -Fqx 'turn-watch-hold-supplier-reader: absent' "${passing}"
grep -Fqx 'turn-watch-hold-partial-work: preserved' "${passing}"
grep -Fqx 'turn-2-supplier-integrations: 1' "${passing}"
grep -Fqx 'turn-2-slice3-filings: 1' "${passing}"
grep -Fqx 'turn-2-proof: passed' "${passing}"
grep -Fqx 'turn-2-agent-proof: passed' "${passing}"
grep -Fqx 'watch-reproduction: unobserved-controlled-host' "${passing}"
grep -Fqx 'watch-exposure: unknown; turn start is not a real watch handle' "${passing}"
[[ ! -e ${attempt}/events-turn-3.jsonl ]]
grep -Fqx 'host-route: substitute' "${attempt}/record"
cmp "${attempt}/case-evidence/watch-observations.txt" "$(dirname "${work}/pass"/controller.*/case-evidence/watch-observations.txt)/watch-observations.txt"
kill -0 "$(< "${work}/clock/model-pid")" 2> /dev/null && exit 1
kill -0 "$(< "${work}/clock/controller-pid")" 2> /dev/null && exit 1

# Each quality rejection changes one declared observed signal from this
# passing journey. A scripted reduction of work cannot erase these outcomes.
case_path="${source_dir}/Distribution/tests/native-comparison/supplier-watch"
source "${case_path}/assess.bash"
native_assessor_counterexamples "${case_path}/assess.bash" "${passing}" \
  --verdict case_assess_status case_assess_reason -- case_assess
native_assessor_rejects_field_rows << 'CASES'
early-integration publication turn-watch-hold-supplier-reader: diagnostic | did not preserve
lost-work continuation turn-2-partial-work: lost | preserved supplier continuation
duplicate once turn-2-slice3-filings: 2 | exactly once
missing-proof proof turn-2-agent-proof: none | independent and executed proof
fake-session session turn-2-thread: fabricated | incomplete
missing-release schedule watch-event: nonqualifying | publication schedule
CASES

# An ended clean hold is an observed non-reproduction, not a model fault or
# a fabricated active turn. No producer release or automatic resume follows.
clock "${work}/early-clock"
export NATIVE_COMPARISON_CONTROL_CLOCK="${work}/early-clock"
WATCH_TEST_EARLY=true native_comparison_run_case supplier-watch "${source_dir}" \
  "${work}/early" "${work}/results" || true
grep -Fqx 'watch-result: ended-before-publication' "${work}/early/observations.txt"
grep -Fqx 'watch-turn-stream: complete' "${work}/early/observations.txt"
[[ ${native_comparison_reason} == 'not reproduced: the clean held watch ended before publication; qualifying continuation is unobserved, not a quality regression' ]]
[[ ! -e ${work}/early-clock/qualifying && ! -e ${native_comparison_attempt}/events-turn-3.jsonl ]]

# A changed domain builder used by the case cannot reuse a committed case
# identity or start an arm. The shared import-closure owner finds the effect.
source "${source_dir}/Distribution/tests/support/native-comparison-pair-fixture.sh"
native_comparison_pair_fixture "${source_dir}" "${work}/identity"
printf '\n# Changed supplier agreement construction.\n' \
  >> "${work}/identity/source/Distribution/tests/support/supplierAgreementTestData.mjs"
before=$(native_comparison_fixture_sessions "${work}/identity")
status=0
native_comparison_fixture_capture "${work}/identity" "${native_comparison_fixture_baseline}" \
  dirty-builder --case supplier-watch || status=$?
[[ ${status} -eq 2 ]]
grep -q 'the case basis is not committed' "${work}/identity/dirty-builder.err" \
  || {
    cat "${work}/identity/dirty-builder.err" >&2
    exit 1
  }
grep -q 'Distribution/tests/support/supplierAgreementTestData.mjs' "${work}/identity/dirty-builder.err"
[[ $(native_comparison_fixture_sessions "${work}/identity") -eq ${before} ]]

# A regular executable takes route 0, but altered substitute bytes still
# refuse the workflow with a valid clock, before a session or attempt exists.
mkdir -p "${work}/different/bin" "${work}/different/run"
cp "${source_dir}/Distribution/tests/support/native-agent-paused-supplier.sh" "${work}/different/bin/codex"
printf '\n# Deliberately altered credential-free substitute.\n' >> "${work}/different/bin/codex"
chmod +x "${work}/different/bin/codex"
status=0
PATH="${work}/different/bin:${PATH}" CODEX_HOME="${work}/different/codex-home" \
  native_comparison_run_case supplier-watch "${source_dir}" "${work}/different/run" \
  "${work}/different/results" || status=$?
[[ ${status} -eq 1 ]]
grep -Fqx 'unstarted: supplier-watch permits only the controlled supplier substitute; no session started' \
  "${work}/different/run/observations.txt"
[[ $(native_comparison_fixture_sessions "${work}/different") -eq 0 ]]
[[ -z ${native_comparison_attempt} && ! -e ${work}/different/results ]]

# Even an externally supplied clock cannot enable a real-native route. The
# route seam is overridden before the journey could build or run a command.
native_codex_prepare() { native_codex_isolate=1; }
native_comparison_run_case supplier-watch "${source_dir}" "${work}/native" || true
grep -Fq 'unstarted: supplier-watch native observation timing is not approved' "${work}/native/observations.txt"
[[ -z ${native_comparison_attempt} ]]
