#!/usr/bin/env bash
# Credential-free proof for the one-shot journeys: result, queued,
# escalation, review and refinement, each through substitute hosts and the
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

run_substitute_one_shot_journeys
