#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/public-payload-fixture.bash
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/release-fixture.bash
source "${source_dir}/tests/helpers/release-fixture.bash"

checker="${source_dir}/scripts/check-self-installation.sh"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

clone_matching() {
  local dest=$1

  cp -a -- "${matching_template}" "${dest}"
}

assert_checker_pass() {
  local repo=$1
  local label=$2
  local before after output

  before=$(snapshot_path_state "${repo}")
  if ! output=$(bash "${checker}" "${repo}" 2>&1); then
    echo "FAIL: ${label}: self-installation check must pass." >&2
    printf '%s\n' "${output}" >&2
    exit 1
  fi
  after=$(snapshot_path_state "${repo}")
  if [[ "${after}" != "${before}" ]]; then
    echo "FAIL: ${label}: checker wrote to the target." >&2
    exit 1
  fi
}

assert_checker_fail() {
  local repo=$1
  local label=$2
  local needle=$3
  local before after output

  before=$(snapshot_path_state "${repo}")
  if output=$(bash "${checker}" "${repo}" 2>&1); then
    echo "FAIL: ${label}: self-installation check must fail." >&2
    printf '%s\n' "${output}" >&2
    exit 1
  fi
  if [[ "${output}" != *"${needle}"* ]]; then
    echo "FAIL: ${label}: expected failure to mention: ${needle}" >&2
    printf '%s\n' "${output}" >&2
    exit 1
  fi
  after=$(snapshot_path_state "${repo}")
  if [[ "${after}" != "${before}" ]]; then
    echo "FAIL: ${label}: checker wrote to the target." >&2
    exit 1
  fi
}

matching_template="${temporary_dir}/matching"
build_latest_fixture "${matching_template}"
tagged_checkout="${temporary_dir}/release-0.1.10"
checkout_tagged_release "${matching_template}" "${tagged_checkout}" 0.1.10
git -C "${matching_template}" -c advice.detachedHead=false checkout --quiet \
  'v0.1.10'
bash "${tagged_checkout}/install.sh" --target "${matching_template}" \
  --source "${matching_template}" --platform cursor --force > /dev/null

success="${temporary_dir}/success"
clone_matching "${success}"
assert_checker_pass "${success}" 'current-release success'

drift="${temporary_dir}/drift"
clone_matching "${drift}"
printf '%s\n' 'local managed edit' >> "${drift}/.agents/skills/dough-update/SKILL.md"
assert_checker_fail "${drift}" 'one-root drift' \
  "Managed payload mismatch: ${drift}/.agents/skills dough-update/SKILL.md"

disagreement="${temporary_dir}/disagreement"
clone_matching "${disagreement}"
printf '%s\n' '0.1.1' > "${disagreement}/.claude/skills/dough-update/VERSION"
assert_checker_fail "${disagreement}" 'both-root record disagreement' \
  "Self-installation record disagreement: ${disagreement}/.agents/skills/dough-update/VERSION 0.1.10 ${disagreement}/.claude/skills/dough-update/VERSION 0.1.1"

source_only="${temporary_dir}/source-only"
clone_matching "${source_only}"
printf '%s\n' '<!-- source-only development -->' >> \
  "${source_only}/src/skills/dough-update/SKILL.md"
assert_checker_pass "${source_only}" 'source-only development'

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

missing_tag="${temporary_dir}/missing-tag"
clone_matching "${missing_tag}"
printf '%s\n' '9.9.9' > "${missing_tag}/.agents/skills/dough-update/VERSION"
printf '%s\n' '9.9.9' > "${missing_tag}/.claude/skills/dough-update/VERSION"
assert_checker_fail "${missing_tag}" 'missing local tag' \
  "No numeric release tag v9.9.9 in ${missing_tag}"

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

collision="${temporary_dir}/collision.git"
mkdir -p -- "${collision}"
git -C "${collision}" init --quiet -b main
git_identity "${collision}"
write_candidate_payload "${collision}" 0.1.1 payload-0.1.1
rm -rf -- "${collision}/src/skills/dough-slice-planning"
commit_all "${collision}" 'release 0.1.1 without slice-planning'
tag_release "${collision}" 0.1.1 '2026-06-01T00:00:00'
collision_source=$(cd -- "${collision}" && pwd)
for root in "${collision}/.agents/skills" "${collision}/.claude/skills"; do
  mkdir -p -- "${root}"
  cp -R -- "${collision}/src/skills/." "${root}/"
  printf '%s\n' '0.1.1' > "${root}/dough-update/VERSION"
  printf '%s\n' "${collision_source}" > "${root}/dough-update/SOURCE"
done
mkdir -p -- "${collision}/.agents/skills/dough-slice-planning"
printf '%s\n' 'Keep this unrelated local slice-planning skill.' > \
  "${collision}/.agents/skills/dough-slice-planning/SKILL.md"
assert_checker_fail "${collision}" 'candidate-path collision' \
  "Managed payload mismatch: ${collision}/.agents/skills dough-slice-planning/SKILL.md"

echo 'PASS: self-installation check accepts matching local tags, ignores source-only development, and names drifted, disagreeing, malformed, missing-tag, SOURCE-conflicting, and colliding native paths without writes.'
