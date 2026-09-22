#!/usr/bin/env bash
# Native proof for the installed Git publication contract.
#
# Usage:
#   tests/git-publication-native.sh
#   tests/git-publication-native.sh --native codex
#   tests/git-publication-native.sh --native cursor
#   tests/git-publication-native.sh --native claude
#   tests/git-publication-native.sh --native HOST --case CASE
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
# shellcheck source=tests/support/git-publication-native-substitute-suite.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/git-publication-native-substitute-suite.sh"
# shellcheck source=tests/support/git-publication-native-host.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/git-publication-native-host.sh"
# shellcheck source=tests/support/ci-completion-native-run.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/ci-completion-native-run.sh"
# shellcheck source=tests/support/trunk-closure-native-run.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/trunk-closure-native-run.sh"
# shellcheck source=tests/support/story-branch-closure-native-run.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/story-branch-closure-native-run.sh"

usage() {
  cat >&2 << 'EOF'
usage: tests/git-publication-native.sh
   or: tests/git-publication-native.sh --native <codex|cursor|claude>
   or: tests/git-publication-native.sh --native HOST --case publication/JOURNEY
   or: tests/git-publication-native.sh --native codex --case story-branch-increment
   or: tests/git-publication-native.sh --native HOST --case execution-review/pending|ready|failure|skip-retro
   or: tests/git-publication-native.sh --native HOST --case trunk-closure/source|ignored-only
   or: tests/git-publication-native.sh --native HOST --case story-branch-closure/source-conflict
Credential-free default exercises the publication assessor and substitute
runner. --native HOST requires that host's CLI and runs the host's assigned
fresh-proof journeys against an installed candidate. --case selects one live
journey and rejects unknown cases before fixture setup.
EOF
}

native_flag=0
host_arg=''
case_arg=''

while [[ $# -gt 0 ]]; do
  case $1 in
    --native)
      native_flag=1
      shift
      ;;
    --case)
      if [[ $# -lt 2 ]]; then
        echo 'error: missing --case value' >&2
        usage
        exit 2
      fi
      case_arg=$2
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
  if [[ -n ${host_arg} || -n ${case_arg} ]]; then
    echo 'error: a host and --case require --native' >&2
    usage
    exit 2
  fi
  run_assessor_counterexamples
  run_trunk_closure_assessor_counterexamples
  run_story_closure_assessor_counterexamples
  run_substitute_host_journeys
  exit 0
fi

if [[ ${host_arg} != codex && ${host_arg} != cursor && ${host_arg} != claude ]]; then
  echo "error: unsupported or missing host '${host_arg}' (known: codex, cursor, claude)" >&2
  usage
  exit 2
fi

if [[ -n ${case_arg} ]] && ! native_case_known "${case_arg}"; then
  echo "error: unknown native case '${case_arg}'" >&2
  usage
  exit 2
fi

run_native_host "${host_arg}" "${case_arg}"
