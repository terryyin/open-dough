#!/usr/bin/env bash
# shellcheck disable=SC2310,SC2312 # The refusal is the expected outcome; assertions read fixture records through command substitution.
# Update from a list-era release to a directory-format release at apply.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/helpers/release-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/helpers/publication-update-proof.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
directory_only='dough-update/references/directory-only.md'
legacy='dough-legacy-only/SKILL.md'
proposed='Distribution/proposed/dough-proposed/SKILL.md'

# A list-era release ships a legacy file; the directory release drops it, adds
# a file named only by its directory entry, and keeps Proposed content outside.
build_fixture() {
  local fixture=$1 directory_added=$2
  node "${source_dir}/Distribution/tests/support/release-source.mjs" "${fixture}" << JSON
{"revisions": [
  {"name": "release 0.1.1 list-era", "release": {
    "version": "0.1.1", "taggedAt": "2026-09-01T00:00:00", "marker": "list-era",
    "declaration": "grouped", "added": {"${legacy}": "legacy from 0.1.1\\n"}}},
  {"name": "release 0.1.2 directory", "release": {
    "version": "0.1.2", "taggedAt": "2026-09-02T00:00:00", "marker": "directory",
    "added": {${directory_added}}},
    "files": {"${proposed}": "Proposed guidance\\n"},
    "remove": ["Distribution/src/skills/${legacy%%/*}"]}
]}
JSON
}

# Installs 0.1.1 into a fresh project and prints the fixture's source URL.
install_list_era() {
  local fixture=$1 target=$2 older_checkout
  older_checkout="${temporary_dir}/release-0.1.1-${target##*/}"
  checkout_tagged_release "${fixture}" "${older_checkout}" 0.1.1
  prepare_target "${target}"
  write_project_configuration "${target}"
  bash "${older_checkout}/install.sh" --target "${target}" \
    --source "file://$(cd -- "${fixture}" && pwd -P)" --platform codex > /dev/null
}

apply_update() {
  bash "${source_dir}/Distribution/src/install/open-dough-release.sh" apply \
    --target "$1" --platform codex
}

fixture="${temporary_dir}/fixture.git"
target="${temporary_dir}/project"
build_fixture "${fixture}" "\"${directory_only}\": \"directory-only bytes\\n\""
install_list_era "${fixture}" "${target}"
for root in "${target}/.agents/skills" "${target}/.claude/skills"; do
  [[ -f "${root}/${legacy}" && ! -e "${root}/${directory_only}" ]]
done

output=$(apply_update "${target}")
[[ "${output}" == *'to 0.1.2'* ]]
for root in "${target}/.agents/skills" "${target}/.claude/skills"; do
  git -C "${fixture}" show "v0.1.2:Distribution/src/skills/${directory_only}" \
    | cmp -s - "${root}/${directory_only}"
  [[ ! -e "${root}/${legacy}" && ! -e "${root}/${legacy%%/*}" ]]
  [[ ! -e "${root}/dough-proposed" ]]
  [[ $(cat "${root}/dough-update/VERSION") == '0.1.2' ]]
done
assert_sentinels "${target}" "${target}/.claude/skills/other-skill/SKILL.md"
assert_project_configuration "${target}"
snapshot=$(cd -- "${target}" && find .agents .claude -type f -print0 | xargs -0 shasum | LC_ALL=C sort)

# At the equal version, apply leaves both roots and project data unchanged.
apply_update "${target}" > /dev/null
[[ $(cd -- "${target}" && find .agents .claude -type f -print0 | xargs -0 shasum | LC_ALL=C sort) == "${snapshot}" ]]
assert_project_configuration "${target}"

# A directory release holding test material is refused before any write.
invalid_fixture="${temporary_dir}/invalid.git"
invalid_target="${temporary_dir}/invalid-project"
build_fixture "${invalid_fixture}" '"dough-update/payload.test.mjs": "test material\n"'
install_list_era "${invalid_fixture}" "${invalid_target}"
before=$(cd -- "${invalid_target}" && find .agents .claude -type f -print0 | xargs -0 shasum | LC_ALL=C sort)
if refusal=$(apply_update "${invalid_target}" 2>&1); then
  echo 'Expected apply to refuse a directory release holding test material' >&2
  exit 1
fi
[[ "${refusal}" == *'Test material in shipped directory: dough-update/payload.test.mjs'* ]]
[[ $(cd -- "${invalid_target}" && find .agents .claude -type f -print0 | xargs -0 shasum | LC_ALL=C sort) == "${before}" ]]
[[ $(cat "${invalid_target}/.agents/skills/dough-update/VERSION") == '0.1.1' ]]
