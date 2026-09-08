#!/usr/bin/env bash
# PATH substitute for credential-free selected context runs.
# Logs every invocation, including version probes, then emits recorded streams.
# NATIVE_AGENT_STREAM selects complete (default), truncated, missing, or unknown.
# Synthetic streams prove adapter contracts, not that native runtimes emit them.
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
stream_kind=${NATIVE_AGENT_STREAM:-complete}
if [[ -z ${workspace} ]]; then
  workspace=${PWD}
fi

index="${workspace}/docs/adrs/README.md"
record="${workspace}/docs/adrs/0001-session-state.md"
if [[ -f ${index} && -f ${record} ]] \
  && grep -Eq '\| \[0001\][^|]*\| Proposed \|' "${index}" \
  && grep -Eq '\*\*Status:\*\* Accepted' "${record}"; then
  response='Stopped: docs/adrs/README.md lists 0001 as Proposed, while 0001-session-state.md is Accepted. This conflict is unresolved. Cannot proceed until a human clarifies or resolves the disagreement.'
else
  response='Accepted ADR 0001-session-state.md keeps session state in Redis. Both backend instances should follow that decision for shared login sessions.'
fi

write_codex_response() {
  if [[ -n ${output_file} ]]; then
    printf '%s\n' "${response}" > "${output_file}"
  fi
}

emit_cursor_partial() {
  skill_path="${workspace}/.cursor/skills/dough-adr-awareness/SKILL.md"
  jq -n -c --arg path "${skill_path}" --arg content "$(cat "${skill_path}")" \
    '{tool_call:{readToolCall:{args:{path:$path},result:{success:{content:$content}}}}}'
}

emit_claude_partial() {
  jq -n -c \
    '{message:{content:[{type:"tool_use",name:"Skill",input:{skill:"dough-adr-awareness"}}]}}'
}

emit_codex_expansion() {
  skill_path="${workspace}/.agents/skills/dough-adr-awareness/SKILL.md"
  if [[ ! -f ${skill_path} ]]; then
    jq -n -c \
      '{type:"item.completed",item:{id:"item_0",type:"agent_message",text:"Installed skill was not found."}}'
    return 0
  fi
  jq -n -c --arg command "sed -n '1,260p' '${skill_path}'" \
    --arg content "$(cat "${skill_path}")" \
    '{type:"item.completed",item:{id:"item_0",type:"command_execution",command:$command,aggregated_output:$content,exit_code:0,status:"completed"}}'
}

emit_codex_turn_completed() {
  printf '%s\n' '{"type":"turn.completed"}'
}

case ${stream_kind} in
  missing)
    write_codex_response
    exit 0
    ;;
  unknown)
    write_codex_response
    printf '%s\n' '{"unrecognized":true}'
    exit 0
    ;;
  truncated)
    write_codex_response
    case ${host} in
      codex)
        jq -n -c \
          '{type:"item.completed",item:{id:"item_0",type:"agent_message",text:"Partial response before terminal completion."}}'
        ;;
      cursor)
        emit_cursor_partial
        ;;
      claude)
        emit_claude_partial
        ;;
      *)
        printf 'error: recorded substitute does not implement host %s\n' \
          "${host}" >&2
        exit 1
        ;;
    esac
    exit 0
    ;;
  complete) ;;
  *)
    printf 'error: recorded substitute does not implement stream %s\n' \
      "${stream_kind}" >&2
    exit 1
    ;;
esac

case ${host} in
  codex)
    write_codex_response
    emit_codex_expansion
    emit_codex_turn_completed
    ;;
  cursor)
    emit_cursor_partial
    jq -n -c --arg result "${response}" '{type:"result",result:$result}'
    ;;
  claude)
    emit_claude_partial
    jq -n -c --arg result "${response}" '{type:"result",result:$result}'
    ;;
  *)
    printf 'error: recorded substitute does not implement host %s\n' "${host}" >&2
    exit 1
    ;;
esac
