#!/usr/bin/env bash
# Own a native command's process group and wait with deadline plus grace.
# Defaults leave recorded-success substitutes unchanged. Timeout does not retry.
# Bound: terminate only the owned group, never the caller's process group.
# Stream completeness uses native_run_classify_stream from native-run-stream.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Supervisor/wrapper globals; ps formats pids.

native_run_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=tests/support/native-run-stream.sh
# shellcheck disable=SC1091
source "${native_run_support_dir}/native-run-stream.sh"

native_run_outcome=exited
native_run_failure_reason=

native_run_pgid_of() {
  ps -o pgid= -p "$1" 2> /dev/null | tr -d '[:space:]'
}

native_run_signal_owned() {
  local signal=$1
  local pgid=$2
  local pid=$3
  local caller_pgid=$4

  if [[ -n ${pgid} && ${pgid} != "${caller_pgid}" ]]; then
    kill -s "${signal}" -- "-${pgid}" 2> /dev/null || true
  fi
  kill -s "${signal}" "${pid}" 2> /dev/null || true
}

native_run_terminate_group() {
  local pgid=$1
  local pid=$2
  local grace=$3
  local waited=0
  local caller_pgid
  caller_pgid=$(native_run_pgid_of $$)

  native_run_signal_owned TERM "${pgid}" "${pid}" "${caller_pgid}"
  while ((waited < grace)); do
    if ! kill -0 "${pid}" 2> /dev/null; then
      return 0
    fi
    sleep 1
    waited=$((waited + 1))
  done
  native_run_signal_owned KILL "${pgid}" "${pid}" "${caller_pgid}"
}

native_run_child_pgid() {
  local pid=$1
  local parent_pgid=$2
  local pgid tries=0

  while ((tries < 50)); do
    if ! kill -0 "${pid}" 2> /dev/null; then
      printf '%s\n' "${pid}"
      return 0
    fi
    pgid=$(native_run_pgid_of "${pid}")
    if [[ -n ${pgid} && ${pgid} != "${parent_pgid}" ]]; then
      printf '%s\n' "${pgid}"
      return 0
    fi
    sleep 0.05
    tries=$((tries + 1))
  done
  printf '%s\n' "${pid}"
}

native_run_watchdog() {
  local pid=$1
  local pgid=$2
  local deadline=$3
  local grace=$4
  local sentinel=$5
  local timeout_flag=$6
  local sleeper=

  trap 'if [[ -n ${sleeper} ]]; then kill "${sleeper}" 2>/dev/null || true; wait "${sleeper}" 2>/dev/null || true; fi; exit 0' TERM INT
  sleep "${deadline}" &
  sleeper=$!
  wait "${sleeper}" || true
  sleeper=
  if [[ ! -f ${sentinel} ]]; then
    exit 0
  fi
  : > "${timeout_flag}"
  native_run_terminate_group "${pgid}" "${pid}" "${grace}"
}

native_run_spawn_group() {
  local workdir=$1
  shift
  if [[ -n ${workdir} ]]; then
    cd -- "${workdir}" || exit 127
  fi
  if command -v setsid > /dev/null 2>&1; then
    exec setsid "$@"
  fi
  if command -v perl > /dev/null 2>&1; then
    exec perl -e 'setpgrp(0, 0) or die $!; exec { $ARGV[0] } @ARGV or die $!' -- "$@"
  fi
  printf 'error: native run requires setsid or perl to own a process group\n' >&2
  exit 127
}

native_run_owned() {
  local stdout_file=$1
  local stderr_file=$2
  local workdir=$3
  shift 3
  local deadline grace pid pgid status watchdog sentinel timeout_flag
  deadline=${native_case_deadline:-3600}
  grace=${native_case_grace:-15}
  status=0
  native_run_outcome=exited
  sentinel=$(mktemp "${TMPDIR:-/tmp}/native-run.XXXXXX")
  timeout_flag="${sentinel}.timed-out"

  native_run_spawn_group "${workdir}" "$@" > "${stdout_file}" 2>> "${stderr_file}" &
  pid=$!
  # Wait until setsid/setpgrp detaches; do not sample the caller's group.
  pgid=$(native_run_child_pgid "${pid}" "$(native_run_pgid_of $$)")

  native_run_watchdog "${pid}" "${pgid}" "${deadline}" "${grace}" \
    "${sentinel}" "${timeout_flag}" &
  watchdog=$!

  wait "${pid}" || status=$?
  rm -f "${sentinel}"
  if [[ -f ${timeout_flag} ]]; then
    wait "${watchdog}" 2> /dev/null || true
    rm -f "${timeout_flag}"
    native_run_outcome=timeout
    return 124
  fi
  kill -s TERM "${watchdog}" 2> /dev/null || true
  wait "${watchdog}" 2> /dev/null || true
  rm -f "${timeout_flag}"
  return "${status}"
}

native_run_mark_failed() {
  native_run_outcome=failed
  native_run_failure_reason=$1
  tool_version=${tool_version:-unknown}
}

native_run_capture_version() {
  local version status=0
  version=$("$@" 2>> "${native_stderr}") || status=$?
  if [[ ${status} -ne 0 || -z ${version} ]]; then
    tool_version=unknown
    return 0
  fi
  tool_version=${version}
}

native_run_require_host() {
  if command -v "${platform}" > /dev/null 2>&1; then
    return 0
  fi
  printf 'error: missing executable: %s\n' "${platform}" >> "${native_stderr}"
  native_run_mark_failed 'missing executable'
  return 127
}

native_run_owned_or_fail() {
  local status=0
  native_run_owned "$@" || status=$?
  if ((status == 0)); then
    return 0
  fi
  if [[ ${native_run_outcome} != timeout ]]; then
    case ${status} in
      126) native_run_mark_failed 'permission denied' ;;
      127) native_run_mark_failed 'missing executable' ;;
      *) native_run_mark_failed "native command exited ${status}" ;;
    esac
  fi
  return "${status}"
}

native_run_context_command() {
  tool_version=unknown
  case ${platform} in
    codex | cursor | claude) ;;
    *) return 2 ;;
  esac
  native_run_require_host || return $?
  case ${platform} in
    codex)
      native_codex_prepare "${temporary_dir}" "${candidate}"
      native_run_capture_version codex --version
      native_codex_build_command "${target}" "${output_file}" "${prompt}" \
        "${transcript}"
      native_run_owned_or_fail "${transcript}" "${native_stderr}" '' \
        "${native_codex_command[@]}" || return $?
      ;;
    cursor)
      native_run_capture_version cursor agent --version
      native_run_owned_or_fail "${transcript}" "${native_stderr}" "${target}" \
        cursor agent --print --force --trust --sandbox enabled \
        --output-format stream-json --workspace "${target}" "${prompt}" \
        || return $?
      ;;
    claude)
      native_run_capture_version claude --version
      native_run_owned_or_fail "${transcript}" "${native_stderr}" "${target}" \
        claude --print --permission-mode default \
        --allowedTools 'Read,Glob,Grep,Skill' --no-session-persistence \
        --output-format stream-json --verbose "${prompt}" || return $?
      ;;
    *) return 2 ;;
  esac
  native_run_classify_stream "${platform}" "${transcript}"
  if [[ ${native_run_stream_status} != complete ]]; then
    native_run_outcome=incomplete
    native_run_failure_reason=${native_run_stream_reason}
    case ${platform} in
      cursor | claude)
        jq -r 'select(.type == "result") | .result' "${transcript}" \
          > "${output_file}" 2> /dev/null || : > "${output_file}"
        ;;
      *) ;;
    esac
    return 1
  fi
  case ${platform} in
    cursor | claude)
      jq -r 'select(.type == "result") | .result' "${transcript}" \
        > "${output_file}"
      ;;
    *) ;;
  esac
}
