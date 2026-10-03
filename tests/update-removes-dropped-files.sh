#!/usr/bin/env bash
# shellcheck disable=SC2154 # Sourced fixture defines managed_files.
# An update removes installed files that earlier releases declared and the new
# release does not, found through the release tags at the recorded source.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/release-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
helper="${source_dir}/src/install/open-dough-release.sh"
fixture="${temporary_dir}/fixture.git"

# A is declared only by 0.1.0, so a target recorded at 0.1.1 still holding it
# was stranded by an earlier update. B is declared through 0.1.1 and dropped by
# 0.1.2. Its directory also holds a project file in the target.
leftover_a='dough-retired/references/a.md'
leftover_b='dough-adr-awareness/extras/b.md'
project_beside_b='dough-adr-awareness/extras/project-notes.md'

# Add each named extra to the fixture's src/skills with bytes naming the
# release, and declare it in that release's install.sh.
declare_extras() {
  local repo=$1 version=$2 extra
  shift 2
  for extra in "$@"; do
    mkdir -p -- "${repo}/src/skills/${extra%/*}"
    printf '%s from %s\n' "${extra}" "${version}" > "${repo}/src/skills/${extra}"
    awk -v extra="${extra}" '{ print } /^managed_files=\(/ { print "  " extra }' \
      "${repo}/install.sh" > "${repo}/install.sh.new"
    mv -- "${repo}/install.sh.new" "${repo}/install.sh"
  done
}

# 0.0.9's declaration is unreadable, as in early real releases; 0.1.0 declares
# A and B; 0.1.1 drops A; 0.1.2 drops B.
build_dropped_files_fixture() {
  local repo=$1

  init_fixture_repo "${repo}"
  write_candidate_payload "${repo}" 0.0.9 payload-0.0.9
  printf '%s\n' 'managed_files=(dough-update/SKILL.md)' > "${repo}/install.sh"
  commit_all "${repo}" 'release 0.0.9 with an unreadable declaration'
  tag_release "${repo}" 0.0.9 '2026-08-30T00:00:00'

  write_candidate_payload "${repo}" 0.1.0 payload-0.1.0
  declare_extras "${repo}" 0.1.0 "${leftover_a}" "${leftover_b}"
  commit_all "${repo}" 'release 0.1.0'
  tag_release "${repo}" 0.1.0 '2026-08-31T00:00:00'

  rm -rf -- "${repo}/src/skills/${leftover_a%%/*}"
  write_candidate_payload "${repo}" 0.1.1 payload-0.1.1
  declare_extras "${repo}" 0.1.1 "${leftover_b}"
  commit_all "${repo}" 'release 0.1.1'
  tag_release "${repo}" 0.1.1 '2026-09-01T00:00:00'

  rm -rf -- "${repo}/src/skills/${leftover_b%/*}"
  write_candidate_payload "${repo}" 0.1.2 payload-0.1.2
  commit_all "${repo}" 'release 0.1.2'
  tag_release "${repo}" 0.1.2 '2026-09-02T00:00:00'
}

# Install 0.1.1 with its own installer into both roots, then add A with 0.1.0
# bytes and the project's own files.
prepare_recorded_target() {
  local target=$1 older=$2 root

  prepare_target "${target}"
  bash "${older}/install.sh" --target "${target}" --source "${fixture}" \
    --platform codex > /dev/null
  mkdir -p -- "${target}/.claude/skills/own-skill"
  printf '%s\n' 'Project-owned skill.' > "${target}/.claude/skills/own-skill/SKILL.md"
  for root in "${target}/.agents/skills" "${target}/.claude/skills"; do
    mkdir -p -- "${root}/${leftover_a%/*}"
    git -C "${fixture}" show "v0.1.0:src/skills/${leftover_a}" > "${root}/${leftover_a}"
    printf '%s\n' 'Project notes beside a leftover.' > "${root}/${project_beside_b}"
    [[ -f "${root}/${leftover_b}" ]]
  done
}

# Print the indented paths the output lists under platform's removal heading.
removed_listing() {
  local output=$1 platform=$2 root=$3
  printf '%s\n' "${output}" | awk -v heading="${platform}: removed files 0.1.2 no longer declares from ${root}:" '
    $0 == heading { listing = 1; next }
    listing && /^  / { sub(/^  /, ""); print; next }
    { listing = 0 }
  ' | LC_ALL=C sort
}

# Each root lists A and B as removed, no longer holds them, and holds 0.1.2.
assert_leftovers_replaced_by_release() {
  local target=$1 output=$2 platform_root platform root listed installed_version expected_removed

  expected_removed=$(printf '%s\n' "${leftover_a}" "${leftover_b}" | LC_ALL=C sort)
  for platform_root in "codex:${target}/.agents/skills" "claude:${target}/.claude/skills"; do
    platform=${platform_root%%:*}
    root=${platform_root#*:}
    listed=$(removed_listing "${output}" "${platform}" "${root}")
    if [[ "${listed}" != "${expected_removed}" ]]; then
      printf 'FAIL: %s removal listing was:\n%s\nfull output:\n%s\n' "${platform}" "${listed}" "${output}" >&2
      exit 1
    fi
    [[ ! -e "${root}/${leftover_a}" && ! -e "${root}/${leftover_b}" ]]
    assert_payload_bytes_match "${fixture}/src/skills" "${root}"
    installed_version=$(cat "${root}/dough-update/VERSION")
    [[ "${installed_version}" == '0.1.2' ]]
  done
}

assert_project_files_kept() {
  local target=$1 root contents

  contents=$(cat "${target}/.claude/skills/own-skill/SKILL.md")
  [[ "${contents}" == 'Project-owned skill.' ]]
  for root in "${target}/.agents/skills" "${target}/.claude/skills"; do
    contents=$(cat "${root}/${project_beside_b}")
    [[ "${contents}" == 'Project notes beside a leftover.' ]]
    contents=$(cat "${root}/dough-update/SOURCE")
    [[ "${contents}" == "${recorded_source}" ]]
  done
  assert_sentinels "${target}"
}

build_dropped_files_fixture "${fixture}"
recorded_source=$(cd -- "${fixture}" && pwd -P)
older="${temporary_dir}/release-0.1.1"
checkout_tagged_release "${fixture}" "${older}" 0.1.1

# Ordinary update: unedited leftovers in both roots are removed and listed.
target="${temporary_dir}/ordinary"
prepare_recorded_target "${target}" "${older}"
output=$(bash "${helper}" apply --target "${target}" --platform codex 2>&1)

[[ "${output}" == *'installed or updated the shared Codex/Cursor root and Claude Code to 0.1.2'* ]]
if [[ "${output}" == *'filtering not recognized'* || "${output}" == *'promisor'* ]]; then
  printf 'FAIL: release-history fetch noise reached the update output:\n%s\n' "${output}" >&2
  exit 1
fi
assert_leftovers_replaced_by_release "${target}" "${output}"
# Removal leaves no empty directory; one still holding a project file stays.
for root in "${target}/.agents/skills" "${target}/.claude/skills"; do
  [[ ! -e "${root}/${leftover_a%%/*}" ]]
  [[ -d "${root}/${leftover_b%/*}" ]]
done
assert_project_files_kept "${target}"

# Edited leftovers: the ordinary update names them in every root and refuses
# before any write, pointing to the explicit force replacement.
target="${temporary_dir}/edited"
prepare_recorded_target "${target}" "${older}"
printf '%s\n' 'local edit' >> "${target}/.agents/skills/${leftover_b}"
printf '%s\n' 'local edit' >> "${target}/.claude/skills/${leftover_b}"
before=$(snapshot_path_state "${target}")
if output=$(bash "${helper}" apply --target "${target}" --platform codex 2>&1); then
  printf 'FAIL: ordinary update accepted an edited leftover:\n%s\n' "${output}" >&2
  exit 1
fi
expected_refusal="codex: edited files at paths 0.1.2 no longer declares in ${target}/.agents/skills:
  ${leftover_b}
claude: edited files at paths 0.1.2 no longer declares in ${target}/.claude/skills:
  ${leftover_b}
Ordinary update refuses without writes. Use --force to explicitly reinstall and remove them."
if [[ "${output}" != *"${expected_refusal}"* ||
  "${output}" != *'Outcome: refused; preserved the selected installation.'* ]]; then
  printf 'FAIL: edited-leftover refusal was:\n%s\n' "${output}" >&2
  exit 1
fi
after=$(snapshot_path_state "${target}")
if [[ "${after}" != "${before}" ]]; then
  echo 'FAIL: refusing an edited leftover changed the target.' >&2
  exit 1
fi
assert_project_files_kept "${target}"

# Explicit force installs 0.1.2 and removes every leftover, edited or not.
output=$(bash "${helper}" apply --target "${target}" --platform codex --force 2>&1)
[[ "${output}" == *'Outcome: installed 0.1.2 in the shared Codex/Cursor root and Claude Code by explicit force.'* ]]
assert_leftovers_replaced_by_release "${target}" "${output}"
assert_project_files_kept "${target}"
