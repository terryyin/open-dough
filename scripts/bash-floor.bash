#!/usr/bin/env bash
# The Bash floor of the shell checks and of the scripts that list them.
# Sourced by scripts/test-environment.bash and by scripts/test-jobs.sh, which
# also runs under a contributor's PATH bash for the preview
# (scripts/test-shares.mjs), so this file keeps to Bash 3.2 syntax.

# require_bash_floor REMEDY stops with a FAIL naming the bash on PATH and
# REMEDY ("rerun the tests") when that bash is older than 5; sets test_bash.
# Checks run in child shells, so it checks the bash they will actually use.
# Bash 5 is the floor: the runner reads EPOCHREALTIME and test-jobs.sh uses
# associative arrays and `mapfile -d`.
require_bash_floor() {
  local version
  test_bash=$(command -v bash)
  # Expand BASH_VERSION in the child shell, not this one.
  # shellcheck disable=SC2016
  version=$("${test_bash}" -c 'printf "%s" "${BASH_VERSION}"')
  if [[ ${version%%.*} -lt 5 ]]; then
    printf 'FAIL: shell tests require Bash 5 or newer; resolved %s (version %s).\n' \
      "${test_bash}" "${version}" >&2
    printf 'Install Bash 5 or newer and put its bin directory first on PATH, then %s.\n' "$1" >&2
    exit 1
  fi
}
