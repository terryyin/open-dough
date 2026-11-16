#!/usr/bin/env bash
# Shared assertions for native case listing and invalid-selection proofs.
# shellcheck disable=SC2154,SC2311,SC2312 # Proof script assigns paths; pipefail covers listings.

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
