#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/public-payload-fixture.bash
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/release-fixture.bash
source "${source_dir}/tests/helpers/release-fixture.bash"
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/incomplete-install-report.bash
source "${source_dir}/tests/helpers/incomplete-install-report.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
cd -- "${temporary_dir}"

helper="${source_dir}/src/install/open-dough-release.sh"
fixture="${temporary_dir}/fixture.git"
build_latest_fixture "${fixture}"

trace_file="${temporary_dir}/trace.log"
export OPEN_DOUGH_TRACE="${trace_file}"

previous_source='previous-successful-source'
previous_version='0.1.0'

prepare_apply_with_previous_records() {
  local name=$1

  apply_target="${temporary_dir}/${name} project"
  apply_dest="${apply_target}/.cursor/skills/dough-update"
  prepare_target "${apply_target}"
  bash "${helper}" apply --url "${fixture}" --target "${apply_target}" --platform cursor
  printf '%s\n' "${previous_source}" > "${apply_dest}/SOURCE"
  printf '%s\n' "${previous_version}" > "${apply_dest}/VERSION"
  : > "${trace_file}"
}

prepare_apply_with_previous_records copy-fail
copy_fail=${apply_target}
copy_dest=${apply_dest}
if output=$(OPEN_DOUGH_INSTALL_FAULT=copy bash "${helper}" apply --url "${fixture}" \
  --target "${copy_fail}" --platform cursor 2>&1); then
  echo "FAIL: copy failure must not report success." >&2
  exit 1
fi
assert_apply_incomplete_install_report "${output}" \
  'Copy failed after replacement started.'
assert_preserved_install_records "${copy_dest}" \
  "${previous_source}" "${previous_version}"
contents=$(cat "${copy_dest}/SKILL.md")
[[ "${contents}" == 'partial-install' ]]
grep -q '^install ' "${trace_file}"

prepare_apply_with_previous_records verify-fail
verify_fail=${apply_target}
verify_dest=${apply_dest}
if output=$(OPEN_DOUGH_INSTALL_FAULT=verify bash "${helper}" apply --url "${fixture}" \
  --target "${verify_fail}" --platform cursor 2>&1); then
  echo "FAIL: verification failure must not report success." >&2
  exit 1
fi
assert_apply_incomplete_install_report "${output}" \
  'Installed payload verification failed.'
assert_preserved_install_records "${verify_dest}" \
  "${previous_source}" "${previous_version}"

prepare_apply_with_previous_records record-fail
record_fail=${apply_target}
record_dest=${apply_dest}
if output=$(OPEN_DOUGH_INSTALL_FAULT=record bash "${helper}" apply --url "${fixture}" \
  --target "${record_fail}" --platform cursor 2>&1); then
  echo "FAIL: record-write fault must not report success." >&2
  exit 1
fi
assert_apply_incomplete_install_report "${output}" \
  'Failed to write installation records after replacement started.'
assert_preserved_install_records "${record_dest}" \
  "${previous_source}" "${previous_version}"
grep -q '^install ' "${trace_file}"

prepare_apply_with_previous_records real-record-fail
real_record_fail=${apply_target}
real_record_dest=${apply_dest}
chmod a-w "${real_record_dest}/VERSION"
if output=$(bash "${helper}" apply --url "${fixture}" --target "${real_record_fail}" \
  --platform cursor 2>&1); then
  echo "FAIL: real VERSION write failure must not report success." >&2
  chmod u+w "${real_record_dest}/VERSION"
  exit 1
fi
chmod u+w "${real_record_dest}/VERSION"
assert_apply_incomplete_install_report "${output}" \
  'Failed to write installation records after replacement started.'
assert_preserved_install_records "${real_record_dest}" \
  "${previous_source}" "${previous_version}"
grep -q '^install ' "${trace_file}"

echo 'PASS: apply reports copy, verification, and record-write replacement failures without certifying or advancing SOURCE/VERSION.'
