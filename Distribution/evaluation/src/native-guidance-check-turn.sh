#!/usr/bin/env bash
# Turn execution for a guidance-check journey; orchestration stays in its runner.
# shellcheck disable=SC2034,SC2154,SC2312 # Journey and case globals.

# Runs turn TURN with PROMPT: a fresh session for turn 1, else a resumed
# native_guidance_check_thread. Prints the runner's turn fields; a turn whose
# stream does not show it completing in this session is not completed.
native_guidance_check_turn() {
  local turn=$1 prompt=$2 start status=completed thread stopped=''
  local commands command_count=unknown harness_inspected=unknown
  transcript="${native_guidance_check_controller}/events-turn-${turn}.jsonl"
  output_file="${native_guidance_check_controller}/response-turn-${turn}.md"
  : > "${transcript}"
  start=$(native_guidance_check_now)
  native_run_interrupt_status=0
  native_run_controller_command=()
  if declare -F case_prepare_turn > /dev/null; then
    case_prepare_turn "${root}" "${turn}" "${transcript}" "${native_guidance_check_controller}" "${start}" || return
  fi
  if [[ ${turn} -eq 1 ]]; then
    native_codex_build_command "${native_guidance_check_workspace}" "${output_file}" \
      "${prompt}" "${transcript}"
    native_run_owned_or_fail "${transcript}" "${native_stderr}" '' \
      "${native_codex_command[@]}" || true
  else
    native_codex_build_resume_command "${native_guidance_check_thread}" \
      "${output_file}" "${prompt}"
    native_run_owned_or_fail "${transcript}" "${native_stderr}" \
      "${native_guidance_check_workspace}" "${native_codex_command[@]}" || true
  fi
  ((native_run_interrupt_status == 0)) || return "${native_run_interrupt_status}"
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
  elif [[ ${status} == completed && ${turn} -ne 1 && ${thread} != "${native_guidance_check_thread}" ]]; then
    status=incomplete
    stopped="the stream names thread ${thread}, not the resumed ${native_guidance_check_thread}: it is not this session's evidence"
  fi
  if [[ ${native_run_stream_status} == complete && -n ${thread} &&
    (${turn} -eq 1 || ${thread} == "${native_guidance_check_thread}") ]] \
    && commands=$(native_host_stream codex "${transcript}" commands); then
    command_count=$(printf '%s' "${commands}" | awk 'END { print NR }')
    harness_inspected=$(native_harness_inspected "${harness}${case_harness_paths:+|${case_harness_paths}}" <<< "${commands}")
  fi
  [[ ${turn} -ne 1 ]] || native_guidance_check_thread=${thread}
  printf 'turn-%s-status: %s\n' "${turn}" "${status}"
  printf 'turn-%s-thread: %s\n' "${turn}" "${thread}"
  printf 'turn-%s-seconds: %s\n' "${turn}" \
    "$(native_guidance_check_seconds "${start}" "$(native_guidance_check_now)")"
  printf 'turn-%s-commands: %s\n' "${turn}" "${command_count}"
  printf 'turn-%s-harness-inspected: %s\n' "${turn}" "${harness_inspected}"
  [[ -z ${stopped} ]] || printf 'turn-%s-stopped: %s\n' "${turn}" "${stopped}"
  [[ ${status} == completed ]]
}
