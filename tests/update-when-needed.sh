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
target=$(cd -- "${target}" && pwd -P)

trace_file="${temporary_dir}/trace.log"
rm -f -- "${trace_file}"
export OPEN_DOUGH_TRACE="${trace_file}"

bash "${helper}" apply --url "${fixture}" --target "${target}" --platform cursor
cursor_dest="${target}/.cursor/skills/dough-update"
assert_payload "${cursor_dest}" 0.1.10 payload-0.1.10
assert_sentinels "${target}"
grep -qx "install ${cursor_dest}" "${trace_file}"
grep -qx "apply-install ${cursor_dest}" "${trace_file}"

printf '%s\n' 'harmless local skill edit' >> "${cursor_dest}/SKILL.md"
cursor_skill_root=$(dirname -- "${cursor_dest}")
obsolete_recognition="${cursor_skill_root}/dough-adr-awareness/RECOGNITION.md"
printf '%s\n' 'obsolete recognition' > "${obsolete_recognition}"
git -C "${fixture}" checkout --quiet main
printf '%s\n' 'untagged-source-change' >> "${fixture}/BRANCH_HEAD"
commit_all "${fixture}" 'untagged source change after install'

older_dest="${target}/.agents/skills/dough-update"
older_checkout="${temporary_dir}/release-0.1.1"
checkout_tagged_release "${fixture}" "${older_checkout}" 0.1.1
bash "${older_checkout}/install.sh" --target "${target}" --source "${fixture}" \
  --platform codex
assert_payload "${older_dest}" 0.1.1 payload-0.1.1
expected_source=$(cd -- "${fixture}" && pwd -P)
recorded_source=$(cat "${older_dest}/SOURCE")
[[ "${recorded_source}" == "${expected_source}" ]]
printf '%s\n' 'fixed earlier recognition record' > \
  "${target}/.agents/skills/dough-adr-awareness/RECOGNITION.md"
decoy="${temporary_dir}/client-origin.git"
mkdir -p -- "${decoy}"
git -C "${decoy}" init --quiet -b main
git_identity "${decoy}"
write_candidate_payload "${decoy}" 9.9.9 payload-client-remote
commit_all "${decoy}" 'client remote decoy'
tag_release "${decoy}" 9.9.9 '2026-09-08T00:00:00'
git -C "${target}" init --quiet
git -C "${target}" remote add origin "${decoy}"
before_cursor=$(snapshot_path_state "${target}/.cursor/skills")
before_claude=$(snapshot_path_state "${target}/.claude/skills")
: > "${trace_file}"
upgrade_tmp="${temporary_dir}/apply-tmp"
mkdir -p -- "${upgrade_tmp}"
output=$(TMPDIR="${upgrade_tmp}" bash "${helper}" apply --target "${target}" \
  --platform codex)
assert_owned_tmp_empty "${upgrade_tmp}" 'ordinary upgrade'
[[ "${output}" == *"Source: ${expected_source}"* ]]
[[ "${output}" != *"${decoy}"* ]]
[[ "${output}" == *'updated from 0.1.1 to 0.1.10'* ]]
assert_payload "${older_dest}" 0.1.10 payload-0.1.10
recorded_source=$(cat "${older_dest}/SOURCE")
[[ "${recorded_source}" == "${expected_source}" ]]
[[ ! -e "${target}/.agents/skills/dough-adr-awareness/RECOGNITION.md" ]]
after_cursor=$(snapshot_path_state "${target}/.cursor/skills")
after_claude=$(snapshot_path_state "${target}/.claude/skills")
[[ "${after_cursor}" == "${before_cursor}" ]]
[[ "${after_claude}" == "${before_claude}" ]]
grep -Fq 'harmless local skill edit' "${cursor_dest}/SKILL.md"
install_count=$(grep -c '^install ' "${trace_file}")
[[ "${install_count}" -eq 1 ]]
grep -qx "apply-upgrade ${older_dest}" "${trace_file}"
assert_sentinels "${target}"

unknown="${target}/.claude/skills/dough-update"
mkdir -p -- "${unknown}"
cp -- "${cursor_dest}/SKILL.md" "${unknown}/SKILL.md"
[[ ! -e "${unknown}/VERSION" ]]
printf '%s\n' '0.0.9' > "${cursor_dest}/VERSION"
: > "${trace_file}"
output=$(bash "${helper}" apply --url "${fixture}" --target "${target}" \
  --platform claude)
[[ "${output}" == *'Installed: unknown'* ]]
[[ "${output}" == *'previously unknown'* ]]
assert_payload "${unknown}" 0.1.10 payload-0.1.10
contents=$(cat "${cursor_dest}/VERSION")
[[ "${contents}" == 0.0.9 ]]
assert_payload "${older_dest}" 0.1.10 payload-0.1.10
assert_sentinels "${target}"

malformed="${temporary_dir}/malformed project"
prepare_target "${malformed}"
bash "${helper}" apply --url "${fixture}" --target "${malformed}" --platform cursor
malformed_dest="${malformed}/.cursor/skills/dough-update"
printf '%s\n' 'v0.1.10' > "${malformed_dest}/VERSION"
: > "${trace_file}"
if output=$(bash "${helper}" apply --url "${fixture}" --target "${malformed}" \
  --platform cursor 2>&1); then
  echo "FAIL: malformed record must be refused." >&2
  exit 1
fi
[[ "${output}" == *'malformed'* ]]
contents=$(cat "${malformed_dest}/VERSION")
[[ "${contents}" == 'v0.1.10' ]]
grep -qx "apply-malformed ${malformed_dest}" "${trace_file}"
if grep -q '^install ' "${trace_file}"; then
  echo "FAIL: malformed record must not invoke the installer." >&2
  exit 1
fi

if output=$(bash "${helper}" apply --url "${fixture}" --target "${target}" \
  --platform cursor --version 0.1.2 2>&1); then
  echo "FAIL: requested-version apply must be refused." >&2
  exit 1
fi
[[ "${output}" == *'latest numeric release only'* ]]
if output=$(bash "${helper}" apply --url "${fixture}" --target "${target}" \
  --platform cursor 0.1.2 2>&1); then
  echo "FAIL: positional requested version must be refused." >&2
  exit 1
fi
[[ "${output}" == *'latest numeric release only'* ]]
if output=$(bash "${source_dir}/install.sh" --target "${target}" \
  --source "${source_dir}" --platform cursor --version 0.1.2 2>&1); then
  echo "FAIL: requested-version install must be refused." >&2
  exit 1
fi
[[ "${output}" == *'latest numeric release only'* ]]

legacy="${temporary_dir}/legacy project"
prepare_target "${legacy}"
legacy_source="${temporary_dir}/legacy-v0.1.0"
mkdir -p -- "${legacy_source}/src/skills/dough-update"
if ! git -C "${source_dir}" rev-parse --verify --quiet 'v0.1.0^{commit}' \
  > /dev/null; then
  echo "FAIL: git tag v0.1.0 is required so this test can use the genuine legacy installer." >&2
  exit 1
fi
git -C "${source_dir}" show v0.1.0:install.sh > "${legacy_source}/install.sh"
git -C "${source_dir}" show v0.1.0:src/skills/dough-update/SKILL.md > \
  "${legacy_source}/src/skills/dough-update/SKILL.md"
bash "${legacy_source}/install.sh" --target "${legacy}" --platform cursor
legacy_dest="${legacy}/.cursor/skills/dough-update"
[[ -f "${legacy_dest}/SKILL.md" ]]
[[ ! -e "${legacy_dest}/VERSION" ]]
: > "${trace_file}"
output=$(bash "${helper}" apply --url "${fixture}" --target "${legacy}" \
  --platform cursor --force)
[[ "${output}" == *'explicit force'* ]]
assert_payload "${legacy_dest}" 0.1.10 payload-0.1.10
recorded_source=$(cat "${legacy_dest}/SOURCE")
[[ "${recorded_source}" == "${expected_source}" ]]
assert_sentinels "${legacy}"

echo "PASS: update compares before writes, retires recognition during an ordinary newer-release update from recorded SOURCE without a URL, refuses malformed and requested versions, and bootstraps a genuine v0.1.0 install with explicit force."
