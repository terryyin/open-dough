#!/usr/bin/env bash
# Credential-free refusals and incomplete comparisons through the maintainer
# entry (Distribution/tests/native-comparison.sh). Invalid or unrecoverable
# requests stop before a payload freezes, a case materializes or a host
# starts: an unqualified host and an unknown case beside a tripwire codex
# that must never run, no codex on PATH, and a missing case prerequisite in a
# committed copy of the harness
# (Distribution/tests/support/native-comparison-pair-fixture.sh). Then
# substitute-host pairs whose host fails around the case's decisions: a
# continuing turn without a stream beside an arm interrupted mid-turn, a
# resumed turn reporting another thread, and a host that keeps no session
# record. Each record names the arm, its retained proof and the unknowns,
# computes no effort difference and gives recovery, and the runner never
# resubmits a stopped turn. Substitute records say they are not native
# evidence, and no kept comparison record came from a substitute.
# shellcheck disable=SC1091,SC2154,SC2310,SC2312 # Sourced fixture and helper globals; journeys report their verdicts.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
source "${source_dir}/Distribution/tests/support/native-comparison-pair-fixture.sh"
source "${source_dir}/Distribution/tests/support/native-observation.sh"

work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT
entry=("${BASH}" "${source_dir}/Distribution/tests/native-comparison.sh")
refused_line='refused: no payload was frozen, no case materialized and no session started'

# Runs request NAME (the command that follows) into NAME.out and NAME.err
# and requires its refusal, exit 2, with ERROR among the reasons.
refuse() {
  local name=$1 error=$2 status=0
  shift 2
  "$@" > "${work}/${name}.out" 2> "${work}/${name}.err" || status=$?
  if [[ ${status} -ne 2 ]] || ! grep -Fqx "${refused_line}" "${work}/${name}.err" \
    || ! grep -Fq "error: ${error}" "${work}/${name}.err"; then
    printf 'FAIL: request %s was not refused with: %s (exit %s)\n' "${name}" "${error}" "${status}" >&2
    cat -- "${work}/${name}.out" "${work}/${name}.err" >&2
    exit 1
  fi
}

# A codex that marks any start: no refused request may reach it.
mkdir -p -- "${work}/tripwire"
printf '#!/usr/bin/env bash\ntouch %q\nexit 1\n' "${work}/tripwire/started" > "${work}/tripwire/codex"
chmod a+x "${work}/tripwire/codex"
tripwire_path=${work}/tripwire:${PATH}
PATH=${tripwire_path} refuse claude \
  'claude is not qualified for comparison cases: the runner drives only codex, and claude stays unqualified until its own native observations are obtained' \
  "${entry[@]}" --native claude --case paused-supplier --results-dir "${work}/refused"
PATH=${tripwire_path} refuse cursor 'cursor is not qualified for comparison cases' \
  "${entry[@]}" --native cursor --case doughnut-title-precedence --results-dir "${work}/refused"
PATH=${tripwire_path} refuse unknown-case 'no comparison case no-such-case; --list shows the cases' \
  "${entry[@]}" --native codex --case no-such-case --results-dir "${work}/refused"
PATH=${tripwire_path} refuse unknown-payload 'the candidate payload no-such-revision names no commit in' \
  "${entry[@]}" --native codex --case paused-supplier --baseline HEAD --candidate no-such-revision \
  --factor f --gain g --quality q --results-dir "${work}/refused"
[[ ! -e ${work}/tripwire/started && ! -e ${work}/refused ]]

# Without codex on PATH: each directory holding one is replaced by links to
# its other entries.
IFS=: read -ra directories <<< "${PATH}"
without_codex=()
for directory in "${directories[@]}"; do
  if [[ -e ${directory}/codex ]]; then
    mirror=$(mktemp -d "${work}/path.XXXXXX")
    for file in "${directory}"/*; do
      [[ ${file##*/} == codex ]] || ln -s -- "${file}" "${mirror}/"
    done
    directory=${mirror}
  fi
  without_codex+=("${directory}")
done
PATH=$(IFS=: && printf '%s' "${without_codex[*]}") refuse no-codex \
  'missing prerequisite: codex is not on PATH' \
  "${entry[@]}" --native codex --case paused-supplier --results-dir "${work}/refused"
[[ ! -e ${work}/refused ]]

# Substitute payloads whose host fails around the case's decisions.
native_comparison_pair_fixture "${source_dir}" "${work}"
baseline=${native_comparison_fixture_baseline}
silent=$(native_comparison_fixture_rule "${work}" completion silent)
interrupted=$(native_comparison_fixture_rule "${work}" completion interrupted)
stale=$(native_comparison_fixture_rule "${work}" completion stale)
unrecorded=$(native_comparison_fixture_rule "${work}" completion unrecorded)
# Runs pair NAME of BASELINE and CANDIDATE, which must end incomplete or not
# comparable (exit 1), and prints its record's path.
stopped_pair() {
  local status=0
  native_comparison_fixture_run "${work}" "$2" "$3" "$4" "$1" || status=$?
  if [[ ${status} -ne 1 ]]; then
    printf 'FAIL: the %s pair exited %s, not 1\n' "$1" "${status}" >&2
    cat -- "${work}/$1.out" "${work}/$1.err" >&2
    return 1
  fi
  printf '%s/record\n' "$(sed -n 's/^result-path: //p' "${work}/$1.out")"
}
# Prints the turns the substitute's session record of THREAD holds.
session_turns() {
  cat -- "${work}"/codex-home/sessions/*/*/*/rollout-*-"$1".jsonl | grep -c '"type":"turn_context"'
}
# Prints ARM's retained attempt directory of pair RECORD.
attempt() {
  printf '%s/results/%s\n' "${work}" "$(native_observation_value "$1" "$2-attempt")"
}

# The baseline's continuing turn leaves no stream after doing its work; the
# candidate's host exits in its first resumed turn. Neither is retried.
both=$(stopped_pair both "${silent}" "${interrupted}" concurrent)
grep -Fqx 'verdict: incomplete' "${both}"
grep -Fqx 'verdict-reason: the baseline arm did not complete its journey (turn 4 incomplete: missing terminal stream); no outcome or effort comparison is claimed' "${both}"
grep -Fqx 'baseline-stopped: turn 4 incomplete: missing terminal stream' "${both}"
grep -Fqx 'candidate-stopped: turn 2 failed: native command exited 1; truncated terminal stream' "${both}"
grep -Fqx "unknown: the baseline arm's turn 4: not observed (turn 4 incomplete: missing terminal stream)" "${both}"
grep -Fqx "unknown: the candidate arm's turns 2-4: not observed (turn 2 failed: native command exited 1; truncated terminal stream)" "${both}"
grep -Eq '^baseline-outcome: fail: turn 4 did not complete \(incomplete\)' "${both}"
grep -Fqx 'baseline-proof: observations.txt final-state.txt' "${both}"
grep -Fqx 'effort-difference: not computed: the pair is incomplete' "${both}"
grep -Eq '^effort-candidate: partial, turns 2-4 unobserved, counts cover observed turns only: 2 turns, ' "${both}"
grep -Eq '^effort-baseline: partial, turn 4 unobserved, ' "${both}"
grep -Fqx 'recovery: this record stays incomplete as observed; it claims no outcome, equivalence or saving' "${both}"
grep -Fq 'recovery: the candidate arm stopped (turn 2 failed: native command exited 1; truncated terminal stream); the runner neither retried nor resumed it' "${both}"
grep -Fqx "recovery: for a comparison, resolve the cause above and run a fresh pair of paused-supplier from the same frozen commits (--baseline ${silent} --candidate ${interrupted}) and the committed case basis; never resume a stopped session into this record" "${both}"
grep -Fqx 'evidence: not native (baseline and candidate routes: substitute substitute): a substitute host proves the runner, observer and judge only, never native behavior' "${both}"
# The unobserved turn's work stays in the retained final state, uncounted.
grep -Fqx 'turn-4-stopped: missing terminal stream' "$(attempt "${both}" baseline)/observations.txt"
grep -q 'repeat-verdict-stage' "$(attempt "${both}" baseline)/final-state.txt"
grep -Fqx 'turn-2-status: failed' "$(attempt "${both}" candidate)/observations.txt"
if grep -q '^turn-3-' "$(attempt "${both}" candidate)/observations.txt"; then
  echo 'FAIL: a turn ran after the interrupted one' >&2
  exit 1
fi
[[ -s $(attempt "${both}" candidate)/codex-session.jsonl && -s $(attempt "${both}" candidate)/events-turn-2.jsonl ]]
[[ $(session_turns "$(native_observation_value "${both}" baseline-thread)") -eq 4 ]]
[[ $(session_turns "$(native_observation_value "${both}" candidate-thread)") -eq 2 ]]
[[ -s $(dirname -- "${both}")/pair-observations.txt ]]

# A resumed turn whose stream names another thread is not this session's.
other=$(stopped_pair other "${baseline}" "${stale}" sequential)
thread=$(native_observation_value "${other}" candidate-thread)
grep -Fqx "candidate-stopped: turn 2 incomplete: the stream names thread 00000000-0000-4000-8000-00000057a1e0, not the resumed ${thread}: it is not this session's evidence" "${other}"
grep -Eq '^baseline-outcome: pass: ' "${other}"
grep -Fqx 'verdict: incomplete' "${other}"

# A host that keeps no session record leaves settings and workers unknown:
# both arms are assessed, and the pair is not comparable.
unknown=$(stopped_pair unknown "${baseline}" "${unrecorded}" concurrent)
grep -Fqx 'verdict: not-comparable' "${unknown}"
grep -Fqx "verdict-reason: the arms' settings were not matched (unavailable for the candidate arm)" "${unknown}"
grep -Eq '^baseline-outcome: pass: ' "${unknown}"
grep -Eq '^candidate-outcome: pass: ' "${unknown}"
grep -Fqx 'candidate-workers: unknown' "${unknown}"
grep -Fqx 'candidate-settings: unavailable' "${unknown}"
grep -Fqx "unknown: the candidate arm's applied settings and workers: the host left no readable session record" "${unknown}"
grep -Eq '^effort-candidate: [0-9]+ turns, .*, unknown workers, ' "${unknown}"
grep -Fqx 'effort-difference: not computed: the pair is not-comparable' "${unknown}"
grep -Fqx 'candidate-stopped: none' "${unknown}"

# A case prerequisite this host lacks stops the request before anything runs.
printf '%s\n' 'case_preflight() {' "  echo 'paused-supplier: this host lacks the fixture prerequisite' >&2" \
  '  return 1' '}' >> "${work}/source/Distribution/tests/native-comparison/paused-supplier/case.bash"
sessions=$(find "${work}/codex-home" -type f | wc -l)
attempts=$(find "${work}/results/codex" -mindepth 3 -maxdepth 3 | wc -l)
PATH=${work}/bin:${PATH} CODEX_HOME=${work}/codex-home refuse prerequisite \
  'missing prerequisite of case paused-supplier' "${native_comparison_fixture_entry[@]}" \
  --native codex --case paused-supplier --results-dir "${work}/results"
grep -Fqx 'paused-supplier: this host lacks the fixture prerequisite' "${work}/prerequisite.err"
[[ $(find "${work}/codex-home" -type f | wc -l) -eq ${sessions} ]]
[[ $(find "${work}/results/codex" -mindepth 3 -maxdepth 3 | wc -l) -eq ${attempts} ]]

# Kept comparison records are native evidence.
for record in "${source_dir}"/Distribution/tests/native-comparison/*/comparisons/*.txt; do
  if grep -Eq '^(evidence: not native|(baseline|candidate)-host: .*substitute)' "${record}"; then
    printf 'FAIL: kept comparison %s came from a substitute host\n' "${record}" >&2
    exit 1
  fi
done
