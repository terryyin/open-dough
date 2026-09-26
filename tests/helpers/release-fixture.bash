#!/usr/bin/env bash
# Shared fixture builders for version-aware install/update tests.
# Sourced by tests; callers set source_dir and managed_files, and enable pipefail.

: "${source_dir:?source_dir must be set before sourcing this helper}"
: "${managed_files:?managed_files must be set before sourcing this helper}"
if ((${#managed_files[@]} == 0)); then
  echo 'managed_files must contain at least one client payload file' >&2
  return 1
fi

# shellcheck source=tests/helpers/path-state-snapshot.bash
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/path-state-snapshot.bash"
# shellcheck source=tests/helpers/payload-bytes.bash
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/payload-bytes.bash"
# shellcheck source=tests/helpers/install-target-fixture.bash
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/install-target-fixture.bash"

# Commit identity and settings every fixture repository needs.
configure_fixture_git() {
  git -C "$1" config user.email 'fixture@example.com'
  git -C "$1" config user.name 'Open Dough Fixture'
  # Commits otherwise start a detached auto-maintenance repack (Git 2.55)
  # that can still be writing .git/objects when the test removes the fixture.
  git -C "$1" config maintenance.auto false
}

init_fixture_repo() {
  mkdir -p -- "$1"
  git -C "$1" init --quiet -b main
  configure_fixture_git "$1"
}

copy_installer_modules() {
  local dest=$1
  local modules_root=${2:-${source_dir}}
  local mjs_file
  local -a mjs_files=()

  mkdir -p -- "${dest}/src/install"
  cp -- "${modules_root}/src/install/"*.sh "${dest}/src/install/"
  # Hook registration helpers travel with the installer (Node merge logic).
  for mjs_file in "${modules_root}/src/install/"*.mjs; do
    [[ -f "${mjs_file}" ]] || continue
    mjs_files+=("${mjs_file}")
  done
  if ((${#mjs_files[@]} > 0)); then
    cp -- "${mjs_files[@]}" "${dest}/src/install/"
  fi
}

copy_current_release_files() {
  local dest=$1

  mkdir -p -- "${dest}/src/install" "${dest}/src/skills"
  cp -- "${source_dir}/install.sh" "${dest}/install.sh"
  copy_installer_modules "${dest}"
  payload_bytes_transfer copy "${source_dir}/src/skills" "${dest}/src/skills"
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
  local version

  version=$(cat "${source_dir}/VERSION")
  copy_current_release_files "${repo}"
  init_fixture_repo "${repo}"

  commit_all "${repo}" "release ${version} exact candidate"
  tag_release "${repo}" "${version}" '2026-09-06T00:00:00'
}

build_latest_fixture() {
  local repo=$1

  init_fixture_repo "${repo}"

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

# Build a release source whose tagged 0.1.1 lacks part of the current payload
# and whose tagged 0.1.2 is the current payload, and check 0.1.1 out at
# OLDER_DIR so a test can install that older release with its own install.sh.
#   build_upgrade_releases FIXTURE OLDER_DIR OLDER_LABEL NEWER_LABEL \
#     [--withhold DECLARED_PREFIX]... [--remove SKILLS_PATH]...
# --withhold drops every managed_files entry starting with DECLARED_PREFIX from
# 0.1.1's install.sh; --remove deletes src/skills/SKILLS_PATH from 0.1.1.
build_upgrade_releases() {
  local fixture=$1 older_dir=$2 older_label=$3 newer_label=$4
  local prefix path
  local -a withheld=() removed=()
  shift 4
  while (($# > 0)); do
    case $1 in
      --withhold) withheld+=("$2") ;;
      --remove) removed+=("$2") ;;
      *)
        echo "build_upgrade_releases: unknown option $1" >&2
        return 1
        ;;
    esac
    shift 2
  done

  init_fixture_repo "${fixture}"
  write_candidate_payload "${fixture}" 0.1.1 "${older_label}"
  for prefix in "${withheld[@]}"; do
    if ! awk -v prefix="${prefix}" '
      /^managed_files=\(/ { in_payload = 1 }
      in_payload && /^\)/ { in_payload = 0 }
      in_payload && index($1, prefix) == 1 { withheld = 1; next }
      { print }
      END { exit !withheld }
    ' "${fixture}/install.sh" > "${fixture}/filtered"; then
      echo "build_upgrade_releases: nothing declared under ${prefix}" >&2
      return 1
    fi
    mv -- "${fixture}/filtered" "${fixture}/install.sh"
  done
  for path in "${removed[@]}"; do
    if [[ ! -e "${fixture}/src/skills/${path}" ]]; then
      echo "build_upgrade_releases: no source to remove at ${path}" >&2
      return 1
    fi
    rm -rf -- "${fixture}/src/skills/${path}"
  done
  commit_all "${fixture}" "release 0.1.1 ${older_label}"
  tag_release "${fixture}" 0.1.1 '2026-09-01T00:00:00'
  checkout_tagged_release "${fixture}" "${older_dir}" 0.1.1

  write_candidate_payload "${fixture}" 0.1.2 "${newer_label}"
  commit_all "${fixture}" "release 0.1.2 ${newer_label}"
  tag_release "${fixture}" 0.1.2 '2026-09-02T00:00:00'
}
