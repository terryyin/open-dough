#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/release-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/publication-update-proof.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
fixture="${temporary_dir}/source"
helper="${source_dir}/src/install/open-dough-release.sh"
older="${temporary_dir}/older"
# Model a release before decomposition and refinement, including its declared payload.
node "${source_dir}/tests/support/release-source.mjs" "${fixture}" << 'JSON'
{"revisions": [
  {"name": "release 0.1.1 before-stories", "release": {
    "version": "0.1.1", "taggedAt": "2026-09-01T00:00:00",
    "marker": "before-stories",
    "withheld": ["dough-story-decomposition/", "dough-story-refinement/"],
    "removed": ["dough-story-decomposition", "dough-story-refinement"]}},
  {"name": "release 0.1.2 with-stories", "release": {
    "version": "0.1.2", "taggedAt": "2026-09-02T00:00:00",
    "marker": "with-stories"}}
]}
JSON
checkout_tagged_release "${fixture}" "${older}" 0.1.1

# The codex and cursor hints select the same .agents entry root, so cursor
# represents both; claude reads the .claude entry root.
for platform in cursor claude; do
  target="${temporary_dir}/${platform}"
  prepare_target "${target}"
  write_project_configuration "${target}"
  bash "${older}/install.sh" --target "${target}" --source "${fixture}" --platform "${platform}" > /dev/null
  # A new managed reference must not overwrite an unrelated pre-existing file.
  collision="${target}/.claude/skills/dough-story-refinement/references/planning.md"
  mkdir -p -- "${collision%/*}"
  printf '%s\n' 'Local planning guidance.' > "${collision}"
  before=$(snapshot_path_state "${target}")
  if bash "${helper}" apply --target "${target}" --platform "${platform}" > /dev/null 2>&1; then
    echo 'FAIL: candidate-only dependency overwrote local guidance.' >&2
    exit 1
  fi
  after=$(snapshot_path_state "${target}")
  [[ "${before}" == "${after}" ]]
  rm -- "${collision}"
  bash "${helper}" apply --target "${target}" --platform "${platform}" > /dev/null
  for root in .agents/skills .claude/skills; do
    assert_payload "${target}/${root}/dough-update" 0.1.2 with-stories
    assert_installed_publication_modules "${target}/${root}"
  done
  assert_sentinels "${target}"
  assert_project_configuration "${target}"
done
