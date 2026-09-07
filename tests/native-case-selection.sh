#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2312 # Helpers are linted separately; pipefail covers listings.
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

assert_no_sentinel_calls() {
  if [[ -s ${sentinel_log} ]]; then
    echo 'FAIL: sentinel recorded native command invocations.' >&2
    cat "${sentinel_log}" >&2
    return 1
  fi
}

assert_watched_empty() {
  local leftover
  leftover=$(find "${watched_dir}" -mindepth 1 -print)
  if [[ -n ${leftover} ]]; then
    echo 'FAIL: wrapper created files under the watched TMPDIR.' >&2
    printf '%s\n' "${leftover}" >&2
    return 1
  fi
}

run_wrapper() {
  env TMPDIR="${watched_dir}" PATH="${PATH}" \
    NATIVE_AGENT_SENTINEL_LOG="${sentinel_log}" \
    bash "$@"
}

record_for() {
  local listing=$1
  local host=$2
  local case_id=$3
  local record
  record=$(awk -v h="${host}" -v c="${case_id}" '
    BEGIN { RS = "" }
    index($0, "host: " h "\n") == 1 && $0 ~ ("\ncase: " c "(\n|$)") {
      print
      found = 1
      exit
    }
    END { if (!found) exit 1 }
  ' <<< "${listing}") || {
    printf 'FAIL: missing record host=%s case=%s\n' "${host}" "${case_id}" >&2
    printf '%s\n' "${listing}" >&2
    return 1
  }
  printf '%s\n' "${record}"
}

assert_record() {
  local listing=$1
  local host=$2
  local case_id=$3
  shift 3
  local record snippet
  record=$(record_for "${listing}" "${host}" "${case_id}")
  grep -Fq 'purpose:' <<< "${record}"
  grep -Fq 'setup:' <<< "${record}"
  grep -Fq 'dependencies:' <<< "${record}"
  grep -Fq 'prior-evidence:' <<< "${record}"
  for snippet in "$@"; do
    grep -Fq "${snippet}" <<< "${record}" || {
      printf 'FAIL: %s %s omitted %s\n' "${host}" "${case_id}" "${snippet}" >&2
      printf '%s\n' "${record}" >&2
      return 1
    }
  done
}

assert_listing_quiet() {
  local wrapper=$1
  local listing
  shift
  listing=$(run_wrapper "${wrapper}" "$@")
  assert_no_sentinel_calls
  assert_watched_empty
  grep -Fq 'usage:' <<< "${listing}"
  printf '%s\n' "${listing}"
}

assert_invalid() {
  local status
  : > "${stderr_file}"
  : > "${stdout_file}"
  set +e
  run_wrapper "$@" > "${stdout_file}" 2> "${stderr_file}"
  status=$?
  set -e
  if [[ ${status} -eq 0 ]]; then
    echo 'FAIL: expected a nonzero usage error.' >&2
    printf 'command: %s\n' "$*" >&2
    cat "${stdout_file}" >&2
    cat "${stderr_file}" >&2
    return 1
  fi
  grep -Fq 'error:' "${stderr_file}"
  grep -Fq 'usage:' "${stderr_file}"
  assert_no_sentinel_calls
  assert_watched_empty
}

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
  'v0.2.0' 'prior-evidence: none' 'dependencies: none'
assert_record "${codex_listing}" codex delivery/ordinary-update \
  'inspected bootstrap' 'newer local tagged fixture' \
  'not a native legacy-refusal'
assert_record "${codex_listing}" codex delivery/updated-use \
  'delivery/ordinary-update' 'same isolated target' 'attempt ID'
assert_record "${cursor_listing}" cursor delivery/legacy-refusal 'v0.2.0'
assert_record "${cursor_listing}" cursor delivery/ordinary-update \
  'inspected bootstrap' 'not a native legacy-refusal'
assert_record "${cursor_listing}" cursor delivery/updated-use \
  'delivery/ordinary-update'
assert_record "${claude_listing}" claude delivery/legacy-refusal 'v0.2.0'
assert_record "${claude_listing}" claude delivery/ordinary-update \
  'inspected bootstrap' 'not a native legacy-refusal'
assert_record "${claude_listing}" claude delivery/updated-use \
  'delivery/ordinary-update' 'attempt ID'

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

# Recognized selected delivery --case must not set up or launch.
assert_invalid "${codex_wrapper}" --native --case delivery/legacy-refusal
assert_invalid "${cursor_wrapper}" --native --case delivery/ordinary-update
assert_invalid "${claude_wrapper}" --native --case delivery/updated-use

printf 'Running existing default wrapper checks.\n'
bash "${context_wrapper}"
bash "${codex_wrapper}"
bash "${cursor_wrapper}"
bash "${claude_wrapper}"
assert_no_sentinel_calls

echo 'PASS: native case listing and invalid selection stay off the native path, and default checks still pass.'
