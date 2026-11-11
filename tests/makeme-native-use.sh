#!/usr/bin/env bash
# The sourced native helpers define and consume this runner's shared globals.
# shellcheck disable=SC1091,SC2034,SC2154
set -euo pipefail
# Explicit paid native probe. Usage: HOST mixed|opted-out|refactor ARTIFACT_DIRECTORY.
# Without arguments it runs only the cheap harness contract, never paid
# inference. Ordinary npm test runs those two harness files as its own jobs and
# does not start this wrapper (scripts/test-jobs.sh).
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
if (($# == 0)); then
  log=$(mktemp)
  trap 'rm -f "${log}"' EXIT
  if node --test "${source_dir}/tests/support/makeme-native-harness.test.mjs" \
    "${source_dir}/tests/support/makeme-native-refactor-harness.test.mjs" > "${log}" 2>&1; then
    exit 0
  fi
  cat -- "${log}" >&2
  exit 1
fi
platform=$1
journey=$2
temporary_dir=$3
case ${platform} in codex | cursor | claude) ;; *) exit 2 ;; esac
case ${journey} in mixed | opted-out | refactor) ;; *) exit 2 ;; esac
mkdir -p -- "${temporary_dir}"
temporary_dir=$(cd -- "${temporary_dir}" && pwd -P)
# shellcheck source=tests/helpers/wait-for.bash
source "${source_dir}/tests/helpers/wait-for.bash"
# shellcheck source=tests/support/native-run-supervise.sh
source "${source_dir}/tests/support/native-run-supervise.sh"
# shellcheck source=tests/support/native-codex.sh
source "${source_dir}/tests/support/native-codex.sh"
fixture=makeme-native-fixture.mjs
if [[ ${journey} == refactor ]]; then fixture=makeme-native-refactor-fixture.mjs; fi
node "${source_dir}/tests/support/${fixture}" "${source_dir}" \
  "${platform}" "${temporary_dir}/project" "${journey}" > "${temporary_dir}/fixture.json"
target="${temporary_dir}/project"
prompt=$(node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(process.argv[1])).prompt)' "${temporary_dir}/fixture.json")
printf '%s\n' "${prompt}" > "${temporary_dir}/prompt.txt"
transcript="${temporary_dir}/events.jsonl"
native_stderr="${temporary_dir}/stderr.log"
output_file="${temporary_dir}/response.md"
native_case_deadline=300
native_case_grace=10
: > "${native_stderr}"
native_run_require_host
status=0
case ${platform} in
  codex)
    native_codex_prepare "${temporary_dir}" "${source_dir}"
    native_run_capture_version codex --version
    native_codex_build_command "${target}" "${output_file}" "${prompt}" "${transcript}"
    native_run_owned_or_fail "${transcript}" "${native_stderr}" '' "${native_codex_command[@]}" || status=$?
    ;;
  cursor)
    native_run_capture_version cursor agent --version
    native_run_owned_or_fail "${transcript}" "${native_stderr}" "${target}" \
      cursor agent --print --force --trust --sandbox disabled --output-format stream-json \
      --workspace "${target}" "${prompt}" || status=$?
    ;;
  claude)
    native_run_capture_version claude --version
    native_run_owned_or_fail "${transcript}" "${native_stderr}" "${target}" \
      claude --print --dangerously-skip-permissions --no-session-persistence \
      --output-format stream-json --verbose "${prompt}" || status=$?
    ;;
  *) exit 2 ;;
esac
printf 'host: %s\nversion: %s\njourney: %s\nexit: %s\noutcome: %s\n' \
  "${platform}" "${tool_version}" "${journey}" "${status}" "${native_run_outcome}" > "${temporary_dir}/run.txt"
if [[ ${platform} != codex ]]; then native_run_write_output 1; fi
node "${source_dir}/tests/support/native-host-stream.mjs" "${platform}" "${transcript}" status
if ((status != 0)); then exit "${status}"; fi
if [[ ${journey} == refactor ]]; then
  node "${source_dir}/tests/support/makeme-native-refactor-assess.mjs" "${platform}" "${temporary_dir}"
else
  node "${source_dir}/tests/support/makeme-native-assess.mjs" "${platform}" "${journey}" "${temporary_dir}"
fi
