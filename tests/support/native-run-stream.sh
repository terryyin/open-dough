#!/usr/bin/env bash
# Classify a selected native terminal stream as complete, truncated, missing,
# or unknown, as the shared stream reader reads it; callers map that onto run
# outcome. Recorded streams prove the adapter contract, not that runtimes emit
# them.
# shellcheck disable=SC2034 # native_run_stream_* are consumed by the supervisor.

# shellcheck source=tests/support/native-host-stream.sh
# shellcheck disable=SC1091,SC2312
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-host-stream.sh"

native_run_stream_status=
native_run_stream_reason=

native_run_classify_stream() {
  local host=$1
  local stream=$2
  local status

  native_run_stream_status=
  native_run_stream_reason=
  if [[ ! -f ${stream} || ! -s ${stream} ]]; then
    native_run_stream_status=missing
    native_run_stream_reason='missing terminal stream'
    return 0
  fi
  # An unknown host, or a reader failure, leaves the shape unknown.
  status=$(native_host_stream "${host}" "${stream}" status 2> /dev/null) || status=
  case ${status} in
    complete)
      native_run_stream_status=complete
      ;;
    truncated)
      native_run_stream_status=truncated
      native_run_stream_reason='truncated terminal stream'
      ;;
    *)
      native_run_stream_status=unknown
      native_run_stream_reason='unknown event shape'
      ;;
  esac
}
