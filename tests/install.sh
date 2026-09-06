#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

target="${temporary_dir}/target project"
mkdir -p -- "${target}/.agents/skills/unrelated" \
  "${target}/.claude/skills/dough-update"
sentinel="${target}/.agents/skills/unrelated/SKILL.md"
claude_sentinel="${target}/.claude/skills/dough-update/SKILL.md"
project_file="${target}/keep this file.txt"
printf '%s\n' 'Keep this unrelated skill.' > "${sentinel}"
printf '%s\n' 'Keep this Claude sentinel.' > "${claude_sentinel}"
printf '%s\n' 'Keep this project file.' > "${project_file}"

# Run outside the checkout so the installer must locate its own source.
cd -- "${temporary_dir}"
bash "${source_dir}/install.sh" --target "${target}"

cmp "${source_dir}/src/skills/dough-update/SKILL.md" \
  "${target}/.agents/skills/dough-update/SKILL.md"
[[ ! -e "${target}/.cursor" ]]
contents=$(cat "${sentinel}")
[[ "${contents}" == 'Keep this unrelated skill.' ]]
contents=$(cat "${claude_sentinel}")
[[ "${contents}" == 'Keep this Claude sentinel.' ]]
contents=$(cat "${project_file}")
[[ "${contents}" == 'Keep this project file.' ]]

if output=$(bash "${source_dir}/install.sh" --target "${target}" --platform claude 2>&1); then
  echo "FAIL: unsupported platform must stop before writing." >&2
  exit 1
fi
[[ "${output}" == *'Unsupported platform:'* ]]
[[ "${output}" == *'claude'* ]]
[[ ! -e "${target}/.cursor" ]]
cmp "${source_dir}/src/skills/dough-update/SKILL.md" \
  "${target}/.agents/skills/dough-update/SKILL.md"
contents=$(cat "${claude_sentinel}")
[[ "${contents}" == 'Keep this Claude sentinel.' ]]

installed_skill="${target}/.agents/skills/dough-update/SKILL.md"
printf '%s\n' 'Keep my local changes.' > "${installed_skill}"
if output=$(bash "${source_dir}/install.sh" --target "${target}" 2>&1); then
  echo "FAIL: repeat installation must stop." >&2
  exit 1
fi
[[ "${output}" == *'Warning:'* ]]
[[ "${output}" == *'--force'* ]]
contents=$(cat "${installed_skill}")
[[ "${contents}" == 'Keep my local changes.' ]]
contents=$(cat "${sentinel}")
[[ "${contents}" == 'Keep this unrelated skill.' ]]
contents=$(cat "${claude_sentinel}")
[[ "${contents}" == 'Keep this Claude sentinel.' ]]

bash "${source_dir}/install.sh" --target "${target}" --force
cmp "${source_dir}/src/skills/dough-update/SKILL.md" "${installed_skill}"
contents=$(cat "${sentinel}")
[[ "${contents}" == 'Keep this unrelated skill.' ]]

bash "${source_dir}/install.sh" --target "${target}" --platform cursor
cursor_skill="${target}/.cursor/skills/dough-update/SKILL.md"
cmp "${source_dir}/src/skills/dough-update/SKILL.md" "${cursor_skill}"
cmp "${source_dir}/src/skills/dough-update/SKILL.md" "${installed_skill}"
contents=$(cat "${sentinel}")
[[ "${contents}" == 'Keep this unrelated skill.' ]]
contents=$(cat "${claude_sentinel}")
[[ "${contents}" == 'Keep this Claude sentinel.' ]]
contents=$(cat "${project_file}")
[[ "${contents}" == 'Keep this project file.' ]]

printf '%s\n' 'Keep my Cursor edits.' > "${cursor_skill}"
if output=$(bash "${source_dir}/install.sh" --target "${target}" --platform cursor 2>&1); then
  echo "FAIL: Cursor repeat installation must stop." >&2
  exit 1
fi
[[ "${output}" == *'Warning:'* ]]
[[ "${output}" == *'--force'* ]]
contents=$(cat "${cursor_skill}")
[[ "${contents}" == 'Keep my Cursor edits.' ]]
cmp "${source_dir}/src/skills/dough-update/SKILL.md" "${installed_skill}"
contents=$(cat "${claude_sentinel}")
[[ "${contents}" == 'Keep this Claude sentinel.' ]]

bash "${source_dir}/install.sh" --target "${target}" --platform cursor --force
cmp "${source_dir}/src/skills/dough-update/SKILL.md" "${cursor_skill}"
cmp "${source_dir}/src/skills/dough-update/SKILL.md" "${installed_skill}"
contents=$(cat "${sentinel}")
[[ "${contents}" == 'Keep this unrelated skill.' ]]
contents=$(cat "${claude_sentinel}")
[[ "${contents}" == 'Keep this Claude sentinel.' ]]
contents=$(cat "${project_file}")
[[ "${contents}" == 'Keep this project file.' ]]

bash "${source_dir}/install.sh" --target "${target}" --platform codex --force
cmp "${source_dir}/src/skills/dough-update/SKILL.md" "${installed_skill}"
cmp "${source_dir}/src/skills/dough-update/SKILL.md" "${cursor_skill}"

echo "PASS: installs Codex and Cursor skills, rejects unsupported platforms, stops repeats, forces replacement, and preserves other copies."
