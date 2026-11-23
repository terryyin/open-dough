#!/usr/bin/env bash
# shellcheck disable=SC2154 # Sourced fixture's build_matching_installation sets matching_template.
# The self-installation check names missing, trailing-record, and
# SOURCE-conflicting SOURCE records without writes.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/self-installation-fixture.bash
source "${source_dir}/Distribution/tests/helpers/self-installation-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
build_matching_installation "${temporary_dir}/matching"

recorded_source=$(cat "${matching_template}/.agents/skills/dough-update/SOURCE")
trailing_source="${temporary_dir}/trailing-source"
clone_matching "${trailing_source}"
printf '%s\n\n%s\n' "${recorded_source}" 'unexpected trailing source data' > \
  "${trailing_source}/.agents/skills/dough-update/SOURCE"
assert_checker_fail "${trailing_source}" 'SOURCE trailing data with newline' \
  "Malformed installed source record: ${trailing_source}/.agents/skills/dough-update/SOURCE"

trailing_source_no_nl="${temporary_dir}/trailing-source-no-nl"
clone_matching "${trailing_source_no_nl}"
printf '%s\n\n%s' "${recorded_source}" 'unexpected trailing source data' > \
  "${trailing_source_no_nl}/.claude/skills/dough-update/SOURCE"
assert_checker_fail "${trailing_source_no_nl}" \
  'SOURCE trailing data without final newline in other root' \
  "Malformed installed source record: ${trailing_source_no_nl}/.claude/skills/dough-update/SOURCE"

missing_source="${temporary_dir}/missing-source"
clone_matching "${missing_source}"
rm -f -- "${missing_source}/.agents/skills/dough-update/SOURCE"
assert_checker_fail "${missing_source}" 'missing SOURCE' \
  "Missing installed source record: ${missing_source}/.agents/skills/dough-update/SOURCE"

source_conflict="${temporary_dir}/source-conflict"
clone_matching "${source_conflict}"
printf '%s\n' 'https://example.com/other.git' > \
  "${source_conflict}/.claude/skills/dough-update/SOURCE"
assert_checker_fail "${source_conflict}" 'SOURCE conflict' \
  "SOURCE conflicts with the shared installation: ${source_conflict}/.agents/skills/dough-update/SOURCE ${source_conflict}/.claude/skills/dough-update/SOURCE"
