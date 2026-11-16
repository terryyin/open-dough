#!/usr/bin/env bash
# Shell access to the one native host stream reader (native-host-stream.mjs).
# Callers read views of a Claude, Codex, or Cursor stream here instead of
# matching host event shapes themselves.
# shellcheck disable=SC2312

native_stream_reader="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-host-stream.mjs"

# View $3 of host $1's stream $2 (see native-host-stream.mjs for the views).
# Reading a stream is not one of the agent's node calls: whichever node PATH
# finds, including a harness recording wrapper, records it nowhere.
native_host_stream() {
  NATIVE_NODE_CALL_LOG=/dev/null node "${native_stream_reader}" "$@"
}

# The shell commands host $1 started in its live stream $2 that contain text
# $3, one JSON string per line. A stream without that text skips the reader,
# which keeps controller polls cheap.
native_stream_started_commands() {
  local host=$1 stream=$2 text=$3
  if [[ -z ${stream} || ! -f ${stream} ]] || ! grep -Fq -- "${text}" "${stream}"; then
    return 0
  fi
  native_host_stream "${host}" "${stream}" commands | grep -F -- "${text}" || true
}
