#!/usr/bin/env bash
# Own a native command's process group and wait with deadline plus grace.
# Defaults leave recorded-success substitutes unchanged. Timeout termination is
# for a later hung-attempt check; this file does not retry.
# shellcheck disable=SC2034,SC2154 # Supervisor/wrapper globals are shared API.

native_run_pid=
native_run_pgid=
native_run_outcome=exited

native_run_terminate_group() {
  local pgid=$1
  local pid=$2
  local grace=$3
  local waited=0

  if [[ -n ${pgid} ]]; then
    kill -s TERM -- "-${pgid}" 2> /dev/null || true
  fi
  kill -s TERM "${pid}" 2> /dev/null || true
  while ((waited < grace)); do
    if ! kill -0 "${pid}" 2> /dev/null; then
      return 0
    fi
    sleep 1
    waited=$((waited + 1))
  done
  if [[ -n ${pgid} ]]; then
    kill -s KILL -- "-${pgid}" 2> /dev/null || true
  fi
  kill -s KILL "${pid}" 2> /dev/null || true
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
  # shellcheck disable=SC2312 # ps/tr only format the owned pid's group.
  pgid=$(ps -o pgid= -p "${pid}" 2> /dev/null | tr -d '[:space:]')
  if [[ -z ${pgid} ]]; then
    pgid=${pid}
  fi
  native_run_pid=${pid}
  native_run_pgid=${pgid}

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

native_run_context_command() {
  case ${platform} in
    codex)
      native_codex_prepare "${temporary_dir}" "${candidate}"
      tool_version=$(codex --version 2>> "${native_stderr}")
      native_codex_build_command "${target}" "${output_file}" "${prompt}" \
        "${transcript}"
      native_run_owned "${transcript}" "${native_stderr}" '' \
        "${native_codex_command[@]}"
      ;;
    cursor)
      tool_version=$(cursor agent --version 2>> "${native_stderr}")
      native_run_owned "${transcript}" "${native_stderr}" "${target}" \
        cursor agent --print --force --trust --sandbox enabled \
        --output-format stream-json --workspace "${target}" "${prompt}"
      ;;
    claude)
      tool_version=$(claude --version 2>> "${native_stderr}")
      native_run_owned "${transcript}" "${native_stderr}" "${target}" \
        claude --print --permission-mode default \
        --allowedTools 'Read,Glob,Grep,Skill' --no-session-persistence \
        --output-format stream-json --verbose "${prompt}"
      ;;
    *) return 2 ;;
  esac
  case ${platform} in
    cursor | claude)
      jq -r 'select(.type == "result") | .result' "${transcript}" \
        > "${output_file}"
      ;;
    *) ;;
  esac
}
