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
build_latest_fixture "${fixture}"
expected_source=$(cd -- "${fixture}" && pwd -P)

decoy="${temporary_dir}/client-origin.git"
mkdir -p -- "${decoy}"
git -C "${decoy}" init --quiet -b main
git_identity "${decoy}"
write_candidate_payload "${decoy}" 9.9.9 payload-client-remote
commit_all "${decoy}" 'client remote decoy'
tag_release "${decoy}" 9.9.9 '2026-09-08T00:00:00'

trace_file="${temporary_dir}/trace.log"
rm -f -- "${trace_file}"
export OPEN_DOUGH_TRACE="${trace_file}"

prepare_recorded_latest() {
  local target=$1
  prepare_target "${target}"
  git -C "${target}" init --quiet
  git -C "${target}" remote add origin "${decoy}"
  bash "${helper}" apply --url "${fixture}" --target "${target}" --platform cursor \
    > /dev/null
}

capture_skip_state() {
  local dest=$1
  local selected_path skill_root
  skill_root=$(dirname -- "${dest}")
  skip_paths=(
    "${dest}/SKILL.md"
    "${dest}/VERSION"
    "${dest}/SOURCE"
    "${skill_root}/dough-adr-awareness/SKILL.md"
  )
  skip_mtimes=()
  for selected_path in "${skip_paths[@]}"; do
    skip_mtimes+=("$(file_mtime "${selected_path}")")
  done
}

assert_skip_state_unchanged() {
  local label=$1
  local target=$2
  local apply_tmp=$3
  local before=$4
  local after selected_path selected_mtime index

  if grep -q '^install ' "${trace_file}"; then
    echo "FAIL: ${label}: must not invoke the installer." >&2
    exit 1
  fi
  assert_owned_tmp_empty "${apply_tmp}" "${label}:"
  after=$(snapshot_path_state "${target}")
  if [[ "${after}" != "${before}" ]]; then
    echo "FAIL: ${label}: target contents changed." >&2
    exit 1
  fi
  for index in "${!skip_paths[@]}"; do
    selected_path=${skip_paths[${index}]}
    selected_mtime=$(file_mtime "${selected_path}")
    if [[ "${selected_mtime}" != "${skip_mtimes[${index}]}" ]]; then
      echo "FAIL: ${label}: mtime changed for ${selected_path}." >&2
      exit 1
    fi
  done
  assert_sentinels "${target}"
}

run_ordinary_apply() {
  local target=$1
  local apply_tmp=$2
  rm -rf -- "${apply_tmp}"
  mkdir -p -- "${apply_tmp}"
  : > "${trace_file}"
  TMPDIR="${apply_tmp}" bash "${helper}" apply --target "${target}" --platform cursor
}

equal_target="${temporary_dir}/equal project"
prepare_recorded_latest "${equal_target}"
equal_dest="${equal_target}/.cursor/skills/dough-update"
git -C "${fixture}" checkout --quiet main
printf '%s\n' 'untagged-source-change' >> "${fixture}/BRANCH_HEAD"
commit_all "${fixture}" 'untagged source change after equal install'
capture_skip_state "${equal_dest}"
chmod a-w "${skip_paths[@]}"
equal_before=$(snapshot_path_state "${equal_target}")
equal_tmp="${temporary_dir}/equal-tmp"
output=$(run_ordinary_apply "${equal_target}" "${equal_tmp}")
chmod u+w "${skip_paths[@]}"
[[ "${output}" == *"Source: ${expected_source}"* ]]
[[ "${output}" != *"${decoy}"* ]]
[[ "${output}" == *'already current'* ]]
[[ "${output}" == *'no installer invocation or installed-file writes'* ]]
grep -qx "apply-skip-equal ${equal_dest}" "${trace_file}"
assert_payload "${equal_dest}" 0.1.10 payload-0.1.10
assert_skip_state_unchanged 'clean equal' "${equal_target}" \
  "${equal_tmp}" "${equal_before}"

edited_target="${temporary_dir}/edited-equal project"
prepare_recorded_latest "${edited_target}"
edited_dest="${edited_target}/.cursor/skills/dough-update"
printf '%s\n' 'local managed edit' >> "${edited_dest}/SKILL.md"
capture_skip_state "${edited_dest}"
edited_before=$(snapshot_path_state "${edited_target}")
edited_tmp="${temporary_dir}/edited-tmp"
rm -rf -- "${edited_tmp}"
mkdir -p -- "${edited_tmp}"
: > "${trace_file}"
if output=$(TMPDIR="${edited_tmp}" bash "${helper}" apply --target "${edited_target}" \
  --platform cursor 2>&1); then
  echo "FAIL: edited equal must refuse." >&2
  printf '%s\n' "${output}" >&2
  exit 1
fi
[[ "${output}" == *'ordinary update requires an unchanged installation'* ]]
[[ "${output}" == *'Outcome: refused; preserved the selected installation.'* ]]
[[ "${output}" != *'already current'* ]]
grep -qx "apply-unverifiable ${edited_dest}" "${trace_file}"
grep -Fq 'local managed edit' "${edited_dest}/SKILL.md"
assert_skip_state_unchanged 'edited equal' "${edited_target}" \
  "${edited_tmp}" "${edited_before}"

newer_target="${temporary_dir}/newer project"
prepare_recorded_latest "${newer_target}"
newer_dest="${newer_target}/.cursor/skills/dough-update"
printf '%s\n' '0.2.0' > "${newer_dest}/VERSION"
capture_skip_state "${newer_dest}"
chmod a-w "${skip_paths[@]}"
newer_before=$(snapshot_path_state "${newer_target}")
newer_tmp="${temporary_dir}/newer-tmp"
rm -rf -- "${newer_tmp}"
mkdir -p -- "${newer_tmp}"
: > "${trace_file}"
output=$(TMPDIR="${newer_tmp}" bash "${helper}" apply --url "${fixture}" \
  --target "${newer_target}" --platform cursor)
chmod u+w "${skip_paths[@]}"
[[ "${output}" == *'installed 0.2.0 is newer than source 0.1.10'* ]]
[[ "${output}" == *'no downgrade'* ]]
grep -qx "apply-newer ${newer_dest}" "${trace_file}"
contents=$(cat "${newer_dest}/VERSION")
[[ "${contents}" == 0.2.0 ]]
assert_skip_state_unchanged 'valid newer' "${newer_target}" \
  "${newer_tmp}" "${newer_before}"

unsupported_target="${temporary_dir}/unsupported-newer project"
prepare_recorded_latest "${unsupported_target}"
unsupported_dest="${unsupported_target}/.cursor/skills/dough-update"
printf '%s\n' '0.2.0' > "${unsupported_dest}/VERSION"
capture_skip_state "${unsupported_dest}"
unsupported_before=$(snapshot_path_state "${unsupported_target}")
unsupported_tmp="${temporary_dir}/unsupported-tmp"
rm -rf -- "${unsupported_tmp}"
mkdir -p -- "${unsupported_tmp}"
: > "${trace_file}"
if output=$(TMPDIR="${unsupported_tmp}" bash "${helper}" apply \
  --target "${unsupported_target}" --platform cursor 2>&1); then
  echo "FAIL: unverifiable newer must be unsupported." >&2
  printf '%s\n' "${output}" >&2
  exit 1
fi
[[ "${output}" == *'No numeric release tag v0.2.0'* ]]
[[ "${output}" == *'Outcome: unsupported; preserved the selected installation without a downgrade.'* ]]
[[ "${output}" != *'already current'* ]]
[[ "${output}" != *'updated from'* ]]
grep -qx "apply-unverifiable ${unsupported_dest}" "${trace_file}"
contents=$(cat "${unsupported_dest}/VERSION")
[[ "${contents}" == 0.2.0 ]]
assert_skip_state_unchanged 'unverifiable newer' "${unsupported_target}" \
  "${unsupported_tmp}" "${unsupported_before}"

echo "PASS: ordinary equal/newer skips report only verified state without installer invocation or target writes."
