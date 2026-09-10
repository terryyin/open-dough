#!/usr/bin/env bash
# Launch one owned native Claude wrap-up session.
# Usage: run-native.sh <proof-root> <prompt-file> <stem>
# stem is used for transcript/response/stderr/command filenames.
# shellcheck disable=SC1091,SC2034,SC2154,SC2312
set -euo pipefail

WORKTREE=/private/tmp/open-dough-quick-039-native-wrap-up-acceptance

if [[ $# -ne 3 ]]; then
  echo "usage: $0 <proof-root> <prompt-file> <stem>" >&2
  exit 2
fi

PROOF_ROOT=$(cd -- "$1" && pwd -P)
PROMPT_FILE=$2
STEM=$3
FIXTURE="${PROOF_ROOT}/fixture"
TRANSCRIPT="${PROOF_ROOT}/${STEM}-transcript.jsonl"
RESPONSE="${PROOF_ROOT}/${STEM}-response.md"
STDERR_FILE="${PROOF_ROOT}/${STEM}-stderr.log"
COMMAND_FILE="${PROOF_ROOT}/${STEM}-command.txt"
native_stderr=${STDERR_FILE}

source "${WORKTREE}/tests/support/native-run-supervise.sh"

native_case_deadline=3600
native_case_grace=15
transcript=${TRANSCRIPT}
output_file=${RESPONSE}
prompt=$(cat "${PROMPT_FILE}")
native_run_capture_version claude --version
printf '%s\n' "${tool_version}" > "${PROOF_ROOT}/host-version.txt"

{
  printf 'date=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf 'host=%s\n' "${tool_version}"
  printf 'deadline=%s grace=%s\n' "${native_case_deadline}" "${native_case_grace}"
  printf 'proof_root=%s\n' "${PROOF_ROOT}"
  printf 'fixture=%s\n' "${FIXTURE}"
  printf 'prompt_file=%s\n' "${PROMPT_FILE}"
  printf 'command='
  printf '%q ' claude --print --dangerously-skip-permissions \
    --no-session-persistence --output-format stream-json --verbose "${prompt}"
  printf '\n'
} > "${COMMAND_FILE}"

: > "${STDERR_FILE}"
native_run_owned_or_fail "${TRANSCRIPT}" "${STDERR_FILE}" \
  "${FIXTURE}" \
  claude --print --dangerously-skip-permissions --no-session-persistence \
  --output-format stream-json --verbose "${prompt}"
status=$?
native_run_classify_stream claude "${TRANSCRIPT}"
if [[ ${native_run_stream_status} == complete ]]; then
  native_run_write_output 0
else
  native_run_write_output 1
fi
{
  printf 'native_run_outcome=%s\n' "${native_run_outcome}"
  printf 'native_run_failure_reason=%s\n' "${native_run_failure_reason:-}"
  printf 'native_run_stream_status=%s\n' "${native_run_stream_status}"
  printf 'native_run_stream_reason=%s\n' "${native_run_stream_reason:-}"
  printf 'exit=%s\n' "${status}"
} >> "${COMMAND_FILE}"
exit "${status}"
