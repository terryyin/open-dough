#!/usr/bin/env bash
# Prompt, payload install, native launch, retain, and live assess helpers.
# shellcheck disable=SC2034,SC2154,SC2310,SC2312
# Globals are shared with the wrapper; timeout/launch failure must be observed.

prep_native_prompt_for() {
  local origin=$1
  local execution=$2
  cat << EOF
Use \$dough-execute-plan. Skip slice planning; this is one small contextual instruction.

Mode: Story Branch Mode.
Originating checkout: ${origin}
Execution checkout: ${execution}
Execution branch: exec/story

You are the implementation agent. Return uncommitted changes. Do not commit, push, or mark the work done.

User outcome: in the selected execution checkout, the file greeting.txt contains exactly the line hello-ok.
EOF
}

prep_native_install_payload() {
  local dest=$1
  local host=$2
  bash "${source_dir}/install.sh" --target "${dest}" --source "${source_dir}" \
    --platform "${host}" > /dev/null
  [[ -f ${dest}/.agents/skills/dough-execute-plan/references/execution-location.md ||
    -f ${dest}/.claude/skills/dough-execute-plan/references/execution-location.md ]]
}

prep_native_run_command() {
  local run_target=${native_run_workspace:-${target}}
  if [[ ${platform} != claude ]]; then
    native_run_context_command || return $?
    return 0
  fi
  tool_version=unknown
  native_run_require_host || return $?
  native_run_capture_version claude --version
  native_run_owned_or_fail "${transcript}" "${native_stderr}" "${run_target}" \
    claude --print --dangerously-skip-permissions --no-session-persistence \
    --output-format stream-json --verbose "${prompt}" || return $?
  native_run_classify_stream "${platform}" "${transcript}"
  if [[ ${native_run_stream_status} != complete ]]; then
    native_run_outcome=incomplete
    native_run_failure_reason=${native_run_stream_reason}
    native_run_write_output 1
    return 1
  fi
  native_run_write_output 0
}

prep_native_retain() {
  local dest=${prep_native_results_dir}
  local record_file

  if [[ -z ${dest} ]]; then
    dest=$(mktemp -d "${TMPDIR:-/tmp}/execution-worktree-prep-native.XXXXXX")
    prep_native_results_dir=${dest}
  fi
  native_case_results_dir=${dest}
  native_case_host=${prep_native_host}
  native_case_id=${prep_native_case}
  native_result_allocate_attempt "${dest}" "${prep_native_host}" "${prep_native_case}"
  native_result_copy_if_present "${transcript}" events.jsonl
  native_result_copy_if_present "${output_file}" response.md
  native_result_copy_if_present "${native_stderr}" stderr.log
  native_result_copy_if_present "${prep_native_assessment_file-}" assessment.json
  native_result_copy_if_present "${prep_native_observation_file-}" observation.json
  native_result_copy_if_present "${command_log-}" commands.txt
  if [[ -n ${prep_native_origin-} && -f ${prep_native_origin}/origin-marker ]]; then
    native_result_copy_if_present "${prep_native_origin}/origin-marker" origin-marker
  fi
  if [[ -n ${prep_native_execution-} && -f ${prep_native_execution}/greeting.txt ]]; then
    native_result_copy_if_present "${prep_native_execution}/greeting.txt" greeting.txt
  fi
  if [[ -n ${prep_native_execution-} && -f ${prep_native_execution}/.prep-trace.jsonl ]]; then
    native_result_copy_if_present "${prep_native_execution}/.prep-trace.jsonl" prep-trace.jsonl
  fi
  native_result_write_text observations.txt "$(
    printf 'variant: %s\n' "${prep_native_case}"
    printf 'host: %s\n' "${prep_native_host}"
    printf 'execution: %s\n' "${prep_native_execution-unknown}"
    printf 'origin: %s\n' "${prep_native_origin-unknown}"
    printf 'stream-status: %s\n' "${native_run_stream_status-unknown}"
    printf 'assessment-status: %s\n' "${prep_native_assessment_status-not-run}"
    printf 'assessment-reason: %s\n' "${prep_native_assessment_reason-not-run}"
  )"
  record_file="${native_result_attempt_dir}/record"
  {
    printf 'host: %s\n' "${prep_native_host}"
    printf 'case: %s\n' "${prep_native_case}"
    printf 'origin: fresh\n'
    native_result_execution_status_fields
    printf 'assessment-status: %s\n' "${prep_native_assessment_status-not-run}"
    printf 'assessment-reason: %s\n' "${prep_native_assessment_reason-not-run}"
    native_result_print_tool_identity
    printf 'prompt-identity: %s\n' \
      "$(printf '%s' "${prompt}" | shasum -a 256 | cut -d ' ' -f 1)"
    printf 'helper-identity: tests/support/execution-worktree-prep-native.sh\n'
    native_result_print_adapter_identity
    printf 'fixture-identity: tests/support/execution-worktree-prep-native-fixture.mjs\n'
    printf 'assessor-identity: tests/support/execution-worktree-prep-native-assess.mjs\n'
    printf 'artifact-events: events.jsonl\n'
    printf 'artifact-response: response.md\n'
    printf 'artifact-stderr: stderr.log\n'
    printf 'artifact-observations: observations.txt\n'
    prep_native_input_hash_lines
  } > "${record_file}"
  printf 'result-path: %s\n' "${native_result_attempt_dir}"
}

prep_native_input_hash_lines() {
  native_result_input_hash_lines \
    tests/execution-worktree-preparation-native.sh \
    tests/support/execution-worktree-prep-native.sh \
    tests/support/execution-worktree-prep-native-run.sh \
    tests/support/execution-worktree-prep-native-assess.mjs \
    tests/support/execution-worktree-prep-native-observe.mjs \
    tests/support/execution-worktree-prep-native-fixture.mjs
  native_result_supervision_input_hash_lines
  native_result_input_hash_lines \
    tests/support/native-codex.sh \
    src/skills/dough-execute-plan/references/execution-location.md \
    src/skills/dough-execute-plan/SKILL.md
}

prep_native_assess_live() {
  local before_file=$1
  local assess_json status=0
  prep_native_observation_file="${artifact_root}/observation.json"
  prep_native_assessment_file="${artifact_root}/assessment.json"
  local -a assess_args=(
    --variant "${prep_native_case}"
    --host "${prep_native_host}"
    --stream "${transcript}"
    --response "${output_file}"
    --origin "${prep_native_origin}"
    --execution "${prep_native_execution}"
    --stream-status "${native_run_stream_status:-complete}"
  )
  if [[ -n ${native_run_stream_reason-} ]]; then
    assess_args+=(--stream-reason "${native_run_stream_reason}")
  fi
  if [[ -n ${prep_native_trace_path-} ]]; then
    assess_args+=(--trace-path "${prep_native_trace_path}")
  fi
  if [[ -n ${before_file} && -f ${before_file} ]]; then
    assess_args+=(--before "${before_file}")
  fi
  if [[ ${prep_native_case} == wrapper ]]; then
    assess_args+=(--wrapper 1)
    if [[ -n ${prep_native_artifact_cache-} ]]; then
      assess_args+=(--artifact-cache "${prep_native_artifact_cache}")
    fi
  fi
  if [[ ${prep_native_case} == failed-prep ]]; then
    assess_args+=(--ok 0)
  fi
  if [[ ${prep_native_case} == reuse ]]; then
    assess_args+=(--reused 1 --setup-count "${prep_native_setup_count:-1}")
  fi
  assess_json=$(node "${prep_native_assess_js}" "${assess_args[@]}") || status=$?
  if [[ ${status} -ne 0 && -z ${assess_json} ]]; then
    prep_native_assessment_status=pending
    prep_native_assessment_reason='assessor could not read stream or checkout evidence'
    printf '{"status":"pending","reason":"%s"}\n' \
      "${prep_native_assessment_reason}" > "${prep_native_assessment_file}"
    printf '{}\n' > "${prep_native_observation_file}"
    return 0
  fi
  printf '%s\n' "${assess_json}" > "${prep_native_assessment_file}"
  jq -c '.observation // {}' "${prep_native_assessment_file}" \
    > "${prep_native_observation_file}"
  prep_native_assessment_status=$(jq -r '.status' "${prep_native_assessment_file}")
  prep_native_assessment_reason=$(jq -r '.reason' "${prep_native_assessment_file}")
}

prep_native_extract_commands() {
  command_log="${artifact_root}/commands.txt"
  jq -r '.. | objects |
    (.command? // .args.command? // .input.command? // empty) | strings' \
    "${transcript}" > "${command_log}" 2> /dev/null || : > "${command_log}"
}
