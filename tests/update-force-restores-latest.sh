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
fixture=$(cd -- "${fixture}" && pwd -P)
expected_source=${fixture}

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

assert_complete_latest() {
  local dest=$1
  local source=$2
  local recorded
  assert_payload "${dest}" 0.1.10 payload-0.1.10
  recorded=$(cat "${dest}/SOURCE")
  if [[ "${recorded}" != "${source}" ]]; then
    echo "FAIL: SOURCE is ${recorded}, expected ${source}" >&2
    exit 1
  fi
  if ! grep -qx "apply-force ${dest}" "${trace_file}"; then
    echo "FAIL: trace missing apply-force ${dest}" >&2
    cat "${trace_file}" >&2
    exit 1
  fi
  if ! grep -q '^install ' "${trace_file}"; then
    echo "FAIL: trace missing install line" >&2
    cat "${trace_file}" >&2
    exit 1
  fi
}

run_force_apply() {
  local target=$1
  local apply_tmp=$2
  local status
  shift 2
  rm -rf -- "${apply_tmp}"
  mkdir -p -- "${apply_tmp}"
  : > "${trace_file}"
  set +e
  TMPDIR="${apply_tmp}" bash "${helper}" apply --target "${target}" \
    --platform cursor --force "$@" 2> "${apply_tmp}/apply.stderr"
  status=$?
  set -e
  if [[ ${status} -ne 0 ]]; then
    echo "FAIL: force apply exited ${status} for ${target}" >&2
    cat "${apply_tmp}/apply.stderr" >&2 || true
    cat "${trace_file}" >&2 || true
    return "${status}"
  fi
  if [[ -s "${apply_tmp}/apply.stderr" ]]; then
    cat "${apply_tmp}/apply.stderr" >&2
  fi
  # Diagnostic stderr must not count as leftover installer temp work.
  rm -f -- "${apply_tmp}/apply.stderr"
}

assert_force_success() {
  local output=$1
  local dest=$2
  local target=$3
  local apply_tmp=$4
  local source=$5
  if [[ "${output}" != *"Source: ${source}"* ]]; then
    echo "FAIL: force output missing Source: ${source}" >&2
    printf '%s\n' "${output}" >&2
    exit 1
  fi
  if [[ "${output}" == *"${decoy}"* ]]; then
    echo "FAIL: force output mentions decoy remote ${decoy}" >&2
    exit 1
  fi
  if [[ "${output}" != *'explicit force'* ]]; then
    echo "FAIL: force output missing explicit-force outcome" >&2
    printf '%s\n' "${output}" >&2
    exit 1
  fi
  assert_complete_latest "${dest}" "${source}"
  assert_sentinels "${target}"
  assert_owned_tmp_empty "${apply_tmp}" 'explicit force'
}

edited_target="${temporary_dir}/edited project"
prepare_recorded_latest "${edited_target}"
edited_dest="${edited_target}/.agents/skills/dough-update"
edited_root=$(dirname -- "${edited_dest}")
printf '%s\n' 'local managed edit' >> "${edited_dest}/SKILL.md"
printf '%s\n' 'obsolete recognition' > \
  "${edited_root}/dough-adr-awareness/RECOGNITION.md"
printf '%s\n' 'Keep this updater-side file.' > "${edited_dest}/LOCAL.md"
edited_tmp="${temporary_dir}/edited-tmp"
output=$(run_force_apply "${edited_target}" "${edited_tmp}")
assert_force_success "${output}" "${edited_dest}" "${edited_target}" \
  "${edited_tmp}" "${expected_source}"
contents=$(cat "${edited_dest}/LOCAL.md")
[[ "${contents}" == 'Keep this updater-side file.' ]]
if grep -Fq 'local managed edit' "${edited_dest}/SKILL.md"; then
  echo 'FAIL: edited force must restore the latest payload.' >&2
  exit 1
fi

incomplete_target="${temporary_dir}/incomplete project"
prepare_recorded_latest "${incomplete_target}"
incomplete_dest="${incomplete_target}/.agents/skills/dough-update"
incomplete_root=$(dirname -- "${incomplete_dest}")
rm -f -- "${incomplete_dest}/VERSION" \
  "${incomplete_root}/dough-adr-awareness/SKILL.md"
incomplete_tmp="${temporary_dir}/incomplete-tmp"
output=$(run_force_apply "${incomplete_target}" "${incomplete_tmp}")
assert_force_success "${output}" "${incomplete_dest}" "${incomplete_target}" \
  "${incomplete_tmp}" "${expected_source}"

equal_target="${temporary_dir}/equal project"
prepare_recorded_latest "${equal_target}"
equal_dest="${equal_target}/.agents/skills/dough-update"
equal_tmp="${temporary_dir}/equal-tmp"
output=$(run_force_apply "${equal_target}" "${equal_tmp}")
assert_force_success "${output}" "${equal_dest}" "${equal_target}" \
  "${equal_tmp}" "${expected_source}"
[[ "${output}" != *'already current'* ]]

newer_target="${temporary_dir}/newer project"
prepare_recorded_latest "${newer_target}"
newer_dest="${newer_target}/.agents/skills/dough-update"
printf '%s\n' '0.2.0' > "${newer_dest}/VERSION"
newer_tmp="${temporary_dir}/newer-tmp"
output=$(run_force_apply "${newer_target}" "${newer_tmp}")
assert_force_success "${output}" "${newer_dest}" "${newer_target}" \
  "${newer_tmp}" "${expected_source}"
[[ "${output}" != *'no downgrade'* ]]

supplied_target="${temporary_dir}/supplied project"
prepare_recorded_latest "${supplied_target}"
supplied_dest="${supplied_target}/.agents/skills/dough-update"
rm -f -- "${supplied_dest}/SOURCE" "${supplied_dest}/VERSION"
supplied_tmp="${temporary_dir}/supplied-tmp"
output=$(run_force_apply "${supplied_target}" "${supplied_tmp}" \
  --url "${fixture}")
assert_force_success "${output}" "${supplied_dest}" "${supplied_target}" \
  "${supplied_tmp}" "${expected_source}"

echo 'PASS: explicit force restores the latest payload plus SOURCE then VERSION for edited, incomplete, equal, and newer installations from recorded SOURCE, and from a supplied URL when SOURCE is absent.'
