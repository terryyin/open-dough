#!/usr/bin/env bash
# Shared native helpers supply and consume the runtime variables below.
# shellcheck disable=SC1091,SC2034,SC2154
set -euo pipefail
source_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd -P)
proof_root=$1
# shellcheck source=tests/support/native-codex.sh
source "${source_root}/tests/support/native-codex.sh"
# shellcheck source=tests/support/native-run-supervise.sh
source "${source_root}/tests/support/native-run-supervise.sh"
native_codex_prepare "${proof_root}" "${source_root}"
prompt=$(cat "${proof_root}/prompt.txt")
native_codex_build_command "${proof_root}/open-dough" "${proof_root}/native-response.md" "${prompt}" "${proof_root}/native.jsonl"
native_case_deadline=1800
native_case_grace=15
status=0
native_run_owned "${proof_root}/native.jsonl" "${proof_root}/native.stderr" '' "${native_codex_command[@]}" || status=$?
printf '%s\n' "${status}" > "${proof_root}/native-exit.txt"
printf '%s\n' "${native_run_outcome}" > "${proof_root}/native-outcome.txt"
exit "${status}"
