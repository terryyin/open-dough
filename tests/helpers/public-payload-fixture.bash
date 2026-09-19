#!/usr/bin/env bash
# shellcheck disable=SC2034 # Sourced scenarios consume managed_files and internal_skill_names.
# Client payload expected by current-source install and release-fixture scenarios.
# Internal maintainer skills that must remain outside that payload.

internal_skill_names=(
  release-version
  reconcile-retrospective-findings
  triage-retrospective-findings
)

# install.sh's own managed_files=(...) declaration is the single source of
# truth for the current client payload; read it rather than hand-duplicating
# the list here, so this fixture cannot drift from the real installer.
fixture_repo_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=src/install/open-dough-release-version.sh
source "${fixture_repo_root}/src/install/open-dough-release-version.sh"
declared_managed_files=$(read_managed_files_declaration "${fixture_repo_root}/install.sh") || return 1
managed_files=()
while IFS= read -r managed_file; do
  managed_files+=("${managed_file}")
done <<< "${declared_managed_files}"
