#!/usr/bin/env bash
# Credential-free proof for the admission publication journeys: investigation,
# continuation, correction and closure, each through substitute hosts and the
# shared supervisor/stream/retention path, followed by its real-state
# counterexamples. With a journey name it runs that journey alone, as its
# wrapper (tests/git-publication-native-admission-<journey>.sh) does for the
# suite. Their live counterparts run through
#   Distribution/tests/git-publication-native.sh --native HOST --case publication/admission-*
# shellcheck disable=SC2312
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
# shellcheck source=Distribution/tests/support/git-publication-native-run.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/support/git-publication-native-run.sh"
# shellcheck source=Distribution/tests/support/git-publication-native-suites.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/support/git-publication-native-suites.sh"
# shellcheck source=Distribution/tests/support/git-publication-native-substitute-suite.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/support/git-publication-native-substitute-suite.sh"

case ${1:-all} in
  all) run_substitute_admission_journeys ;;
  investigation | continuation | correction | closure)
    run_substitute_admission_journey "admission-$1"
    ;;
  *)
    printf 'Unknown admission journey: %s\n' "$1" >&2
    exit 2
    ;;
esac
