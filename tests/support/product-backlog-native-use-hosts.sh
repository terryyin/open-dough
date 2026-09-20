#!/usr/bin/env bash
# Host session running and transcript observation for the shared product
# backlog native installed-workflow-use journey
# (tests/support/product-backlog-native-use.sh).
# shellcheck disable=SC2034,SC2154,SC2312 # Globals and shared helpers come from the sourcing test.

use_hosts_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=tests/support/native-run-supervise.sh
# shellcheck disable=SC1091
source "${use_hosts_support_dir}/native-run-supervise.sh"

use_assert_codex_call() {
  local transcript=$1
  local invocation=$2
  local label=$3
  if ! grep -F '"type":"item.started"' "${transcript}" \
    | grep -Fq "${invocation}"; then
    printf 'FAIL: native Codex transcript did not show the installed merge adapter %s call.\n' \
      "${label}" >&2
    return 1
  fi
}

use_assert_cursor_call() {
  local transcript=$1
  local invocation=$2
  local label=$3
  local observed
  observed=$(
    jq -r '.. | objects | select(has("tool_call")) |
      .tool_call | .. | objects | .args? // empty | .. | strings' \
      "${transcript}"
    jq -r '.. | objects |
      (.command? // .args.command? // .input.command? // empty) | strings' \
      "${transcript}"
  )
  if ! printf '%s\n' "${observed}" | grep -Fq "${invocation}"; then
    printf 'FAIL: native Cursor stream did not show the installed merge adapter %s call.\n' \
      "${label}" >&2
    return 1
  fi
}

use_assert_host_adapter_call() {
  local host=$1
  local transcript=$2
  local invocation=$3
  local label=$4
  case ${host} in
    codex) use_assert_codex_call "${transcript}" "${invocation}" "${label}" ;;
    cursor) use_assert_cursor_call "${transcript}" "${invocation}" "${label}" ;;
    *) ;;
  esac
}

use_run_cursor_session() {
  local target=$1
  local output_file=$2
  local prompt=$3
  local transcript=$4
  local platform=cursor
  local native_stderr="${transcript}.stderr"
  local native_run_workspace=${target}
  : > "${native_stderr}"
  native_run_context_command || {
    printf 'FAIL: native Cursor session did not complete (%s).\n' \
      "${native_run_failure_reason:-outcome=${native_run_outcome}}" >&2
    return 1
  }
}

use_run_host_session() {
  local host=$1
  local target=$2
  local output_file=$3
  local prompt=$4
  local transcript=${5:-}
  case ${host} in
    codex)
      native_codex_run \
        "${target}" "${output_file}" "${prompt}" "${transcript}" \
        bypass-hook-trust
      ;;
    cursor)
      use_run_cursor_session \
        "${target}" "${output_file}" "${prompt}" "${transcript}"
      ;;
    *)
      (
        cd -- "${target}" || exit
        claude --print --dangerously-skip-permissions \
          --no-session-persistence "${prompt}"
      ) > "${output_file}" 2>&1
      ;;
  esac
}

use_native_tool_version() {
  local host=$1
  case ${host} in
    cursor) cursor agent --version ;;
    *) ${host} --version ;;
  esac
}
