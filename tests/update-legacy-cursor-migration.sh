#!/usr/bin/env bash
# shellcheck disable=SC1091
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
source "${source_dir}/tests/helpers/release-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
fixture="${temporary_dir}/fixture.git"
helper="${source_dir}/src/install/open-dough-release.sh"
build_latest_fixture "${fixture}"

prepare_legacy_cursor_only() {
  local target=$1

  prepare_target "${target}"
  bash "${helper}" apply --url "${fixture}" --target "${target}" --platform cursor > /dev/null
  mkdir -p -- "${target}/.cursor/skills"
  cp -R -- "${target}/.agents/skills/dough-update" \
    "${target}/.agents/skills/dough-adr-awareness" "${target}/.cursor/skills/"
  rm -rf -- "${target}/.agents/skills/dough-update" \
    "${target}/.agents/skills/dough-adr-awareness" \
    "${target}/.claude/skills/dough-update" \
    "${target}/.claude/skills/dough-adr-awareness"
}

assert_refuses_unchanged() {
  local target=$1 label=$2 before after output

  before=$(snapshot_path_state "${target}")
  if output=$(bash "${helper}" apply --target "${target}" --platform cursor 2>&1); then
    echo "FAIL: ${label} must refuse ordinary migration." >&2
    exit 1
  fi
  [[ "${output}" == *'Outcome: refused; preserved'* ]]
  after=$(snapshot_path_state "${target}")
  [[ "${after}" == "${before}" ]]
}

safe_target="${temporary_dir}/safe"
prepare_legacy_cursor_only "${safe_target}"
printf '%s\n' 'Keep this unrelated Cursor skill.' > \
  "${safe_target}/.cursor/skills/other-cursor-skill/LOCAL.md"
bash "${helper}" apply --target "${safe_target}" --platform cursor > /dev/null
assert_payload "${safe_target}/.agents/skills/dough-update" 0.1.10 payload-0.1.10
assert_payload "${safe_target}/.claude/skills/dough-update" 0.1.10 payload-0.1.10
[[ ! -e "${safe_target}/.cursor/skills/dough-update" ]]
[[ ! -e "${safe_target}/.cursor/skills/dough-adr-awareness" ]]
cursor_sentinel=$(cat "${safe_target}/.cursor/skills/other-cursor-skill/SKILL.md")
[[ "${cursor_sentinel}" == 'Keep this Cursor sentinel.' ]]
cursor_local=$(cat "${safe_target}/.cursor/skills/other-cursor-skill/LOCAL.md")
[[ "${cursor_local}" == 'Keep this unrelated Cursor skill.' ]]

edited_target="${temporary_dir}/edited"
prepare_legacy_cursor_only "${edited_target}"
printf '%s\n' edited >> "${edited_target}/.cursor/skills/dough-update/SKILL.md"
assert_refuses_unchanged "${edited_target}" 'edited legacy payload'

conflict_target="${temporary_dir}/conflict"
prepare_legacy_cursor_only "${conflict_target}"
mkdir -p -- "${conflict_target}/.agents/skills"
cp -R -- "${conflict_target}/.cursor/skills/dough-update" \
  "${conflict_target}/.cursor/skills/dough-adr-awareness" \
  "${conflict_target}/.agents/skills/"
printf '%s\n' "${temporary_dir}/conflicting-source.git" > \
  "${conflict_target}/.cursor/skills/dough-update/SOURCE"
assert_refuses_unchanged "${conflict_target}" 'conflicting canonical and legacy sources'

retire_failure_target="${temporary_dir}/retire-failure"
prepare_legacy_cursor_only "${retire_failure_target}"
if OPEN_DOUGH_INSTALL_FAULT=legacy-retire bash "${helper}" apply \
  --target "${retire_failure_target}" --platform cursor > /dev/null 2>&1; then
  echo 'FAIL: a legacy retirement failure must not report migration success.' >&2
  exit 1
fi
[[ -f "${retire_failure_target}/.agents/skills/dough-update/SKILL.md" ]]
[[ -f "${retire_failure_target}/.cursor/skills/dough-update/SOURCE" ]]

unsafe_target="${temporary_dir}/unsafe"
mkdir -p -- "${unsafe_target}/.cursor"
ln -s -- "${temporary_dir}" "${unsafe_target}/.cursor/skills"
assert_refuses_unchanged "${unsafe_target}" 'unsafe legacy topology'

echo 'PASS: ordinary legacy Cursor migration verifies before writing, converges on two roots, preserves unrelated Cursor content, and refuses edited, conflicting, unsafe, or incomplete migration state.'
