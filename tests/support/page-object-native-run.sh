#!/usr/bin/env bash
# Manually invoked paid probe. Reuse writable native launch profiles, owned
# supervision, and the one native stream reader; never run from npm test.
# shellcheck disable=SC2034,SC2154 # Native helper globals are assigned and consumed by sourced functions.
set -euo pipefail
support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
candidate=$(cd -- "${support_dir}/../.." && pwd)
# shellcheck source=tests/support/git-publication-native-run.sh
# shellcheck disable=SC1091
source "${support_dir}/git-publication-native-run.sh"
platform=$1
selection=${2:-on}
temporary_dir=$3
mkdir -p -- "${temporary_dir}"
temporary_dir=$(cd -- "${temporary_dir}" && pwd -P)
mkdir -p -- "${temporary_dir}/tmp"
export TMPDIR="${temporary_dir}/tmp"
target="${temporary_dir}/project"
if [[ ${selection} == both || ${selection} == makeme-only || ${selection} == neither ]]; then
  node "${support_dir}/page-object-makeme-fixture.mjs" "${target}" "${platform}" "${selection}" > "${temporary_dir}/fixture.json"
elif [[ ${selection} == installed ]]; then
  node "${support_dir}/page-object-native-installed-fixture.mjs" "${target}" "${platform}" > "${temporary_dir}/fixture.json"
elif [[ ${selection} == refactor ]]; then
  node "${support_dir}/page-object-native-refactor-fixture.mjs" "${target}" "${platform}" > "${temporary_dir}/fixture.json"
else
  node "${support_dir}/page-object-native-fixture.mjs" "${target}" "${platform}" "${selection}" > "${temporary_dir}/fixture.json"
fi
if [[ ${selection} == refactor ]]; then
  (
    cd -- "${target}"
    node run-tests.mjs browser/library.spec.mjs
    node run-tests.mjs legacy/library.spec.mjs
  ) > "${temporary_dir}/before-tests.txt" 2>&1
fi
transcript="${temporary_dir}/events.jsonl"
output_file="${temporary_dir}/response.md"
native_stderr="${temporary_dir}/stderr.log"
: > "${transcript}"
: > "${native_stderr}"
native_case_deadline=480
native_case_grace=15
test_entry=browser
if [[ ${selection} == off || ${selection} == makeme-only || ${selection} == neither ]]; then
  test_entry=legacy
fi
prompt="Add ${test_entry}/library.spec.mjs to test opening Atlas from the Library and following its related item to Boreal. Hold the Atlas response, verify Loading item before releasing it, and verify exactly the Atlas then Boreal reads. Use the README to run your scenario and confirm it passes. Leave application and harness files unchanged."
if [[ ${selection} == refactor ]]; then
  prompt='Use Dough Post Change Refactor for the current uncommitted change. Run each changed browser scenario using the README command. Preserve application and harness files, and do not commit or push.'
fi
printf '%s\n' "${prompt}" > "${temporary_dir}/prompt.txt"
status=0
git_publication_run_native_command || status=$?
printf '%s\n' "${tool_version}" > "${temporary_dir}/version.txt"
printf 'host=%s exit=%s outcome=%s stream=%s reason=%s\n' \
  "${platform}" "${status}" "${native_run_outcome}" "${native_run_stream_status}" "${native_run_failure_reason}" \
  | tee "${temporary_dir}/result.txt"
native_host_stream "${platform}" "${transcript}" calls > "${temporary_dir}/calls.jsonl" || true
native_host_stream "${platform}" "${transcript}" reads > "${temporary_dir}/reads.jsonl" || true
native_host_stream "${platform}" "${transcript}" tools > "${temporary_dir}/tools.jsonl" || true
exit "${status}"
