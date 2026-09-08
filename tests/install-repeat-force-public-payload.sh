#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/release-fixture.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

target="${temporary_dir}/target project"
mkdir -p -- "${target}"
target=$(cd -- "${target}" && pwd -P)
selected_root="${target}/.agents/skills"
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
printf '%s\n' 'Keep the Claude updater.' > \
  "${claude_root}/dough-update/SKILL.md"
printf '%s\n' 'Keep the Claude ADR skill.' > \
  "${claude_root}/dough-adr-awareness/SKILL.md"
printf '%s\n' 'Keep the Claude ADR record.' > \
  "${claude_root}/dough-adr-awareness/RECOGNITION.md"
printf '%s\n' 'Keep this project file.' > "${target}/keep.txt"

before_later_collision=$(find "${target}" -type f -exec shasum -a 256 {} \; | LC_ALL=C sort)
if output=$(bash "${source_dir}/install.sh" \
  --target "${target}" --source "${source_dir}" --platform cursor 2>&1); then
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
  --target "${target}" --source "${source_dir}" --platform cursor 2>&1); then
  echo 'FAIL: repeat installation must stop before changing the public payload.' >&2
  exit 1
fi
[[ "${output}" == *'Warning:'* ]]
[[ "${output}" == *'--force'* ]]
after_repeat=$(find "${target}" -type f -exec shasum -a 256 {} \; | LC_ALL=C sort)
[[ "${after_repeat}" == "${before_repeat}" ]]

before_selected_sidecars=$(shasum -a 256 \
  "${selected_root}/dough-update/LOCAL.md" \
  "${selected_root}/dough-adr-awareness/LOCAL.md")
before_selected_unrelated=$(snapshot_path_state \
  "${selected_root}/unrelated-guidance")
before_project_file=$(shasum -a 256 "${target}/keep.txt")

output=$(bash "${source_dir}/install.sh" \
  --target "${target}" --source "${source_dir}" --platform cursor --force)
[[ "${output}" == *"Installed Open Dough public guidance in ${selected_root}"* ]]

cmp "${source_dir}/src/skills/dough-update/SKILL.md" \
  "${selected_root}/dough-update/SKILL.md"
cmp "${source_dir}/src/skills/dough-adr-awareness/SKILL.md" \
  "${selected_root}/dough-adr-awareness/SKILL.md"
[[ ! -e "${selected_root}/dough-adr-awareness/RECOGNITION.md" ]]
expected_version=$(cat "${source_dir}/VERSION")
assert_contents "${selected_root}/dough-update/VERSION" "${expected_version}"
expected_source=$(cd -- "${source_dir}" && pwd -P)
assert_contents "${selected_root}/dough-update/SOURCE" "${expected_source}"

assert_contents "${selected_root}/dough-update/LOCAL.md" 'Keep this updater-side file.'
assert_contents "${selected_root}/dough-adr-awareness/LOCAL.md" 'Keep this ADR-side file.'
assert_contents "${selected_root}/unrelated-guidance/SKILL.md" 'Keep unrelated Cursor guidance.'
assert_contents "${target}/keep.txt" 'Keep this project file.'

cmp "${source_dir}/src/skills/dough-update/SKILL.md" \
  "${claude_root}/dough-update/SKILL.md"
cmp "${source_dir}/src/skills/dough-adr-awareness/SKILL.md" \
  "${claude_root}/dough-adr-awareness/SKILL.md"
[[ ! -e "${claude_root}/dough-adr-awareness/RECOGNITION.md" ]]

after_selected_sidecars=$(shasum -a 256 \
  "${selected_root}/dough-update/LOCAL.md" \
  "${selected_root}/dough-adr-awareness/LOCAL.md")
after_selected_unrelated=$(snapshot_path_state \
  "${selected_root}/unrelated-guidance")
after_project_file=$(shasum -a 256 "${target}/keep.txt")
[[ "${after_selected_sidecars}" == "${before_selected_sidecars}" ]]
[[ "${after_selected_unrelated}" == "${before_selected_unrelated}" ]]
[[ "${after_project_file}" == "${before_project_file}" ]]

output=$(bash "${source_dir}/install.sh" \
  --target "${target}" --source "${source_dir}" --platform cursor --force)
[[ "${output}" == *"Recorded version "* ]]
[[ ! -e "${selected_root}/dough-adr-awareness/RECOGNITION.md" ]]

assert_unsafe_retired_object() {
  local object_kind=$1
  local unsafe_target="${temporary_dir}/unsafe-${object_kind}"
  local unsafe_path="${unsafe_target}/.agents/skills/dough-adr-awareness/RECOGNITION.md"
  local outside_file="${temporary_dir}/outside-${object_kind}"
  local before after failure_output

  mkdir -p -- "$(dirname -- "${unsafe_path}")"
  printf '%s\n' 'Keep this outside file.' > "${outside_file}"
  if [[ "${object_kind}" == directory ]]; then
    mkdir -- "${unsafe_path}"
  else
    ln -s -- "${outside_file}" "${unsafe_path}"
  fi
  before=$(snapshot_path_state "${unsafe_target}")
  if failure_output=$(bash "${source_dir}/install.sh" \
    --target "${unsafe_target}" --source "${source_dir}" --platform cursor --force 2>&1); then
    echo "FAIL: a retired-path ${object_kind} must be refused before writes." >&2
    exit 1
  fi
  [[ "${failure_output}" == *'Unsafe retired-file collision:'* ]]
  after=$(snapshot_path_state "${unsafe_target}")
  [[ "${after}" == "${before}" ]]
  assert_contents "${outside_file}" 'Keep this outside file.'
}

assert_unsafe_retired_object directory
assert_unsafe_retired_object symlink

echo 'PASS: ordinary repeat preserves the edited installation, explicit force replaces the two declared Cursor payload files, retires only the fixed recognition file, preserves all other content, treats absence as a no-op, and refuses unsafe retired-path objects before writes.'
