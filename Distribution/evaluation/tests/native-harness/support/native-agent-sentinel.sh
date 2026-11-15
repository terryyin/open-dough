#!/usr/bin/env bash
# Substitute Codex/Cursor/Claude CLI that logs every invocation, including
# version probes. Used only by credential-free native-selection tests.
set -euo pipefail

if [[ -z ${NATIVE_AGENT_SENTINEL_LOG:-} ]]; then
  printf 'error: NATIVE_AGENT_SENTINEL_LOG must name a writable log file.\n' >&2
  exit 1
fi

{
  printf '%s' "${0##*/}"
  if [[ $# -gt 0 ]]; then
    printf ' %s' "$@"
  fi
  printf '\n'
} >> "${NATIVE_AGENT_SENTINEL_LOG}"

printf 'error: native agent sentinel must not be invoked during listing or invalid selection.\n' >&2
exit 1
