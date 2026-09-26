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
mkdir -p -- "${fixture}"
git -C "${fixture}" init --quiet -b main
configure_fixture_git "${fixture}"

write_candidate_payload "${fixture}" 0.1.1 payload-before-added-skills
for managed_file in "${new_managed_files[@]}"; do
  rm -- "${fixture}/src/skills/${managed_file}"
done
for managed_file in "${new_managed_files[@]}"; do
  awk -v managed_file="${managed_file}" '$1 != managed_file' \
    "${fixture}/install.sh" > "${fixture}/filtered"
  mv -- "${fixture}/filtered" "${fixture}/install.sh"
done
commit_all "${fixture}" 'release before added skills'
tag_release "${fixture}" 0.1.1 '2026-06-01T00:00:00'

older_checkout="${temporary_dir}/release-0.1.1"
checkout_tagged_release "${fixture}" "${older_checkout}" 0.1.1

write_candidate_payload "${fixture}" 0.1.2 payload-with-added-skills
commit_all "${fixture}" 'release with added skills'
tag_release "${fixture}" 0.1.2 '2026-06-02T00:00:00'

# Files the older release shipped, installed by hand below as its payload.
older_managed_files=()
for managed_file in "${managed_files[@]}"; do
  [[ -f "${older_checkout}/src/skills/${managed_file}" ]] || continue
  older_managed_files+=("${managed_file}")
done
install_older_payload() {
  (
    managed_files=("${older_managed_files[@]}")
    payload_bytes_transfer copy "${older_checkout}/src/skills" "$1"
  )
}

target="${temporary_dir}/target"
prepare_target "${target}"
agents_root="${target}/.agents/skills"
actual_version=''
mkdir -p -- "${agents_root}/dough-update" "${agents_root}/dough-adr-awareness"
install_older_payload "${agents_root}"
printf '%s\n' "${fixture}" > "${agents_root}/dough-update/SOURCE"
printf '%s\n' '0.1.1' > "${agents_root}/dough-update/VERSION"

output=$(bash "${source_dir}/src/install/open-dough-release.sh" apply \
  --target "${target}" --platform codex)

[[ "${output}" == *'installed or updated the shared Codex/Cursor root and Claude Code to 0.1.2'* ]]
for root in "${agents_root}" "${target}/.claude/skills"; do
  assert_payload_bytes_match "${fixture}/src/skills" "${root}"
  actual_version=$(cat "${root}/dough-update/VERSION")
  [[ "${actual_version}" == '0.1.2' ]]
done
assert_sentinels "${target}"

collision_target="${temporary_dir}/collision-target"
prepare_target "${collision_target}"
collision_root="${collision_target}/.agents/skills"
mkdir -p -- "${collision_root}/dough-update" \
  "${collision_root}/dough-adr-awareness" \
  "${collision_root}/dough-test-optimization/references"
install_older_payload "${collision_root}"
printf '%s\n' 'Keep this unrelated local optimization guidance.' > \
  "${collision_root}/dough-test-optimization/references/optimization-tactics.md"
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
