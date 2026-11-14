#!/usr/bin/env bash
# shellcheck disable=SC2154 # The sourcing check sets command_status.
# A whole-report assertion for a check that runs a script into
# `${temporary_dir}/<name>.log` and records its exit in command_status.

# Fails unless <name>.log is exactly stdin and the command exited STATUS.
expect_report() {
  local log="${temporary_dir}/$1.log"
  if ((command_status != $2)) || ! diff -u -- - "${log}" > "${temporary_dir}/diff"; then
    printf 'FAIL: the %s report (exit %s, expected %s) differs:\n' \
      "$1" "${command_status}" "$2" >&2
    cat -- "${temporary_dir}/diff" >&2
    exit 1
  fi
}
