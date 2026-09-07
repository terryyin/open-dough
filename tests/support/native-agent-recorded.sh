#!/usr/bin/env bash
# PATH substitute for credential-free selected context runs.
# Logs every invocation, including version probes, then emits recorded streams.
# shellcheck disable=SC2249,SC2312 # Optional flag scan; pipefail covers jq args.
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

host=${0##*/}

if [[ ${host} == 'cursor' && ${1:-} == 'agent' && ${2:-} == '--version' ]]; then
  printf 'cursor-agent recorded-1\n'
  exit 0
fi
if [[ ${host} == 'cursor' && ${1:-} == '--version' ]]; then
  printf 'cursor-editor recorded-1\n'
  exit 0
fi
if [[ ${1:-} == '--version' ]]; then
  printf '%s recorded-1\n' "${host}"
  exit 0
fi
if [[ ${host} == 'cursor' && ${1:-} == 'agent' ]]; then
  shift
fi

output_file=
workspace=
args=("$@")
idx=0
while [[ ${idx} -lt ${#args[@]} ]]; do
  case ${args[idx]} in
    -o)
      idx=$((idx + 1))
      output_file=${args[idx]}
      ;;
    --workspace | -C)
      idx=$((idx + 1))
      workspace=${args[idx]}
      ;;
  esac
  idx=$((idx + 1))
done
prompt=${args[$((${#args[@]} - 1))]}

if [[ ${prompt} == *'statuses agree'* ]]; then
  response='Accepted ADR 0001-session-state.md keeps session state in Redis.

## ADR CHECK COMPLETE'
else
  response='Stopped: docs/adrs/README.md lists 0001 as Proposed, while 0001-session-state.md is Accepted. This conflict is unresolved. Cannot proceed until a human clarifies or resolves the disagreement.'
fi

case ${host} in
  codex)
    printf '%s\n' "${response}" > "${output_file}"
    printf '%s\n' '{"type":"item"}'
    ;;
  cursor)
    if [[ -z ${workspace} ]]; then
      workspace=${PWD}
    fi
    skill_path="${workspace}/.cursor/skills/dough-adr-awareness/SKILL.md"
    jq -n -c --arg path "${skill_path}" --arg content "$(cat "${skill_path}")" \
      '{tool_call:{readToolCall:{args:{path:$path},result:{success:{content:$content}}}}}'
    jq -n -c --arg result "${response}" '{type:"result",result:$result}'
    ;;
  claude)
    jq -n -c \
      '{message:{content:[{type:"tool_use",name:"Skill",input:{skill:"dough-adr-awareness"}}]}}'
    jq -n -c --arg result "${response}" '{type:"result",result:$result}'
    ;;
  *)
    printf 'error: recorded substitute does not implement host %s\n' "${host}" >&2
    exit 1
    ;;
esac
