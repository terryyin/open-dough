#!/usr/bin/env bash
# PATH substitute that can version, then fail the session (nonzero or denied).
# Credential-free launch-failure proof only. Does not retry or call a real agent.
set -uo pipefail

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

host=${0##*/}
fail_code=${NATIVE_AGENT_FAIL_CODE:-1}
fail_message=${NATIVE_AGENT_FAIL_MESSAGE:-native agent failed}

if [[ ${host} == 'cursor' && ${1:-} == 'agent' && ${2:-} == '--version' ]]; then
  if [[ ${NATIVE_AGENT_FAIL_VERSION:-} == 1 ]]; then
    printf 'error: cursor agent version unavailable\n' >&2
    exit 1
  fi
  printf 'cursor-agent fail-1\n'
  exit 0
fi
if [[ ${host} == 'cursor' && ${1:-} == '--version' ]]; then
  printf 'cursor-editor fail-1\n'
  exit 0
fi
if [[ ${1:-} == '--version' ]]; then
  printf '%s fail-1\n' "${host}"
  exit 0
fi
if [[ ${host} == 'cursor' && ${1:-} == 'agent' ]]; then
  shift
fi

printf '%s\n' "${fail_message}" >&2
exit "${fail_code}"
