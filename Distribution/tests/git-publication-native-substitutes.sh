#!/usr/bin/env bash
# Credential-free proof for the remaining substitute-host publication journeys:
# publish-boundary on each host, its whole-run rejected cases, and the
# local-only, claim-race, uncertain-recovery, preparation, story-branch,
# trunk-closure, story-branch-closure, bug-disposition and land-default
# journeys through the shared supervisor/stream/retention path. One-shot,
# owned-context and admission substitutes keep their own jobs. Live
# counterparts run through
#   Distribution/tests/git-publication-native.sh --native HOST --case …
# shellcheck disable=SC2312
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
# shellcheck source=Distribution/tests/support/git-publication-native-run.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/support/git-publication-native-run.sh"
# shellcheck source=Distribution/tests/support/git-publication-native-suites.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/support/git-publication-native-suites.sh"
# shellcheck source=Distribution/tests/support/git-publication-native-counterexamples.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/support/git-publication-native-counterexamples.sh"
# shellcheck source=Distribution/tests/support/git-publication-native-substitute-suite.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/support/git-publication-native-substitute-suite.sh"

run_substitute_host_journeys
