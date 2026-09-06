#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

list_files() {
  (
    cd -- "$1"
    find . -type f -print | LC_ALL=C sort
  )
}

target="${temporary_dir}/target project"
mkdir -p -- "${target}/.agents/skills/unrelated" \
  "${target}/.cursor/skills/cursor-sentinel" \
  "${target}/.claude/skills/claude-sentinel"
printf '%s\n' 'Keep this Codex guidance.' > \
  "${target}/.agents/skills/unrelated/SKILL.md"
printf '%s\n' 'Keep this Cursor guidance.' > \
  "${target}/.cursor/skills/cursor-sentinel/SKILL.md"
printf '%s\n' 'Keep this Claude guidance.' > \
  "${target}/.claude/skills/claude-sentinel/SKILL.md"
printf '%s\n' 'Keep this project file.' > "${target}/keep.txt"

cd -- "${temporary_dir}"
bash "${source_dir}/install.sh" --target "${target}" --platform codex

managed_files=(
  dough-update/SKILL.md
  dough-adr-awareness/SKILL.md
  dough-adr-awareness/RECOGNITION.md
)
for managed_file in "${managed_files[@]}"; do
  cmp "${source_dir}/src/skills/${managed_file}" \
    "${target}/.agents/skills/${managed_file}"
done

for internal_skill in extract-guidance release-version; do
  [[ ! -e "${target}/.agents/skills/${internal_skill}" ]]
  [[ ! -e "${target}/.cursor/skills/${internal_skill}" ]]
  [[ ! -e "${target}/.claude/skills/${internal_skill}" ]]
done
[[ ! -e "${target}/AGENTS.md" ]]
[[ ! -e "${target}/CLAUDE.md" ]]
[[ ! -e "${target}/.cursor/skills/dough-update" ]]
[[ ! -e "${target}/.cursor/skills/dough-adr-awareness" ]]
[[ ! -e "${target}/.claude/skills/dough-update" ]]
[[ ! -e "${target}/.claude/skills/dough-adr-awareness" ]]

expected_files=$(
  cat << 'EOF'
./.agents/skills/dough-adr-awareness/RECOGNITION.md
./.agents/skills/dough-adr-awareness/SKILL.md
./.agents/skills/dough-update/SKILL.md
./.agents/skills/unrelated/SKILL.md
./.claude/skills/claude-sentinel/SKILL.md
./.cursor/skills/cursor-sentinel/SKILL.md
./keep.txt
EOF
)
actual_files=$(list_files "${target}")
[[ "${actual_files}" == "${expected_files}" ]]

incomplete_source="${temporary_dir}/incomplete source"
mkdir -p -- "${incomplete_source}/src/skills/dough-update" \
  "${incomplete_source}/src/skills/dough-adr-awareness"
cp -- "${source_dir}/install.sh" "${incomplete_source}/install.sh"
cp -- "${source_dir}/src/skills/dough-update/SKILL.md" \
  "${incomplete_source}/src/skills/dough-update/SKILL.md"
cp -- "${source_dir}/src/skills/dough-adr-awareness/SKILL.md" \
  "${incomplete_source}/src/skills/dough-adr-awareness/SKILL.md"

incomplete_target="${temporary_dir}/incomplete target"
mkdir -p -- "${incomplete_target}"
printf '%s\n' 'Do not change me.' > "${incomplete_target}/sentinel.txt"
before=$(list_files "${incomplete_target}")
if output=$(bash "${incomplete_source}/install.sh" \
  --target "${incomplete_target}" --platform codex 2>&1); then
  echo "FAIL: an incomplete public payload must be rejected." >&2
  exit 1
fi
[[ "${output}" == *'Public payload is incomplete:'* ]]
[[ "${output}" == *'dough-adr-awareness/RECOGNITION.md'* ]]
after=$(list_files "${incomplete_target}")
[[ "${after}" == "${before}" ]]
[[ ! -e "${incomplete_target}/.agents" ]]
sentinel_contents=$(cat "${incomplete_target}/sentinel.txt")
[[ "${sentinel_contents}" == 'Do not change me.' ]]

echo "PASS: Codex receives the complete declared public payload, incomplete source is rejected before writes, and internal, unrelated, Cursor, and Claude material is preserved."
