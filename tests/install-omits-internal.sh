#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
internal_skill_names=(release-version extract-guidance)
managed_files=(
  dough-update/SKILL.md
  dough-adr-awareness/SKILL.md
  dough-adr-awareness/RECOGNITION.md
)

for internal_skill_name in "${internal_skill_names[@]}"; do
  [[ -f "${source_dir}/.agents/skills/${internal_skill_name}/SKILL.md" ]]
  [[ ! -e "${source_dir}/src/skills/${internal_skill_name}" ]]
done
[[ -f "${source_dir}/AGENTS.md" ]]
[[ -f "${source_dir}/CLAUDE.md" ]]

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

target="${temporary_dir}/target project"
mkdir -p -- "${target}/.agents/skills/unrelated" \
  "${target}/.claude/skills/other-skill" \
  "${target}/.cursor/skills/other-cursor-skill"
sentinel="${target}/.agents/skills/unrelated/SKILL.md"
claude_sentinel="${target}/.claude/skills/other-skill/SKILL.md"
cursor_sentinel="${target}/.cursor/skills/other-cursor-skill/SKILL.md"
project_file="${target}/keep this file.txt"
printf '%s\n' 'Keep this unrelated skill.' > "${sentinel}"
printf '%s\n' 'Keep this Claude sentinel.' > "${claude_sentinel}"
printf '%s\n' 'Keep this Cursor sentinel.' > "${cursor_sentinel}"
printf '%s\n' 'Keep this project file.' > "${project_file}"

list_files() {
  (
    cd -- "$1"
    find . -type f -print | LC_ALL=C sort
  )
}

assert_internal_absent() {
  local root=$1
  local internal_skill_name
  local skill_root

  for internal_skill_name in "${internal_skill_names[@]}"; do
    for skill_root in .agents .cursor .claude; do
      [[ ! -e "${root}/${skill_root}/skills/${internal_skill_name}" ]]
    done
  done
  [[ ! -e "${root}/AGENTS.md" ]]
  [[ ! -e "${root}/CLAUDE.md" ]]
}

assert_sentinels() {
  local contents
  contents=$(cat "${sentinel}")
  [[ "${contents}" == 'Keep this unrelated skill.' ]]
  contents=$(cat "${claude_sentinel}")
  [[ "${contents}" == 'Keep this Claude sentinel.' ]]
  contents=$(cat "${cursor_sentinel}")
  [[ "${contents}" == 'Keep this Cursor sentinel.' ]]
  contents=$(cat "${project_file}")
  [[ "${contents}" == 'Keep this project file.' ]]
}

expect_files() {
  local expected actual
  expected=$(cat || true)
  actual=$(list_files "${target}")
  if [[ "${actual}" != "${expected}" ]]; then
    echo "FAIL: installed outputs did not match the expected enumeration." >&2
    echo "Expected:" >&2
    printf '%s\n' "${expected}" >&2
    echo "Actual:" >&2
    printf '%s\n' "${actual}" >&2
    exit 1
  fi
}

assert_public_payload() {
  local relative_skill_root=$1
  local managed_file

  for managed_file in "${managed_files[@]}"; do
    cmp "${source_dir}/src/skills/${managed_file}" \
      "${target}/${relative_skill_root}/${managed_file}"
  done
  cmp "${source_dir}/VERSION" \
    "${target}/${relative_skill_root}/dough-update/VERSION"
}

# Run outside the checkout so the installer must locate its own source.
cd -- "${temporary_dir}"

bash "${source_dir}/install.sh" --target "${target}" --platform codex
assert_public_payload .agents/skills
assert_internal_absent "${target}"
assert_sentinels
expect_files << 'EOF'
./.agents/skills/dough-adr-awareness/RECOGNITION.md
./.agents/skills/dough-adr-awareness/SKILL.md
./.agents/skills/dough-update/SKILL.md
./.agents/skills/dough-update/VERSION
./.agents/skills/unrelated/SKILL.md
./.claude/skills/other-skill/SKILL.md
./.cursor/skills/other-cursor-skill/SKILL.md
./keep this file.txt
EOF

bash "${source_dir}/install.sh" --target "${target}" --platform cursor
assert_public_payload .cursor/skills
assert_public_payload .agents/skills
assert_internal_absent "${target}"
assert_sentinels
expect_files << 'EOF'
./.agents/skills/dough-adr-awareness/RECOGNITION.md
./.agents/skills/dough-adr-awareness/SKILL.md
./.agents/skills/dough-update/SKILL.md
./.agents/skills/dough-update/VERSION
./.agents/skills/unrelated/SKILL.md
./.claude/skills/other-skill/SKILL.md
./.cursor/skills/dough-adr-awareness/RECOGNITION.md
./.cursor/skills/dough-adr-awareness/SKILL.md
./.cursor/skills/dough-update/SKILL.md
./.cursor/skills/dough-update/VERSION
./.cursor/skills/other-cursor-skill/SKILL.md
./keep this file.txt
EOF

bash "${source_dir}/install.sh" --target "${target}" --platform claude
assert_public_payload .claude/skills
assert_public_payload .cursor/skills
assert_public_payload .agents/skills
assert_internal_absent "${target}"
assert_sentinels
expect_files << 'EOF'
./.agents/skills/dough-adr-awareness/RECOGNITION.md
./.agents/skills/dough-adr-awareness/SKILL.md
./.agents/skills/dough-update/SKILL.md
./.agents/skills/dough-update/VERSION
./.agents/skills/unrelated/SKILL.md
./.claude/skills/dough-adr-awareness/RECOGNITION.md
./.claude/skills/dough-adr-awareness/SKILL.md
./.claude/skills/dough-update/SKILL.md
./.claude/skills/dough-update/VERSION
./.claude/skills/other-skill/SKILL.md
./.cursor/skills/dough-adr-awareness/RECOGNITION.md
./.cursor/skills/dough-adr-awareness/SKILL.md
./.cursor/skills/dough-update/SKILL.md
./.cursor/skills/dough-update/VERSION
./.cursor/skills/other-cursor-skill/SKILL.md
./keep this file.txt
EOF

echo "PASS: installer writes only the public payload and updater VERSION for Codex, Cursor, and Claude, enumerates those outputs, and omits internal release-version, extract-guidance, AGENTS.md, and CLAUDE.md."
