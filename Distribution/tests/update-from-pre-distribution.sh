#!/usr/bin/env bash
# Verify published updaters that still read the pre-Distribution source paths.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/helpers/release-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
older_tag=v0.3.98
candidate_version=1000.0.0
release_source="${temporary_dir}/release source"
old_release="${temporary_dir}/older release"
target="${temporary_dir}/target"

init_fixture_repo "${release_source}"
git -C "${release_source}" fetch --quiet --depth 1 "${source_dir}" \
  "refs/tags/${older_tag}:refs/tags/${older_tag}"
git -C "${release_source}" checkout --quiet --detach "${older_tag}"
git -C "${release_source}" worktree add --quiet --detach "${old_release}" "${older_tag}"
prepare_target "${target}"
bash "${old_release}/install.sh" --source "${release_source}" --target "${target}" > /dev/null

git -C "${release_source}" rm --quiet -r -- src
mkdir -p -- "${release_source}/Distribution/src" "${release_source}/src"
cp -- "${source_dir}/install.sh" "${release_source}/"
cp -R -- "${source_dir}/Distribution/src/install" "${release_source}/Distribution/src/"
cp -R -P -- "${source_dir}/src/install" "${source_dir}/src/skills" "${release_source}/src/"
mkdir -p -- "${release_source}/Distribution/src/skills"
payload_bytes_transfer copy "${source_dir}/Distribution/src/skills" "${release_source}/Distribution/src/skills"
printf '%s\n' "${candidate_version}" > "${release_source}/VERSION"
printf '## %s - 2026-11-14\n\nCandidate.\n' "${candidate_version}" > "${release_source}/CHANGELOG.md"
commit_all "${release_source}" 'Candidate with relocated guidance'
git -C "${release_source}" tag -a "v${candidate_version}" -m 'Candidate with relocated guidance'

old_helper="${old_release}/src/install/open-dough-release.sh"
output=$(bash "${old_helper}" apply --target "${target}")
[[ "${output}" == *"Open Dough guidance in"*"version ${candidate_version}"* ]]
[[ "${output}" != *'removed files'* ]]
for root in .agents .claude; do
  destination="${target}/${root}/skills/dough-update"
  installed=$(cat "${destination}/VERSION")
  [[ "${installed}" == "${candidate_version}" ]]
  bash "${release_source}/src/install/open-dough-release.sh" compare-payload "${destination}" "${release_source}"
done

output=$(bash "${old_helper}" apply --target "${target}")
[[ "${output}" == *'both physical installations are current; no installer invocation or installed-file writes.'* ]]
assert_sentinels "${target}"
