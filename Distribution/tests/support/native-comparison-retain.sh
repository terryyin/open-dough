#!/usr/bin/env bash
# Retention of one native journey of a versioned comparison case
# (Distribution/tests/support/native-comparison-run.sh, which sources this
# file): the attempt's streams, responses, observations, final project state
# and the record of its exact case, project, payload and runtime identities,
# under RESULTS_DIR/codex/native-comparison/CASE/. The record's host-route
# says whether the arm ran the Codex runtime in the harness sandbox (native)
# or a substitute `codex` (substitute), which proves the harness only and is
# never native behavior evidence.
#
#   native_comparison_case_files SOURCE_DIR CASE
#     Sets case_files to every file of CASE the agent, controller or assessor
#     reads, relative to SOURCE_DIR.
#   native_comparison_retain CASE SOURCE_DIR RESULTS_DIR ROOT PROMPT WAKE
#     Retains the attempt the runner's controller holds; leaves
#     native_result_attempt_dir.
# shellcheck disable=SC2034,SC2154,SC2312 # Runner and helper globals; fields print as observed.

# case.md only describes the case and comparisons/ holds reports about it, so
# recording a measurement or a comparison there keeps the case's identity.
native_comparison_case_files() {
  mapfile -t case_files < <(cd -- "$1" && find "Distribution/tests/native-comparison/$2" -type f \
    ! -name case.md ! -path '*/comparisons/*' | LC_ALL=C sort)
}

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
    printf 'host-route: %s\n' "$( ((${native_codex_isolate:-0})) && echo native || echo substitute)"
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
