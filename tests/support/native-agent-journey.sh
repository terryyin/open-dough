#!/usr/bin/env bash
# PATH substitute for credential-free selected delivery/updated-use runs.
# Logs every invocation, including version probes. The update stage requires a
# no-URL prompt and applies the genuine local fixture installer from recorded
# SOURCE; the use stage emits recorded evidence. Does not infer an update from
# final payload bytes.
# Codex uses -C/-o plus item.completed activity and a terminal turn.completed
# event. Cursor and Claude Code emit stream-json type:result complete events;
# workspace comes from --workspace or PWD.
# NATIVE_AGENT_STREAM=truncated|missing|unknown skips apply and emits that shape.
# NATIVE_AGENT_TRUNCATE_INSTALLED_SKILL=1 applies for real, then drops the
# installed dough-adr-awareness/SKILL.md's last line, so the update stream
# still completes while the payload compare fails afterward.
# shellcheck disable=SC2016,SC2249,SC2312 # Literal invocation marker; optional flag scan.
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
  printf 'cursor-agent journey-1\n'
  exit 0
fi
if [[ ${host} == 'cursor' && ${1:-} == '--version' ]]; then
  printf 'cursor-editor journey-1\n'
  exit 0
fi
if [[ ${1:-} == '--version' ]]; then
  printf '%s journey-1\n' "${host}"
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
if [[ -z ${workspace} ]]; then
  workspace=${PWD}
fi
stream_kind=${NATIVE_AGENT_STREAM:-complete}

stage=
if [[ ${prompt} == *'dough-update'* ]]; then
  stage=update
elif [[ ${prompt} == *'dough-adr-awareness'* ]]; then
  stage=use
else
  printf 'error: journey substitute could not classify the native prompt.\n' >&2
  exit 1
fi

if [[ ${stage} == 'update' ]] && [[ ${prompt} =~ file://|https?:// ]]; then
  printf 'error: journey substitute update prompt must omit a source URL.\n' >&2
  exit 1
fi

if [[ ${NATIVE_AGENT_FAIL_STAGE:-} == "${stage}" ]]; then
  printf 'error: journey substitute failed the %s stage\n' "${stage}" >&2
  exit 1
fi

write_codex_complete() {
  jq -n -c \
    '{type:"item.completed",item:{id:"item_0",type:"agent_message",text:"Recorded journey stage completed."}}'
  printf '%s\n' '{"type":"turn.completed"}'
}

emit_codex_use_expansion() {
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

emit_cursor_use_activation() {
  skill_path="${workspace}/.cursor/skills/dough-adr-awareness/SKILL.md"
  jq -n -c --arg path "${skill_path}" --arg content "$(cat "${skill_path}")" \
    '{tool_call:{readToolCall:{args:{path:$path},result:{success:{content:$content}}}}}'
}

emit_claude_use_skill_request() {
  jq -n -c \
    '{message:{content:[{type:"tool_use",name:"Skill",input:{skill:"dough-adr-awareness"}}]}}'
}

write_stream_result() {
  jq -n -c --arg result "$1" '{type:"result",result:$result}'
}

emit_incomplete_stream() {
  case ${stream_kind} in
    missing)
      exit 0
      ;;
    unknown)
      printf '%s\n' '{"unrecognized":true}'
      exit 0
      ;;
    truncated)
      case ${host} in
        cursor)
          printf '%s\n' '{"tool_call":{}}'
          ;;
        claude)
          printf '%s\n' '{"message":{}}'
          ;;
        *)
          jq -n -c \
            '{type:"item.completed",item:{id:"item_0",type:"agent_message",text:"Partial response before terminal completion."}}'
          ;;
      esac
      exit 0
      ;;
    *)
      printf 'error: journey substitute does not implement stream %s\n' \
        "${stream_kind}" >&2
      exit 1
      ;;
  esac
}

if [[ ${stream_kind} != 'complete' ]]; then
  emit_incomplete_stream
fi

use_response=$(printf '%s\n' \
  'Stopped: architecture/decisions/CATALOG.md reports Replaced for ARC-12, while architecture/decisions/retain-complete-telemetry-history.md is Adopted. This conflict is unresolved. Cannot proceed until a human who owns precedence resolves the disagreement. No decision or implementation was changed.')

if [[ ${stage} == 'update' ]]; then
  if [[ ${host} == 'codex' && -z ${output_file} ]]; then
    printf 'error: journey substitute update requires -C and -o.\n' >&2
    exit 1
  fi
  platform=${host}
  case ${platform} in
    codex | cursor | claude) ;;
    *) platform=codex ;;
  esac
  dest="${workspace}/.agents/skills/dough-update"
  case ${platform} in
    cursor) dest="${workspace}/.cursor/skills/dough-update" ;;
    claude) dest="${workspace}/.claude/skills/dough-update" ;;
  esac
  if [[ ! -f "${dest}/SOURCE" ]]; then
    printf 'error: journey substitute could not find recorded SOURCE at %s\n' \
      "${dest}/SOURCE" >&2
    exit 1
  fi
  recorded=$(cat "${dest}/SOURCE")
  source_root=${recorded#file://}
  if [[ ${recorded} == "${source_root}" ]]; then
    printf 'error: journey substitute recorded SOURCE is not a file URL.\n' >&2
    exit 1
  fi
  installer="${source_root}/src/install/open-dough-release.sh"
  if [[ ! -f "${installer}" ]]; then
    printf 'error: journey substitute could not find installer at %s\n' \
      "${installer}" >&2
    exit 1
  fi
  truncate_installed_skill() {
    local skill_dir installed
    skill_dir=$(dirname -- "${dest}")
    installed="${skill_dir}/dough-adr-awareness/SKILL.md"
    [[ -f ${installed} ]] || return 0
    sed -e '$d' -- "${installed}" > "${installed}.short"
    mv -- "${installed}.short" "${installed}"
  }
  if [[ ${host} == 'codex' ]]; then
    bash "${installer}" apply \
      --target "${workspace}" --platform "${platform}" \
      > "${output_file}"
    if [[ -n ${NATIVE_AGENT_TRUNCATE_INSTALLED_SKILL:-} ]]; then
      truncate_installed_skill
    fi
    write_codex_complete
    exit 0
  fi
  report=$(
    bash "${installer}" apply \
      --target "${workspace}" --platform "${platform}"
  )
  if [[ -n ${NATIVE_AGENT_TRUNCATE_INSTALLED_SKILL:-} ]]; then
    truncate_installed_skill
  fi
  write_stream_result "${report}"
  exit 0
fi

if [[ ${host} == 'codex' ]]; then
  if [[ -z ${output_file} ]]; then
    printf 'error: journey substitute use requires -o.\n' >&2
    exit 1
  fi
  printf '%s\n' "${use_response}" > "${output_file}"
  emit_codex_use_expansion
  printf '%s\n' '{"type":"turn.completed"}'
  exit 0
fi
if [[ ${host} == 'cursor' ]]; then
  emit_cursor_use_activation
fi
if [[ ${host} == 'claude' ]]; then
  emit_claude_use_skill_request
fi
write_stream_result "${use_response}"
