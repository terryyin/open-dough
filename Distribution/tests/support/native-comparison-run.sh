#!/usr/bin/env bash
# One native journey of a versioned comparison case
# (Distribution/tests/native-comparison/<case>/, see its case.md): materialize the case's
# project and payload, start one Codex session with the case's neutral task,
# then for each controlled event change the environment and continue the
# same session with the case's wake message (wake.txt; a case without events
# needs none). After each turn the case observes; at the end the case may
# clean up, its assessor judges the observations, and the attempt is
# retained with its exact case, project, payload and runtime identities.
# The assessor and every controller file stay outside the agent's workspace.
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

# The files that decide how a case journey runs, beside the case's own files.
native_comparison_inputs=(
  Distribution/tests/support/native-comparison-run.sh
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
# native_comparison_thread. Prints the runner's turn fields.
native_comparison_turn() {
  local turn=$1 prompt=$2 start status=completed thread
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
    timeout | failed) status=${native_run_outcome} ;;
    *) [[ ${native_run_stream_status} == complete ]] || status=incomplete ;;
  esac
  thread=$(native_host_stream codex "${transcript}" thread)
  [[ ${turn} -ne 1 ]] || native_comparison_thread=${thread}
  printf 'turn-%s-status: %s\n' "${turn}" "${status}"
  printf 'turn-%s-thread: %s\n' "${turn}" "${thread}"
  printf 'turn-%s-seconds: %s\n' "${turn}" \
    "$(native_comparison_seconds "${start}" "$(native_comparison_now)")"
  [[ ${status} == completed ]]
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
    if ! case_materialize "${root}" "${native_comparison_payload_dir:-${source_dir}}" codex; then
      printf 'case: %s\nmaterialization: failed\n' "${case_name}" > "${work}/observations.txt"
      printf '%s\n' fail 'the case could not be materialized; no session started' '' \
        > "${work}/verdict"
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
    native_run_require_host || exit 127
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

# Sets case_files to every file of CASE the agent, controller or assessor
# reads, relative to SOURCE_DIR. case.md only describes the case and
# comparisons/ holds reports about it, so recording a measurement or a
# comparison there keeps the case's identity.
native_comparison_case_files() {
  mapfile -t case_files < <(cd -- "$1" && find "Distribution/tests/native-comparison/$2" -type f \
    ! -name case.md ! -path '*/comparisons/*' | LC_ALL=C sort)
}

# Retains the attempt under RESULTS_DIR/codex/native-comparison/CASE/.
native_comparison_retain() {
  local case_name=$1 source_dir=$2 results_dir=$3 root=$4 prompt=$5 wake=$6
  local dest case_files
  native_result_allocate_attempt "${results_dir}" codex "native-comparison/${case_name}"
  dest=${native_result_attempt_dir}
  cp -- "${native_comparison_controller}"/events-turn-*.jsonl \
    "${native_comparison_controller}"/response-turn-*.md \
    "${native_comparison_controller}/observations.txt" "${native_stderr}" "${dest}/" 2> /dev/null || true
  # Raw evidence a case's observer kept beside its observations.
  [[ ! -d ${native_comparison_controller}/case-evidence ]] \
    || cp -R -- "${native_comparison_controller}/case-evidence" "${dest}/"
  printf '%s\n' "${prompt}" > "${dest}/prompt.txt"
  printf '%s\n' "${wake}" > "${dest}/wake.txt"
  {
    git -C "${root}/workspace" log --graph --format='%h %s' --all
    git -C "${root}/workspace" status --short --untracked-files=all -- . ':!.agents' ':!.claude'
    git -C "${root}/workspace" diff HEAD -- . ':!.agents' ':!.claude'
    git -C "${root}/workspace" log --first-parent --name-status "${native_comparison_basis_head}..HEAD"
    git -C "${root}/workspace" log -p "${native_comparison_basis_head}..HEAD" -- . ':!.agents' ':!.claude'
  } > "${dest}/final-state.txt" 2>&1
  native_comparison_case_files "${source_dir}" "${case_name}"
  {
    printf 'host: codex\ncase: native-comparison/%s\norigin: fresh\n' "${case_name}"
    printf 'native-executable: %s\n' "$(command -v codex)"
    printf 'native-version: %s\n' "${tool_version:-unknown}"
    printf 'native-requested-settings: %s\n' "${native_codex_settings[*]:-host defaults}"
    native_comparison_retain_sessions "${source_dir}" "${dest}"
    printf 'thread: %s\n' "${native_comparison_thread:-unknown}"
    printf 'host-load-start: %s\nhost-load-end: %s\n' "${native_comparison_load_start}" \
      "$(native_comparison_load)"
    printf 'source-revision: %s\n' "$(git -C "${source_dir}" rev-parse HEAD)"
    printf 'source-dirty: %s\n' "$(git -C "${source_dir}" status --porcelain | grep -q . && echo true || echo false)"
    printf 'project-basis: %s\n' "${case_project_basis}"
    printf 'payload-revision: %s\n' "${native_comparison_payload_revision:-working-tree}"
    printf 'payload-requested: %s\n' "${native_comparison_payload_requested:-working-tree}"
    printf 'payload-digest: %s\n' "${native_comparison_payload_digest}"
    printf 'assessor-identity: Distribution/tests/native-comparison/%s/assess.bash\n' "${case_name}"
    native_result_input_hash_lines "${case_files[@]}" "${native_comparison_inputs[@]}"
    native_result_supervision_input_hash_lines
  } > "${dest}/record"
}

# Prints the thread's applied settings and worker sessions from the host's
# session records, keeping copies of those records in DEST (they hold account
# identities and stay local). A substitute host's records are read only
# under CODEX_HOME, never a developer's own.
native_comparison_retain_sessions() {
  local source_dir=$1 dest=$2 root thread file
  root=${CODEX_HOME:-${HOME}/.codex}/sessions
  [[ ${native_codex_isolate:-0} -eq 1 || -n ${CODEX_HOME-} ]] || root=
  if [[ -z ${native_comparison_thread-} || -z ${root} ]] \
    || ! node "${source_dir}/Distribution/tests/support/native-codex-session.mjs" \
      "${native_comparison_thread}" "${root}" > "${dest}/codex-settings.txt"; then
    printf 'codex-session-file: missing\n'
    return 0
  fi
  cat -- "${dest}/codex-settings.txt"
  cp -- "$(native_observation_field "${dest}/codex-settings.txt" codex-session-file)" \
    "${dest}/codex-session.jsonl"
  while read -r _ thread _ file; do
    cp -- "${file#file=}" "${dest}/codex-worker-${thread}.jsonl"
  done < <(grep '^codex-worker: ' "${dest}/codex-settings.txt")
}
