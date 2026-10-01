#!/usr/bin/env bash
# Credential-free proof for the admission publication journeys: investigation,
# continuation, correction and closure, each through substitute hosts and the
# shared supervisor/stream/retention path, followed by its real-state
# counterexamples. Their live counterparts run through
#   tests/git-publication-native.sh --native HOST --case publication/admission-*
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

run_substitute_admission_journeys
