#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/release-fixture.bash
source "${source_dir}/tests/helpers/release-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
candidate="${temporary_dir}/exact candidate"
target="${temporary_dir}/donut assessment target"
fixture_source="${source_dir}/tests/fixtures/adr-adoption/donut-assessment"
original_source="${fixture_source}/.agents/skills/adr-awareness/SKILL.md"
architecture_home="${fixture_source}/.cursor/rules/architecture-decisions.mdc"
recognition="${source_dir}/src/skills/dough-adr-awareness/RECOGNITION.md"

assert_fixture_fact_only_in_original() {
  local expected=$1
  local matches

  matches=$(grep -RFl -- "${expected}" "${fixture_source}")
  [[ ${matches} == "${original_source}" ]]
  grep -Fq -- "${expected}" "${recognition}"
  ! grep -Fq -- "${expected}" "${architecture_home}"
}

grep -Fq '## Retain adopter context before cleanup' "${recognition}"
grep -Fq 'Use that local architecture guidance as the home' "${recognition}"
grep -Fq 'do not copy its behavioral workflow into a second local source' \
  "${recognition}"
grep -Fq 'Do not rewrite ADR' "${recognition}"
grep -Fq 'original and every caller or discovery link remain' "${recognition}"
assert_fixture_fact_only_in_original \
  'Cross-cutting stack, persistence, API contracts, auth'
assert_fixture_fact_only_in_original 'packaging/monorepo'
assert_fixture_fact_only_in_original 'backend/frontend/cli/mcp/e2e'
assert_fixture_fact_only_in_original 'PR/commit message or note'
assert_fixture_fact_only_in_original 'pointing at the ADR and the exception'
grep -Fq 'docs/adrs/_template.md' "${original_source}"
grep -Fq 'docs/adrs/_template.md' "${architecture_home}" && exit 1

build_current_tagged_release_fixture "${candidate}"
prepare_donut_adr_assessment_target "${target}" "${candidate}"

version=$(cat "${source_dir}/VERSION")
tag="v${version}"
tag_points_at=$(git -C "${candidate}" tag --points-at HEAD)
tag_exact=$(git -C "${candidate}" describe --exact-match --tags HEAD)
[[ ${tag_points_at} == "${tag}" ]]
[[ ${tag_exact} == "${tag}" ]]
[[ ${version} =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
for managed_file in \
  dough-update/SKILL.md \
  dough-adr-awareness/SKILL.md \
  dough-adr-awareness/RECOGNITION.md; do
  cmp "${source_dir}/src/skills/${managed_file}" \
    "${target}/.agents/skills/${managed_file}"
  git -C "${candidate}" show "${tag}:src/skills/${managed_file}" \
    | cmp - "${target}/.agents/skills/${managed_file}"
done
installed_version=$(cat "${target}/.agents/skills/dough-update/VERSION")
[[ ${installed_version} == "${version}" ]]

cmp \
  "${source_dir}/tests/fixtures/adr-adoption/donut-assessment/.agents/skills/adr-awareness/SKILL.md" \
  "${target}/.agents/skills/adr-awareness/SKILL.md"
grep -Fq 'agents use' "${target}/.cursor/rules/general.mdc"
grep -Fq '.agents/skills/adr-awareness/' \
  "${target}/.cursor/rules/architecture-decisions.mdc"
grep -Fq '.agents/skills/adr-awareness/SKILL.md' \
  "${target}/.cursor/agent-map.md"
grep -Fq '| Accepted |' "${target}/docs/adrs/README.md"
grep -Fq '**Status:** Accepted' "${target}/docs/adrs/0001-session-state.md"
grep -Fq '**Status:** Proposed' "${target}/docs/adrs/0002-package-sessions.md"
grep -Fq 'Keep shared session state in Redis.' \
  "${target}/docs/adrs/0001-session-state.md"
grep -Fq 'Consider extracting session storage into a separate package.' \
  "${target}/docs/adrs/0002-package-sessions.md"
grep -Fq 'Keep this unrelated local guidance unchanged.' \
  "${target}/.agents/skills/unrelated-guidance/SKILL.md"
grep -Fq 'Keep this Cursor installation unchanged.' \
  "${target}/.cursor/skills/other-host-guidance/SKILL.md"
grep -Fq 'Keep this Claude Code installation unchanged.' \
  "${target}/.claude/skills/other-host-guidance/SKILL.md"
[[ -L "${target}/.claude/skills/adr-awareness" ]]
original_skill_target=$(readlink "${target}/.claude/skills/adr-awareness")
[[ ${original_skill_target} == '../../.agents/skills/adr-awareness' ]]

for internal_skill in extract-guidance release-version; do
  for skill_root in .agents/skills .cursor/skills .claude/skills; do
    [[ ! -e "${target}/${skill_root}/${internal_skill}" ]]
  done
done

snapshot=$(snapshot_path_state "${target}")
[[ ${snapshot} == *$'file\t.agents/skills/adr-awareness/SKILL.md\t'* ]]
[[ ${snapshot} == *$'directory\t.agents/skills/adr-awareness'* ]]
[[ ${snapshot} == *$'symlink\t.claude/skills/adr-awareness\t../../.agents/skills/adr-awareness'* ]]
snapshot_again=$(snapshot_path_state "${target}")
[[ ${snapshot} == "${snapshot_again}" ]]

echo 'PASS: disposable Donut-derived ADR assessment target has the exact tagged current Codex payload, original skill and callers/context, protected coexistence data, and a byte/existence/symlink snapshot.'
echo 'PASS: bounded trigger and exception-trail facts are traceable only to the local original and are not prefilled in the architecture context home; shared instructions retain them before later cleanup.'
