#!/usr/bin/env bash
# Hang substitute: start a child, emit partial output, ignore SIGTERM.
# Credential-free timeout proof only. Does not retry or call a real agent.
# shellcheck disable=SC2312 # ps/tr only format this hang pid's group.
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

if [[ ${host} == 'cursor' && ${1:-} == 'agent' && ${2:-} == '--version' ]]; then
  printf 'cursor-agent hang-1\n'
  exit 0
fi
if [[ ${host} == 'cursor' && ${1:-} == '--version' ]]; then
  printf 'cursor-editor hang-1\n'
  exit 0
fi
if [[ ${1:-} == '--version' ]]; then
  printf '%s hang-1\n' "${host}"
  exit 0
fi
if [[ ${host} == 'cursor' && ${1:-} == 'agent' ]]; then
  shift
fi

output_file=
args=("$@")
idx=0
while [[ ${idx} -lt ${#args[@]} ]]; do
  case ${args[idx]} in
    -o)
      idx=$((idx + 1))
      output_file=${args[idx]}
      ;;
    *) ;;
  esac
  idx=$((idx + 1))
done

if [[ -n ${output_file} ]]; then
  printf '%s\n' 'partial hang output' > "${output_file}"
fi
printf '%s\n' '{"type":"item","partial":true}'

trap '' TERM INT HUP
(
  trap '' TERM INT HUP
  while true; do
    sleep 60
  done
) &
hang_child=$!
if [[ -n ${NATIVE_AGENT_HANG_STATE:-} ]]; then
  hang_pgid=$(ps -o pgid= -p $$ | tr -d '[:space:]')
  {
    printf 'hang_pid=%s\n' "$$"
    printf 'hang_child=%s\n' "${hang_child}"
    printf 'hang_pgid=%s\n' "${hang_pgid}"
    printf 'hang_started=%s\n' "$(date +%s)"
  } > "${NATIVE_AGENT_HANG_STATE}"
fi
while true; do
  sleep 60
done
