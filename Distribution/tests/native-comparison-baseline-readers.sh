#!/usr/bin/env bash
# Purpose: changed stream or session-discovery interpretation obtains fresh
# evidence when an archive lacks the raw inputs needed to replay those readers.
# shellcheck disable=SC1091,SC2154,SC2312 # Shared comparison fixture owns resources.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
source "${source_dir}/Distribution/tests/support/native-comparison-pair-fixture.sh"
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT
native_comparison_pair_fixture "${source_dir}" "${work}"
quiet=$(native_comparison_fixture_rule "${work}" quiet)
native_comparison_fixture_capture "${work}" "${quiet}" original
saved="${work}/original.json"
original=$(shasum -a 256 "${saved}")

# A reader change is not a current-assessor correction: only its old scalar
# metrics and stream digest survive, so another native baseline must be observed.
for reader in native-host-stream-adapters.mjs native-codex-session.mjs; do
  before=$(native_comparison_fixture_sessions "${work}")
  prior=$(shasum -a 256 "${saved}")
  [[ -f ${work}/source/Distribution/tests/support/${reader} ]]
  printf '\n// A changed evidence interpretation.\n' >> "${work}/source/Distribution/tests/support/${reader}"
  native_comparison_fixture_git "${work}/source" add -A
  native_comparison_fixture_git "${work}/source" commit -q -m "Change ${reader} interpretation"
  record=$(native_comparison_fixture_record "${work}" "${quiet}" "${quiet}" concurrent "${reader}" --reuse-baseline "${saved}")
  after=$(native_comparison_fixture_sessions "${work}")
  [[ ${after} -eq $((before + 2)) ]] || {
    printf 'FAIL: changed %s started %s sessions, expected two fresh arms\n' "${reader}" "$((after - before))" >&2
    exit 1
  }
  grep -Fqx 'baseline-acquisition: fresh' "${record}"
  grep -q 'saved baseline insufficient: case, project setup or runner inputs differ' "${record}"
  [[ ${prior} == "$(shasum -a 256 "${saved}")" ]]
  saved="$(dirname -- "${record}")/baseline.json"
  [[ -s ${saved} ]]
done
[[ ${original} == "$(shasum -a 256 "${work}/original.json")" ]]
