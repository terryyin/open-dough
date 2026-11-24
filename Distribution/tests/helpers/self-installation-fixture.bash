#!/usr/bin/env bash
# Shared fixture for scripts/check-self-installation.sh checks: a release
# source installed from its own v0.1.10 tag, per-case copies of it, and checker
# assertions that also prove the checker leaves the target unwritten.
# Sourced by tests; callers set source_dir and enable pipefail.

: "${source_dir:?source_dir must be set before sourcing this helper}"
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/public-payload-fixture.bash
source "${source_dir}/Distribution/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/release-fixture.bash
source "${source_dir}/Distribution/tests/helpers/release-fixture.bash"

checker="${source_dir}/scripts/check-self-installation.sh"
matching_template=

# Builds at DEST the shared "latest" release source (see
# Distribution/tests/support/release-sources.mjs) checked out at v0.1.10 with
# that tag's payload installed into its own native roots.
build_matching_installation() {
  local dest=$1
  local tagged_checkout="${dest}.release-0.1.10"

  node "${source_dir}/Distribution/tests/support/release-source.mjs" \
    "${dest}" latest
  checkout_tagged_release "${dest}" "${tagged_checkout}" 0.1.10
  git -C "${dest}" -c advice.detachedHead=false checkout --quiet 'v0.1.10'
  bash "${tagged_checkout}/install.sh" --target "${dest}" \
    --source "${dest}" --platform cursor --force > /dev/null
  matching_template=${dest}
}

clone_matching() {
  local dest=$1

  cp -a -- "${matching_template}" "${dest}"
}

assert_checker_pass() {
  local repo=$1
  local label=$2
  local before after output

  before=$(snapshot_path_state "${repo}")
  if ! output=$(bash "${checker}" "${repo}" 2>&1); then
    echo "FAIL: ${label}: self-installation check must pass." >&2
    printf '%s\n' "${output}" >&2
    exit 1
  fi
  after=$(snapshot_path_state "${repo}")
  if [[ "${after}" != "${before}" ]]; then
    echo "FAIL: ${label}: checker wrote to the target." >&2
    exit 1
  fi
}

assert_checker_fail() {
  local repo=$1
  local label=$2
  local needle=$3
  local before after output

  before=$(snapshot_path_state "${repo}")
  if output=$(bash "${checker}" "${repo}" 2>&1); then
    echo "FAIL: ${label}: self-installation check must fail." >&2
    printf '%s\n' "${output}" >&2
    exit 1
  fi
  if [[ "${output}" != *"${needle}"* ]]; then
    echo "FAIL: ${label}: expected failure to mention: ${needle}" >&2
    printf '%s\n' "${output}" >&2
    exit 1
  fi
  after=$(snapshot_path_state "${repo}")
  if [[ "${after}" != "${before}" ]]; then
    echo "FAIL: ${label}: checker wrote to the target." >&2
    exit 1
  fi
}
