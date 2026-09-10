#!/usr/bin/env bash
# Launch one owned native Codex wrap-up session.
# Usage: run-native.sh <proof-root> <prompt-file> <stem>
# stem is used for transcript/response/stderr/command filenames.
# shellcheck disable=SC1091,SC2154,SC2312
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

source "${WORKTREE}/tests/support/native-run-supervise.sh"
source "${WORKTREE}/tests/support/native-codex.sh"

native_case_deadline=3600
native_case_grace=15
native_codex_prepare "${PROOF_ROOT}" "${WORKTREE}"
prompt=$(cat "${PROMPT_FILE}")
native_codex_build_command "${FIXTURE}" "${RESPONSE}" "${prompt}" "${TRANSCRIPT}"

{
  printf 'date=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf 'host=%s\n' "$(codex --version)"
  printf 'deadline=%s grace=%s\n' "${native_case_deadline}" "${native_case_grace}"
  printf 'isolate=%s\n' "${native_codex_isolate}"
  printf 'proof_root=%s\n' "${PROOF_ROOT}"
  printf 'fixture=%s\n' "${FIXTURE}"
  printf 'protected_source=%s\n' "${WORKTREE}"
  printf 'prompt_file=%s\n' "${PROMPT_FILE}"
  printf 'command='
  printf '%q ' "${native_codex_command[@]}"
  printf '\n'
} > "${COMMAND_FILE}"

: > "${STDERR_FILE}"
native_run_owned_or_fail "${TRANSCRIPT}" "${STDERR_FILE}" '' \
  "${native_codex_command[@]}"
status=$?
native_run_classify_stream codex "${TRANSCRIPT}"
{
  printf 'native_run_outcome=%s\n' "${native_run_outcome}"
  printf 'native_run_failure_reason=%s\n' "${native_run_failure_reason:-}"
  printf 'native_run_stream_status=%s\n' "${native_run_stream_status}"
  printf 'native_run_stream_reason=%s\n' "${native_run_stream_reason:-}"
  printf 'exit=%s\n' "${status}"
} >> "${COMMAND_FILE}"
exit "${status}"
