#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2034,SC2312 # Sourced asserts use work paths; pipefail covers listings.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
context_wrapper="${source_dir}/tests/dough-adr-awareness-context.sh"
codex_wrapper="${source_dir}/tests/dough-adr-awareness-codex-delivery-to-use.sh"
cursor_wrapper="${source_dir}/tests/dough-adr-awareness-cursor-delivery-to-use.sh"
claude_wrapper="${source_dir}/tests/dough-adr-awareness-claude-delivery-to-use.sh"

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
cp -- "${source_dir}/tests/support/native-agent-sentinel.sh" "${sentinel_bin}/codex"
cp -- "${source_dir}/tests/support/native-agent-sentinel.sh" "${sentinel_bin}/cursor"
cp -- "${source_dir}/tests/support/native-agent-sentinel.sh" "${sentinel_bin}/claude"
chmod a+x "${sentinel_bin}/codex" "${sentinel_bin}/cursor" "${sentinel_bin}/claude"
export PATH="${sentinel_bin}:${PATH}"
export NATIVE_AGENT_SENTINEL_LOG="${sentinel_log}"

# shellcheck source=tests/support/native-case-assert.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-case-assert.sh"

context_listing=$(assert_listing_quiet "${context_wrapper}" --list)
codex_listing=$(assert_listing_quiet "${codex_wrapper}" --list)
cursor_listing=$(assert_listing_quiet "${cursor_wrapper}" --list \
  --results-dir "${readonly_results}")
claude_listing=$(assert_listing_quiet "${claude_wrapper}" \
  --results-dir "${results_dir}" --list)

for host in codex cursor claude; do
  assert_record "${context_listing}" "${host}" context/clear \
    'fresh install' 'prior-evidence: none' 'dependencies: none'
  assert_record "${context_listing}" "${host}" context/conflict \
    'disagree' 'prior-evidence: none' 'dependencies: none'
done
[[ $(grep -c '^case: context/clear$' <<< "${context_listing}" || true) -eq 3 ]]
[[ $(grep -c '^case: context/conflict$' <<< "${context_listing}" || true) -eq 3 ]]

assert_record "${codex_listing}" codex delivery/legacy-refusal \
  'v0.2.0' 'prior-evidence: none' 'dependencies: none' 'unavailable'
assert_record "${codex_listing}" codex delivery/ordinary-update \
  'inspected bootstrap' 'newer local tagged fixture' \
  'not a native legacy-refusal' 'unavailable'
assert_record "${codex_listing}" codex delivery/updated-use \
  'ordinary no-URL' 'recorded SOURCE' 'one attempt' 'dependencies: none'
assert_record "${cursor_listing}" cursor delivery/legacy-refusal \
  'v0.2.0' 'unavailable'
assert_record "${cursor_listing}" cursor delivery/ordinary-update \
  'inspected bootstrap' 'not a native legacy-refusal' 'unavailable'
assert_record "${cursor_listing}" cursor delivery/updated-use \
  'ordinary no-URL' 'recorded SOURCE' 'one attempt'
assert_record "${claude_listing}" claude delivery/legacy-refusal \
  'v0.2.0' 'unavailable'
assert_record "${claude_listing}" claude delivery/ordinary-update \
  'inspected bootstrap' 'not a native legacy-refusal' 'unavailable'
assert_record "${claude_listing}" claude delivery/updated-use \
  'ordinary no-URL' 'recorded SOURCE' 'one attempt' 'dependencies: none'

for listing in "${codex_listing}" "${cursor_listing}" "${claude_listing}"; do
  grep -Fq 'unavailable for selected launch' <<< "${listing}"
  grep -Fq 'combined ordinary no-URL update then fresh use journey in one attempt' <<< "${listing}"
done

for host_listing in \
  "codex:${codex_listing}" "cursor:${cursor_listing}" "claude:${claude_listing}"; do
  host=${host_listing%%:*}
  listing=${host_listing#*:}
  updated_use_record=$(record_for "${listing}" "${host}" delivery/updated-use)
  if grep -Fq 'attempt ID' <<< "${updated_use_record}"; then
    echo "FAIL: ${host} delivery/updated-use listing still depends on an attempt ID." >&2
    printf '%s\n' "${updated_use_record}" >&2
    exit 1
  fi
  if grep -Fq 'delivery/ordinary-update' <<< "${updated_use_record}"; then
    echo "FAIL: ${host} delivery/updated-use listing still depends on a separate ordinary-update case." >&2
    printf '%s\n' "${updated_use_record}" >&2
    exit 1
  fi
done

if grep -Eiq 'certified|prior-evidence: pass|reuse accepted' \
  <<< "${context_listing}${codex_listing}${cursor_listing}${claude_listing}"; then
  echo 'FAIL: listing certified prior evidence.' >&2
  exit 1
fi

mkdir -p -- "${results_dir}/cursor/context/clear/attempt-1"
printf 'status: pass\n' > "${results_dir}/cursor/context/clear/attempt-1/record"
unreviewed_listing=$(run_wrapper "${context_wrapper}" --list \
  --results-dir "${results_dir}")
assert_no_sentinel_calls
assert_watched_empty
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
assert_invalid "${context_wrapper}" --native cursor --case delivery/legacy-refusal
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
assert_invalid "${claude_wrapper}" --case delivery/legacy-refusal
assert_invalid "${codex_wrapper}" --native --case delivery/legacy-refusal --bogus

# Recognized selected delivery --case: unavailable stages fail before setup.
# Selected delivery/updated-use launch is covered by the adapter proofs.
assert_invalid "${codex_wrapper}" --native --case delivery/legacy-refusal
grep -Fq 'unavailable for selected launch' "${stderr_file}"
assert_invalid "${codex_wrapper}" --native --case delivery/ordinary-update
grep -Fq 'unavailable for selected launch' "${stderr_file}"
assert_invalid "${cursor_wrapper}" --native --case delivery/legacy-refusal
assert_invalid "${cursor_wrapper}" --native --case delivery/ordinary-update
assert_invalid "${claude_wrapper}" --native --case delivery/legacy-refusal
assert_invalid "${claude_wrapper}" --native --case delivery/ordinary-update

printf 'Running existing default wrapper checks.\n'
bash "${context_wrapper}"
bash "${codex_wrapper}"
bash "${cursor_wrapper}"
bash "${claude_wrapper}"
assert_no_sentinel_calls

echo 'PASS: native case listing and invalid selection stay off the native path, and default checks still pass.'
