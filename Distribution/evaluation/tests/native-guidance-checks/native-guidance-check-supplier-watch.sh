#!/usr/bin/env bash
# Controlled in-flight publications exercise the real journey, supplier Git
# fixture, observation and retention. No model choice or real wait is simulated.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2312 # Case/journey globals and observed states.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
source "${source_dir}/Distribution/evaluation/src/native-guidance-check-run.sh"
source "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-assessor-counterexample.sh"
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
mkdir -p "${work}/bin" "${work}/pass" "${work}/early"
cp "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-agent-paused-supplier.sh" "${work}/bin/codex"
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
source "$(dirname "$0")/wait-for.bash"
printf '%s\n' "${workspace}" > "${clock}/workspace"
printf '%s\n' "${BASHPID}" > "${clock}/model-pid"
printf 'ready\n' > "${clock}/model-ready"
wait_for nonqualifying 10 "test -s '${clock}/nonqualifying'"
# Observable command activity in the second phase cannot control release.
printf 'command remains active after nonqualifying publication\n'
printf busy > "${clock}/busy"
exec 8<> "${clock}/model-hold"
read -r -u 8 _
SCRIPT
chmod +x "${work}/bin/codex" "${work}/bin/context" "${work}/bin/block"
export PATH="${work}/bin:${PATH}"
export NATIVE_AGENT_PAUSED_SUPPLIER_CONTEXT_COMMAND="${work}/bin/context"
export CODEX_HOME="${work}/codex-home"
export NATIVE_AGENT_PAUSED_SUPPLIER_FAULT=usage
native_guidance_check_payload_revision=$(git -C "${source_dir}" rev-parse HEAD)
native_case_deadline=30
native_case_grace=0
clock() {
  mkdir -p "$1"
  mkfifo "$1/advance" "$1/model-hold" "$1/model-ready"
}
clock "${work}/clock"
export NATIVE_COMPARISON_CONTROL_CLOCK="${work}/clock"

# Preparation and the first turn finish before the model signals command entry.
# The external controlled clock then advances without a model poll. The
# scripted host is genuinely alive at both publications and emits no polls.
(
  IFS= read -r _ < "${work}/clock/model-ready"
  workspace=$(< "${work}/clock/workspace")
  grep -q dough-story-dependencies "${workspace}/.planning/seeds/SEED-324-landed-ci-repeat-checks.md" && exit 1
  grep -q 'required stability evidence and real native CLI controls intact' "${workspace}/.planning/seeds/SEED-324-landed-ci-repeat-checks.md"
  kill -0 "$(< "${work}/clock/model-pid")"
  printf 'nonqualifying\n' > "${work}/clock/advance"
  wait_for early-publication 10 "test -s '${work}/clock/nonqualifying'"
  kill -0 "$(< "${work}/clock/model-pid")"
  [[ -e ${workspace}/tests/repeat-checks.test.mjs && ! -e ${workspace}/tests/repeat-verdict-stage.test.mjs ]]
  wait_for active-command-output 10 "test -s '${work}/clock/busy'"
  printf 'qualifying\n' > "${work}/clock/advance"
  wait_for qualification 10 "test -s '${work}/clock/qualifying'"
  kill -0 "$(< "${work}/clock/model-pid")"
  wait_for controller-exit 10 "! kill -0 $(< "${work}/clock/controller-pid") 2>/dev/null"
  printf 'release\n' > "${work}/clock/model-hold"
) > "${work}/driver.out" 2> "${work}/driver.err" &
driver=$!
native_guidance_check_run_case supplier-watch "${source_dir}" "${work}/pass" "${work}/results"
wait "${driver}"
driver=''
passing="${work}/pass/observations.txt"
attempt=${native_guidance_check_attempt}
grep -Fqx 'turn-2-status: completed' "${passing}"
grep -Fqx 'turn-2-hold-supplier-reader: absent' "${passing}"
grep -Fqx 'turn-2-hold-partial-work: preserved' "${passing}"
grep -Fqx 'turn-2-supplier-integrations: 1' "${passing}"
grep -Fqx 'turn-2-slice3-filings: 1' "${passing}"
grep -Fqx 'turn-2-proof: passed' "${passing}"
grep -Fqx 'turn-2-agent-proof: passed' "${passing}"
grep -Fqx 'turn-2-watch-reproduction: unobserved-controlled-host' "${passing}"
grep -Fqx 'turn-2-watch-exposure: unknown' "${passing}"
[[ ! -e ${attempt}/events-turn-3.jsonl ]]
grep -Fqx 'host-route: substitute' "${attempt}/record"
cmp "${attempt}/case-evidence/watch-observations.txt" "$(dirname "${work}/pass"/controller.*/case-evidence/watch-observations.txt)/watch-observations.txt"
kill -0 "$(< "${work}/clock/model-pid")" 2> /dev/null && exit 1
kill -0 "$(< "${work}/clock/controller-pid")" 2> /dev/null && exit 1
kill -0 "$(< "${work}/clock/clock-pid")" 2> /dev/null && exit 1

# Export the actual retained journey, then reassess every declared input.
node "${source_dir}/Distribution/evaluation/src/native-comparison-archive.mjs" export \
  "${attempt}" "${work}/watch-baseline.json" "${source_dir}" "${work}/replay.txt" > "${work}/export.out"
node "${source_dir}/Distribution/evaluation/src/native-comparison-archive.mjs" assess \
  "${work}/watch-baseline.json" '' "${source_dir}" "${work}/reassess.txt" > "${work}/assessment.json"
[[ $(jq -r .status "${work}/assessment.json") == pass ]]
[[ $(jq '.evidence.turns | length' "${work}/watch-baseline.json") == 2 ]]
jq -e '.evidence.supplierWatch as $e | $e.publications as $p |
  $e.start < $p[0].beginMs and $p[0].beginMs <= $p[0].ms and
  $p[0].ms < $p[1].beginMs and $p[1].beginMs <= $p[1].ms' \
  "${work}/watch-baseline.json" > /dev/null

grep -Fqx 'turn-2-publication-1-event: nonqualifying' "${work}/reassess.txt"
grep -Fqx 'turn-2-publication-2-event: qualifying' "${work}/reassess.txt"
grep -Fqx 'turn-2-before-partial-work: preserved' "${work}/reassess.txt"
grep -Fqx 'turn-2-hold-supplier-reader: absent' "${work}/reassess.txt"

# Matching includes the controlled release driver and ordered publications,
# independent of their real completion times and without additional turns.
source "${source_dir}/Distribution/evaluation/src/native-comparison-pair.sh"
mkdir -p "${work}/pair/baseline" "${work}/pair/candidate"
for arm in baseline candidate; do
  cp "${passing}" "${work}/pair/${arm}/observations.txt"
  cp "${work}/pass/verdict" "${work}/pair/${arm}/verdict"
  printf '%s\n' "${native_guidance_check_payload_revision}" > "${work}/pair/payload-${arm}.id"
  native_comparison_pair_observe_arm "${work}/pair" "${arm}" 2 '' > "${work}/pair/${arm}.fields"
done
[[ $(native_comparison_pair_match "${work}/pair" events) == same ]]
sed 's/publication-2-event: qualifying/publication-2-event: nonqualifying/' "${passing}" > "${work}/pair/candidate/observations.txt"
native_comparison_pair_observe_arm "${work}/pair" candidate 2 '' > "${work}/pair/candidate.fields"
[[ $(native_comparison_pair_match "${work}/pair" events) == differs ]]

# Each quality rejection changes one declared observed signal from this
# passing journey. A scripted reduction of work cannot erase these outcomes.
case_path="${source_dir}/Distribution/evaluation/cases/guidance-checks/supplier-watch"
source "${case_path}/assess.bash"
# Immutable exports keep their retired schedule label and remain assessable.
sed 's/producer-schedule: controlled-fifo/producer-schedule: fixed-180s-180s/' \
  "${passing}" > "${work}/legacy-observations.txt"
case_assess "${work}/legacy-observations.txt"
[[ ${case_assess_status} == pass ]]
native_assessor_counterexamples "${case_path}/assess.bash" "${passing}" \
  --verdict case_assess_status case_assess_reason -- case_assess
native_assessor_rejects_field_rows << 'CASES'
early-integration publication turn-2-hold-supplier-reader: diagnostic | did not preserve
lost-work continuation turn-2-partial-work: lost | preserved supplier continuation
duplicate once turn-2-slice3-filings: 2 | exactly once
missing-proof proof turn-2-agent-proof: none | independent and executed proof
fake-session session turn-2-thread: fabricated | incomplete
missing-release schedule turn-2-publication-2-event: nonqualifying | publication schedule
CASES

# An ended clean hold is an observed non-reproduction, not a model fault or
# a fabricated active turn. No producer release or automatic resume follows.
clock "${work}/early-clock"
export NATIVE_COMPARISON_CONTROL_CLOCK="${work}/early-clock"
WATCH_TEST_EARLY=true native_guidance_check_run_case supplier-watch "${source_dir}" \
  "${work}/early" "${work}/results" || true
grep -Fqx 'turn-2-watch-result: ended-before-publication' "${work}/early/observations.txt"
grep -Fqx 'turn-2-watch-stream: complete' "${work}/early/observations.txt"
[[ ${native_guidance_check_reason} == 'not reproduced: the clean held watch ended before publication; qualifying continuation is unobserved, not a quality regression' ]]
[[ ! -e ${work}/early-clock/qualifying && ! -e ${native_guidance_check_attempt}/events-turn-3.jsonl ]]

# A malformed clock release fails the actual controller and promptly retires
# its active model and clock descendants, without either publication.
clock "${work}/failed-clock"
mkdir "${work}/clock-failure"
export NATIVE_COMPARISON_CONTROL_CLOCK="${work}/failed-clock"
(
  IFS= read -r _ < "${work}/failed-clock/model-ready"
  printf 'invalid-clock-event\n' > "${work}/failed-clock/advance"
) &
driver=$!
native_guidance_check_run_case supplier-watch "${source_dir}" "${work}/clock-failure" "${work}/results" || true
wait "${driver}"
driver=''
grep -Fq 'active-turn controller exited ' "${work}/clock-failure/observations.txt" || {
  cat "${work}/clock-failure/observations.txt" "${native_guidance_check_attempt}/stderr.log" >&2
  exit 1
}
[[ ! -e ${work}/failed-clock/nonqualifying && ! -e ${work}/failed-clock/qualifying ]]
for resource in model-pid controller-pid clock-pid; do
  kill -0 "$(< "${work}/failed-clock/${resource}")" 2> /dev/null && exit 1
done

# A real isolated Git publication rejection also fails the controller and
# retires its still-blocked clock/model; it cannot manufacture a release.
clock "${work}/rejected-clock"
mkdir "${work}/publication-failure"
export NATIVE_COMPARISON_CONTROL_CLOCK="${work}/rejected-clock"
(
  IFS= read -r _ < "${work}/rejected-clock/model-ready"
  workspace=$(< "${work}/rejected-clock/workspace")
  hook="$(dirname "${workspace}")/remote.git/hooks/pre-receive"
  printf '#!/usr/bin/env bash\nexit 37\n' > "${hook}"
  chmod +x "${hook}"
  printf 'nonqualifying\n' > "${work}/rejected-clock/advance"
) &
driver=$!
native_guidance_check_run_case supplier-watch "${source_dir}" "${work}/publication-failure" "${work}/results" || true
wait "${driver}"
driver=''
grep -Fq 'active-turn controller exited ' "${work}/publication-failure/observations.txt"
[[ ! -e ${work}/rejected-clock/nonqualifying && ! -e ${work}/rejected-clock/qualifying ]]
for resource in model-pid controller-pid clock-pid; do
  kill -0 "$(< "${work}/rejected-clock/${resource}")" 2> /dev/null && exit 1
done

# A changed domain builder used by the case cannot reuse a committed case
# identity or start an arm. The shared import-closure owner finds the effect.
source "${source_dir}/Distribution/evaluation/tests/native-guidance-checks/support/native-comparison-pair-fixture.sh"
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
cp "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-agent-paused-supplier.sh" "${work}/different/bin/codex"
printf '\n# Deliberately altered credential-free substitute.\n' >> "${work}/different/bin/codex"
chmod +x "${work}/different/bin/codex"
status=0
PATH="${work}/different/bin:${PATH}" CODEX_HOME="${work}/different/codex-home" \
  native_guidance_check_run_case supplier-watch "${source_dir}" "${work}/different/run" \
  "${work}/different/results" || status=$?
[[ ${status} -eq 1 ]]
grep -Fqx 'unstarted: supplier-watch permits only the controlled supplier substitute; no session started' \
  "${work}/different/run/observations.txt"
[[ $(native_comparison_fixture_sessions "${work}/different") -eq 0 ]]
[[ -z ${native_guidance_check_attempt} && ! -e ${work}/different/results ]]
