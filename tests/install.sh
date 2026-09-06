#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

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
  cmp "${source_dir}/src/skills/dough-update/SKILL.md" "${destination}/SKILL.md"
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
bash "${source_dir}/install.sh" --target "${target}"

assert_verified_install "${target}/.agents/skills/dough-update"
[[ ! -e "${target}/.cursor" ]]
[[ ! -e "${target}/.claude/skills/dough-update" ]]
assert_sentinels

if output=$(bash "${source_dir}/install.sh" --target "${target}" --platform windsurf 2>&1); then
  echo "FAIL: unsupported platform must stop before writing." >&2
  exit 1
fi
[[ "${output}" == *'Unsupported platform:'* ]]
[[ "${output}" == *'windsurf'* ]]
[[ ! -e "${target}/.cursor" ]]
[[ ! -e "${target}/.claude/skills/dough-update" ]]
assert_verified_install "${target}/.agents/skills/dough-update"
contents=$(cat "${claude_sentinel}")
[[ "${contents}" == 'Keep this Claude sentinel.' ]]

installed_skill="${target}/.agents/skills/dough-update/SKILL.md"
installed_record="${target}/.agents/skills/dough-update/VERSION"
printf '%s\n' 'Keep my local changes.' > "${installed_skill}"
if output=$(bash "${source_dir}/install.sh" --target "${target}" 2>&1); then
  echo "FAIL: repeat installation must stop." >&2
  exit 1
fi
[[ "${output}" == *'Warning:'* ]]
[[ "${output}" == *'--force'* ]]
contents=$(cat "${installed_skill}")
[[ "${contents}" == 'Keep my local changes.' ]]
cmp "${source_dir}/VERSION" "${installed_record}"
assert_sentinels

bash "${source_dir}/install.sh" --target "${target}" --force
assert_verified_install "${target}/.agents/skills/dough-update"
contents=$(cat "${sentinel}")
[[ "${contents}" == 'Keep this unrelated skill.' ]]

bash "${source_dir}/install.sh" --target "${target}" --platform cursor
cursor_skill="${target}/.cursor/skills/dough-update/SKILL.md"
assert_verified_install "${target}/.cursor/skills/dough-update"
assert_verified_install "${target}/.agents/skills/dough-update"
assert_sentinels

printf '%s\n' 'Keep my Cursor edits.' > "${cursor_skill}"
if output=$(bash "${source_dir}/install.sh" --target "${target}" --platform cursor 2>&1); then
  echo "FAIL: Cursor repeat installation must stop." >&2
  exit 1
fi
[[ "${output}" == *'Warning:'* ]]
[[ "${output}" == *'--force'* ]]
contents=$(cat "${cursor_skill}")
[[ "${contents}" == 'Keep my Cursor edits.' ]]
cmp "${source_dir}/VERSION" "${target}/.cursor/skills/dough-update/VERSION"
assert_verified_install "${target}/.agents/skills/dough-update"
contents=$(cat "${claude_sentinel}")
[[ "${contents}" == 'Keep this Claude sentinel.' ]]

bash "${source_dir}/install.sh" --target "${target}" --platform cursor --force
assert_verified_install "${target}/.cursor/skills/dough-update"
assert_verified_install "${target}/.agents/skills/dough-update"
assert_sentinels

bash "${source_dir}/install.sh" --target "${target}" --platform claude
claude_skill="${target}/.claude/skills/dough-update/SKILL.md"
assert_verified_install "${target}/.claude/skills/dough-update"
assert_verified_install "${target}/.cursor/skills/dough-update"
assert_verified_install "${target}/.agents/skills/dough-update"
assert_sentinels

printf '%s\n' 'Keep my Claude edits.' > "${claude_skill}"
if output=$(bash "${source_dir}/install.sh" --target "${target}" --platform claude 2>&1); then
  echo "FAIL: Claude repeat installation must stop." >&2
  exit 1
fi
[[ "${output}" == *'Warning:'* ]]
[[ "${output}" == *'--force'* ]]
contents=$(cat "${claude_skill}")
[[ "${contents}" == 'Keep my Claude edits.' ]]
cmp "${source_dir}/VERSION" "${target}/.claude/skills/dough-update/VERSION"
assert_verified_install "${target}/.agents/skills/dough-update"
assert_verified_install "${target}/.cursor/skills/dough-update"
contents=$(cat "${claude_sentinel}")
[[ "${contents}" == 'Keep this Claude sentinel.' ]]

bash "${source_dir}/install.sh" --target "${target}" --platform claude --force
assert_verified_install "${target}/.claude/skills/dough-update"
assert_verified_install "${target}/.cursor/skills/dough-update"
assert_verified_install "${target}/.agents/skills/dough-update"
assert_sentinels

bash "${source_dir}/install.sh" --target "${target}" --platform codex --force
assert_verified_install "${target}/.agents/skills/dough-update"
assert_verified_install "${target}/.cursor/skills/dough-update"
assert_verified_install "${target}/.claude/skills/dough-update"

bad_source="${temporary_dir}/bad source"
mkdir -p -- "${bad_source}/src/install" \
  "${bad_source}/src/skills/dough-update"
cp -- "${source_dir}/install.sh" "${bad_source}/install.sh"
cp -- "${source_dir}/src/install/"*.sh "${bad_source}/src/install/"
cp -- "${source_dir}/src/skills/dough-update/SKILL.md" \
  "${bad_source}/src/skills/dough-update/SKILL.md"
printf '%s\n' '0.1.0' > "${bad_source}/VERSION"
printf '%s\n' '## 9.9.9 - 2026-01-01' > "${bad_source}/CHANGELOG.md"
untouched_target="${temporary_dir}/untouched project"
mkdir -p -- "${untouched_target}"
if output=$(bash "${bad_source}/install.sh" --target "${untouched_target}" 2>&1); then
  echo "FAIL: invalid source metadata must stop before copy." >&2
  exit 1
fi
[[ "${output}" == *'Missing dated changelog entry'* ]]
[[ ! -e "${untouched_target}/.agents" ]]

echo "PASS: installs Codex, Cursor, and Claude skills and records, rejects unsupported platforms, stops repeats, forces replacement, and preserves other copies."
