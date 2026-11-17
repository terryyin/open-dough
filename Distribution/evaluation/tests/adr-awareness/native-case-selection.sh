#!/usr/bin/env bash
# Native case listing and invalid case selection are answered without
# launching the native path.
# shellcheck disable=SC1091,SC2034,SC2312 # Sourced asserts use work paths; pipefail covers listings.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
context_wrapper="${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-context.sh"
codex_wrapper="${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-codex-delivery-to-use.sh"
cursor_wrapper="${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-cursor-delivery-to-use.sh"
claude_wrapper="${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-claude-delivery-to-use.sh"

work_dir=$(mktemp -d)
finish() {
  chmod -R u+w "${work_dir}" 2> /dev/null || true
  rm -rf -- "${work_dir}"
}
trap finish EXIT

sentinel_bin="${work_dir}/bin"
sentinel_log="${work_dir}/sentinel.log"
watched_dir="${work_dir}/watched"
results_dir="${work_dir}/results"
readonly_results="${work_dir}/readonly-results"
stderr_file="${work_dir}/stderr.txt"
stdout_file="${work_dir}/stdout.txt"
mkdir -p -- "${sentinel_bin}" "${watched_dir}" "${results_dir}" "${readonly_results}"
chmod a-w "${readonly_results}"
: > "${sentinel_log}"
cp -- "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-agent-sentinel.sh" "${sentinel_bin}/codex"
cp -- "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-agent-sentinel.sh" "${sentinel_bin}/cursor"
cp -- "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-agent-sentinel.sh" "${sentinel_bin}/claude"
chmod a+x "${sentinel_bin}/codex" "${sentinel_bin}/cursor" "${sentinel_bin}/claude"
export PATH="${sentinel_bin}:${PATH}"
export NATIVE_AGENT_SENTINEL_LOG="${sentinel_log}"

# shellcheck source=Distribution/evaluation/tests/native-harness/support/native-case-assert.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/evaluation/tests/native-harness/support/native-case-assert.sh"

context_listing=$(assert_listing_quiet "${context_wrapper}" --list)
codex_listing=$(assert_listing_quiet "${codex_wrapper}" --list)
cursor_listing=$(assert_listing_quiet "${cursor_wrapper}" --list \
  --results-dir "${readonly_results}")
claude_listing=$(assert_listing_quiet "${claude_wrapper}" \
  --results-dir "${results_dir}" --list)

for listing in "${context_listing}" "${codex_listing}" "${cursor_listing}" \
  "${claude_listing}"; do
  assert_records_show_layout "${listing}"
done

if grep -Eiq 'certified|prior-evidence: pass|reuse accepted' \
  <<< "${context_listing}${codex_listing}${cursor_listing}${claude_listing}"; then
  echo 'FAIL: listing certified prior evidence.' >&2
  exit 1
fi

mkdir -p -- "${results_dir}/cursor/context/clear/attempt-1"
printf 'status: pass\n' > "${results_dir}/cursor/context/clear/attempt-1/record"
unreviewed_listing=$(assert_listing_quiet "${context_wrapper}" --list \
  --results-dir "${results_dir}")
unreviewed_record=$(record_for "${unreviewed_listing}" cursor context/clear)
grep -Fq 'prior-evidence: unreviewed' <<< "${unreviewed_record}"
if grep -Eq 'prior-evidence: (pass|certified|accepted)' <<< "${unreviewed_record}"; then
  echo 'FAIL: listing treated a planted result as certified.' >&2
  printf '%s\n' "${unreviewed_record}" >&2
  exit 1
fi
record_for "${unreviewed_listing}" cursor context/conflict \
  | grep -Fq 'prior-evidence: none'

assert_invalid "${context_wrapper}" --native zed clear
assert_invalid "${context_wrapper}" --native cursor fog
assert_invalid "${context_wrapper}" --native cursor --case not-a-case
assert_invalid "${context_wrapper}" --native cursor --case delivery/updated-use
assert_invalid "${context_wrapper}" --bogus
assert_invalid "${context_wrapper}" --list --native cursor clear
assert_invalid "${context_wrapper}" --list --deadline 3600
assert_invalid "${context_wrapper}" --deadline 3600
assert_invalid "${context_wrapper}" --native cursor clear --deadline
assert_invalid "${context_wrapper}" --native cursor clear --deadline 0
assert_invalid "${context_wrapper}" --native cursor clear --deadline -1
assert_invalid "${context_wrapper}" --native cursor clear --grace nope
assert_invalid "${context_wrapper}" --native cursor clear --grace
assert_invalid "${codex_wrapper}" --native junk
assert_invalid "${codex_wrapper}" --native --case not-a-case
assert_invalid "${codex_wrapper}" --native --case context/clear
assert_invalid "${codex_wrapper}" --native --unknown
assert_invalid "${cursor_wrapper}" --native extra
assert_invalid "${claude_wrapper}" --case delivery/not-a-case
assert_invalid "${codex_wrapper}" --native --case delivery/not-a-case --bogus
