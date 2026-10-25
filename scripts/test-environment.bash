#!/usr/bin/env bash
# The environment every check runs in: the Bash floor, CI's Git state, and
# CI's uncolored output.
# Sourced by scripts/test.sh before any check starts; sets test_bash.

# shellcheck disable=SC1091
# shellcheck source=scripts/bash-floor.bash
source "$(dirname -- "${BASH_SOURCE[0]}")/bash-floor.bash"
require_bash_floor 'rerun the tests'

# Every check sees CI's Git state, whatever the caller's configuration: no
# global, XDG, system, or inherited `git -c` settings or identity variables;
# this list replaces any inherited GIT_CONFIG_COUNT set. Background maintenance
# is off so no detached repack outlives a fixture; a push over the local
# transport drops this list, so a pushed-to bare remote needs its own setting
# (see tests/README.md). No identity or default branch is set, as in CI, and
# useConfigOnly makes a missing identity fail here as it does there.
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
unset GIT_CONFIG_PARAMETERS GIT_AUTHOR_NAME GIT_AUTHOR_EMAIL \
  GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL
export GIT_CONFIG_COUNT=3 \
  GIT_CONFIG_KEY_0=maintenance.auto GIT_CONFIG_VALUE_0=false \
  GIT_CONFIG_KEY_1=gc.auto GIT_CONFIG_VALUE_1=0 \
  GIT_CONFIG_KEY_2=user.useConfigOnly GIT_CONFIG_VALUE_2=true

# Output is uncolored, as in CI, whatever color the caller's shell forces, so
# a check comparing tool output sees the same bytes locally and in CI.
unset FORCE_COLOR NO_COLOR
