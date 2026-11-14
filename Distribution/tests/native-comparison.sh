#!/usr/bin/env bash
# The maintainer's entry to versioned native comparison cases
# (Distribution/tests/native-comparison/<case>/, each described by its case.md): real-work
# decisions with a neutral task, controlled events and a separate assessor.
#
# Usage:
#   Distribution/tests/native-comparison.sh
#   Distribution/tests/native-comparison.sh --list [--where TRAIT=TEXT]...
#   Distribution/tests/native-comparison.sh --native codex --case NAME [--results-dir DIR]
#     [--model MODEL] [--effort EFFORT] [--deadline SECONDS]
#   Distribution/tests/native-comparison.sh --native codex --case NAME --baseline REV
#     --candidate REV --factor TEXT --gain TEXT --quality TEXT
#     [--arms concurrent|sequential] [--payload-repo DIR] [--results-dir DIR]
#     [--model MODEL] [--effort EFFORT] [--deadline SECONDS]
#
# --list prints each case's selection traits (workflow, hosts,
# prerequisites, decisions-and-proof, duration); each --where keeps the cases
# whose TRAIT contains TEXT. --native codex runs one paid Codex journey of the
# named case with this checkout's working tree as the payload, or, with
# --baseline and --candidate, a paid pair: both revisions of --payload-repo
# (default this checkout) are frozen as commits, the factor under test, its
# intended gain and the quality criteria are recorded before either arm
# starts, and both arms run (concurrently by default) in fresh projects of one
# case basis with the same model and effort (default gpt-6.1-sol, xhigh, as
# the cases' source sessions ran; a turn's deadline defaults to 2400
# seconds). The pair's record is judged outcome first and printed; the
# command exits 0 with an outcome (preserved, improved, regressed,
# neither-passed) and 1 when the pair is incomplete or not comparable. Run a
# paid journey or pair only when a human authorizes it.
#
# Default mode is credential-free: the catalog, substitute-host pairs of the
# paused-supplier case through this command, and the pair judge's rejected
# cases. Each case's own credential-free proof is
# Distribution/tests/native-comparison-<case>.sh.
# shellcheck disable=SC1091,SC2034,SC2154,SC2249,SC2310,SC2312 # Sourced runner, pair and helper globals; journeys report their verdicts.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
source "${source_dir}/Distribution/tests/support/native-comparison-pair.sh"
source "${source_dir}/Distribution/tests/support/native-comparison-catalog.sh"

# Prints the Usage block of this header.
usage() {
  awk '/^# Usage:$/ { on = 1 } on && /^#$/ { exit } on { sub(/^# ?/, ""); print }' \
    "${BASH_SOURCE[0]}" >&2
  exit 2
}

host='' case_name='' results_dir='' model=gpt-6.1-sol effort=xhigh deadline=2400 list=false
where=() native_comparison_pair_baseline='' native_comparison_pair_candidate=''
native_comparison_pair_factor='' native_comparison_pair_gain='' native_comparison_pair_quality=''
native_comparison_pair_arms=concurrent native_comparison_pair_repository=${source_dir}
while (($#)); do
  case $1 in
    --list) list=true && shift && continue ;;
    --native | --case | --results-dir | --model | --effort | --deadline | --where | --baseline | \
      --candidate | --factor | --gain | --quality | --arms | --payload-repo)
      [[ $# -ge 2 && -n $2 ]] || usage
      ;;
    *) usage ;;
  esac
  case $1 in
    --native) host=$2 ;;
    --case) case_name=$2 ;;
    --results-dir) results_dir=$2 ;;
    --model) model=$2 ;;
    --effort) effort=$2 ;;
    --deadline) deadline=$2 ;;
    --where) where+=("$2") ;;
    --baseline) native_comparison_pair_baseline=$2 ;;
    --candidate) native_comparison_pair_candidate=$2 ;;
    --factor) native_comparison_pair_factor=$2 ;;
    --gain) native_comparison_pair_gain=$2 ;;
    --quality) native_comparison_pair_quality=$2 ;;
    --arms) native_comparison_pair_arms=$2 ;;
    --payload-repo) native_comparison_pair_repository=$2 ;;
  esac
  shift 2
done
# Any pair option selects pair mode.
pair_options=${native_comparison_pair_baseline}${native_comparison_pair_candidate}
pair_options+=${native_comparison_pair_factor}${native_comparison_pair_gain}${native_comparison_pair_quality}

if [[ ${list} == true ]]; then
  [[ -z ${host}${case_name}${results_dir}${pair_options} ]] || usage
  native_comparison_catalog "${source_dir}" "${where[@]}"
  exit
fi
if [[ -n ${host} ]]; then
  if [[ ${host} != codex || ! -f ${source_dir}/Distribution/tests/native-comparison/${case_name}/case.bash ||
    ! ${deadline} =~ ^[1-9][0-9]*$ || ${#where[@]} -gt 0 ]]; then
    usage
  fi
  results_dir=${results_dir:-$(mktemp -d)}
  native_result_require_writable "${results_dir}"
  native_case_deadline=${deadline}
  native_codex_settings=(-m "${model}" -c "model_reasoning_effort=\"${effort}\"")
  # Under TMPDIR, which a plain `mktemp -d` ignores on macOS: arms live here,
  # under a name that does not point the agent at this harness.
  work=$(mktemp -d "${TMPDIR:-/tmp}/tmp.XXXXXXXXXX")
  trap 'rm -rf -- "${work}"' EXIT
  status=0
  if [[ -z ${pair_options} ]]; then
    native_comparison_run_case "${case_name}" "${source_dir}" "${work}" \
      "${native_case_results_dir}" || status=$?
    cat -- "${work}/observations.txt"
    printf 'result-path: %s\n' "${native_comparison_attempt}"
    exit "${status}"
  fi
  [[ -n ${native_comparison_pair_baseline} && -n ${native_comparison_pair_candidate} &&
    -n ${native_comparison_pair_factor} && -n ${native_comparison_pair_gain} &&
    -n ${native_comparison_pair_quality} && ${native_comparison_pair_arms} =~ ^(concurrent|sequential)$ ]] || usage
  native_comparison_pair "${case_name}" "${source_dir}" "${work}" "${native_case_results_dir}" || exit 2
  cat -- "${native_comparison_pair_attempt}/record"
  printf 'result-path: %s\n' "${native_comparison_pair_attempt}"
  case ${native_comparison_verdict_outcome} in
    incomplete | not-comparable) exit 1 ;;
    *) exit 0 ;;
  esac
fi
[[ -z ${case_name}${results_dir}${pair_options} && ${#where[@]} -eq 0 ]] || usage

source "${source_dir}/Distribution/tests/support/native-comparison-verdict-counterexamples.sh"
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT
entry=("${BASH}" "${BASH_SOURCE[0]}")

# The catalog selects a case by its traits.
"${entry[@]}" --list > "${work}/catalog"
grep -Fqx 'paused-supplier' "${work}/catalog"
grep -Fqx 'doughnut-title-precedence' "${work}/catalog"
grep -Eq '^  (workflow|hosts|prerequisites|decisions-and-proof|duration): ' "${work}/catalog"
[[ $("${entry[@]}" --list --where hosts=codex --where workflow=blocked | grep -v '^ ') == paused-supplier ]]
[[ $("${entry[@]}" --list --where prerequisites=nix | grep -v '^ ') == doughnut-title-precedence ]]
if "${entry[@]}" --list --where workflow=no-such-workflow > /dev/null; then
  echo 'FAIL: a catalog filter that matches no case succeeded' >&2
  exit 1
fi

# Payload revisions: this checkout's commit, and commits whose installed
# guidance tells the substitute to hold more quietly (one command fewer per
# hold, same decisions) or to take a shortcut (push its branch, skip proof).
git clone -q --shared --no-checkout "${source_dir}" "${work}/payloads"
baseline=$(git -C "${source_dir}" rev-parse HEAD)
commit_rule() {
  git -C "${work}/payloads" checkout -q --detach "${baseline}"
  printf '\n<!-- paused-supplier-substitute-rule: %s -->\n' "$1" \
    >> "${work}/payloads/src/skills/dough-execute-plan/SKILL.md"
  git -C "${work}/payloads" -c user.name=Payload -c user.email=payload@example.invalid \
    commit -q -am "Substitute rule $1"
  git -C "${work}/payloads" rev-parse HEAD
}
quiet=$(commit_rule quiet)
shortcut=$(commit_rule shortcut)
mkdir -p -- "${work}/bin"
cp -- "${source_dir}/Distribution/tests/support/native-agent-paused-supplier.sh" "${work}/bin/codex"
chmod a+x "${work}/bin/codex"
# Runs a substitute pair of the paused-supplier case, BASELINE CANDIDATE ARMS
# NAME, into NAME.out and NAME.err; returns the command's status.
run_pair() {
  PATH="${work}/bin:${PATH}" CODEX_HOME="${work}/codex-home" "${entry[@]}" --native codex \
    --case paused-supplier --baseline "$1" --candidate "$2" --arms "$3" \
    --payload-repo "${work}/payloads" --factor 'substitute rule in the installed guidance' \
    --gain 'fewer commands per hold' --quality 'the case assessor passes before effort counts' \
    --model gpt-test --effort low --deadline 120 --results-dir "${work}/results" \
    > "${work}/$4.out" 2> "${work}/$4.err"
}
# Prints the record of a pair that must end with an outcome verdict.
pair() {
  run_pair "$@" || {
    printf 'FAIL: the %s pair did not reach an outcome\n' "$4" >&2
    cat -- "${work}/$4.out" "${work}/$4.err" >&2
    exit 1
  }
  printf '%s/record\n' "$(sed -n 's/^result-path: //p' "${work}/$4.out")"
}
value() {
  sed -n "s/^$2: //p" "$1"
}

# A quieter candidate keeps the outcome: both arms ran together, with their
# own frozen payloads, one case and project basis, the same settings and
# their own sessions, and the record names each of them.
preserved=$(pair "${baseline}" "${quiet}" concurrent preserved)
grep -Fqx 'verdict: preserved' "${preserved}"
[[ $(value "${preserved}" baseline-payload) == "${baseline} tree=$(git -C "${source_dir}" rev-parse "${baseline}^{tree}") requested=${baseline}" ]]
[[ $(value "${preserved}" candidate-payload) == "${quiet} tree="*" requested=${quiet}" ]]
digest=$(value "${preserved}" baseline-payload-digest)
[[ ${digest} =~ ^[0-9a-f]{64}$ && ${digest} != "$(value "${preserved}" candidate-payload-digest)" ]]
for condition in basis project-basis host settings events; do
  grep -Fqx "condition-${condition}: same" "${preserved}"
done
[[ $(value "${preserved}" baseline-project-basis) =~ ^main=[0-9a-f]{40}\ supplier=[0-9a-f]{40}\ consumer=[0-9a-f]{40}\ partial=[0-9a-f]{40}$ ]]
grep -Fqx 'baseline-settings: model=gpt-test effort=low sandbox=danger-full-access approval=never' "${preserved}"
[[ $(value "${preserved}" baseline-thread) =~ ^0{8}- && $(value "${preserved}" baseline-thread) != "$(value "${preserved}" candidate-thread)" ]]
grep -Fqx 'arms: concurrent' "${preserved}"
grep -Fq "case-input-hash: $(shasum -a 256 "${source_dir}/Distribution/tests/native-comparison/paused-supplier/assess.bash" | cut -d ' ' -f 1) Distribution/tests/native-comparison/paused-supplier/assess.bash" "${preserved}"
cmp -s "${source_dir}/Distribution/tests/native-comparison/paused-supplier/task.txt" \
  "$(dirname -- "${preserved}")/case-basis/Distribution/tests/native-comparison/paused-supplier/task.txt"
# The criteria were recorded before either arm's sessions.
[[ $(grep -n '^quality-criteria: ' "${preserved}" | cut -d : -f 1) -lt $(grep -n '^baseline-attempt: ' "${preserved}" | cut -d : -f 1) ]]
for arm in baseline candidate; do
  record="${work}/results/$(value "${preserved}" "${arm}-attempt")/record"
  grep -q "^codex-session-file: ${work}/codex-home/sessions/" "${record}"
  grep -Fqx "payload-revision: $(value "${preserved}" "${arm}-payload" | cut -d ' ' -f 1)" "${record}"
done
# Each held wake is an empty one; the quieter candidate spends one command
# on each where the baseline spends two.
grep -Eq '^effort-baseline: 4 turns, 3 wakes \(2 empty: 4 commands, ' "${preserved}"
grep -Eq '^effort-candidate: 4 turns, 3 wakes \(2 empty: 2 commands, ' "${preserved}"
grep -Fqx 'effort-difference: candidate -3 commands' <(cut -d , -f 1 "${preserved}" | grep '^effort-difference: ')
grep -q '^effort-unavailable: tokens and cost' "${preserved}"

# A cheaper candidate that pushes and skips its proof regresses the outcome;
# its push leaves the baseline arm's remote unchanged.
regressed=$(pair "${baseline}" "${shortcut}" sequential regressed)
grep -Fqx 'verdict: regressed' "${regressed}"
grep -Fqx 'candidate-outcome: fail: turn 4 changed the remote' "${regressed}"
grep -Eq '^baseline-outcome: pass: ' "${regressed}"
grep -Eq '^effort-difference: candidate -[0-9]+ commands' "${regressed}"
grep -q '^effort-standing: not a gain: the outcome is regressed' "${regressed}"
grep -Fqx 'turn-4-remote: changed' "${work}/results/$(value "${regressed}" candidate-attempt)/observations.txt"
grep -Fqx 'turn-4-remote: unchanged' "${work}/results/$(value "${regressed}" baseline-attempt)/observations.txt"

# A revision that names no commit stops before any arm starts.
status=0
run_pair "${baseline}" no-such-revision concurrent invalid || status=$?
[[ ${status} -eq 2 ]]
grep -q 'the candidate payload no-such-revision names no commit' "${work}/invalid.err"
[[ $(find "${work}/results/codex/native-comparison-pair" -mindepth 2 -maxdepth 2 | wc -l) -eq 2 ]]

# The pair judge's outcomes and rejected cases, from the preserved pair.
native_comparison_verdict_counterexamples "$(dirname -- "${preserved}")/pair-observations.txt" "${work}"
