#!/usr/bin/env bash
# Classify a selected native terminal stream as complete, truncated, missing,
# or unknown. Host event shapes stay here; callers map that onto run outcome.
# Recorded streams prove the adapter contract, not that runtimes emit them.
# shellcheck disable=SC2034 # native_run_stream_* are consumed by the supervisor.

native_run_stream_status=
native_run_stream_reason=

native_run_stream_jq() {
  local filter=$1
  local stream=$2

  jq -e -s "${filter}" "${stream}" > /dev/null 2>&1
}

native_run_stream_is_complete() {
  local host=$1
  local stream=$2

  case ${host} in
    cursor | claude)
      native_run_stream_jq 'any(.[]; .type == "result")' "${stream}"
      ;;
    codex)
      native_run_stream_jq 'any(.[]; .type == "item")' "${stream}"
      ;;
    *)
      return 1
      ;;
  esac
}

native_run_stream_is_known_partial() {
  local host=$1
  local stream=$2

  case ${host} in
    cursor)
      native_run_stream_jq 'any(.[]; has("tool_call") or has("type"))' \
        "${stream}"
      ;;
    claude)
      native_run_stream_jq 'any(.[]; has("message") or has("type"))' \
        "${stream}"
      ;;
    codex)
      native_run_stream_jq 'any(.[]; has("type"))' "${stream}"
      ;;
    *)
      return 1
      ;;
  esac
}

native_run_classify_stream() {
  local host=$1
  local stream=$2

  native_run_stream_status=
  native_run_stream_reason=
  if [[ ! -f ${stream} || ! -s ${stream} ]]; then
    native_run_stream_status=missing
    native_run_stream_reason='missing terminal stream'
    return 0
  fi
  if native_run_stream_is_complete "${host}" "${stream}"; then
    native_run_stream_status=complete
    native_run_stream_reason=
    return 0
  fi
  if native_run_stream_is_known_partial "${host}" "${stream}"; then
    native_run_stream_status=truncated
    native_run_stream_reason='truncated terminal stream'
    return 0
  fi
  native_run_stream_status=unknown
  native_run_stream_reason='unknown event shape'
}
