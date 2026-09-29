#!/usr/bin/env bash
# Reassesses retained publication observations with today's assessor
# (git_publication_assess), as corpus replay (native-stream-publication-replay.mjs)
# needs.
#
#   git-publication-native-reassess.sh <observations> <response> [...]
#
# Takes pairs of an observations file and a response file (empty when none) and
# prints one line per pair: the assessment status, its reason, and the
# observation fields the assessor read, comma-separated, each separated by a
# tab. The caller decides from the fields read whether the observations carry
# today's schema.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
# shellcheck source=tests/support/git-publication-native-run.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/git-publication-native-run.sh"

reads=$(mktemp)
trap 'rm -f -- "${reads}"' EXIT

# Assessors read fields in command substitutions, so each read is recorded in
# a file rather than a variable.
eval "git_publication_reassess_$(declare -f git_publication_assess_field)"
git_publication_assess_field() {
  printf '%s\n' "$2" >> "${reads}"
  git_publication_reassess_git_publication_assess_field "$@"
}

while (($# >= 2)); do
  : > "${reads}"
  git_publication_assess "$1" "$2"
  fields=$(awk '!seen[$0]++' "${reads}" | paste -sd, -)
  # Set by git_publication_assess, from the sourced assessors.
  # shellcheck disable=SC2154
  printf '%s\t%s\t%s\n' "${git_publication_assess_status}" \
    "${git_publication_assess_reason}" "${fields}"
  shift 2
done
