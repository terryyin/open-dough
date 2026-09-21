#!/usr/bin/env bash
# Native proof for the installed Git publication contract.
#
# Usage:
#   tests/git-publication-native.sh
#   tests/git-publication-native.sh --native codex
#   tests/git-publication-native.sh --native cursor
#   tests/git-publication-native.sh --native claude
#
# Default mode is credential-free: assessor counterexamples plus substitute
# processes through the shared supervisor/stream/retention path. --native HOST
# launches a fresh host session against an installed publication candidate.
# shellcheck disable=SC2312
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/git-publication-native-assess.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/git-publication-native-assess.sh"
# shellcheck source=tests/support/git-publication-native-run.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/git-publication-native-run.sh"
# shellcheck source=tests/support/git-publication-native-suites.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/git-publication-native-suites.sh"
# shellcheck source=tests/support/git-publication-native-host.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/git-publication-native-host.sh"

usage() {
  cat >&2 << 'EOF'
usage: tests/git-publication-native.sh
   or: tests/git-publication-native.sh --native <codex|cursor|claude>
Credential-free default exercises the publication assessor and substitute
runner. --native HOST requires that host's CLI and runs the host's assigned
fresh-proof journeys against an installed candidate.
EOF
}

native_flag=0
host_arg=''

while [[ $# -gt 0 ]]; do
  case $1 in
    --native)
      native_flag=1
      shift
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
  if [[ -n ${host_arg} ]]; then
    echo 'error: a host requires --native' >&2
    usage
    exit 2
  fi
  run_assessor_counterexamples
  run_substitute_host_journeys
  exit 0
fi

if [[ ${host_arg} != codex && ${host_arg} != cursor && ${host_arg} != claude ]]; then
  echo "error: unsupported or missing host '${host_arg}' (known: codex, cursor, claude)" >&2
  usage
  exit 2
fi

run_native_host "${host_arg}"
