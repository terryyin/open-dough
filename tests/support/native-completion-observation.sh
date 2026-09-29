#!/usr/bin/env bash
# Shared native-proof helpers for one complete-revision call versus fixture-masked
# stop/await leftovers. Journey files keep their own observation field layouts.
# shellcheck disable=SC2034,SC2154,SC2312

native_stream_reader="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-host-stream.mjs"
# The node found before any harness wrapper goes first on PATH, so reading a
# stream is not itself recorded as one of the agent's node calls.
native_stream_node=$(command -v node)

# The shell commands host $1 started in its live stream $2 that contain text
# $3, one JSON string per line, from the shared reader. A stream without that
# text skips the reader, which keeps controller polls cheap.
native_stream_started_commands() {
  local host=$1 stream=$2 text=$3
  if [[ -z ${stream} || ! -f ${stream} ]] || ! grep -Fq -- "${text}" "${stream}"; then
    return 0
  fi
  NATIVE_NODE_CALL_LOG='' "${native_stream_node}" "${native_stream_reader}" \
    "${host}" "${stream}" commands | grep -F -- "${text}" || true
}

# Calls containing every text $4...: the node call log $1, or the commands host
# $2 started in stream $3, whichever sees more. Agents may quote paths or bypass
# the PATH node shim, so either source counts. The first text selects the
# stream's commands, so it names the call's script or subcommand.
native_started_call_count() {
  local node_log=$1 host=$2 transcript=$3 log_calls stream_calls text
  shift 3
  log_calls=$(grep -F -- "$1" "${node_log}" || true)
  stream_calls=$(native_stream_started_commands "${host}" "${transcript}" "$1")
  for text in "${@:2}"; do
    log_calls=$(grep -F -- "${text}" <<< "${log_calls}" || true)
    stream_calls=$(grep -F -- "${text}" <<< "${stream_calls}" || true)
  done
  log_calls=$(grep -c . <<< "${log_calls}" || true)
  stream_calls=$(grep -c . <<< "${stream_calls}" || true)
  printf '%s\n' "$((log_calls > stream_calls ? log_calls : stream_calls))"
}

# complete-revision calls for mailbox $4 and revision $5, from the node call log
# $1 or the commands host $2 started in stream $3.
native_completion_call_count() {
  local node_log=$1 host=$2 transcript=$3 mailbox=$4 sha=$5
  native_started_call_count "${node_log}" "${host}" "${transcript}" \
    complete-revision "${mailbox}" "${sha}"
}

# True once complete-revision for mailbox $4 and revision $5 has started, with
# the arguments of native_completion_call_count.
native_completion_seen() {
  (($(native_completion_call_count "$@") > 0))
}

# Revision $2 is registered in mailbox $1 once the mailbox holds its coverage
# record, which only the mailbox's own registration writes, whether a
# register-push command or managed delivery registered it.
native_completion_registered() {
  local mailbox=$1 sha=$2
  if [[ -f ${mailbox}/coverage/${sha}.json ]]; then
    printf 'true\n'
  else
    printf 'false\n'
  fi
}

native_completion_await_count() {
  local node_log=$1 mailbox=$2 sha=$3
  grep -Fc "await-revision ${mailbox} ${sha}" "${node_log}" || true
}

native_completion_stop_count() {
  local node_log=$1 mailbox=$2
  grep -Ec "[[:space:]]stop[[:space:]]+${mailbox}([[:space:]]|$)" "${node_log}" || true
}

# Echoes true when complete-revision produced a stopped/finished terminal without
# a fixture fallback stop masking missing product shutdown.
native_completion_product_shutdown() {
  local complete_count=$1 forced_stop_file=$2 terminal=$3
  local forced_stop=false
  [[ -n ${forced_stop_file} && -f ${forced_stop_file} ]] && forced_stop=true
  if [[ ${complete_count} -ge 1 && ${forced_stop} == false &&
    (${terminal} == stopped || ${terminal} == finished) ]]; then
    printf 'true\n'
  else
    printf 'false\n'
  fi
}

native_completion_forced_stop() {
  local forced_stop_file=$1
  if [[ -n ${forced_stop_file} && -f ${forced_stop_file} ]]; then
    printf 'true\n'
  else
    printf 'false\n'
  fi
}
