#!/usr/bin/env bash
# Shared EXIT-trap cleanup for the product backlog's native cases (guard, use,
# take): a passing run removes its temporary directory; a failing run prints
# the retained evidence files and a `PRESERVED: <dir>` line on stderr and keeps
# the directory.

# Usage: product_backlog_native_cleanup STATUS LABEL EVIDENCE_GLOB DIR
# LABEL names the case in the failure line ("Claude Code guard"); EVIDENCE_GLOB
# is the file-name pattern, within DIR, of the evidence files to print.
product_backlog_native_cleanup() {
  local status=$1
  local label=$2
  local evidence_glob=$3
  local directory=$4
  local evidence
  if [[ ${status} -eq 0 ]]; then
    rm -rf -- "${directory}"
    return
  fi
  printf '\nFAIL: preserving native %s evidence after status %s.\n' \
    "${label}" "${status}" >&2
  # The glob is expanded here on purpose.
  # shellcheck disable=SC2231
  for evidence in "${directory}"/${evidence_glob}; do
    [[ -f ${evidence} ]] || continue
    printf '%s\n' "--- $(basename -- "${evidence}") ---" >&2
    cat "${evidence}" >&2
  done
  printf 'PRESERVED: %s\n' "${directory}" >&2
}
