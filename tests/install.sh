#!/usr/bin/env bash
# The installer puts the shared Codex/Cursor and Claude skills and records in
# place, rejects unsupported platforms, stops ordinary repeats, replaces by
# force, and preserves other skills and project files.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/helpers/public-payload-fixture.bash
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
# shellcheck source=tests/helpers/release-fixture.bash
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/release-fixture.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

# A repeat installation over an edited, partial, or unverifiable managed
# installation stops without writes and points at --force.
assert_repeat_install_refused() {
  local failure=$1
  local before after
  shift
  before=$(snapshot_path_state "${target}")
  if output=$(bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" "$@" 2>&1); then
    echo "FAIL: ${failure}" >&2
    exit 1
  fi
  [[ "${output}" == *'existing managed installation is edited, partial, or unverifiable'* ]]
  [[ "${output}" == *'--force'* ]]
  after=$(snapshot_path_state "${target}")
  [[ "${after}" == "${before}" ]]
}

target="${temporary_dir}/target project"
mkdir -p -- "${target}/.agents/skills/unrelated" \
  "${target}/.claude/skills/other-skill"
sentinel="${target}/.agents/skills/unrelated/SKILL.md"
claude_sentinel="${target}/.claude/skills/other-skill/SKILL.md"
project_file="${target}/keep this file.txt"
printf '%s\n' 'Keep this unrelated skill.' > "${sentinel}"
printf '%s\n' 'Keep this Claude sentinel.' > "${claude_sentinel}"
printf '%s\n' 'Keep this project file.' > "${project_file}"

assert_verified_install() {
  local destination=$1
  local skill_root expected_source recorded_source
  skill_root=$(dirname -- "${destination}")
  expected_source=$(cd -- "${source_dir}" && pwd -P)
  cmp "${source_dir}/src/skills/dough-update/SKILL.md" "${destination}/SKILL.md"
  cmp "${source_dir}/src/skills/dough-adr-awareness/SKILL.md" \
    "${skill_root}/dough-adr-awareness/SKILL.md"
  recorded_source=$(cat "${destination}/SOURCE")
  [[ "${recorded_source}" == "${expected_source}" ]]
  cmp "${source_dir}/VERSION" "${destination}/VERSION"
}

assert_sentinels() {
  local contents
  contents=$(cat "${sentinel}")
  [[ "${contents}" == 'Keep this unrelated skill.' ]]
  contents=$(cat "${claude_sentinel}")
  [[ "${contents}" == 'Keep this Claude sentinel.' ]]
  contents=$(cat "${project_file}")
  [[ "${contents}" == 'Keep this project file.' ]]
}

# Run outside the checkout so the installer must locate its own source.
cd -- "${temporary_dir}"
bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" > /dev/null

assert_verified_install "${target}/.agents/skills/dough-update"
assert_verified_install "${target}/.claude/skills/dough-update"
[[ -f "${target}/.cursor/hooks.json" ]]
[[ -f "${target}/.claude/settings.json" ]]
assert_sentinels

if output=$(bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" --platform windsurf 2>&1); then
  echo "FAIL: unsupported platform must stop before writing." >&2
  exit 1
fi
[[ "${output}" == *'Unsupported platform:'* ]]
[[ "${output}" == *'windsurf'* ]]
[[ -f "${target}/.cursor/hooks.json" ]]
assert_verified_install "${target}/.claude/skills/dough-update"
contents=$(cat "${claude_sentinel}")
[[ "${contents}" == 'Keep this Claude sentinel.' ]]

installed_skill="${target}/.agents/skills/dough-update/SKILL.md"
installed_record="${target}/.agents/skills/dough-update/VERSION"
printf '%s\n' 'Keep my local changes.' > "${installed_skill}"
assert_repeat_install_refused "repeat installation must stop."
contents=$(cat "${installed_skill}")
[[ "${contents}" == 'Keep my local changes.' ]]
cmp "${source_dir}/VERSION" "${installed_record}"
assert_sentinels

bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" --force > /dev/null
assert_verified_install "${target}/.agents/skills/dough-update"
contents=$(cat "${sentinel}")
[[ "${contents}" == 'Keep this unrelated skill.' ]]

# A removed managed file also stops a repeat installation without writes.
removed_reference=dough-story-refinement/references/planning.md
removed_file="${target}/.claude/skills/${removed_reference}"
rm -- "${removed_file}"
assert_repeat_install_refused "repeat installation must stop on a removed managed file."
[[ ! -e "${removed_file}" ]]

bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" --force > /dev/null
cmp "${source_dir}/src/skills/${removed_reference}" "${removed_file}"
assert_verified_install "${target}/.claude/skills/dough-update"
assert_sentinels

bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" --platform cursor > /dev/null
cursor_skill="${target}/.agents/skills/dough-update/SKILL.md"
assert_verified_install "${target}/.agents/skills/dough-update"
assert_sentinels

printf '%s\n' 'Keep my Cursor edits.' > "${cursor_skill}"
assert_repeat_install_refused "Cursor repeat installation must stop." --platform cursor
contents=$(cat "${cursor_skill}")
[[ "${contents}" == 'Keep my Cursor edits.' ]]
cmp "${source_dir}/VERSION" "${target}/.agents/skills/dough-update/VERSION"
contents=$(cat "${claude_sentinel}")
[[ "${contents}" == 'Keep this Claude sentinel.' ]]

bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" --platform cursor --force > /dev/null
assert_verified_install "${target}/.agents/skills/dough-update"
assert_sentinels

bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" --platform claude > /dev/null
claude_skill="${target}/.claude/skills/dough-update/SKILL.md"
assert_verified_install "${target}/.claude/skills/dough-update"
assert_verified_install "${target}/.agents/skills/dough-update"
assert_sentinels

printf '%s\n' 'Keep my Claude edits.' > "${claude_skill}"
assert_repeat_install_refused "Claude repeat installation must stop." --platform claude
contents=$(cat "${claude_skill}")
[[ "${contents}" == 'Keep my Claude edits.' ]]
cmp "${source_dir}/VERSION" "${target}/.claude/skills/dough-update/VERSION"
assert_verified_install "${target}/.agents/skills/dough-update"
contents=$(cat "${claude_sentinel}")
[[ "${contents}" == 'Keep this Claude sentinel.' ]]

bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" --platform claude --force > /dev/null
assert_verified_install "${target}/.claude/skills/dough-update"
assert_verified_install "${target}/.agents/skills/dough-update"
assert_sentinels

bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" --platform codex --force > /dev/null
assert_verified_install "${target}/.agents/skills/dough-update"
assert_verified_install "${target}/.claude/skills/dough-update"

bad_source="${temporary_dir}/bad source"
mkdir -p -- "${bad_source}/src/skills"
cp -- "${source_dir}/install.sh" "${bad_source}/install.sh"
copy_installer_modules "${bad_source}"
cp -R -- "${source_dir}/src/skills/." "${bad_source}/src/skills/"
printf '%s\n' '0.1.0' > "${bad_source}/VERSION"
printf '%s\n' '## 9.9.9 - 2026-01-01' > "${bad_source}/CHANGELOG.md"
untouched_target="${temporary_dir}/untouched project"
mkdir -p -- "${untouched_target}"
if output=$(bash "${bad_source}/install.sh" --target "${untouched_target}" \
  --source "${bad_source}" 2>&1); then
  echo "FAIL: invalid source metadata must stop before copy." >&2
  exit 1
fi
[[ "${output}" == *'Missing dated changelog entry'* ]]
[[ ! -e "${untouched_target}/.agents" ]]
