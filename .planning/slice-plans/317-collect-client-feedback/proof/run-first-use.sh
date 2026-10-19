#!/usr/bin/env bash
# The sourced native helpers consume deadline/grace and provide result variables.
# shellcheck disable=SC2034,SC2154
set -euo pipefail
proof_script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
feedback_source=$(cd -- "${proof_script_dir}/../../../.." && pwd)
feedback_root=$(cd -- "$1" && pwd -P)
feedback_label=${2:-first}
# shellcheck source=tests/support/native-codex.sh
# shellcheck disable=SC1091
source "${feedback_source}/tests/support/native-codex.sh"
# shellcheck source=tests/support/native-run-supervise.sh
# shellcheck disable=SC1091
source "${feedback_source}/tests/support/native-run-supervise.sh"
native_case_deadline=900
native_case_grace=15
native_codex_prepare "${feedback_root}" "${feedback_source}"
feedback_prompt=$(cat -- "${feedback_root}/prompt.txt")
native_codex_build_command "${feedback_root}/open-dough" \
  "${feedback_root}/${feedback_label}-output.md" \
  "${feedback_prompt}" \
  "${feedback_root}/${feedback_label}-transcript.jsonl"
printf '%q ' "${native_codex_command[@]}" > "${feedback_root}/${feedback_label}-command.txt"
printf '\n' >> "${feedback_root}/${feedback_label}-command.txt"
status=0
native_run_owned "${feedback_root}/${feedback_label}-transcript.jsonl" \
  "${feedback_root}/${feedback_label}-stderr.log" '' "${native_codex_command[@]}" || status=$?
printf 'native status=%s outcome=%s\n' "${status}" "${native_run_outcome}" | tee "${feedback_root}/${feedback_label}-terminal.txt"
exit "${status}"
