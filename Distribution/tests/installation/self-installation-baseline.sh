#!/usr/bin/env bash
# The self-installation check accepts installed copies matching local tags and
# ignores source-only development; it names drifted and colliding native paths
# without writes.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/self-installation-fixture.bash
source "${source_dir}/Distribution/tests/helpers/self-installation-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
build_matching_installation "${temporary_dir}/matching"

success="${temporary_dir}/success"
clone_matching "${success}"
assert_checker_pass "${success}" 'current-release success'

source_only="${temporary_dir}/source-only"
clone_matching "${source_only}"
printf '%s\n' '<!-- source-only development -->' >> \
  "${source_only}/Distribution/src/skills/dough-update/SKILL.md"
assert_checker_pass "${source_only}" 'source-only development'

drift="${temporary_dir}/drift"
clone_matching "${drift}"
printf '%s\n' 'local managed edit' >> "${drift}/.agents/skills/dough-update/SKILL.md"
assert_checker_fail "${drift}" 'one-root drift' \
  "Managed payload mismatch: ${drift}/.agents/skills dough-update/SKILL.md"

collision="${temporary_dir}/collision.git"
node "${source_dir}/Distribution/tests/support/release-source.mjs" "${collision}" << 'JSON'
{"revisions": [{"name": "release 0.1.1 without slice-planning", "release": {
  "version": "0.1.1", "taggedAt": "2026-06-01T00:00:00",
  "marker": "payload-0.1.1", "removed": ["dough-slice-planning"]}}]}
JSON
collision_source=$(cd -- "${collision}" && pwd)
for root in "${collision}/.agents/skills" "${collision}/.claude/skills"; do
  mkdir -p -- "${root}"
  cp -R -- "${collision}/Distribution/src/skills/." "${root}/"
  printf '%s\n' '0.1.1' > "${root}/dough-update/VERSION"
  printf '%s\n' "${collision_source}" > "${root}/dough-update/SOURCE"
done
mkdir -p -- "${collision}/.agents/skills/dough-slice-planning"
printf '%s\n' 'Keep this unrelated local slice-planning skill.' > \
  "${collision}/.agents/skills/dough-slice-planning/SKILL.md"
assert_checker_fail "${collision}" 'candidate-path collision' \
  "Managed payload mismatch: ${collision}/.agents/skills dough-slice-planning/SKILL.md"
