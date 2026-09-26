#!/usr/bin/env bash
# shellcheck disable=SC2154 # Sourced fixture defines managed_files.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/release-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
new_managed_files=(
  dough-maintain-findings/SKILL.md
  dough-bug-fixing/SKILL.md
  dough-resplit-story/SKILL.md
  dough-slice-planning/SKILL.md
  dough-slice-plan-refinement/SKILL.md
  dough-test-optimization/SKILL.md
  dough-test-optimization/references/optimization-tactics.md
  dough-test-optimization/references/resolving-candidates.md
)

fixture="${temporary_dir}/fixture.git"
older_checkout="${temporary_dir}/release-0.1.1"
# Model a release declaring none of the added skills' files.
added_skill_options=()
for managed_file in "${new_managed_files[@]}"; do
  added_skill_options+=(--withhold "${managed_file}" --remove "${managed_file}")
done
build_upgrade_releases "${fixture}" "${older_checkout}" \
  payload-before-added-skills payload-with-added-skills "${added_skill_options[@]}"

target="${temporary_dir}/target"
prepare_target "${target}"
agents_root="${target}/.agents/skills"
actual_version=''
mkdir -p -- "${agents_root}/dough-update" "${agents_root}/dough-adr-awareness"
for managed_file in "${managed_files[@]}"; do
  [[ -f "${older_checkout}/src/skills/${managed_file}" ]] || continue
  mkdir -p -- "${agents_root}/${managed_file%/*}"
  cp -- "${older_checkout}/src/skills/${managed_file}" "${agents_root}/${managed_file}"
done
printf '%s\n' "${fixture}" > "${agents_root}/dough-update/SOURCE"
printf '%s\n' '0.1.1' > "${agents_root}/dough-update/VERSION"

output=$(bash "${source_dir}/src/install/open-dough-release.sh" apply \
  --target "${target}" --platform codex)

[[ "${output}" == *'installed or updated the shared Codex/Cursor root and Claude Code to 0.1.2'* ]]
for root in "${agents_root}" "${target}/.claude/skills"; do
  for managed_file in "${managed_files[@]}"; do
    cmp "${fixture}/src/skills/${managed_file}" "${root}/${managed_file}"
  done
  actual_version=$(cat "${root}/dough-update/VERSION")
  [[ "${actual_version}" == '0.1.2' ]]
done
assert_sentinels "${target}"
