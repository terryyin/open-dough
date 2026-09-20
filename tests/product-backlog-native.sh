#!/usr/bin/env bash
# shellcheck disable=SC2312
# Native proof for the product backlog's native-editing
# protection ("guard") and its installed-workflow use.
#
# Usage:
#   tests/product-backlog-native.sh
#   tests/product-backlog-native.sh --native claude --case guard
#   tests/product-backlog-native.sh --native codex --case guard
#   tests/product-backlog-native.sh --native claude --case use
#   tests/product-backlog-native.sh --native codex --case use
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
# --native codex --case use runs the same installed-workflow journey through
# fresh isolated `codex exec` sessions and observes their actual script calls.
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
# shellcheck source=tests/support/product-backlog-native-use.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/product-backlog-native-use.sh"
# shellcheck source=tests/support/native-codex.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-codex.sh"

usage() {
  cat >&2 << 'EOF'
usage: tests/product-backlog-native.sh
   or: tests/product-backlog-native.sh --native claude --case guard
   or: tests/product-backlog-native.sh --native <claude|codex> --case <guard|use>
HOST is claude or codex.
CASE is guard (native PreToolUse edit-denial for the product backlog)
or use (the installed Git merge adapter's conflict stop and human-repaired
resume, discovered by a fresh native session from ordinary-language guidance).
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

if [[ ${host_arg} != claude && ${host_arg} != codex ]]; then
  echo "error: unsupported or missing host '${host_arg}' (known: claude, codex)" >&2
  usage
  exit 2
fi
case ${case_id} in
  guard | use) ;;
  *)
    echo "error: unknown case '${case_id}' (known: guard, use)" >&2
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
    if [[ ${host_arg} == codex ]]; then
      guard_run_native_codex "${source_dir}"
    else
      guard_run_native "${source_dir}"
    fi
    ;;
  use) use_run_native "${source_dir}" "${host_arg}" ;;
  *)
    echo "error: internal error: unreachable case '${case_id}'" >&2
    exit 2
    ;;
esac
