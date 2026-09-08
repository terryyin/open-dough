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
fixture="${temporary_dir}/fixture.git"
target="${temporary_dir}/target project"
build_latest_fixture "${fixture}"
prepare_target "${target}"

resolved=$(bash "${helper}" resolve-url "${fixture}")
IFS=$'\t' read -r tag commit version << EOF
${resolved}
EOF
[[ "${tag}" == v0.1.10 ]]
[[ "${version}" == 0.1.10 ]]
[[ "${#commit}" -eq 40 ]]

git -C "${fixture}" checkout --quiet main
printf '%s\n' 'moved-after-resolve' >> "${fixture}/BRANCH_HEAD"
commit_all "${fixture}" 'move default branch after resolve'

release_dir="${temporary_dir}/release"
fetched=$(bash "${helper}" fetch-release "${fixture}" "${release_dir}")
IFS=$'\t' read -r fetched_tag fetched_commit fetched_version << EOF
${fetched}
EOF
[[ "${fetched_tag}" == "${tag}" ]]
[[ "${fetched_commit}" == "${commit}" ]]
[[ "${fetched_version}" == 0.1.10 ]]
head=$(git -C "${release_dir}" rev-parse HEAD)
[[ "${head}" == "${commit}" ]]
[[ ! -e "${release_dir}/BRANCH_HEAD" ]]
grep -Fq 'open-dough-payload payload-0.1.10' \
  "${release_dir}/src/skills/dough-update/SKILL.md"

for platform in codex cursor claude; do
  platform_target="${temporary_dir}/${platform} project"
  prepare_target "${platform_target}"
  clone_dir="${temporary_dir}/${platform} clone"
  git clone --quiet "${fixture}" "${clone_dir}"
  pin_output=$(bash "${clone_dir}/src/install/open-dough-release.sh" \
    pin-latest "${clone_dir}" "${fixture}")
  IFS=$'\t' read -r pin_tag pin_commit pin_version << EOF
${pin_output}
EOF
  [[ "${pin_tag}" == v0.1.10 ]]
  [[ "${pin_commit}" == "${commit}" ]]
  [[ "${pin_version}" == 0.1.10 ]]
  bash "${clone_dir}/install.sh" --target "${platform_target}" --source "${fixture}" \
    --platform "${platform}"
  dest=$(bash "${helper}" destination "${platform_target}" "${platform}")
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
bash "${temporary_dir}/cursor clone/install.sh" --target "${relative_target}" \
  --source fixture.git --platform cursor
relative_dest=$(bash "${helper}" destination "${relative_target}" cursor)
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
[[ "${output}" == *'Release: v0.1.10 (commit '* ]]
[[ "${output}" == *"Outcome: installed 0.1.10."* ]]
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

branch_only="${temporary_dir}/branch-only.git"
mkdir -p -- "${branch_only}"
git -C "${branch_only}" init --quiet -b main
git_identity "${branch_only}"
write_candidate_payload "${branch_only}" 0.1.0 payload-branch-only
commit_all "${branch_only}" 'branch content'
git -C "${branch_only}" tag not-a-release
git -C "${branch_only}" tag v1.2.3-rc.1
if output=$(bash "${helper}" apply --url "${branch_only}" --target "${target}" \
  --platform cursor 2>&1); then
  echo "FAIL: a source without numeric releases must be refused." >&2
  exit 1
fi
[[ "${output}" == *'No numeric release tags'* ]]
[[ ! -e "${target}/.agents/skills/dough-update" ]]

invalid_highest="${temporary_dir}/invalid-highest.git"
mkdir -p -- "${invalid_highest}"
git -C "${invalid_highest}" init --quiet -b main
git_identity "${invalid_highest}"
write_candidate_payload "${invalid_highest}" 0.1.2 payload-0.1.2
commit_all "${invalid_highest}" 'valid lower release'
tag_release "${invalid_highest}" 0.1.2 '2026-09-01T00:00:00'
write_candidate_payload "${invalid_highest}" 0.1.2 payload-mismatch
printf '%s\n' '0.1.9' > "${invalid_highest}/VERSION"
commit_all "${invalid_highest}" 'invalid highest'
tag_release "${invalid_highest}" 0.1.10 '2026-09-02T00:00:00'
if output=$(bash "${helper}" apply --url "${invalid_highest}" --target "${target}" \
  --platform cursor 2>&1); then
  echo "FAIL: an invalid highest release must not fall back." >&2
  exit 1
fi
[[ "${output}" == *'invalid'* ]]
[[ "${output}" != *'installed 0.1.2'* ]]
[[ ! -e "${target}/.agents/skills/dough-update" ]]
assert_sentinels "${target}"

echo "PASS: numeric latest from the supplied URL is pinned, fetched, and installed; fetch/tag/metadata failures leave the target untouched."
