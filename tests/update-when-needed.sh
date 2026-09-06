#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
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
git -C "${fixture}" checkout --quiet main
printf '%s\n' 'untagged-source-change' >> "${fixture}/BRANCH_HEAD"
commit_all "${fixture}" 'untagged source change after install'

skill_mtime=$(file_mtime "${cursor_dest}/SKILL.md")
record_mtime=$(file_mtime "${cursor_dest}/VERSION")
chmod a-w "${cursor_dest}/SKILL.md" "${cursor_dest}/VERSION"
: > "${trace_file}"
output=$(bash "${helper}" apply --url "${fixture}" --target "${target}" \
  --platform cursor)
chmod u+w "${cursor_dest}/SKILL.md" "${cursor_dest}/VERSION"
[[ "${output}" == *'already current'* ]]
[[ "${output}" == *'no installer invocation or installed-file writes'* ]]
[[ "${output}" == *'v0.1.10'* ]]
grep -qx "apply-skip-equal ${cursor_dest}" "${trace_file}"
if grep -q '^install ' "${trace_file}"; then
  echo "FAIL: equal-version update must not invoke the installer." >&2
  exit 1
fi
grep -Fq 'harmless local skill edit' "${cursor_dest}/SKILL.md"
skill_mtime_after=$(file_mtime "${cursor_dest}/SKILL.md")
record_mtime_after=$(file_mtime "${cursor_dest}/VERSION")
[[ "${skill_mtime_after}" == "${skill_mtime}" ]]
[[ "${record_mtime_after}" == "${record_mtime}" ]]
assert_sentinels "${target}"

older="${target}/.agents/skills/dough-update"
mkdir -p -- "${older}"
write_candidate_payload "${temporary_dir}/older-payload" 0.1.0 payload-0.1.0
cp -- "${temporary_dir}/older-payload/src/skills/dough-update/SKILL.md" \
  "${older}/SKILL.md"
printf '%s\n' '0.1.0' > "${older}/VERSION"
: > "${trace_file}"
output=$(bash "${helper}" apply --url "${fixture}" --target "${target}" \
  --platform codex)
[[ "${output}" == *'updated from 0.1.0 to 0.1.10'* ]]
assert_payload "${older}" 0.1.10 payload-0.1.10
grep -Fq 'harmless local skill edit' "${cursor_dest}/SKILL.md"
install_count=$(grep -c '^install ' "${trace_file}")
[[ "${install_count}" -eq 1 ]]
grep -qx "apply-upgrade ${older}" "${trace_file}"
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
assert_payload "${older}" 0.1.10 payload-0.1.10
assert_sentinels "${target}"

newer="${temporary_dir}/newer project"
prepare_target "${newer}"
bash "${helper}" apply --url "${fixture}" --target "${newer}" --platform cursor
newer_dest="${newer}/.cursor/skills/dough-update"
printf '%s\n' '0.2.0' > "${newer_dest}/VERSION"
skill_mtime=$(file_mtime "${newer_dest}/SKILL.md")
record_mtime=$(file_mtime "${newer_dest}/VERSION")
chmod a-w "${newer_dest}/SKILL.md" "${newer_dest}/VERSION"
: > "${trace_file}"
output=$(bash "${helper}" apply --url "${fixture}" --target "${newer}" \
  --platform cursor)
chmod u+w "${newer_dest}/SKILL.md" "${newer_dest}/VERSION"
[[ "${output}" == *'installed 0.2.0 is newer than source 0.1.10'* ]]
[[ "${output}" == *'no downgrade'* ]]
contents=$(cat "${newer_dest}/VERSION")
[[ "${contents}" == 0.2.0 ]]
grep -qx "apply-newer ${newer_dest}" "${trace_file}"
if grep -q '^install ' "${trace_file}"; then
  echo "FAIL: newer installed version must not invoke the installer." >&2
  exit 1
fi
skill_mtime_after=$(file_mtime "${newer_dest}/SKILL.md")
record_mtime_after=$(file_mtime "${newer_dest}/VERSION")
[[ "${skill_mtime_after}" == "${skill_mtime}" ]]
[[ "${record_mtime_after}" == "${record_mtime}" ]]

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
  --platform cursor --version 0.1.2 2>&1); then
  echo "FAIL: requested-version install must be refused." >&2
  exit 1
fi
[[ "${output}" == *'latest numeric release only'* ]]

copy_fail="${temporary_dir}/copy-fail project"
prepare_target "${copy_fail}"
bash "${helper}" apply --url "${fixture}" --target "${copy_fail}" --platform cursor
copy_dest="${copy_fail}/.cursor/skills/dough-update"
printf '%s\n' '0.1.0' > "${copy_dest}/VERSION"
: > "${trace_file}"
if output=$(OPEN_DOUGH_INSTALL_FAULT=copy bash "${helper}" apply --url "${fixture}" \
  --target "${copy_fail}" --platform cursor 2>&1); then
  echo "FAIL: copy failure must not report success." >&2
  exit 1
fi
[[ "${output}" == *'Copy failed after replacement started'* ]]
[[ "${output}" == *'may be incomplete'* ]]
[[ "${output}" == *'--force'* ]]
[[ "${output}" != *'Outcome: updated'* ]]
contents=$(cat "${copy_dest}/VERSION")
[[ "${contents}" == 0.1.0 ]]
contents=$(cat "${copy_dest}/SKILL.md")
[[ "${contents}" == 'partial-install' ]]
grep -q '^install ' "${trace_file}"

verify_fail="${temporary_dir}/verify-fail project"
prepare_target "${verify_fail}"
bash "${helper}" apply --url "${fixture}" --target "${verify_fail}" --platform cursor
verify_dest="${verify_fail}/.cursor/skills/dough-update"
printf '%s\n' '0.1.0' > "${verify_dest}/VERSION"
: > "${trace_file}"
if output=$(OPEN_DOUGH_INSTALL_FAULT=verify bash "${helper}" apply --url "${fixture}" \
  --target "${verify_fail}" --platform cursor 2>&1); then
  echo "FAIL: verification failure must not report success." >&2
  exit 1
fi
[[ "${output}" == *'verification failed'* ]]
[[ "${output}" == *'may be incomplete'* ]]
[[ "${output}" == *'--force'* ]]
contents=$(cat "${verify_dest}/VERSION")
[[ "${contents}" == 0.1.0 ]]

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
[[ "${output}" == *'Installed: unknown'* || "${output}" == *'explicit force'* ]]
assert_payload "${legacy_dest}" 0.1.10 payload-0.1.10
assert_sentinels "${legacy}"

echo "PASS: update compares before writes, refuses malformed and requested versions, reports failed replacement, and bootstraps a genuine v0.1.0 install with explicit force."
