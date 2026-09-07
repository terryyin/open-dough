#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

target="${temporary_dir}/target project"
mkdir -p -- "${target}"
target=$(cd -- "${target}" && pwd -P)
selected_root="${target}/.cursor/skills"
codex_root="${target}/.agents/skills"
claude_root="${target}/.claude/skills"

assert_contents() {
  local path=$1
  local expected=$2
  local actual
  actual=$(cat "${path}")
  [[ "${actual}" == "${expected}" ]]
}

mkdir -p -- \
  "${selected_root}/dough-adr-awareness" \
  "${selected_root}/unrelated-guidance" \
  "${codex_root}/dough-update" \
  "${codex_root}/dough-adr-awareness" \
  "${claude_root}/dough-update" \
  "${claude_root}/dough-adr-awareness"

printf '%s\n' 'Keep my local ADR skill edit.' > \
  "${selected_root}/dough-adr-awareness/SKILL.md"
printf '%s\n' 'Keep my local recognition edit.' > \
  "${selected_root}/dough-adr-awareness/RECOGNITION.md"
printf '%s\n' 'Keep this ADR-side file.' > \
  "${selected_root}/dough-adr-awareness/LOCAL.md"
printf '%s\n' 'Keep unrelated Cursor guidance.' > \
  "${selected_root}/unrelated-guidance/SKILL.md"
printf '%s\n' 'Keep the Codex updater.' > \
  "${codex_root}/dough-update/SKILL.md"
printf '%s\n' 'Keep the Codex ADR skill.' > \
  "${codex_root}/dough-adr-awareness/SKILL.md"
printf '%s\n' 'Keep the Codex ADR record.' > \
  "${codex_root}/dough-adr-awareness/RECOGNITION.md"
printf '%s\n' 'Keep the Claude updater.' > \
  "${claude_root}/dough-update/SKILL.md"
printf '%s\n' 'Keep the Claude ADR skill.' > \
  "${claude_root}/dough-adr-awareness/SKILL.md"
printf '%s\n' 'Keep the Claude ADR record.' > \
  "${claude_root}/dough-adr-awareness/RECOGNITION.md"
printf '%s\n' 'Keep this project file.' > "${target}/keep.txt"

before_later_collision=$(find "${target}" -type f -exec shasum -a 256 {} \; | LC_ALL=C sort)
if output=$(bash "${source_dir}/install.sh" \
  --target "${target}" --platform cursor 2>&1); then
  echo 'FAIL: an ADR skill collision must stop before an earlier payload write.' >&2
  exit 1
fi
[[ "${output}" == *'dough-adr-awareness is already installed'* ]]
after_later_collision=$(find "${target}" -type f -exec shasum -a 256 {} \; | LC_ALL=C sort)
[[ "${after_later_collision}" == "${before_later_collision}" ]]
[[ ! -e "${selected_root}/dough-update/SKILL.md" ]]

mkdir -p -- "${selected_root}/dough-update"
printf '%s\n' 'Keep this updater-side file.' > \
  "${selected_root}/dough-update/LOCAL.md"
printf '%s\n' 'Keep my local updater edit.' > \
  "${selected_root}/dough-update/SKILL.md"
before_repeat=$(find "${target}" -type f -exec shasum -a 256 {} \; | LC_ALL=C sort)
if output=$(bash "${source_dir}/install.sh" \
  --target "${target}" --platform cursor 2>&1); then
  echo 'FAIL: repeat installation must stop before changing the public payload.' >&2
  exit 1
fi
[[ "${output}" == *'Warning:'* ]]
[[ "${output}" == *'--force'* ]]
after_repeat=$(find "${target}" -type f -exec shasum -a 256 {} \; | LC_ALL=C sort)
[[ "${after_repeat}" == "${before_repeat}" ]]

output=$(bash "${source_dir}/install.sh" \
  --target "${target}" --platform cursor --force)
[[ "${output}" == *"Installed Open Dough public guidance in ${selected_root}"* ]]

cmp "${source_dir}/src/skills/dough-update/SKILL.md" \
  "${selected_root}/dough-update/SKILL.md"
cmp "${source_dir}/src/skills/dough-adr-awareness/SKILL.md" \
  "${selected_root}/dough-adr-awareness/SKILL.md"
assert_contents "${selected_root}/dough-adr-awareness/RECOGNITION.md" \
  'Keep my local recognition edit.'

assert_contents "${selected_root}/dough-update/LOCAL.md" 'Keep this updater-side file.'
assert_contents "${selected_root}/dough-adr-awareness/LOCAL.md" 'Keep this ADR-side file.'
assert_contents "${selected_root}/unrelated-guidance/SKILL.md" 'Keep unrelated Cursor guidance.'
assert_contents "${target}/keep.txt" 'Keep this project file.'

assert_contents "${codex_root}/dough-update/SKILL.md" 'Keep the Codex updater.'
assert_contents "${codex_root}/dough-adr-awareness/SKILL.md" 'Keep the Codex ADR skill.'
assert_contents "${codex_root}/dough-adr-awareness/RECOGNITION.md" 'Keep the Codex ADR record.'
assert_contents "${claude_root}/dough-update/SKILL.md" 'Keep the Claude updater.'
assert_contents "${claude_root}/dough-adr-awareness/SKILL.md" 'Keep the Claude ADR skill.'
assert_contents "${claude_root}/dough-adr-awareness/RECOGNITION.md" 'Keep the Claude ADR record.'

echo 'PASS: ordinary repeat preserves the edited installation, explicit force replaces only the two declared Cursor payload files, and an older recognition record remains for later retirement.'
