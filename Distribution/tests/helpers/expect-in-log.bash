#!/usr/bin/env bash
# A runner report assertion that says what it missed. A bare `grep -q` under
# `set -e` would end the test silently, hiding the report that failed it.

# Asserts that LOG has a line matching the grep arguments, or prints the log.
expect_in_log() {
  local log=$1
  shift
  if ! grep -q "$@" "${log}"; then
    printf 'FAIL: %s has no line matching: %s\n' "${log##*/}" "${*: -1}" >&2
    cat -- "${log}" >&2
    exit 1
  fi
}
