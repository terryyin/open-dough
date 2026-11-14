#!/usr/bin/env bash
# One native journey of a versioned comparison case
# (Distribution/tests/native-comparison/<case>/, see its case.md): materialize the case's
# project and payload, start one Codex session with the case's neutral task,
# then for each controlled event change the environment and continue the
# same session with the case's wake message (wake.txt; a case without events
# needs none). After each turn the case observes; at the end the case may
# clean up, its assessor judges the observations, and the attempt is
# retained with its exact case, project, payload and runtime identities
# (native-comparison-retain.sh). The assessor and every controller file stay
# outside the agent's workspace.
#
# A turn that does not complete stops the journey: its `turn-N-stopped:`
# field names why (deadline, the host's exit, a missing, truncated or
# unreadable stream, or a stream naming no thread or another session's), the
# later turns never run, and the runner neither retries nor resumes it. A
# journey that cannot start (no codex on PATH, checked before the case
# materializes, or a failed materialization) records `unstarted: REASON`
# and retains nothing.
#
#   native_comparison_run_case CASE SOURCE_DIR WORK [RESULTS_DIR]
#
# The Open Dough payload installed is SOURCE_DIR's working tree unless
# native_comparison_payload_dir names a frozen one, with its commit in
# native_comparison_payload_revision and the revision the caller asked for in
# native_comparison_payload_requested.
#
# A case's case.bash defines case_events (its event names in order; those in
# the optional case_empty_events leave nothing to continue, for effort),
# case_materialize ROOT PAYLOAD_DIR HOST (builds ROOT/workspace, may export
# the environment the agent's commands need, and leaves case_project_basis,
# the identities of the project it built; when it fails, no session starts),
# case_apply_event ROOT EVENT SCRATCH, case_observe ROOT TURN STREAM SCRATCH
# HARNESS (which may keep raw evidence in SCRATCH/case-evidence for
# retention) and optionally case_cleanup ROOT, which prints its own fields; its
# assess.bash defines case_assess OBSERVATIONS, leaving case_assess_status
# and case_assess_reason.
#
# Leaves native_comparison_status (pass or fail), _reason and _attempt (the
# retained attempt directory, when RESULTS_DIR is given). Codex only so far;
# a credential-free test may put a substitute `codex` first on PATH, whose
# session records are read only under CODEX_HOME.
# shellcheck disable=SC1090,SC1091,SC2030,SC2031,SC2034,SC2154,SC2312 # Sourced case and helper globals; the journey runs and retains in one subshell.

native_comparison_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "${native_comparison_support_dir}/native-run-supervise.sh"
source "${native_comparison_support_dir}/native-codex.sh"
source "${native_comparison_support_dir}/native-observation.sh"
source "${native_comparison_support_dir}/native-result-retain.sh"
source "${native_comparison_support_dir}/delivery-evidence-native-payload.sh"
source "${native_comparison_support_dir}/native-comparison-retain.sh"

# The files that decide how a case journey runs, beside the case's own files.
native_comparison_inputs=(
  Distribution/tests/support/native-comparison-run.sh
  Distribution/tests/support/native-comparison-retain.sh
  Distribution/tests/support/native-codex.sh
  Distribution/tests/support/native-codex-session.mjs
  Distribution/tests/support/native-observation.sh
  Distribution/tests/support/delivery-evidence-native-payload.sh
)

native_comparison_now() {
  printf '%s\n' "${EPOCHREALTIME/./}"
}

# The host's load averages, as each record shows them at start and end.
native_comparison_load() {
  sysctl -n vm.loadavg 2> /dev/null | tr -d '{}' | xargs
}

native_comparison_seconds() {
  awk -v start="$1" -v end="$2" 'BEGIN { printf "%.1f\n", (end - start) / 1000000 }'
}

# Runs turn TURN with PROMPT: a fresh session for turn 1, else a resumed
# native_comparison_thread. Prints the runner's turn fields; a turn whose
# stream does not show it completing in this session is not completed.
native_comparison_turn() {
  local turn=$1 prompt=$2 start status=completed thread stopped=''
  transcript="${native_comparison_controller}/events-turn-${turn}.jsonl"
  output_file="${native_comparison_controller}/response-turn-${turn}.md"
  : > "${transcript}"
  start=$(native_comparison_now)
  if [[ ${turn} -eq 1 ]]; then
    native_codex_build_command "${native_comparison_workspace}" "${output_file}" \
      "${prompt}" "${transcript}"
    native_run_owned_or_fail "${transcript}" "${native_stderr}" '' \
      "${native_codex_command[@]}" || true
  else
    native_codex_build_resume_command "${native_comparison_thread}" \
      "${output_file}" "${prompt}"
    native_run_owned_or_fail "${transcript}" "${native_stderr}" \
      "${native_comparison_workspace}" "${native_codex_command[@]}" || true
  fi
  native_run_classify_stream codex "${transcript}"
  case ${native_run_outcome} in
    timeout) status=timeout stopped="no completion within the ${native_case_deadline:-3600} s deadline; the runner stopped the session" ;;
    failed) status=failed stopped=${native_run_failure_reason} ;;
    *) ;;
  esac
  if [[ ${native_run_stream_status} != complete ]]; then
    [[ ${status} != completed ]] || status=incomplete
    stopped+=${stopped:+; }${native_run_stream_reason}
  fi
  thread=$(native_host_stream codex "${transcript}" thread)
  if [[ ${status} == completed && -z ${thread} ]]; then
    status=incomplete stopped='the stream names no session thread'
  elif [[ ${status} == completed && ${turn} -ne 1 && ${thread} != "${native_comparison_thread}" ]]; then
    status=incomplete
    stopped="the stream names thread ${thread}, not the resumed ${native_comparison_thread}: it is not this session's evidence"
  fi
  [[ ${turn} -ne 1 ]] || native_comparison_thread=${thread}
  printf 'turn-%s-status: %s\n' "${turn}" "${status}"
  printf 'turn-%s-thread: %s\n' "${turn}" "${thread}"
  printf 'turn-%s-seconds: %s\n' "${turn}" \
    "$(native_comparison_seconds "${start}" "$(native_comparison_now)")"
  [[ -z ${stopped} ]] || printf 'turn-%s-stopped: %s\n' "${turn}" "${stopped}"
  [[ ${status} == completed ]]
}

# Ends a journey that started no session, in WORK, for REASON: its
# observations and verdict say so, and nothing is retained.
native_comparison_unstarted() {
  printf 'case: %s\nunstarted: %s\n' "$1" "$3" > "$2/observations.txt"
  printf '%s\n' fail "$3; no session started" '' > "$2/verdict"
}

native_comparison_run_case() {
  local case_name=$1 source_dir=$2 work=$3 results_dir=${4-}
  local case_path="${source_dir}/Distribution/tests/native-comparison/${case_name}"
  local root observations start prepared turn=1 event prompt wake
  native_comparison_status=fail
  native_comparison_reason=
  native_comparison_attempt=
  (
    source "${case_path}/case.bash"
    source "${case_path}/assess.bash"
    start=$(native_comparison_now)
    # A neutral name: the agent sees this path.
    root=$(mktemp -d "${work}/nc.XXXXXX")
    native_comparison_controller=$(mktemp -d "${work}/controller.XXXXXX")
    native_comparison_workspace="${root}/workspace"
    observations="${native_comparison_controller}/observations.txt"
    native_stderr="${native_comparison_controller}/stderr.log"
    platform=codex
    : > "${native_stderr}"
    native_comparison_load_start=$(native_comparison_load)
    if ! native_run_require_host; then
      native_comparison_unstarted "${case_name}" "${work}" 'no codex is on PATH'
      exit 0
    fi
    if ! case_materialize "${root}" "${native_comparison_payload_dir:-${source_dir}}" codex; then
      native_comparison_unstarted "${case_name}" "${work}" 'the case could not be materialized'
      exit 0
    fi
    native_comparison_basis_head=$(git -C "${native_comparison_workspace}" rev-parse HEAD)
    prepared=$(native_comparison_now)
    # The installed payload, before the agent can commit or change it.
    native_comparison_payload_digest=$(cd -- "${native_comparison_workspace}" \
      && git ls-files --others --modified --exclude-standard -- .agents .claude \
      | LC_ALL=C sort | xargs shasum -a 256 | shasum -a 256 | cut -d ' ' -f 1)
    prompt=$(< "${case_path}/task.txt")
    wake=
    [[ ! -f ${case_path}/wake.txt ]] || wake=$(< "${case_path}/wake.txt")
    native_codex_prepare "${root}" "${source_dir}"
    native_run_capture_version codex --version
    local harness="${native_comparison_controller}|${source_dir}|native-comparison"
    {
      printf 'case: %s\n' "${case_name}"
      printf 'preparation-seconds: %s\n' "$(native_comparison_seconds "${start}" "${prepared}")"
    } > "${observations}"
    if native_comparison_turn 1 "${prompt}" >> "${observations}"; then
      case_observe "${root}" 1 "${transcript}" "${native_comparison_controller}" \
        "${harness}" >> "${observations}"
      for event in ${case_events}; do
        turn=$((turn + 1))
        printf 'turn-%s-event: %s\n' "${turn}" "${event}" >> "${observations}"
        case_apply_event "${root}" "${event}" "${native_comparison_controller}"
        native_comparison_turn "${turn}" "${wake}" >> "${observations}" || break
        case_observe "${root}" "${turn}" "${transcript}" \
          "${native_comparison_controller}" "${harness}" >> "${observations}"
      done
    fi
    if declare -F case_cleanup > /dev/null; then
      case_cleanup "${root}" >> "${observations}"
    fi
    printf 'total-seconds: %s\n' \
      "$(native_comparison_seconds "${start}" "$(native_comparison_now)")" >> "${observations}"
    case_assess "${observations}" || true
    printf 'assessment-status: %s\nassessment-reason: %s\n' \
      "${case_assess_status}" "${case_assess_reason}" >> "${observations}"
    if [[ -n ${results_dir} ]]; then
      native_comparison_retain "${case_name}" "${source_dir}" "${results_dir}" \
        "${root}" "${prompt}" "${wake}"
    fi
    printf '%s\n' "${case_assess_status}" "${case_assess_reason}" \
      "${native_result_attempt_dir-}" > "${work}/verdict"
    cat -- "${observations}" > "${work}/observations.txt"
  ) || return
  {
    read -r native_comparison_status
    read -r native_comparison_reason
    read -r native_comparison_attempt
  } < "${work}/verdict"
  [[ ${native_comparison_status} == pass ]]
}
