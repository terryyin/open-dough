#!/usr/bin/env bash
# PATH substitute for credential-free selected delivery/updated-use runs.
# Logs every invocation, including version probes. The update stage applies the
# genuine local fixture installer against the target; the use stage emits
# recorded evidence. Does not infer an update from final payload bytes.
# Codex uses -C/-o plus a type:item complete event. Cursor and Claude Code emit
# stream-json type:result complete events; workspace comes from --workspace or PWD.
# NATIVE_AGENT_STREAM=truncated|missing|unknown skips apply and emits that shape.
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

if [[ ${NATIVE_AGENT_FAIL_STAGE:-} == "${stage}" ]]; then
  printf 'error: journey substitute failed the %s stage\n' "${stage}" >&2
  exit 1
fi

write_codex_complete() {
  printf '%s\n' '{"type":"item"}'
}

emit_codex_use_expansion() {
  skill_path="${workspace}/.agents/skills/dough-adr-awareness/SKILL.md"
  if [[ ! -f ${skill_path} ]]; then
    write_codex_complete
    return 0
  fi
  jq -n -c --arg path "${skill_path}" --arg content "$(cat "${skill_path}")" \
    '{type:"item",item:{path:$path,content:$content}}'
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
          printf '%s\n' '{"type":"thread.started"}'
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
  'Invocation: $dough-adr-awareness' \
  '' \
  'Stopped: architecture/decisions/CATALOG.md reports Replaced for ARC-12, while architecture/decisions/retain-complete-telemetry-history.md is Adopted. This conflict is unresolved. Cannot proceed until a human who owns precedence resolves the disagreement. No decision or implementation was changed.')

if [[ ${stage} == 'update' ]]; then
  if [[ ${host} == 'codex' && -z ${output_file} ]]; then
    printf 'error: journey substitute update requires -C and -o.\n' >&2
    exit 1
  fi
  url=
  if [[ ${prompt} =~ file://[^[:space:]]+ ]]; then
    url=${BASH_REMATCH[0]}
  fi
  if [[ -z ${url} ]]; then
    printf 'error: journey substitute could not find a file:// source URL.\n' >&2
    exit 1
  fi
  source_root=${url#file://}
  installer="${source_root}/src/install/open-dough-release.sh"
  if [[ ! -f ${installer} ]]; then
    printf 'error: journey substitute could not find installer at %s\n' \
      "${installer}" >&2
    exit 1
  fi
  platform=${host}
  case ${platform} in
    codex | cursor | claude) ;;
    *) platform=codex ;;
  esac
  if [[ ${host} == 'codex' ]]; then
    bash "${installer}" apply \
      --url "${url}" --target "${workspace}" --platform "${platform}" \
      > "${output_file}"
    write_codex_complete
    exit 0
  fi
  report=$(
    bash "${installer}" apply \
      --url "${url}" --target "${workspace}" --platform "${platform}"
  )
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
  exit 0
fi
if [[ ${host} == 'cursor' ]]; then
  emit_cursor_use_activation
fi
if [[ ${host} == 'claude' ]]; then
  emit_claude_use_skill_request
fi
write_stream_result "${use_response}"
