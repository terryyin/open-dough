#!/usr/bin/env bash
# Shared fixture builders for version-aware install/update tests.
# Sourced by tests; callers set source_dir and have set -euo pipefail.

: "${source_dir:?source_dir must be set before sourcing this helper}"

git_identity() {
  git -C "$1" config user.email 'fixture@example.com'
  git -C "$1" config user.name 'Open Dough Fixture'
}

write_candidate_payload() {
  local dest=$1
  local version=$2
  local marker=$3

  mkdir -p -- "${dest}/src/install" "${dest}/src/skills/dough-update" \
    "${dest}/src/skills/dough-adr-awareness"
  cp -- "${source_dir}/install.sh" "${dest}/install.sh"
  cp -- "${source_dir}/src/install/"*.sh "${dest}/src/install/"
  cp -- "${source_dir}/src/skills/dough-update/SKILL.md" \
    "${dest}/src/skills/dough-update/SKILL.md"
  cp -- "${source_dir}/src/skills/dough-adr-awareness/SKILL.md" \
    "${dest}/src/skills/dough-adr-awareness/SKILL.md"
  cp -- "${source_dir}/src/skills/dough-adr-awareness/RECOGNITION.md" \
    "${dest}/src/skills/dough-adr-awareness/RECOGNITION.md"
  printf '\n<!-- open-dough-payload %s -->\n' "${marker}" >> \
    "${dest}/src/skills/dough-update/SKILL.md"
  printf '%s\n' "${version}" > "${dest}/VERSION"
  printf '%s\n\n%s\n' "## ${version} - 2026-09-06" "${marker}" > "${dest}/CHANGELOG.md"
}

commit_all() {
  local repo=$1
  local message=$2

  git -C "${repo}" add -A
  git -C "${repo}" commit --quiet -m "${message}"
}

tag_release() {
  local repo=$1
  local version=$2
  local date=$3

  GIT_AUTHOR_DATE="${date}" GIT_COMMITTER_DATE="${date}" \
    git -C "${repo}" tag -a "v${version}" -m "v${version}"
}

build_latest_fixture() {
  local repo=$1

  mkdir -p -- "${repo}"
  git -C "${repo}" init --quiet -b main
  git_identity "${repo}"

  write_candidate_payload "${repo}" 0.1.1 payload-0.1.1
  commit_all "${repo}" 'release 0.1.1'
  tag_release "${repo}" 0.1.1 '2026-06-01T00:00:00'

  write_candidate_payload "${repo}" 0.1.2 payload-0.1.2
  commit_all "${repo}" 'release 0.1.2'
  tag_release "${repo}" 0.1.2 '2026-09-01T00:00:00'

  write_candidate_payload "${repo}" 0.1.10 payload-0.1.10
  commit_all "${repo}" 'release 0.1.10'
  tag_release "${repo}" 0.1.10 '2020-01-01T00:00:00'

  write_candidate_payload "${repo}" 0.9.9 payload-branch
  printf '%s\n' 'divergent-branch' > "${repo}/BRANCH_HEAD"
  commit_all "${repo}" 'divergent branch head'
}

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
  [[ "${contents}" == 'Keep this unrelated skill.' ]]
  contents=$(cat "${target}/.cursor/skills/other-cursor-skill/SKILL.md")
  [[ "${contents}" == 'Keep this Cursor sentinel.' ]]
  contents=$(cat "${target}/.claude/skills/other-skill/SKILL.md")
  [[ "${contents}" == 'Keep this Claude sentinel.' ]]
  contents=$(cat "${target}/keep this file.txt")
  [[ "${contents}" == 'Keep this project file.' ]]
}

assert_payload() {
  local destination=$1
  local version=$2
  local marker=$3
  local contents
  local skill_root

  grep -Fq "open-dough-payload ${marker}" "${destination}/SKILL.md"
  skill_root=$(dirname -- "${destination}")
  cmp "${source_dir}/src/skills/dough-adr-awareness/SKILL.md" \
    "${skill_root}/dough-adr-awareness/SKILL.md"
  cmp "${source_dir}/src/skills/dough-adr-awareness/RECOGNITION.md" \
    "${skill_root}/dough-adr-awareness/RECOGNITION.md"
  contents=$(cat "${destination}/VERSION")
  [[ "${contents}" == "${version}" ]]
}

file_mtime() {
  if stat -f '%m' "$1" > /dev/null 2>&1; then
    stat -f '%m' "$1"
  else
    stat -c '%Y' "$1"
  fi
}
