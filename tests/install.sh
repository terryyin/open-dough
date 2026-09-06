#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

target="${temporary_dir}/target project"
mkdir -p -- "${target}/.agents/skills/unrelated"
sentinel="${target}/.agents/skills/unrelated/SKILL.md"
printf '%s\n' 'Keep this unrelated skill.' > "${sentinel}"

# Run outside the checkout so the installer must locate its own source.
cd -- "${temporary_dir}"
bash "${source_dir}/install.sh" --target "${target}"

cmp "${source_dir}/src/skills/dough-update/SKILL.md" \
  "${target}/.agents/skills/dough-update/SKILL.md"
contents=$(cat "${sentinel}")
[[ "${contents}" == 'Keep this unrelated skill.' ]]

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

bash "${source_dir}/install.sh" --target "${target}" --force
cmp "${source_dir}/src/skills/dough-update/SKILL.md" "${installed_skill}"
contents=$(cat "${sentinel}")
[[ "${contents}" == 'Keep this unrelated skill.' ]]

echo "PASS: installs the supplied skill, stops repeats, forces replacement, and preserves unrelated content."
