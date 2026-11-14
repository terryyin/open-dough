#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/public-payload-fixture.bash
source "${source_dir}/Distribution/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/release-fixture.bash
source "${source_dir}/Distribution/tests/helpers/release-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
cd -- "${temporary_dir}"

helper="${source_dir}/Distribution/src/install/open-dough-release.sh"
apply_tmp="${temporary_dir}/apply-tmp"
mkdir -p -- "${apply_tmp}"
target="${temporary_dir}/target project"
prepare_target "${target}"

assert_apply_tmp_empty() {
  assert_owned_tmp_empty "${apply_tmp}" 'apply'
}

export TMPDIR="${apply_tmp}"

if output=$(bash "${helper}" apply --url "${temporary_dir}/missing.git" \
  --target "${target}" --platform cursor 2>&1); then
  echo "FAIL: missing source must not succeed." >&2
  exit 1
fi
[[ "${output}" == *'Failed to fetch tags'* || "${output}" == *'Failed to fetch'* ]]
[[ ! -e "${target}/.cursor/skills/dough-update" ]]
assert_sentinels "${target}"
assert_apply_tmp_empty

# The highest tag, v0.1.10, is on a payload whose VERSION says 0.1.9.
invalid_highest="${temporary_dir}/invalid-highest.git"
node "${source_dir}/Distribution/tests/support/release-source.mjs" "${invalid_highest}" << 'JSON'
{"revisions": [
  {"name": "valid lower release", "release": {
    "version": "0.1.2", "taggedAt": "2026-09-01T00:00:00",
    "marker": "payload-0.1.2"}},
  {"name": "invalid highest", "release": {
    "version": "0.1.10", "taggedAt": "2026-09-02T00:00:00",
    "marker": "payload-mismatch"}, "files": {"VERSION": "0.1.9\n"}}
]}
JSON

if output=$(bash "${helper}" apply --url "${invalid_highest}" \
  --target "${target}" --platform cursor 2>&1); then
  echo "FAIL: invalid highest release must not succeed." >&2
  exit 1
fi
[[ "${output}" == *'invalid'* ]]
[[ ! -e "${target}/.cursor/skills/dough-update" ]]
assert_sentinels "${target}"
assert_apply_tmp_empty
