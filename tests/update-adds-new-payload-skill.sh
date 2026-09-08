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

fixture="${temporary_dir}/fixture.git"
mkdir -p -- "${fixture}"
git -C "${fixture}" init --quiet -b main
git_identity "${fixture}"

write_candidate_payload "${fixture}" 0.1.1 payload-before-backlog
rm -- "${fixture}/src/skills/dough-product-backlog/SKILL.md"
commit_all "${fixture}" 'release before backlog skill'
tag_release "${fixture}" 0.1.1 '2026-06-01T00:00:00'

older_checkout="${temporary_dir}/release-0.1.1"
checkout_tagged_release "${fixture}" "${older_checkout}" 0.1.1

write_candidate_payload "${fixture}" 0.1.2 payload-with-backlog
commit_all "${fixture}" 'release with backlog skill'
tag_release "${fixture}" 0.1.2 '2026-06-02T00:00:00'

target="${temporary_dir}/target"
prepare_target "${target}"
agents_root="${target}/.agents/skills"
actual_version=''
mkdir -p -- "${agents_root}/dough-update" "${agents_root}/dough-adr-awareness"
cp -- "${older_checkout}/src/skills/dough-update/SKILL.md" \
  "${agents_root}/dough-update/SKILL.md"
cp -- "${older_checkout}/src/skills/dough-adr-awareness/SKILL.md" \
  "${agents_root}/dough-adr-awareness/SKILL.md"
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

collision_target="${temporary_dir}/collision-target"
prepare_target "${collision_target}"
collision_root="${collision_target}/.agents/skills"
mkdir -p -- "${collision_root}/dough-update" \
  "${collision_root}/dough-adr-awareness" \
  "${collision_root}/dough-product-backlog"
cp -- "${older_checkout}/src/skills/dough-update/SKILL.md" \
  "${collision_root}/dough-update/SKILL.md"
cp -- "${older_checkout}/src/skills/dough-adr-awareness/SKILL.md" \
  "${collision_root}/dough-adr-awareness/SKILL.md"
printf '%s\n' 'Keep this unrelated local backlog skill.' > \
  "${collision_root}/dough-product-backlog/SKILL.md"
printf '%s\n' "${fixture}" > "${collision_root}/dough-update/SOURCE"
printf '%s\n' '0.1.1' > "${collision_root}/dough-update/VERSION"

before=$(snapshot_path_state "${collision_target}")
if bash "${source_dir}/src/install/open-dough-release.sh" apply \
  --target "${collision_target}" --platform codex > /dev/null 2>&1; then
  echo 'FAIL: ordinary update replaced a colliding newly managed skill.' >&2
  exit 1
fi
after=$(snapshot_path_state "${collision_target}")
[[ "${after}" == "${before}" ]]

echo 'PASS: ordinary update adds a newly released payload skill and refuses a pre-existing path collision.'
