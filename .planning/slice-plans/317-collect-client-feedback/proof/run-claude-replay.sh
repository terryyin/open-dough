#!/usr/bin/env bash
# The sourced supervisor consumes deadline/grace and provides result variables.
# shellcheck disable=SC2034,SC2154
set -euo pipefail
proof_script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
feedback_source=$(cd -- "${proof_script_dir}/../../../.." && pwd)
feedback_root=$(cd -- "$1" && pwd -P)
# shellcheck source=tests/support/native-run-supervise.sh
# shellcheck disable=SC1091
source "${feedback_source}/tests/support/native-run-supervise.sh"
native_case_deadline=900
native_case_grace=15
feedback_prompt=$(cat -- "${feedback_root}/replay-prompt.txt")
feedback_command=(claude --print --dangerously-skip-permissions --no-session-persistence --output-format stream-json --verbose "${feedback_prompt}")
printf '%q ' "${feedback_command[@]}" > "${feedback_root}/replay-command.txt"
printf '\n' >> "${feedback_root}/replay-command.txt"
status=0
native_run_owned "${feedback_root}/replay-transcript.jsonl" "${feedback_root}/replay-stderr.log" \
  "${feedback_root}/open-dough" "${feedback_command[@]}" || status=$?
printf 'native status=%s outcome=%s\n' "${status}" "${native_run_outcome}" | tee "${feedback_root}/replay-terminal.txt"
exit "${status}"
