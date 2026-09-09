#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)

if (($# < 2)); then
  echo "Usage: $0 <codex|cursor|claude> <managed-file>..." >&2
  exit 1
fi
platform=$1
shift
managed_files=("$@")

case "${platform}" in
  codex)
    relative_skill_root=.agents/skills
    platform_label=Codex
    ;;
  cursor)
    relative_skill_root=.agents/skills
    platform_label=Cursor
    ;;
  claude)
    relative_skill_root=.claude/skills
    platform_label='Claude Code'
    ;;
  *)
    echo "Usage: $0 <codex|cursor|claude> <managed-file>..." >&2
    exit 1
    ;;
esac

skill_roots=(.agents/skills .claude/skills)

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
bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" \
  --platform "${platform}"

for managed_file in "${managed_files[@]}"; do
  cmp "${source_dir}/src/skills/${managed_file}" \
    "${target}/${relative_skill_root}/${managed_file}"
done
[[ -f "${source_dir}/src/skills/dough-adr-awareness/RECOGNITION.md" ]]
[[ ! -e "${target}/${relative_skill_root}/dough-adr-awareness/RECOGNITION.md" ]]

for internal_skill in extract-guidance release-version; do
  for skill_root in "${skill_roots[@]}"; do
    [[ ! -e "${target}/${skill_root}/${internal_skill}" ]]
  done
done
[[ ! -e "${target}/AGENTS.md" ]]
[[ ! -e "${target}/CLAUDE.md" ]]

for skill_root in "${skill_roots[@]}"; do
  for managed_file in "${managed_files[@]}"; do
    [[ -f "${target}/${skill_root}/${managed_file}" ]]
  done
done
expected_files=$(
  {
    printf '%s\n' \
      './.agents/skills/existing-codex/SKILL.md' \
      './.claude/settings.json' \
      './.claude/skills/existing-claude/SKILL.md' \
      './.cursor/hooks.json' \
      './.cursor/skills/existing-cursor/SKILL.md' \
      './keep.txt'
    for skill_root in "${skill_roots[@]}"; do
      for managed_file in "${managed_files[@]}"; do
        printf './%s/%s\n' "${skill_root}" "${managed_file}"
      done
      printf './%s/dough-update/SOURCE\n' "${skill_root}"
      printf './%s/dough-update/VERSION\n' "${skill_root}"
    done
  } | LC_ALL=C sort
)
actual_files=$(list_files "${target}")
[[ "${actual_files}" == "${expected_files}" ]]
expected_source=$(cd -- "${source_dir}" && pwd -P)
recorded_source=$(cat "${target}/${relative_skill_root}/dough-update/SOURCE")
[[ "${recorded_source}" == "${expected_source}" ]]

incomplete_source="${temporary_dir}/incomplete source"
missing_index=$((${#managed_files[@]} - 1))
missing_managed_file=${managed_files[missing_index]}
mkdir -p -- "${incomplete_source}/src/skills"
cp -- "${source_dir}/install.sh" "${incomplete_source}/install.sh"
cp -- "${source_dir}/VERSION" "${incomplete_source}/VERSION"
cp -- "${source_dir}/CHANGELOG.md" "${incomplete_source}/CHANGELOG.md"
cp -R -- "${source_dir}/src/install" "${incomplete_source}/src/install"
for managed_file in "${managed_files[@]}"; do
  if [[ "${managed_file}" == "${missing_managed_file}" ]]; then
    continue
  fi
  mkdir -p -- "${incomplete_source}/src/skills/$(dirname -- "${managed_file}")"
  cp -- "${source_dir}/src/skills/${managed_file}" \
    "${incomplete_source}/src/skills/${managed_file}"
done

incomplete_target="${temporary_dir}/incomplete target"
mkdir -p -- "${incomplete_target}"
printf '%s\n' 'Do not change me.' > "${incomplete_target}/sentinel.txt"
before=$(list_files "${incomplete_target}")
if output=$(bash "${incomplete_source}/install.sh" \
  --target "${incomplete_target}" --source "${incomplete_source}" \
  --platform "${platform}" 2>&1); then
  echo "FAIL: an incomplete client payload must be rejected." >&2
  exit 1
fi
[[ "${output}" == *'Client payload is incomplete:'* ]]
[[ "${output}" == *"${missing_managed_file}"* ]]
after=$(list_files "${incomplete_target}")
[[ "${after}" == "${before}" ]]
[[ ! -e "${incomplete_target}/${relative_skill_root%%/*}" ]]
sentinel_contents=$(cat "${incomplete_target}/sentinel.txt")
[[ "${sentinel_contents}" == 'Do not change me.' ]]

echo "PASS: ${platform_label} receives the complete declared client payload, incomplete source is rejected before writes, and other platform, internal, and unrelated material is preserved."
