#!/usr/bin/env bash
# A matched pair of journeys of one versioned comparison case: a baseline and
# a candidate Open Dough payload, each a commit frozen and materialized before
# either arm starts, run through the case runner
# (Distribution/tests/support/native-comparison-run.sh) in fresh arms under one case
# basis, host and settings, then judged outcome first
# (Distribution/tests/support/native-comparison-verdict.sh). Each arm keeps its own root,
# workspace, remote, session state and retained attempt; the pair keeps a
# compact record of its basis, conditions, criteria, sessions, outcomes,
# proof references, effort and measurement limits.
#
#   native_comparison_pair CASE SOURCE_DIR WORK RESULTS_DIR
#
# The caller sets native_comparison_pair_repository (where both revisions
# live), _baseline and _candidate (revisions), _factor, _gain and _quality
# (declared before any arm starts) and _arms (sequential or concurrent), with
# native_codex_settings for both arms. Fails without starting an arm when the
# case basis is not committed in SOURCE_DIR (native-comparison-basis.sh), so
# the record names the commit that holds it, or when a revision names no
# commit. Leaves native_comparison_pair_attempt (the retained pair directory)
# and the judge's native_comparison_verdict_*.
# shellcheck disable=SC1090,SC1091,SC2034,SC2154,SC2312 # Sourced case and helper globals; fields print as observed.

native_comparison_pair_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "${native_comparison_pair_dir}/native-comparison-run.sh"
source "${native_comparison_pair_dir}/native-comparison-verdict.sh"
source "${native_comparison_pair_dir}/native-comparison-basis.sh"

native_comparison_pair_inputs=(
  Distribution/tests/support/native-comparison-pair.sh
  Distribution/tests/support/native-comparison-verdict.sh
  Distribution/tests/support/native-comparison-basis.sh
)

native_comparison_pair_attempt=
native_comparison_pair_basis_revision=

# Leaves arm_status, arm_reason and arm_attempt from ARM's verdict under WORK
# (the runner's three lines), each empty when the arm left none.
native_comparison_pair_arm_verdict() {
  arm_status='' arm_reason='' arm_attempt=''
  { read -r arm_status && read -r arm_reason && read -r arm_attempt; } 2> /dev/null < "$1/$2/verdict" || true
}

# Freezes revision REV of the payload repository as ARM's payload under WORK:
# its commit, its tree and its files, materialized once.
native_comparison_pair_freeze() {
  local arm=$1 rev=$2 work=$3 repository=${native_comparison_pair_repository}
  local commit
  commit=$(git -C "${repository}" rev-parse -q --verify "${rev}^{commit}") || {
    printf 'error: the %s payload %s names no commit in %s\n' "${arm}" "${rev}" "${repository}" >&2
    return 1
  }
  mkdir -p -- "${work}/payload-${arm}"
  git -C "${repository}" archive "${commit}" | tar -x -C "${work}/payload-${arm}" || return
  printf '%s %s %s\n' "${commit}" "$(git -C "${repository}" rev-parse "${commit}^{tree}")" \
    "${rev}" > "${work}/payload-${arm}.id"
}

# Runs ARM's journey under WORK/ARM with its frozen payload.
native_comparison_pair_arm() {
  local case_name=$1 source_dir=$2 work=$3 results_dir=$4 arm=$5
  local native_comparison_payload_dir="${work}/payload-${arm}" native_comparison_payload_revision
  local tree native_comparison_payload_requested
  read -r native_comparison_payload_revision tree native_comparison_payload_requested \
    < "${work}/payload-${arm}.id"
  mkdir -p -- "${work}/${arm}"
  native_comparison_run_case "${case_name}" "${source_dir}" "${work}/${arm}" "${results_dir}" \
    > "${work}/${arm}/run.log" 2>&1 || true
}

# Prints ARM's pair fields from its observations and retained record, and
# leaves the facts compared across arms in WORK/ARM.compare/.
native_comparison_pair_observe_arm() {
  local work=$1 arm=$2 turns=$3 empty_events=$4 observations record compare
  local arm_status arm_reason arm_attempt
  observations="${work}/${arm}/observations.txt"
  native_comparison_pair_arm_verdict "${work}" "${arm}"
  record="${arm_attempt}/record"
  compare="${work}/${arm}.compare"
  mkdir -p -- "${compare}"
  [[ -f ${observations} ]] || observations=/dev/null
  [[ -n ${arm_attempt} && -f ${record} ]] || record=/dev/null
  # A fact an arm lacks leaves its file empty.
  grep '^input-hash: ' "${record}" > "${compare}/basis" || true
  grep '^project-basis: ' "${record}" > "${compare}/project-basis" || true
  grep -E '^native-(executable|version): ' "${record}" > "${compare}/host" || true
  { grep '^codex-turn-settings: ' "${record}" || true; } \
    | sed -E 's/^codex-turn-settings: [0-9]+x //; s/ cwd=.*//' | LC_ALL=C sort -u > "${compare}/settings"
  grep -E '^turn-[0-9]+-event: ' "${observations}" > "${compare}/events" || true
  awk -v arm="${arm}" -v turns="${turns}" -v empty=" ${empty_events} " -v record="${record}" \
    -v payload="$(cut -d ' ' -f 1 "${work}/payload-${arm}.id")" '
    FILENAME == record {
      if ($1 == "codex-worker:") workers++
      next
    }
    $1 == "materialization:" { failed = 1 }
    match($1, /^turn-[0-9]+-/) {
      n = substr($1, 6) + 0; key = substr($1, RLENGTH + 1); sub(/:$/, "", key)
      if (key == "status") { seen++; if ($2 == "completed") completed++ }
      if (key == "commands") { commands += $2; cmd[n] = $2 }
      if (key == "seconds") sec[n] = $2
      if (key == "event") event[n] = $2
    }
    $1 == "assessment-status:" { assessment = $2 }
    $1 == "preparation-seconds:" { preparation = $2 }
    $1 == "total-seconds:" { total = $2 }
    END {
      for (n in event) if (index(empty, " " event[n] " ")) { empties++; empty_commands += cmd[n]; empty_seconds += sec[n] }
      complete = (!failed && completed == turns && seen == turns && assessment != "") ? "yes" : "no"
      verdict = assessment == "" ? "missing" : assessment == "pass" ? "passed" : "failed"
      printf "%s-payload: %s\n%s-complete: %s\n%s-assessment: %s\n", arm, payload, arm, complete, arm, verdict
      printf "%s-turns: %d\n%s-wakes: %d\n%s-empty-wakes: %d\n", arm, seen, arm, (seen > 0 ? seen - 1 : 0), arm, empties
      printf "%s-empty-wake-commands: %d\n%s-empty-wake-seconds: %.1f\n", arm, empty_commands, arm, empty_seconds
      printf "%s-commands: %d\n%s-seconds: %.1f\n%s-preparation-seconds: %.1f\n", arm, commands, arm, total, arm, preparation
      printf "%s-workers: %d\n%s-recoveries: 0\n%s-interventions: 0\n", arm, workers, arm, arm
    }' "${observations}" "${record}"
}

# Prints `same`, or how the arms' compared FACT differs or is unknown. Only
# the event sequence may be empty: a case without events has none.
native_comparison_pair_match() {
  local work=$1 fact=$2 b="$1/baseline.compare" c="$1/candidate.compare"
  if [[ ${fact} != events && (! -s ${b}/${fact} || ! -s ${c}/${fact}) ]]; then
    echo unavailable
  elif cmp -s "${b}/${fact}" "${c}/${fact}" \
    && { [[ ${fact} != basis ]] || cmp -s "${b}/basis" "${work}/basis"; }; then
    echo same
  else
    echo differs
  fi
}

native_comparison_pair() {
  local case_name=$1 source_dir=$2 work=$3 results_dir=$4 arm condition case_files events empty_events
  local case_path="${source_dir}/Distribution/tests/native-comparison/${case_name}" observations dest
  native_comparison_pair_attempt=
  # The case basis both arms must run: its files and the runner's inputs,
  # committed, so the record can name the commit that holds them.
  native_comparison_case_files "${source_dir}" "${case_name}"
  native_comparison_pair_basis_revision=$(native_comparison_basis_commit "${source_dir}" \
    "Distribution/tests/native-comparison/${case_name}" "${case_files[@]}" "${native_comparison_inputs[@]}" \
    "${native_run_supervision_inputs[@]}" "${native_comparison_pair_inputs[@]}") || return
  native_comparison_pair_freeze baseline "${native_comparison_pair_baseline}" "${work}" \
    && native_comparison_pair_freeze candidate "${native_comparison_pair_candidate}" "${work}" \
    || return
  # The case's events and those that leave nothing to continue.
  { read -r events && read -r empty_events; } < <(source "${case_path}/case.bash" \
    && printf '%s\n%s\n' "${case_events}" "${case_empty_events-}")
  read -ra events <<< "${events}"
  {
    native_result_input_hash_lines "${case_files[@]}" "${native_comparison_inputs[@]}"
    native_result_supervision_input_hash_lines
  } > "${work}/basis"
  native_result_allocate_attempt "${results_dir}" codex "native-comparison-pair/${case_name}"
  dest=${native_result_attempt_dir}
  native_comparison_pair_attempt=${dest}
  # The exact case content, kept with the pair whether or not it is committed.
  mkdir -p -- "${dest}/case-basis"
  (cd -- "${source_dir}" && tar -cf - "${case_files[@]}") | tar -xf - -C "${dest}/case-basis"
  native_comparison_pair_declare "${case_name}" "${source_dir}" "${work}" > "${dest}/record"
  if [[ ${native_comparison_pair_arms} == concurrent ]]; then
    native_comparison_pair_arm "${case_name}" "${source_dir}" "${work}" "${results_dir}" baseline &
    native_comparison_pair_arm "${case_name}" "${source_dir}" "${work}" "${results_dir}" candidate &
    wait
  else
    for arm in baseline candidate; do
      native_comparison_pair_arm "${case_name}" "${source_dir}" "${work}" "${results_dir}" "${arm}"
    done
  fi
  observations="${dest}/pair-observations.txt"
  {
    printf 'case: %s\n' "${case_name}"
    for arm in baseline candidate; do
      native_comparison_pair_observe_arm "${work}" "${arm}" "$((${#events[@]} + 1))" "${empty_events}"
    done
    printf 'basis: %s\n' "$(native_comparison_pair_match "${work}" basis)"
    for condition in project-basis host settings events; do
      printf '%s: %s\n' "${condition}" "$(native_comparison_pair_match "${work}" "${condition}")"
    done
  } > "${observations}"
  native_comparison_judge "${observations}"
  native_comparison_pair_report "${work}" "${source_dir}" "${results_dir}" "${observations}" >> "${dest}/record"
}

# The record's basis and declared criteria, written before either arm starts.
native_comparison_pair_declare() {
  local case_name=$1 source_dir=$2 work=$3 arm commit tree requested
  printf 'comparison: %s\n' "${case_name}"
  printf 'declared-at: %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf 'factor: %s\nintended-gain: %s\nquality-criteria: %s\n' "${native_comparison_pair_factor}" \
    "${native_comparison_pair_gain}" "${native_comparison_pair_quality}"
  printf 'case-basis-revision: %s\n' "${native_comparison_pair_basis_revision}"
  for arm in baseline candidate; do
    read -r commit tree requested < "${work}/payload-${arm}.id"
    printf '%s-payload: %s tree=%s requested=%s\n' "${arm}" "${commit}" "${tree}" "${requested}"
  done
  printf 'host: codex\n'
  printf 'requested-settings: %s\n' "${native_codex_settings[*]:-host defaults}"
  printf 'arms: %s\n' "${native_comparison_pair_arms}"
  printf 'machine: %s, %s cores, %s\n' "$(uname -sm)" "$(getconf _NPROCESSORS_ONLN)" \
    "$(pmset -g batt 2> /dev/null | sed -n "1s/^Now drawing from '\(.*\)'$/\1/p" | grep . || echo 'power unknown')"
  sed 's/^input-hash:/case-input-hash:/' "${work}/basis"
  native_result_input_hash_lines "${native_comparison_pair_inputs[@]}"
}

# The record's arms, outcomes, proof, verdict, effort and limits.
native_comparison_pair_report() {
  local work=$1 source_dir=$2 results_dir=$3 observations=$4 arm record file proof
  local arm_status arm_reason arm_attempt
  for arm in baseline candidate; do
    native_comparison_pair_arm_verdict "${work}" "${arm}"
    record="${arm_attempt}/record"
    printf '%s-attempt: %s\n' "${arm}" "${arm_attempt#"${results_dir}/"}"
    printf '%s-thread: %s\n' "${arm}" "$(sed -n 's/^thread: //p' "${record}" 2> /dev/null | grep . || echo unknown)"
    printf '%s-workers: %s\n' "${arm}" "$(awk '$1 == "codex-worker:" { printf "%s%s", n++ ? " " : "", $2 }' "${record}" 2> /dev/null | grep . || echo none)"
    printf '%s-payload-digest: %s\n' "${arm}" "$(sed -n 's/^payload-digest: //p' "${record}" 2> /dev/null)"
    printf '%s-project-basis: %s\n' "${arm}" "$(sed -n 's/^project-basis: //p' "${record}" 2> /dev/null)"
    printf '%s-settings: %s\n' "${arm}" "$(paste -sd ';' "${work}/${arm}.compare/settings" | grep . || echo unavailable)"
    printf '%s-host: %s\n' "${arm}" "$(sed -n 's/^native-version: //p' "${record}" 2> /dev/null)"
    printf '%s-load: %s to %s\n' "${arm}" "$(sed -n 's/^host-load-start: //p' "${record}" 2> /dev/null)" \
      "$(sed -n 's/^host-load-end: //p' "${record}" 2> /dev/null)"
    printf '%s-outcome: %s: %s\n' "${arm}" "${arm_status}" "${arm_reason}"
    proof=()
    for file in observations.txt final-state.txt case-evidence; do
      [[ ! -e ${arm_attempt}/${file} ]] || proof+=("${file}")
    done
    printf '%s-proof: %s\n' "${arm}" "${proof[*]:-none}"
  done
  printf 'verdict: %s\nverdict-reason: %s\n' "${native_comparison_verdict_outcome}" "${native_comparison_verdict_reason}"
  grep -E '^(basis|project-basis|host|settings|events): ' "${observations}" | sed 's/^/condition-/'
  native_comparison_verdict_effort "${observations}"
  printf 'measurement-limit: %s\n' \
    'one pair of stochastic sessions supports its observed comparison only' \
    'wall-clock seconds include host load and service latency; see each arm'"'"'s load' \
    'recoveries and interventions count what the runner did: it never retries a turn, and Codex exec runs without approval prompts'
}
