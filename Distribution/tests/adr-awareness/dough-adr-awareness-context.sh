#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Shared fixture helpers supply and consume globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck source=Distribution/tests/helpers/public-payload-fixture.bash
source "${source_dir}/Distribution/tests/helpers/public-payload-fixture.bash"
source "${source_dir}/Distribution/tests/helpers/release-fixture.bash"
source "${source_dir}/Distribution/tests/helpers/fixture-cache.bash"
source "${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-proof.sh"
source "${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-use.sh"

source "${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-context-fixture.sh"

for platform in codex cursor claude; do
  target="${temporary_dir}/${platform}-adopter"
  prepare_installed_adr_awareness_target "${target}" "${candidate}" "${platform}"
  before=$(snapshot_path_state "${target}")
  assert_fresh_install "${platform}" "${target}"
  [[ ${before} == "$(snapshot_path_state "${target}")" ]]
done
[[ ${source_before} == "$(snapshot_path_state "${candidate}")" ]]
exit 0
