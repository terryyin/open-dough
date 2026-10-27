#!/usr/bin/env bash
# Copies the suite runner, the parts it sources or runs, and the modules those
# import into a fixture's scripts/ directory, so adding a runner file edits one
# place.

# copy_runner FIXTURE copies the runner into FIXTURE/scripts/.
copy_runner() {
  local fixture=$1 runner_source
  runner_source=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
  cp -- "${runner_source}/scripts/test.sh" "${runner_source}/scripts/test-jobs.sh" \
    "${runner_source}/scripts/test-shares.mjs" "${runner_source}/scripts/share-deal.mjs" \
    "${runner_source}/scripts/duration-list.mjs" \
    "${runner_source}"/scripts/*.bash "${fixture}/scripts/"
}
