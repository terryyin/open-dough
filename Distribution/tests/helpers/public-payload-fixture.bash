#!/usr/bin/env bash
# shellcheck disable=SC2034 # Sourced scenarios consume managed_files and internal_skill_names.
# Client payload expected by current-source install and release-fixture scenarios.
# Internal maintainer skills that must remain outside that payload.

internal_skill_names=(
  release-version
  reconcile-retrospective-findings
  triage-retrospective-findings
  author-open-dough-skills
  rebalance-ci-shards
)

# The current source's payload inventory is the single source of truth for
# the current client payload, whatever its release format.
fixture_repo_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=Distribution/src/install/open-dough-release-version.sh
source "${fixture_repo_root}/Distribution/src/install/open-dough-release-version.sh"
current_payload=$(read_release_payload "${fixture_repo_root}") || return 1
managed_files=()
while IFS= read -r managed_file; do
  managed_files+=("${managed_file}")
done <<< "${current_payload}"
