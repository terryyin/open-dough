#!/usr/bin/env bash
# A matched pair of journeys of one versioned comparison case: a baseline and
# a candidate Open Dough payload, each a commit frozen and materialized before
# either arm starts, run through the case runner
# (Distribution/tests/support/native-comparison-run.sh) in fresh arms under one case
# basis, host and settings, then judged outcome first
# (Distribution/tests/support/native-comparison-verdict.sh). Each arm keeps its own root,
# workspace, remote, session state and retained attempt; the pair keeps a
# compact record of its basis, conditions, criteria, sessions, outcomes,
# proof references, whether its evidence is native, effort, unknowns,
# recovery and measurement limits. The pair observer
# (native-comparison-pair-observe.sh) reads each arm.
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
source "${native_comparison_pair_dir}/native-comparison-pair-observe.sh"
source "${native_comparison_pair_dir}/native-comparison-verdict.sh"
source "${native_comparison_pair_dir}/native-comparison-basis.sh"
source "${native_comparison_pair_dir}/native-comparison-baseline-acquisition.sh"

native_comparison_pair_inputs=(
  Distribution/tests/support/native-comparison-pair.sh
  Distribution/tests/support/native-comparison-pair-observe.sh
  Distribution/tests/support/native-comparison-verdict.sh
  Distribution/tests/support/native-comparison-basis.sh
  Distribution/tests/support/native-comparison-baseline-acquisition.sh
  Distribution/tests/support/native-comparison-baseline-acquisition.mjs
  Distribution/tests/support/native-comparison-baseline-applicability.mjs
  Distribution/tests/support/native-comparison-baseline-projection.mjs
  Distribution/tests/support/native-comparison-settings.mjs
)

native_comparison_pair_attempt=
native_comparison_pair_basis_revision=

# Leaves arm_status, arm_reason and arm_attempt from ARM's verdict under WORK
# (the runner's three lines), each empty when the arm left none.
native_comparison_pair_arm_verdict() {
  arm_status='' arm_reason='' arm_attempt=''
  { read -r arm_status && read -r arm_reason && read -r arm_attempt; } 2> /dev/null < "$1/$2/verdict" || true
}

# Prints the commit that ARM's payload revision REV names in REPOSITORY, or
# an `error:` line saying it names none.
native_comparison_pair_commit() {
  local repository=$1 arm=$2 rev=$3
  git -C "${repository}" rev-parse -q --verify "${rev}^{commit}" 2> /dev/null || {
    printf 'error: the %s payload %s names no commit in %s\n' "${arm}" "${rev}" "${repository}" >&2
    return 1
  }
}

# Freezes revision REV of the payload repository as ARM's payload under WORK:
# its commit, its tree and its files, materialized once.
native_comparison_pair_freeze() {
  local arm=$1 rev=$2 work=$3 repository=${native_comparison_pair_repository}
  local commit
  commit=$(native_comparison_pair_commit "${repository}" "${arm}" "${rev}") || return
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

native_comparison_pair() {
  local case_name=$1 source_dir=$2 work=$3 results_dir=$4 arm condition case_files events empty_events
  local case_path="${source_dir}/Distribution/tests/native-comparison/${case_name}" observations dest
  native_comparison_pair_attempt=
  # The case basis both arms must run: its files and the runner's inputs,
  # committed, so the record can name the commit that holds them.
  native_comparison_case_files "${source_dir}" "${case_name}" || return 2
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
  native_comparison_baseline_acquire "${case_name}" "${source_dir}" "${work}" "${dest}"
  if [[ ${native_comparison_baseline_reused} == true ]]; then
    native_comparison_pair_arm "${case_name}" "${source_dir}" "${work}" "${results_dir}" candidate
  elif [[ ${native_comparison_pair_arms} == concurrent ]]; then
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
  native_comparison_baseline_finish
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
  printf 'machine: %s\n' "$(native_comparison_machine)"
  sed 's/^input-hash:/case-input-hash:/' "${work}/basis"
  native_result_input_hash_lines "${native_comparison_pair_inputs[@]}"
}

# The record's arms, outcomes, proof, evidence kind, verdict, effort,
# unknowns, recovery and limits.
native_comparison_pair_report() {
  local work=$1 source_dir=$2 results_dir=$3 observations=$4 arm record file proof workers routes
  local arm_status arm_reason arm_attempt
  for arm in baseline candidate; do
    native_comparison_pair_arm_verdict "${work}" "${arm}"
    record="${arm_attempt:-/dev/null/none}/record"
    file=${arm_attempt#"${results_dir}/"}
    printf '%s-attempt: %s\n' "${arm}" "${file:-none retained}"
    printf '%s-thread: %s\n' "${arm}" "$(sed -n 's/^thread: //p' "${record}" 2> /dev/null | grep . || echo unknown)"
    workers=$(awk '$1 == "codex-worker:" { printf "%s%s", n++ ? " " : "", $2 }' "${record}" 2> /dev/null) || true
    [[ $(native_observation_field "${observations}" "${arm}-workers") != unknown ]] || workers=unknown
    printf '%s-workers: %s\n' "${arm}" "${workers:-none}"
    printf '%s-payload-digest: %s\n' "${arm}" "$(sed -n 's/^payload-digest: //p' "${record}" 2> /dev/null)"
    printf '%s-project-basis: %s\n' "${arm}" "$(sed -n 's/^project-basis: //p' "${record}" 2> /dev/null)"
    printf '%s-settings: %s\n' "${arm}" "$(paste -sd ';' "${work}/${arm}.compare/settings" | grep . || echo unavailable)"
    printf '%s-host: %s\n' "${arm}" "$(sed -n 's/^native-version: //p' "${record}" 2> /dev/null)"
    printf '%s-load: %s to %s\n' "${arm}" "$(sed -n 's/^host-load-start: //p' "${record}" 2> /dev/null)" \
      "$(sed -n 's/^host-load-end: //p' "${record}" 2> /dev/null)"
    printf '%s-outcome: %s: %s\n' "${arm}" "${arm_status:-none}" "${arm_reason:-the arm left no verdict}"
    printf '%s-stopped: %s\n' "${arm}" "$(native_observation_value "${observations}" "${arm}-stopped")"
    proof=()
    for file in observations.txt final-state.txt case-evidence; do
      [[ -z ${arm_attempt} || ! -e ${arm_attempt}/${file} ]] || proof+=("${file}")
    done
    printf '%s-proof: %s\n' "${arm}" "${proof[*]:-none}"
  done
  cat -- "${native_comparison_pair_attempt}/baseline-acquisition.txt"
  # Only the Codex runtime in the harness sandbox is native evidence.
  routes=$(awk '$1 ~ /^(baseline|candidate)-route:$/ { printf "%s%s", n++ ? " " : "", $2 }' "${observations}")
  if [[ ${routes} == 'native native' ]]; then
    printf 'evidence: native: both arms ran the codex runtime in the harness sandbox\n'
  else
    printf 'evidence: not native (baseline and candidate routes: %s): a substitute host proves the runner, observer and judge only, never native behavior\n' "${routes}"
  fi
  printf 'verdict: %s\nverdict-reason: %s\n' "${native_comparison_verdict_outcome}" "${native_comparison_verdict_reason}"
  grep -E '^(basis|project-basis|host|settings|events|criteria): ' "${observations}" | sed 's/^/condition-/'
  native_comparison_verdict_effort "${observations}"
  native_comparison_verdict_unknowns "${observations}"
  native_comparison_verdict_recovery "${observations}"
  printf 'measurement-limit: %s\n' \
    'one pair of stochastic sessions supports its observed comparison only' \
    'wall-clock seconds include host load and service latency; see each arm'"'"'s load' \
    'recoveries and interventions count what the runner did: it never retries a turn, and Codex exec runs without approval prompts'
}
