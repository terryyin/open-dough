#!/usr/bin/env bash
# shellcheck disable=SC2154 # Sourced by release-fixture.bash after it checks source_dir and managed_files.
# Project targets for install/update tests: seeded sentinels, and checks of
# the payload and temporary work that installation leaves behind.

prepare_target() {
  local target=$1

  mkdir -p -- "${target}/.agents/skills/unrelated" \
    "${target}/.cursor/skills/other-cursor-skill" \
    "${target}/.claude/skills/other-skill"
  printf '%s\n' 'Keep this unrelated skill.' > \
    "${target}/.agents/skills/unrelated/SKILL.md"
  printf '%s\n' 'Keep this Cursor sentinel.' > \
    "${target}/.cursor/skills/other-cursor-skill/SKILL.md"
  printf '%s\n' 'Keep this Claude sentinel.' > \
    "${target}/.claude/skills/other-skill/SKILL.md"
  printf '%s\n' 'Keep this project file.' > "${target}/keep this file.txt"
}

assert_sentinels() {
  local target=$1
  local contents

  contents=$(cat "${target}/.agents/skills/unrelated/SKILL.md")
  if [[ "${contents}" != 'Keep this unrelated skill.' ]]; then
    echo "FAIL: assert_sentinels lost unrelated agents skill" >&2
    return 1
  fi
  contents=$(cat "${target}/.cursor/skills/other-cursor-skill/SKILL.md")
  if [[ "${contents}" != 'Keep this Cursor sentinel.' ]]; then
    echo "FAIL: assert_sentinels lost Cursor sentinel" >&2
    return 1
  fi
  contents=$(cat "${target}/.claude/skills/other-skill/SKILL.md")
  if [[ "${contents}" != 'Keep this Claude sentinel.' ]]; then
    echo "FAIL: assert_sentinels lost Claude sentinel" >&2
    return 1
  fi
  contents=$(cat "${target}/keep this file.txt")
  if [[ "${contents}" != 'Keep this project file.' ]]; then
    echo "FAIL: assert_sentinels lost project file" >&2
    return 1
  fi
}

assert_payload() {
  local destination=$1
  local version=$2
  local marker=$3
  local contents
  local skill_root managed_file
  local -a unmarked_files=()

  if ! grep -Fq "open-dough-payload ${marker}" "${destination}/SKILL.md"; then
    echo "FAIL: assert_payload missing marker ${marker} in ${destination}/SKILL.md" >&2
    return 1
  fi
  skill_root=$(dirname -- "${destination}")
  # The marked dough-update entry differs by design; every other declared
  # file must match.
  for managed_file in "${managed_files[@]}"; do
    [[ "${managed_file}" == 'dough-update/SKILL.md' ]] || unmarked_files+=("${managed_file}")
  done
  if ! (
    managed_files=("${unmarked_files[@]}")
    assert_payload_bytes_match "${source_dir}/src/skills" "${skill_root}"
  ); then
    echo "FAIL: assert_payload mismatch under ${skill_root}" >&2
    return 1
  fi
  contents=$(cat "${destination}/VERSION")
  if [[ "${contents}" != "${version}" ]]; then
    echo "FAIL: assert_payload VERSION is ${contents}, expected ${version}" >&2
    return 1
  fi
}

# One mtime line per path argument, in argument order, from one stat process.
file_mtime() {
  if stat -f '%m' "$1" > /dev/null 2>&1; then
    stat -f '%m' -- "$@"
  else
    stat -c '%Y' -- "$@"
  fi
}

assert_owned_tmp_empty() {
  local tmp=$1
  local context=$2
  local leftover

  # Apple's developer-tool launcher may create xcrun_db in TMPDIR.
  leftover=$(find "${tmp}" -mindepth 1 ! -name xcrun_db -print -quit)
  if [[ -n "${leftover}" ]]; then
    echo "FAIL: ${context} left temporary work under ${tmp}: ${leftover}" >&2
    find "${tmp}" -mindepth 1 ! -name xcrun_db -print >&2
    exit 1
  fi
}
