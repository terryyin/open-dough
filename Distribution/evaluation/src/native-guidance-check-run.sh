#!/usr/bin/env bash
# One native journey of a versioned guidance-check case
# (Distribution/evaluation/cases/guidance-checks/<case>/): materialize its
# project and payload, start one Codex session with the neutral task,
# then for each controlled event change the environment and continue the
# same session with the case's wake message (wake.txt; a case without events
# needs none). After each turn the case observes. After cleanup, its
# assessor judges the observations and the attempt is
# retained with its exact input identities (native-guidance-check-retain.sh).
# The assessor and controller files stay outside the agent's workspace.
#
# A turn that does not complete stops the journey: its `turn-N-stopped:`
# field names why (deadline, the host's exit, a missing, truncated or
# unreadable stream, or a stream naming no thread or another session's), the
# later turns never run, and the runner neither retries nor resumes it. A
# journey that cannot start (no codex on PATH, checked before the case
# materializes, failed materialization or a refused route) records
# `unstarted: REASON` and retains no attempt. On an interrupt the arm stops
# its host session, cleans up, and ends before assessment or another turn.
#
#   native_guidance_check_run_case CASE SOURCE_DIR WORK [RESULTS_DIR]
#
# The Open Dough payload installed is SOURCE_DIR's working tree unless
# native_guidance_check_payload_dir names a frozen one, with its commit in
# native_guidance_check_payload_revision and the revision the caller asked for in
# native_guidance_check_payload_requested.
#
# A case's case.bash defines case_events (its event names in order; those in
# the optional case_empty_events leave nothing to continue, for effort),
# case_materialize ROOT PAYLOAD_DIR HOST (builds ROOT/workspace, may export
# the environment the agent's commands need, and leaves case_project_basis,
# the identities of the project it built; when it fails, no session starts),
# case_apply_event ROOT EVENT SCRATCH, case_observe ROOT TURN STREAM SCRATCH
# HARNESS (which may keep raw evidence in SCRATCH/case-evidence for
# retention) and optionally case_cleanup ROOT. Once materialization starts,
# cleanup runs once even on an early exit and prints its own fields. The case's
# assess.bash defines case_assess OBSERVATIONS, leaving case_assess_status
# and case_assess_reason.
# Optional case_prepare_run ROOT SCRATCH may refuse before any model starts.
# case_prepare_turn ROOT TURN STREAM SCRATCH may supply the supervisor's
# native_run_controller_command; case_observe_stopped observes an ended attempt.
#
# Leaves native_guidance_check_status (pass or fail), _reason and _attempt (the
# retained attempt directory, when RESULTS_DIR is given). Codex only so far;
# a credential-free test may put a substitute `codex` first on PATH, whose
# session records are read only under CODEX_HOME.
# shellcheck disable=SC1090,SC1091,SC2030,SC2031,SC2034,SC2154,SC2312 # Sourced case and helper globals; the journey runs and retains in one subshell.

native_guidance_check_runtime_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "${native_guidance_check_runtime_dir}/native-run-supervise.sh"
source "${native_guidance_check_runtime_dir}/native-codex.sh"
source "${native_guidance_check_runtime_dir}/native-observation.sh"
source "${native_guidance_check_runtime_dir}/native-result-retain.sh"
source "${native_guidance_check_runtime_dir}/../cases/delivery-evidence/delivery-evidence-native-payload.sh"
source "${native_guidance_check_runtime_dir}/native-guidance-check-retain.sh"
source "${native_guidance_check_runtime_dir}/native-guidance-check-turn.sh"

# The files that decide how a case journey runs, beside the case's own files.
native_guidance_check_inputs=(
  Distribution/evaluation/src/native-guidance-check-run.sh
  Distribution/evaluation/src/native-guidance-check-turn.sh
  Distribution/evaluation/src/native-guidance-check-retain.sh
  Distribution/evaluation/src/native-codex.sh
  Distribution/evaluation/src/native-codex-session.mjs
  Distribution/evaluation/src/native-observation.sh
  Distribution/evaluation/cases/delivery-evidence/delivery-evidence-native-payload.sh
)

native_guidance_check_now() {
  printf '%s\n' "${EPOCHREALTIME/./}"
}

# The host's load averages, as each record shows them at start and end.
native_guidance_check_load() {
  node -p 'require("node:os").loadavg().map(load => load.toFixed(2)).join(" ")'
}

native_guidance_check_seconds() {
  awk -v start="$1" -v end="$2" 'BEGIN { printf "%.1f\n", (end - start) / 1000000 }'
}

# Ends a journey that started no session, in WORK, for REASON: its
# observations and verdict say so, and nothing is retained.
native_guidance_check_unstarted() {
  observations="$2/observations.txt"
  printf 'case: %s\nunstarted: %s\n' "$1" "$3" > "${observations}"
  printf '%s\n' fail "$3; no session started" '' > "$2/verdict"
}

native_guidance_check_arms=()
native_guidance_check_launching=false
native_guidance_check_interrupt_status=0

native_guidance_check_start_arm() {
  local shell_options=$-
  native_guidance_check_launching=true
  # Only the entry receives terminal INT. Each arm gets one forwarded TERM.
  set -m
  (
    set +m
    native_guidance_check_arm "$@"
  ) <&0 &
  native_guidance_check_arms+=("$!")
  [[ ${shell_options} == *m* ]] || set +m
  native_guidance_check_launching=false
  ((native_guidance_check_interrupt_status == 0)) \
    || native_guidance_check_interrupt "${native_guidance_check_interrupt_status}"
}

native_guidance_check_wait_arms() {
  local status=0
  while ((${#native_guidance_check_arms[@]})); do
    wait "${native_guidance_check_arms[0]}" || status=$?
    native_guidance_check_arms=("${native_guidance_check_arms[@]:1}")
  done
  return "${status}"
}

native_guidance_check_interrupt() {
  local pid status=$1
  native_guidance_check_interrupt_status=${status}
  # If a signal interrupted the launch, the entry must first record the child.
  [[ ${native_guidance_check_launching} == false ]] || return 0
  trap '' INT TERM
  for pid in "${native_guidance_check_arms[@]}"; do
    kill -TERM "${pid}" 2> /dev/null || true
  done
  native_guidance_check_wait_arms || true
  exit "${status}"
}

native_guidance_check_cleanup() {
  [[ ${cleanup_pending:-false} == true ]] || return 0
  if declare -F case_cleanup > /dev/null; then
    # Let a cleanup already in progress finish before acting on another signal.
    local cleanup_interrupt=0
    trap 'cleanup_interrupt=130' INT
    trap 'cleanup_interrupt=143' TERM
    cleanup_pending=false
    case_cleanup "${root}" >> "${observations}"
    trap 'exit 130' INT
    trap 'exit 143' TERM
    ((cleanup_interrupt == 0)) || exit "${cleanup_interrupt}"
  fi
}

native_guidance_check_arm() {
  local case_name=$1 source_dir=$2 work=$3 results_dir=${4-}
  local case_path="${source_dir}/Distribution/evaluation/cases/guidance-checks/${case_name}"
  local root observations start prepared turn=1 event prompt wake cleanup_pending=false
  unset -f case_cleanup case_prepare_run case_prepare_turn case_adjust_overlay case_observe_stopped
  source "${case_path}/case.bash"
  source "${case_path}/assess.bash"
  start=$(native_guidance_check_now)
  # A neutral name: the agent sees this path.
  root=$(mktemp -d "${work}/nc.XXXXXX")
  native_guidance_check_controller=$(mktemp -d "${work}/controller.XXXXXX")
  native_guidance_check_workspace="${root}/workspace"
  observations="${native_guidance_check_controller}/observations.txt"
  native_stderr="${native_guidance_check_controller}/stderr.log"
  platform=codex
  : > "${native_stderr}"
  native_guidance_check_load_start=$(native_guidance_check_load)
  if ! native_run_require_host; then
    native_guidance_check_unstarted "${case_name}" "${work}" 'no codex is on PATH'
    exit 0
  fi
  trap 'exit 130' INT
  trap 'exit 143' TERM
  trap native_guidance_check_cleanup EXIT
  cleanup_pending=true
  if ! case_materialize "${root}" "${native_guidance_check_payload_dir:-${source_dir}}" codex; then
    native_guidance_check_unstarted "${case_name}" "${work}" 'the case could not be materialized'
    exit 0
  fi
  native_guidance_check_basis_head=$(git -C "${native_guidance_check_workspace}" rev-parse HEAD)
  prepared=$(native_guidance_check_now)
  # The installed payload, before the agent can commit or change it.
  native_guidance_check_payload_digest=$(cd -- "${native_guidance_check_workspace}" \
    && git ls-files --others --modified --exclude-standard -- .agents .claude \
    | LC_ALL=C sort | xargs shasum -a 256 | shasum -a 256 | cut -d ' ' -f 1)
  prompt=$(< "${case_path}/task.txt")
  wake=
  [[ ! -f ${case_path}/wake.txt ]] || wake=$(< "${case_path}/wake.txt")
  native_codex_prepare "${root}" "${source_dir}"
  if declare -F case_prepare_run > /dev/null && ! case_prepare_run "${root}" "${native_guidance_check_controller}"; then
    native_guidance_check_unstarted "${case_name}" "${work}" "${case_prepare_reason:-the case refused this host route}"
    exit 0
  fi
  native_run_capture_version codex --version
  # Match literal controller/source roots and relative harness paths, not an
  # ordinary workspace ancestor that happens to be named native-comparison.
  local harness
  harness=$(printf '%s\n' "${native_guidance_check_controller}" "${source_dir}" \
    | sed 's/[][\\.^$*+?(){}|]/\\&/g' | paste -sd '|' -)
  harness+='|Distribution/tests/(support/)?native-comparison([/.-]|$)|Distribution/evaluation/(src/native-(comparison|guidance-check)|cases/(comparison|guidance-checks))([/.-]|$)'
  {
    printf 'case: %s\n' "${case_name}"
    printf 'preparation-seconds: %s\n' "$(native_guidance_check_seconds "${start}" "${prepared}")"
  } > "${observations}"
  if native_guidance_check_turn 1 "${prompt}" >> "${observations}"; then
    case_observe "${root}" 1 "${transcript}" "${native_guidance_check_controller}" \
      "${harness}" >> "${observations}"
    for event in ${case_events}; do
      turn=$((turn + 1))
      printf 'turn-%s-event: %s\n' "${turn}" "${event}" >> "${observations}"
      case_apply_event "${root}" "${event}" "${native_guidance_check_controller}"
      if ! native_guidance_check_turn "${turn}" "${wake}" >> "${observations}"; then
        ((native_run_interrupt_status == 0)) || exit "${native_run_interrupt_status}"
        if declare -F case_observe_stopped > /dev/null; then
          case_observe_stopped "${root}" "${turn}" "${transcript}" \
            "${native_guidance_check_controller}" "${harness}" >> "${observations}"
        fi
        break
      fi
      case_observe "${root}" "${turn}" "${transcript}" \
        "${native_guidance_check_controller}" "${harness}" >> "${observations}"
    done
  else
    ((native_run_interrupt_status == 0)) || exit "${native_run_interrupt_status}"
  fi
  native_guidance_check_cleanup
  printf 'total-seconds: %s\n' \
    "$(native_guidance_check_seconds "${start}" "$(native_guidance_check_now)")" >> "${observations}"
  case_assess "${observations}" || true
  printf 'assessment-status: %s\nassessment-reason: %s\n' \
    "${case_assess_status}" "${case_assess_reason}" >> "${observations}"
  if [[ -n ${results_dir} ]]; then
    native_guidance_check_retain "${case_name}" "${source_dir}" "${results_dir}" \
      "${root}" "${prompt}" "${wake}"
  fi
  printf '%s\n' "${case_assess_status}" "${case_assess_reason}" \
    "${native_result_attempt_dir-}" > "${work}/verdict"
  cat -- "${observations}" > "${work}/observations.txt"
}

native_guidance_check_run_case() {
  local work=$3
  native_guidance_check_status=fail
  native_guidance_check_reason=
  native_guidance_check_attempt=
  native_guidance_check_start_arm "$@"
  native_guidance_check_wait_arms || return
  {
    read -r native_guidance_check_status
    read -r native_guidance_check_reason
    read -r native_guidance_check_attempt
  } < "${work}/verdict"
  [[ ${native_guidance_check_status} == pass ]]
}
