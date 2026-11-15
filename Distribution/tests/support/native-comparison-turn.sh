#!/usr/bin/env bash
# Turn execution for the comparison journey; orchestration stays in its runner.
# shellcheck disable=SC2034,SC2154,SC2312 # Journey and case globals.

# Runs turn TURN with PROMPT: a fresh session for turn 1, else a resumed
# native_comparison_thread. Prints the runner's turn fields; a turn whose
# stream does not show it completing in this session is not completed.
native_comparison_turn() {
  local turn=$1 prompt=$2 start status=completed thread stopped=''
  transcript="${native_comparison_controller}/events-turn-${turn}.jsonl"
  output_file="${native_comparison_controller}/response-turn-${turn}.md"
  : > "${transcript}"
  start=$(native_comparison_now)
  native_run_controller_command=()
  if declare -F case_prepare_turn > /dev/null; then
    case_prepare_turn "${root}" "${turn}" "${transcript}" "${native_comparison_controller}" "${start}" || return
  fi
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
