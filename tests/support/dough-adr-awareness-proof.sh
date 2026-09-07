#!/usr/bin/env bash

# Shared assertions for installed ADR-awareness proof beats.
assert_tagged_adr_awareness_payload() {
  local candidate=$1
  local tag=$2
  local target=$3
  local installed_version=$4
  local expected_version=$5
  local managed_file

  # shellcheck disable=SC2154 # Calling tests source the public-payload fixture.
  for managed_file in "${managed_files[@]}"; do
    # shellcheck disable=SC2312 # The caller's pipefail preserves git-show failures.
    git -C "${candidate}" show "${tag}:src/skills/${managed_file}" \
      | cmp - "${target}/.agents/skills/${managed_file}"
  done
  [[ ! -e "${target}/.agents/skills/dough-adr-awareness/RECOGNITION.md" ]]
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
  if grep -Eiq 'dough-update|RECOGNITION\.md|adr-adoption|migration' \
    "${command_log}"; then
    printf 'FAIL: %s invoked updater or migration-support machinery.\n' \
      "${proof_beat}" >&2
    cat "${command_log}" >&2
    return 1
  fi
}
