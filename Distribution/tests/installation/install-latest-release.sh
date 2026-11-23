#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
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
fixture="${temporary_dir}/fixture.git"
target="${temporary_dir}/target project"
# The shared "latest" release source in Distribution/tests/support/release-sources.mjs:
# 0.1.1 tagged 2026-06-01, 0.1.2 tagged 2026-09-01 and 0.1.10 tagged
# 2020-01-01, under an untagged head that adds BRANCH_HEAD.
node "${source_dir}/Distribution/tests/support/release-source.mjs" "${fixture}" latest
prepare_target "${target}"

resolved=$(bash "${helper}" resolve-url "${fixture}")
IFS=$'\t' read -r tag commit version << EOF
${resolved}
EOF
[[ "${tag}" == v0.1.10 ]]
[[ "${version}" == 0.1.10 ]]
expected_commit=$(git -C "${fixture}" rev-parse 'v0.1.10^{commit}')
[[ "${commit}" == "${expected_commit}" ]]

git -C "${fixture}" checkout --quiet main
printf '%s\n' '# Unreleased default-branch guidance' > "${fixture}/Distribution/src/skills/dough-update/SKILL.md"
commit_all "${fixture}" 'move default branch after resolve'

release_dir="${temporary_dir}/release"
checkout_tagged_release "${fixture}" "${release_dir}" 0.1.10

# Cursor represents the shared Codex and Cursor entry root.
for layout in cursor:.agents claude:.claude; do
  platform=${layout%:*}
  root=${layout#*:}
  platform_target="${temporary_dir}/${platform} project"
  prepare_target "${platform_target}"
  bash "${release_dir}/install.sh" --target "${platform_target}" --source "${fixture}" \
    --platform "${platform}" > /dev/null
  dest="${platform_target}/${root}/skills/dough-update"
  assert_payload "${dest}" 0.1.10 payload-0.1.10
  recorded_source=$(cat "${dest}/SOURCE")
  expected_source=$(cd -- "${fixture}" && pwd -P)
  [[ "${recorded_source}" == "${expected_source}" ]]
  assert_sentinels "${platform_target}"
  [[ -e "${platform_target}/.agents/skills/dough-update" ]]
  [[ ! -e "${platform_target}/.cursor/skills/dough-update" ]]
  [[ -e "${platform_target}/.claude/skills/dough-update" ]]
done

relative_target="${temporary_dir}/relative source project"
prepare_target "${relative_target}"
bash "${release_dir}/install.sh" --target "${relative_target}" \
  --source fixture.git --platform cursor > /dev/null
relative_dest="${relative_target}/.agents/skills/dough-update"
assert_payload "${relative_dest}" 0.1.10 payload-0.1.10
recorded_source=$(cat "${relative_dest}/SOURCE")
expected_source=$(cd -- "${fixture}" && pwd -P)
[[ "${recorded_source}" == "${expected_source}" ]]
assert_sentinels "${relative_target}"

apply_target="${temporary_dir}/apply project"
prepare_target "${apply_target}"
output=$(bash "${helper}" apply --url "${fixture}" --target "${apply_target}" \
  --platform cursor)
[[ "${output}" == *"Source: ${fixture}"* ]]
[[ "${output}" == *"Release: v0.1.10 (commit ${commit})"* ]]
[[ "${output}" == *"Outcome: installed 0.1.10"* ]]
assert_payload "${apply_target}/.agents/skills/dough-update" 0.1.10 payload-0.1.10
recorded_source=$(cat "${apply_target}/.agents/skills/dough-update/SOURCE")
expected_source=$(cd -- "${fixture}" && pwd -P)
[[ "${recorded_source}" == "${expected_source}" ]]
assert_sentinels "${apply_target}"

missing_url="${temporary_dir}/missing.git"
if output=$(bash "${helper}" apply --url "${missing_url}" --target "${target}" \
  --platform cursor 2>&1); then
  echo "FAIL: fetch failure must stop before target writes." >&2
  exit 1
fi
[[ "${output}" == *'Failed to fetch tags'* || "${output}" == *'Failed to fetch'* ]]
[[ ! -e "${target}/.agents/skills/dough-update" ]]
assert_sentinels "${target}"

# Branch content with two tags that name no release, and no release.
branch_only="${temporary_dir}/branch-only.git"
node "${source_dir}/Distribution/tests/support/release-source.mjs" "${branch_only}" << 'JSON'
{"revisions": [{"name": "branch content",
  "files": {"VERSION": "0.1.0\n"}, "tags": ["not-a-release", "v1.2.3-rc.1"]}]}
JSON
if output=$(bash "${helper}" apply --url "${branch_only}" --target "${target}" \
  --platform cursor 2>&1); then
  echo "FAIL: a source without numeric releases must be refused." >&2
  exit 1
fi
[[ "${output}" == *'No numeric release tags'* ]]
[[ ! -e "${target}/.agents/skills/dough-update" ]]

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
if output=$(bash "${helper}" apply --url "${invalid_highest}" --target "${target}" \
  --platform cursor 2>&1); then
  echo "FAIL: an invalid highest release must not fall back." >&2
  exit 1
fi
[[ "${output}" == *'invalid'* ]]
[[ "${output}" != *'installed 0.1.2'* ]]
[[ ! -e "${target}/.agents/skills/dough-update" ]]
assert_sentinels "${target}"
