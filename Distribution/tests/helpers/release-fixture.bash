#!/usr/bin/env bash
# Shared fixture builders for version-aware install/update tests.
# Sourced by tests; callers set source_dir and managed_files, and enable pipefail.

: "${source_dir:?source_dir must be set before sourcing this helper}"
: "${managed_files:?managed_files must be set before sourcing this helper}"
if ((${#managed_files[@]} == 0)); then
  echo 'managed_files must contain at least one client payload file' >&2
  return 1
fi

# shellcheck source=Distribution/tests/helpers/path-state-snapshot.bash
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/helpers/path-state-snapshot.bash"
# shellcheck source=Distribution/tests/helpers/payload-bytes.bash
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/helpers/payload-bytes.bash"
# shellcheck source=Distribution/tests/helpers/install-target-fixture.bash
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/helpers/install-target-fixture.bash"

# Commit identity and settings every fixture repository needs.
configure_fixture_git() {
  git -C "$1" config user.email 'fixture@example.com'
  git -C "$1" config user.name 'Open Dough Fixture'
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

  mkdir -p -- "${dest}/Distribution/src/install" "${dest}/src/install"
  cp -- "${modules_root}/Distribution/src/install/"*.sh "${dest}/Distribution/src/install/"
  cp -- "${modules_root}/src/install/open-dough-execution-payload.sh" "${dest}/src/install/"
  # Hook registration helpers travel with the installer (Node merge logic).
  for mjs_file in "${modules_root}/Distribution/src/install/"*.mjs; do
    [[ -f "${mjs_file}" ]] || continue
    mjs_files+=("${mjs_file}")
  done
  if ((${#mjs_files[@]} > 0)); then
    cp -- "${mjs_files[@]}" "${dest}/Distribution/src/install/"
  fi
}

commit_all() {
  local repo=$1
  local message=$2

  git -C "${repo}" add -A
  git -C "${repo}" commit --quiet -m "${message}"
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
