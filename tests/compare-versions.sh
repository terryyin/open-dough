#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/public-payload-fixture.bash
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/release-fixture.bash
source "${source_dir}/tests/helpers/release-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
cd -- "${temporary_dir}"

helper="${source_dir}/src/install/open-dough-release.sh"

assert_compare() {
  local first=$1
  local second=$2
  local expected=$3
  local output

  output=$(bash "${helper}" compare "${first}" "${second}" 2> "${temporary_dir}/compare.err")
  [[ ! -s "${temporary_dir}/compare.err" ]]
  [[ "${output}" == "${expected}" ]]
}

assert_compare 0.08.0 0.9.0 older
assert_compare 0.9.0 0.08.0 newer
assert_compare 0.08.0 0.08.0 equal
assert_compare 0.1.10 0.1.2 newer
assert_compare 0.1.2 0.1.10 older
assert_compare 1.0.0 1.0.18446744073709551616 older
assert_compare 1.0.18446744073709551616 1.0.0 newer
assert_compare 18446744073709551616.0.0 1.0.0 newer

leading_zero="${temporary_dir}/leading-zero.git"
mkdir -p -- "${leading_zero}"
git -C "${leading_zero}" init --quiet -b main
git_identity "${leading_zero}"
write_candidate_payload "${leading_zero}" 0.08.0 payload-0.08.0
commit_all "${leading_zero}" 'release 0.08.0'
tag_release "${leading_zero}" 0.08.0 '2026-01-01T00:00:00'
write_candidate_payload "${leading_zero}" 0.9.0 payload-0.9.0
commit_all "${leading_zero}" 'release 0.9.0'
tag_release "${leading_zero}" 0.9.0 '2026-02-01T00:00:00'

resolved=$(bash "${helper}" resolve-url "${leading_zero}" 2> "${temporary_dir}/resolve.err")
[[ ! -s "${temporary_dir}/resolve.err" ]]
IFS=$'\t' read -r tag _ version << EOF
${resolved}
EOF
[[ "${tag}" == v0.9.0 ]]
[[ "${version}" == 0.9.0 ]]

echo "PASS: numeric version compare orders leading-zero and oversized components without shell-arithmetic diagnostics."
