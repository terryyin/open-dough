#!/usr/bin/env bash
# The environment every check runs in: the Bash floor and CI's Git state.
# Sourced by scripts/test.sh before any check starts; sets test_bash.

# Tests run in child shells, so check the bash they will actually use. Bash 5
# is the floor: this runner, normally that same PATH bash, reads EPOCHREALTIME.
test_bash=$(command -v bash)
# Expand BASH_VERSION in the child shell, not this runner.
# shellcheck disable=SC2016
test_bash_version=$("${test_bash}" -c 'printf "%s" "${BASH_VERSION}"')
if [[ ${test_bash_version%%.*} -lt 5 ]]; then
  printf 'FAIL: shell tests require Bash 5 or newer; resolved %s (version %s).\n' \
    "${test_bash}" "${test_bash_version}" >&2
  printf 'Install Bash 5 or newer and put its bin directory first on PATH, then rerun the tests.\n' >&2
  exit 1
fi

# Every check sees CI's Git state, whatever the caller's configuration: no
# global, XDG, system, or inherited `git -c` settings or identity variables;
# this list replaces any inherited GIT_CONFIG_COUNT set. Background maintenance
# is off so no detached repack outlives a fixture. No identity or default
# branch is set, as in CI, and useConfigOnly makes a missing identity fail here
# as it does there.
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
unset GIT_CONFIG_PARAMETERS GIT_AUTHOR_NAME GIT_AUTHOR_EMAIL \
  GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL
export GIT_CONFIG_COUNT=3 \
  GIT_CONFIG_KEY_0=maintenance.auto GIT_CONFIG_VALUE_0=false \
  GIT_CONFIG_KEY_1=gc.auto GIT_CONFIG_VALUE_1=0 \
  GIT_CONFIG_KEY_2=user.useConfigOnly GIT_CONFIG_VALUE_2=true
