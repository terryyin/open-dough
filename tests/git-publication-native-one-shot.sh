#!/usr/bin/env bash
# Credential-free proof for the one-shot journeys: result, queued,
# escalation, review, refinement, default checkout, automatic landing, its
# ownership stop and an established start, each through substitute hosts and the
# shared supervisor/stream/retention path, followed by its real-state
# counterexamples. Their live counterparts run through
#   tests/git-publication-native.sh --native HOST --case publication/one-shot-*
#   tests/git-publication-native.sh --native HOST --case preparation/one-shot-refinement
# shellcheck disable=SC2312
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/git-publication-native-run.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/git-publication-native-run.sh"
# shellcheck source=tests/support/git-publication-native-suites.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/git-publication-native-suites.sh"
# shellcheck source=tests/support/git-publication-native-substitute-suite.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/git-publication-native-substitute-suite.sh"

case ${1:-all} in
  all) run_substitute_one_shot_journeys ;;
  results) run_substitute_one_shot_result_journeys ;;
  workspaces) run_substitute_one_shot_workspace_journeys ;;
  *)
    printf 'Unknown one-shot journey group: %s\n' "$1" >&2
    exit 2
    ;;
esac
