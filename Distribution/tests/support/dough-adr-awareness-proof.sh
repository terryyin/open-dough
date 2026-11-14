#!/usr/bin/env bash

# Shared fixtures and assertions for installed ADR-awareness proof beats.

# Build a release source whose one release is the working tree's payload at
# its VERSION.
build_current_tagged_release_fixture() {
  local version
  # shellcheck disable=SC2154 # Calling tests set source_dir.
  version=$(cat "${source_dir}/VERSION")
  node "${source_dir}/Distribution/tests/support/release-source.mjs" "$1" << JSON
{"revisions": [{"name": "release ${version} exact candidate", "release": {
  "version": "${version}", "taggedAt": "2026-09-06T00:00:00",
  "marker": "exact-candidate"}}]}
JSON
}

assert_tagged_adr_awareness_payload() {
  local candidate=$1
  local tag=$2
  local target=$3
  local installed_version=$4
  local expected_version=$5
  # shellcheck disable=SC2154 # Calling tests source the public-payload fixture.
  assert_tagged_payload_matches "${candidate}" "${tag}" \
    "${target}/.agents/skills"
  [[ ${installed_version} == "${expected_version}" ]]
}

assert_no_adr_install_or_fetch() {
  local command_log=$1
  local proof_beat=$2

  if grep -Eiq '(^|[ /])(install\.sh|open-dough-release\.sh)( |$)|git (fetch|ls-remote)' \
    "${command_log}"; then
    printf 'FAIL: %s invoked installation or source-fetch machinery.\n' \
      "${proof_beat}" >&2
    cat "${command_log}" >&2
    return 1
  fi
}

assert_no_adr_awareness_maintenance() {
  local command_log=$1
  local proof_beat=$2

  assert_no_adr_install_or_fetch "${command_log}" "${proof_beat}"
  if grep -Eiq 'dough-update|adr-adoption|migration' \
    "${command_log}"; then
    printf 'FAIL: %s invoked updater or migration-support machinery.\n' \
      "${proof_beat}" >&2
    cat "${command_log}" >&2
    return 1
  fi
}
