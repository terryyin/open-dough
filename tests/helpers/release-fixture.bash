#!/usr/bin/env bash
# Shared fixture builders for version-aware install/update tests.
# Sourced by tests; callers set source_dir and managed_files, and enable pipefail.

: "${source_dir:?source_dir must be set before sourcing this helper}"
: "${managed_files:?managed_files must be set before sourcing this helper}"
if ((${#managed_files[@]} == 0)); then
  echo 'managed_files must contain at least one public payload file' >&2
  return 1
fi

git_identity() {
  git -C "$1" config user.email 'fixture@example.com'
  git -C "$1" config user.name 'Open Dough Fixture'
}

copy_current_release_files() {
  local dest=$1
  local managed_file

  mkdir -p -- "${dest}/src/install" "${dest}/src/skills"
  cp -- "${source_dir}/install.sh" "${dest}/install.sh"
  cp -- "${source_dir}/src/install/"*.sh "${dest}/src/install/"
  for managed_file in "${managed_files[@]}"; do
    mkdir -p -- "${dest}/src/skills/$(dirname -- "${managed_file}")"
    cp -- "${source_dir}/src/skills/${managed_file}" \
      "${dest}/src/skills/${managed_file}"
  done
  cp -- "${source_dir}/VERSION" "${dest}/VERSION"
  cp -- "${source_dir}/CHANGELOG.md" "${dest}/CHANGELOG.md"
}

write_candidate_payload() {
  local dest=$1
  local version=$2
  local marker=$3

  copy_current_release_files "${dest}"
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

build_current_tagged_release_fixture() {
  local repo=$1
  shift
  local version
  local source_only_file

  version=$(cat "${source_dir}/VERSION")
  copy_current_release_files "${repo}"
  for source_only_file in "$@"; do
    mkdir -p -- "${repo}/src/skills/$(dirname -- "${source_only_file}")"
    cp -- "${source_dir}/src/skills/${source_only_file}" \
      "${repo}/src/skills/${source_only_file}"
  done
  git -C "${repo}" init --quiet -b main
  git_identity "${repo}"

  commit_all "${repo}" "release ${version} exact candidate"
  tag_release "${repo}" "${version}" '2026-09-06T00:00:00'
}

snapshot_path_state() {
  local root=$1
  local path relative digest symlink_target

  while IFS= read -r -d '' path; do
    relative=${path#"${root}/"}
    if [[ -L ${path} ]]; then
      symlink_target=$(readlink "${path}")
      printf 'symlink\t%s\t%s\n' "${relative}" "${symlink_target}"
    elif [[ -f ${path} ]]; then
      digest=$(shasum -a 256 "${path}")
      printf 'file\t%s\t%s\n' "${relative}" "${digest%% *}"
    elif [[ -d ${path} ]]; then
      printf 'directory\t%s\n' "${relative}"
    else
      printf 'other\t%s\n' "${relative}"
    fi
  done < <(
    # shellcheck disable=SC2312 # pipefail preserves failures across the sorted snapshot pipeline.
    find "${root}" -mindepth 1 ! -path "${root}/.git" \
      ! -path "${root}/.git/*" -print0 | LC_ALL=C sort -z
  )
}

build_latest_fixture() {
  local repo=$1

  mkdir -p -- "${repo}"
  git -C "${repo}" init --quiet -b main
  git_identity "${repo}"

  # Tagged A is 0.1.1; tagged B / numeric latest is 0.1.10.
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

# Check out tagged A (or any numeric tag) from a fixture as data. Do not run
# that tree's helper; tests install A with this snapshot's install.sh.
checkout_tagged_release() {
  local repo=$1
  local dest=$2
  local version=$3
  local commit fetch_url head

  commit=$(git -C "${repo}" rev-parse "v${version}^{commit}")
  fetch_url=$(cd -- "${repo}" && pwd -P)
  if [[ -e "${dest}" ]]; then
    echo "Checkout destination already exists: ${dest}" >&2
    return 1
  fi
  mkdir -p -- "${dest}"
  git -C "${dest}" init --quiet
  git -C "${dest}" fetch --quiet --depth 1 "file://${fetch_url}" "${commit}"
  git -C "${dest}" -c advice.detachedHead=false checkout --quiet --detach FETCH_HEAD
  head=$(git -C "${dest}" rev-parse HEAD)
  [[ "${head}" == "${commit}" ]]
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
  local skill_root managed_file

  grep -Fq "open-dough-payload ${marker}" "${destination}/SKILL.md"
  skill_root=$(dirname -- "${destination}")
  for managed_file in "${managed_files[@]}"; do
    if [[ "${managed_file}" == 'dough-update/SKILL.md' ]]; then
      continue
    fi
    cmp "${source_dir}/src/skills/${managed_file}" \
      "${skill_root}/${managed_file}"
  done
  [[ ! -e "${skill_root}/dough-adr-awareness/RECOGNITION.md" ]]
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
