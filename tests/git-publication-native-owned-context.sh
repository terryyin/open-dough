#!/usr/bin/env bash
# Credential-free proof for the owned-context journeys, where the repository
# has no default checkout: startup in a new owned workspace, preparation
# landed through Dough Land, and Trunk Mode closure. Startup and preparation
# each run once through a substitute host, and the closure once on each host,
# whose coordinator owns its CI observer differently; all through the shared
# supervisor/stream/retention path, followed by their assessor
# counterexamples. Their live counterparts run through
#   tests/git-publication-native.sh --native HOST --case publication/startup-owned-context
#   tests/git-publication-native.sh --native HOST --case publication/preparation-land
#   tests/git-publication-native.sh --native HOST --case trunk-closure/owned-context
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
# shellcheck source=tests/support/trunk-closure-native-run.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/trunk-closure-native-run.sh"
# shellcheck source=tests/support/git-publication-native-owned-context-suite.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/git-publication-native-owned-context-suite.sh"

run_substitute_owned_context_journeys
