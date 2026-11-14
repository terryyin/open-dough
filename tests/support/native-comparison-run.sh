#!/usr/bin/env bash
# One native journey of a versioned comparison case
# (tests/native-comparison/<case>/, see its case.md): materialize the case's
# project and payload, start one Codex session with the case's neutral task,
# then for each controlled event change the environment and continue the
# same session with the case's wake message. After each turn the case
# observes; at the end its assessor judges the observations, and the attempt
# is retained with its exact case, project, payload and runtime identities.
# The assessor and every controller file stay outside the agent's workspace.
#
#   native_comparison_run_case CASE SOURCE_DIR WORK [RESULTS_DIR]
#
# A case's case.bash defines case_events (its event names in order),
# case_materialize ROOT SOURCE_DIR HOST (builds ROOT/workspace and leaves
# case_project_basis, the identities of the project it built),
# case_apply_event ROOT EVENT SCRATCH and case_observe ROOT TURN STREAM
# SCRATCH HARNESS; its assess.bash defines case_assess OBSERVATIONS, leaving
# case_assess_status and case_assess_reason.
#
# Leaves native_comparison_status (pass or fail), _reason and _attempt (the
# retained attempt directory, when RESULTS_DIR is given). Codex only so far;
# the `codex` on PATH may be a substitute (tests/native-comparison.sh).
# shellcheck disable=SC1090,SC1091,SC2030,SC2031,SC2034,SC2154,SC2312 # Sourced case and helper globals; the journey runs and retains in one subshell.

native_comparison_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "${native_comparison_support_dir}/native-run-supervise.sh"
source "${native_comparison_support_dir}/native-codex.sh"
source "${native_comparison_support_dir}/native-observation.sh"
source "${native_comparison_support_dir}/native-result-retain.sh"
source "${native_comparison_support_dir}/delivery-evidence-native-payload.sh"

# The files that decide how a case journey runs, beside the case's own files.
native_comparison_inputs=(
  tests/support/native-comparison-run.sh
  tests/support/native-codex.sh
  tests/support/native-codex-session.mjs
  tests/support/native-observation.sh
  tests/support/delivery-evidence-native-payload.sh
)

native_comparison_now() {
  printf '%s\n' "${EPOCHREALTIME/./}"
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
  local case_path="${source_dir}/tests/native-comparison/${case_name}"
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
    case_materialize "${root}" "${source_dir}" codex
    native_comparison_basis_head=$(git -C "${native_comparison_workspace}" rev-parse HEAD)
    prepared=$(native_comparison_now)
    # The installed payload, before the agent can commit or change it.
    native_comparison_payload_digest=$(cd -- "${native_comparison_workspace}" \
      && git ls-files --others --exclude-standard -- .agents .claude \
      | LC_ALL=C sort | xargs shasum -a 256 | shasum -a 256 | cut -d ' ' -f 1)
    prompt=$(< "${case_path}/task.txt")
    wake=$(< "${case_path}/wake.txt")
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

# Retains the attempt under RESULTS_DIR/codex/native-comparison/CASE/.
native_comparison_retain() {
  local case_name=$1 source_dir=$2 results_dir=$3 root=$4 prompt=$5 wake=$6
  local dest file case_files
  native_result_allocate_attempt "${results_dir}" codex "native-comparison/${case_name}"
  dest=${native_result_attempt_dir}
  cp -- "${native_comparison_controller}"/events-turn-*.jsonl \
    "${native_comparison_controller}"/response-turn-*.md \
    "${native_comparison_controller}/observations.txt" "${native_stderr}" "${dest}/" 2> /dev/null || true
  printf '%s\n' "${prompt}" > "${dest}/prompt.txt"
  printf '%s\n' "${wake}" > "${dest}/wake.txt"
  {
    git -C "${root}/workspace" log --graph --format='%h %s' --all
    git -C "${root}/workspace" status --short --untracked-files=all -- . ':!.agents' ':!.claude'
    git -C "${root}/workspace" diff HEAD -- . ':!.agents' ':!.claude'
    git -C "${root}/workspace" log --first-parent --name-status "${native_comparison_basis_head}..HEAD"
    git -C "${root}/workspace" log -p "${native_comparison_basis_head}..HEAD" -- . ':!.agents' ':!.claude'
  } > "${dest}/final-state.txt" 2>&1
  # Every case file the agent, controller or assessor reads; case.md only
  # describes the case, so recording a measurement there keeps its identity.
  mapfile -t case_files < <(cd -- "${source_dir}" \
    && find "tests/native-comparison/${case_name}" -type f ! -name case.md \
    | LC_ALL=C sort)
  {
    printf 'host: codex\ncase: native-comparison/%s\norigin: fresh\n' "${case_name}"
    printf 'native-executable: %s\n' "$(command -v codex)"
    printf 'native-version: %s\n' "${tool_version:-unknown}"
    printf 'native-requested-settings: %s\n' "${native_codex_settings[*]:-host defaults}"
    if [[ -n ${native_comparison_thread-} ]] \
      && node "${source_dir}/tests/support/native-codex-session.mjs" \
        "${native_comparison_thread}" > "${dest}/codex-settings.txt"; then
      cat -- "${dest}/codex-settings.txt"
      file=$(native_observation_field "${dest}/codex-settings.txt" codex-session-file)
      cp -- "${file}" "${dest}/codex-session.jsonl"
    else
      printf 'codex-session-file: missing\n'
    fi
    printf 'thread: %s\n' "${native_comparison_thread:-unknown}"
    printf 'source-revision: %s\n' "$(git -C "${source_dir}" rev-parse HEAD)"
    printf 'source-dirty: %s\n' "$(git -C "${source_dir}" status --porcelain | grep -q . && echo true || echo false)"
    printf 'project-basis: %s\n' "${case_project_basis}"
    printf 'payload: %s\n' "$(delivery_evidence_installed_payload "${source_dir}")"
    printf 'payload-digest: %s\n' "${native_comparison_payload_digest}"
    printf 'assessor-identity: tests/native-comparison/%s/assess.bash\n' "${case_name}"
    native_result_input_hash_lines "${case_files[@]}" "${native_comparison_inputs[@]}"
    native_result_supervision_input_hash_lines
  } > "${dest}/record"
}
