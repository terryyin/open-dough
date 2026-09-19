#!/usr/bin/env bash
# shellcheck disable=SC2312
# Native proof for the product backlog's Claude Code native-editing
# protection ("guard") and, in a later slice, its installed-workflow use.
#
# Usage:
#   tests/product-backlog-native.sh
#   tests/product-backlog-native.sh --native claude --case guard
#
# The default mode is deterministic: a real install plus the guard's
# decision function, with no real agent. --native claude --case guard spawns
# real `claude --print` sessions against a fixture project with the guard
# actually installed and registered.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/product-backlog-native-guard.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/product-backlog-native-guard.sh"

usage() {
  cat >&2 << 'EOF'
usage: tests/product-backlog-native.sh
   or: tests/product-backlog-native.sh --native claude --case guard
HOST is claude (Codex and Cursor are deferred to a separate plan).
CASE is guard: Claude Code PreToolUse edit-denial for the product backlog.
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

if [[ ${host_arg} != claude ]]; then
  echo "error: unsupported or missing host '${host_arg}' (only claude is implemented here; Codex and Cursor are deferred to .planning/quick/061-native-edit-protection-codex-cursor/PLAN.md)" >&2
  usage
  exit 2
fi
if [[ ${case_id} != guard ]]; then
  echo "error: unknown case '${case_id}' (known: guard)" >&2
  usage
  exit 2
fi

command -v claude > /dev/null || {
  echo 'error: claude CLI not found on PATH' >&2
  exit 1
}

guard_run_native "${source_dir}"
