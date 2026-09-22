#!/usr/bin/env bash
# shellcheck disable=SC2312
# Native proof for the product backlog's native-editing
# protection ("guard") and its installed-workflow use.
#
# Usage:
#   tests/product-backlog-native.sh
#   tests/product-backlog-native.sh --native claude --case guard
#   tests/product-backlog-native.sh --native codex --case guard
#   tests/product-backlog-native.sh --native cursor --case guard
#   tests/product-backlog-native.sh --native claude --case use
#   tests/product-backlog-native.sh --native codex --case use
#   tests/product-backlog-native.sh --native cursor --case use
#   tests/product-backlog-native.sh --native claude --case take
#
# The default mode is deterministic: a real install plus the guard's
# decision function, with no real agent. --native claude --case guard spawns
# real `claude --print` sessions against a fixture project with the guard
# actually installed and registered. --native claude --case use spawns real
# `claude --print` sessions that discover and run the installed product
# backlog Git merge adapter on a real two-branch conflict, then resume it
# after explicit human repair.
# --native codex --case guard spawns fresh isolated `codex exec` sessions with
# the installed repo-local hook trusted for that bounded native run.
# --native cursor --case guard spawns fresh isolated `cursor agent --print`
# sessions against a fixture project with the installed Cursor preToolUse
# guard. --native cursor --case use runs the installed-workflow journey
# through Cursor Agent.
# --native codex --case use runs the same installed-workflow journey through
# fresh isolated `codex exec` sessions and observes their actual script calls.
# --native claude --case take asks a fresh session to start a resolved plan,
# then observes its installed writer call and the resulting claim.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/product-backlog-native-guard.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/product-backlog-native-guard.sh"
# shellcheck source=tests/support/product-backlog-native-guard-claude.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/product-backlog-native-guard-claude.sh"
# shellcheck source=tests/support/product-backlog-native-guard-codex.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/product-backlog-native-guard-codex.sh"
# shellcheck source=tests/support/product-backlog-native-guard-cursor.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/product-backlog-native-guard-cursor.sh"
# shellcheck source=tests/support/product-backlog-native-use.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/product-backlog-native-use.sh"
# shellcheck source=tests/support/product-backlog-native-use-hosts.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/product-backlog-native-use-hosts.sh"
# shellcheck source=tests/support/product-backlog-native-take.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/product-backlog-native-take.sh"
# shellcheck source=tests/support/native-codex.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-codex.sh"

usage() {
  cat >&2 << 'EOF'
usage: tests/product-backlog-native.sh
   or: tests/product-backlog-native.sh --native claude --case guard
   or: tests/product-backlog-native.sh --native <claude|codex|cursor> --case <guard|use>
   or: tests/product-backlog-native.sh --native claude --case take
HOST is claude, codex, or cursor.
CASE is guard (native PreToolUse/preToolUse edit-denial for the product backlog)
or use (the installed Git merge adapter's conflict stop and human-repaired
resume, discovered by a fresh native session from ordinary-language guidance),
or take (a fresh Claude Code session starts a planned story through the
installed backlog writer).
EOF
}

native_flag=0
host_arg=''
case_id=''

while [[ $# -gt 0 ]]; do
  case $1 in
    --native)
      native_flag=1
      shift
      ;;
    --case)
      if [[ $# -lt 2 || $2 == --* ]]; then
        echo 'error: missing --case value' >&2
        usage
        exit 2
      fi
      case_id=$2
      shift 2
      ;;
    --help | -h)
      usage
      exit 0
      ;;
    --*)
      echo "error: unknown option $1" >&2
      usage
      exit 2
      ;;
    *)
      if [[ -n ${host_arg} ]]; then
        echo "error: unexpected argument $1" >&2
        usage
        exit 2
      fi
      host_arg=$1
      shift
      ;;
  esac
done

if [[ ${native_flag} -eq 0 ]]; then
  if [[ -n ${host_arg} || -n ${case_id} ]]; then
    echo 'error: --case and a host require --native' >&2
    usage
    exit 2
  fi
  guard_run_deterministic "${source_dir}"
  exit 0
fi

if [[ ${host_arg} != claude && ${host_arg} != codex && ${host_arg} != cursor ]]; then
  echo "error: unsupported or missing host '${host_arg}' (known: claude, codex, cursor)" >&2
  usage
  exit 2
fi
case ${case_id} in
  guard | use) ;;
  take)
    if [[ ${host_arg} != claude ]]; then
      echo "error: case 'take' requires host 'claude'" >&2
      usage
      exit 2
    fi
    ;;
  *)
    echo "error: unknown case '${case_id}' (known: guard, use, take)" >&2
    usage
    exit 2
    ;;
esac

command -v "${host_arg}" > /dev/null || {
  echo "error: ${host_arg} CLI not found on PATH" >&2
  exit 1
}

case ${case_id} in
  guard)
    case ${host_arg} in
      codex) guard_run_native_codex "${source_dir}" ;;
      cursor) guard_run_native_cursor "${source_dir}" ;;
      *) guard_run_native "${source_dir}" ;;
    esac
    ;;
  use) use_run_native "${source_dir}" "${host_arg}" ;;
  take) take_run_native "${source_dir}" ;;
  *)
    echo "error: internal error: unreachable case '${case_id}'" >&2
    exit 2
    ;;
esac
