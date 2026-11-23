#!/usr/bin/env bash
# The self-installation check names disagreeing, missing, malformed,
# trailing-record, and missing-tag VERSION records without writes.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/self-installation-fixture.bash
source "${source_dir}/Distribution/tests/helpers/self-installation-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
build_matching_installation "${temporary_dir}/matching"

disagreement="${temporary_dir}/disagreement"
clone_matching "${disagreement}"
printf '%s\n' '0.1.1' > "${disagreement}/.claude/skills/dough-update/VERSION"
assert_checker_fail "${disagreement}" 'both-root record disagreement' \
  "Self-installation record disagreement: ${disagreement}/.agents/skills/dough-update/VERSION 0.1.10 ${disagreement}/.claude/skills/dough-update/VERSION 0.1.1"

missing_version="${temporary_dir}/missing-version"
clone_matching "${missing_version}"
rm -f -- "${missing_version}/.agents/skills/dough-update/VERSION"
assert_checker_fail "${missing_version}" 'missing VERSION' \
  "Missing installed version record: ${missing_version}/.agents/skills/dough-update/VERSION"

malformed_version="${temporary_dir}/malformed-version"
clone_matching "${malformed_version}"
printf '%s\n' 'v0.1.10' > \
  "${malformed_version}/.agents/skills/dough-update/VERSION"
assert_checker_fail "${malformed_version}" 'malformed VERSION' \
  "Malformed installed record: ${malformed_version}/.agents/skills/dough-update/VERSION"

trailing_version="${temporary_dir}/trailing-version"
clone_matching "${trailing_version}"
printf '%s\n\n%s\n' '0.1.10' 'unexpected trailing record data' > \
  "${trailing_version}/.agents/skills/dough-update/VERSION"
assert_checker_fail "${trailing_version}" 'VERSION trailing data with newline' \
  "Malformed installed record: ${trailing_version}/.agents/skills/dough-update/VERSION"

trailing_version_no_nl="${temporary_dir}/trailing-version-no-nl"
clone_matching "${trailing_version_no_nl}"
printf '%s\n\n%s' '0.1.10' 'unexpected trailing record data' > \
  "${trailing_version_no_nl}/.claude/skills/dough-update/VERSION"
assert_checker_fail "${trailing_version_no_nl}" \
  'VERSION trailing data without final newline in other root' \
  "Malformed installed record: ${trailing_version_no_nl}/.claude/skills/dough-update/VERSION"

missing_tag="${temporary_dir}/missing-tag"
clone_matching "${missing_tag}"
printf '%s\n' '9.9.9' > "${missing_tag}/.agents/skills/dough-update/VERSION"
printf '%s\n' '9.9.9' > "${missing_tag}/.claude/skills/dough-update/VERSION"
assert_checker_fail "${missing_tag}" 'missing local tag' \
  "No numeric release tag v9.9.9 in ${missing_tag}"
