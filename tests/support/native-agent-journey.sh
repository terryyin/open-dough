#!/usr/bin/env bash
# PATH substitute for credential-free selected delivery/updated-use runs.
# Logs every invocation, including version probes. The update stage applies the
# genuine local fixture installer against the target; the use stage emits
# recorded evidence. Does not infer an update from final payload bytes.
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

if [[ ${stage} == 'update' ]]; then
  if [[ -z ${workspace} || -z ${output_file} ]]; then
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
  bash "${installer}" apply \
    --url "${url}" --target "${workspace}" --platform "${platform}" \
    > "${output_file}"
  write_codex_complete
  exit 0
fi

if [[ -z ${output_file} ]]; then
  printf 'error: journey substitute use requires -o.\n' >&2
  exit 1
fi
printf '%s\n' \
  'Invocation: $dough-adr-awareness' \
  '' \
  'Stopped: architecture/decisions/CATALOG.md reports Replaced for ARC-12, while architecture/decisions/retain-complete-telemetry-history.md is Adopted. This conflict is unresolved. Cannot proceed until a human who owns precedence resolves the disagreement. No decision or implementation was changed.' \
  > "${output_file}"
write_codex_complete
