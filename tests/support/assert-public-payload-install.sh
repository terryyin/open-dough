#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
platform=${1:-}

case "${platform}" in
  codex)
    relative_skill_root=.agents/skills
    platform_label=Codex
    ;;
  cursor)
    relative_skill_root=.cursor/skills
    platform_label=Cursor
    ;;
  *)
    echo "Usage: $0 <codex|cursor>" >&2
    exit 1
    ;;
esac

managed_files=(
  dough-update/SKILL.md
  dough-adr-awareness/SKILL.md
  dough-adr-awareness/RECOGNITION.md
)
skill_roots=(.agents/skills .cursor/skills .claude/skills)

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

list_files() {
  (
    cd -- "$1"
    find . -type f -print | LC_ALL=C sort
  )
}

target="${temporary_dir}/target project"
mkdir -p -- "${target}/.agents/skills/existing-codex" \
  "${target}/.cursor/skills/existing-cursor" \
  "${target}/.claude/skills/existing-claude"
printf '%s\n' 'Keep this Codex guidance.' > \
  "${target}/.agents/skills/existing-codex/SKILL.md"
printf '%s\n' 'Keep this Cursor guidance.' > \
  "${target}/.cursor/skills/existing-cursor/SKILL.md"
printf '%s\n' 'Keep this Claude guidance.' > \
  "${target}/.claude/skills/existing-claude/SKILL.md"
printf '%s\n' 'Keep this project file.' > "${target}/keep.txt"

cd -- "${temporary_dir}"
bash "${source_dir}/install.sh" --target "${target}" --platform "${platform}"

for managed_file in "${managed_files[@]}"; do
  cmp "${source_dir}/src/skills/${managed_file}" \
    "${target}/${relative_skill_root}/${managed_file}"
done

for internal_skill in extract-guidance release-version; do
  for skill_root in "${skill_roots[@]}"; do
    [[ ! -e "${target}/${skill_root}/${internal_skill}" ]]
  done
done
[[ ! -e "${target}/AGENTS.md" ]]
[[ ! -e "${target}/CLAUDE.md" ]]

for skill_root in "${skill_roots[@]}"; do
  if [[ "${skill_root}" == "${relative_skill_root}" ]]; then
    continue
  fi
  for managed_file in "${managed_files[@]}"; do
    [[ ! -e "${target}/${skill_root}/${managed_file}" ]]
  done
done

expected_files=$(
  {
    printf '%s\n' \
      './.agents/skills/existing-codex/SKILL.md' \
      './.claude/skills/existing-claude/SKILL.md' \
      './.cursor/skills/existing-cursor/SKILL.md' \
      './keep.txt'
    for managed_file in "${managed_files[@]}"; do
      printf './%s/%s\n' "${relative_skill_root}" "${managed_file}"
    done
  } | LC_ALL=C sort
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
  --target "${incomplete_target}" --platform "${platform}" 2>&1); then
  echo "FAIL: an incomplete public payload must be rejected." >&2
  exit 1
fi
[[ "${output}" == *'Public payload is incomplete:'* ]]
[[ "${output}" == *'dough-adr-awareness/RECOGNITION.md'* ]]
after=$(list_files "${incomplete_target}")
[[ "${after}" == "${before}" ]]
[[ ! -e "${incomplete_target}/${relative_skill_root%%/*}" ]]
sentinel_contents=$(cat "${incomplete_target}/sentinel.txt")
[[ "${sentinel_contents}" == 'Do not change me.' ]]

echo "PASS: ${platform_label} receives the complete declared public payload, incomplete source is rejected before writes, and other platform, internal, and unrelated material is preserved."
