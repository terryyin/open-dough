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
older_checkout="${temporary_dir}/release-0.1.1"
checkout_tagged_release "${fixture}" "${older_checkout}" 0.1.1

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

assert_ordinary_update_refuses_unwritten() {
  local label=$1
  local needle=$2
  local dest=$3
  local apply_tmp=$4
  local skill_root before after output
  local selected_path selected_mtime index
  local -a watched_paths=()
  local -a watched_mtimes=()

  skill_root=$(dirname -- "${dest}")
  for selected_path in \
    "${dest}/SKILL.md" \
    "${dest}/VERSION" \
    "${dest}/SOURCE" \
    "${skill_root}/dough-adr-awareness/SKILL.md"; do
    if [[ -f "${selected_path}" ]]; then
      watched_paths+=("${selected_path}")
      watched_mtimes+=("$(file_mtime "${selected_path}")")
    fi
  done
  before=$(snapshot_path_state "${unverifiable}")
  rm -rf -- "${apply_tmp}"
  mkdir -p -- "${apply_tmp}"
  : > "${trace_file}"
  if output=$(TMPDIR="${apply_tmp}" bash "${helper}" apply --target "${unverifiable}" \
    --platform cursor 2>&1); then
    echo "FAIL: ${label}: ordinary update must refuse an unverifiable installation." >&2
    printf '%s\n' "${output}" >&2
    exit 1
  fi
  if [[ "${output}" != *"${needle}"* ]]; then
    echo "FAIL: ${label}: expected refusal to mention: ${needle}" >&2
    printf '%s\n' "${output}" >&2
    exit 1
  fi
  [[ "${output}" == *'Outcome: refused; preserved the selected installation.'* ]]
  [[ "${output}" != *'Usage:'* ]]
  [[ "${output}" != *"${decoy}"* ]]
  [[ "${output}" != *'Installed: unknown'* ]]
  [[ "${output}" != *'updated from'* ]]
  if grep -q '^install ' "${trace_file}"; then
    echo "FAIL: ${label}: unverifiable ordinary update must not invoke the installer." >&2
    exit 1
  fi
  assert_owned_tmp_empty "${apply_tmp}" "${label}:"
  after=$(snapshot_path_state "${unverifiable}")
  if [[ "${after}" != "${before}" ]]; then
    echo "FAIL: ${label}: target contents changed during refusal." >&2
    exit 1
  fi
  for index in "${!watched_paths[@]}"; do
    selected_path=${watched_paths[${index}]}
    selected_mtime=$(file_mtime "${selected_path}")
    if [[ "${selected_mtime}" != "${watched_mtimes[${index}]}" ]]; then
      echo "FAIL: ${label}: mtime changed for ${selected_path}." >&2
      exit 1
    fi
  done
  assert_sentinels "${unverifiable}"
}

restore_clean_older_cursor() {
  bash "${older_checkout}/install.sh" --target "${unverifiable}" \
    --source "${fixture}" --platform cursor --force > /dev/null
}

unverifiable="${temporary_dir}/unverifiable project"
prepare_target "${unverifiable}"
git -C "${unverifiable}" init --quiet
git -C "${unverifiable}" remote add origin "${decoy}"
unverifiable_dest="${unverifiable}/.cursor/skills/dough-update"
unverifiable_tmp="${temporary_dir}/unverifiable-tmp"
restore_clean_older_cursor

printf '%s\n' 'local managed edit' >> "${unverifiable_dest}/SKILL.md"
assert_ordinary_update_refuses_unwritten \
  'edited managed file' \
  'ordinary update requires an unchanged installation' \
  "${unverifiable_dest}" \
  "${unverifiable_tmp}"

restore_clean_older_cursor
rm -f -- "$(dirname -- "${unverifiable_dest}")/dough-adr-awareness/SKILL.md"
assert_ordinary_update_refuses_unwritten \
  'missing managed file' \
  'ordinary update requires an unchanged installation' \
  "${unverifiable_dest}" \
  "${unverifiable_tmp}"

restore_clean_older_cursor
rm -f -- "${unverifiable_dest}/SOURCE"
assert_ordinary_update_refuses_unwritten \
  'missing source record' \
  'Missing installed source record' \
  "${unverifiable_dest}" \
  "${unverifiable_tmp}"

restore_clean_older_cursor
printf '%s\n%s\n' "${expected_source}" 'extra source line' > \
  "${unverifiable_dest}/SOURCE"
assert_ordinary_update_refuses_unwritten \
  'malformed source record' \
  'Malformed installed source record' \
  "${unverifiable_dest}" \
  "${unverifiable_tmp}"

restore_clean_older_cursor
rm -f -- "${unverifiable_dest}/VERSION"
assert_ordinary_update_refuses_unwritten \
  'missing version record' \
  'Missing installed version record' \
  "${unverifiable_dest}" \
  "${unverifiable_tmp}"

restore_clean_older_cursor
printf '%s\n' 'v0.1.1' > "${unverifiable_dest}/VERSION"
assert_ordinary_update_refuses_unwritten \
  'malformed version record' \
  'Malformed installed record' \
  "${unverifiable_dest}" \
  "${unverifiable_tmp}"

restore_clean_older_cursor
printf '%s\n' "${temporary_dir}/missing-source.git" > \
  "${unverifiable_dest}/SOURCE"
assert_ordinary_update_refuses_unwritten \
  'unavailable source' \
  'Failed to fetch tags' \
  "${unverifiable_dest}" \
  "${unverifiable_tmp}"

restore_clean_older_cursor
printf '%s\n' '0.1.3' > "${unverifiable_dest}/VERSION"
assert_ordinary_update_refuses_unwritten \
  'unavailable tag' \
  'No numeric release tag v0.1.3' \
  "${unverifiable_dest}" \
  "${unverifiable_tmp}"

mismatch="${temporary_dir}/mismatch.git"
mkdir -p -- "${mismatch}"
git -C "${mismatch}" init --quiet -b main
git_identity "${mismatch}"
write_candidate_payload "${mismatch}" 0.1.1 payload-0.1.1
printf '%s\n' '0.1.8' > "${mismatch}/VERSION"
commit_all "${mismatch}" 'tagged 0.1.1 with mismatched VERSION'
tag_release "${mismatch}" 0.1.1 '2026-06-01T00:00:00'
write_candidate_payload "${mismatch}" 0.1.10 payload-0.1.10
commit_all "${mismatch}" 'release 0.1.10'
tag_release "${mismatch}" 0.1.10 '2020-01-01T00:00:00'
restore_clean_older_cursor
mismatch_source=$(cd -- "${mismatch}" && pwd -P)
printf '%s\n' "${mismatch_source}" > "${unverifiable_dest}/SOURCE"
assert_ordinary_update_refuses_unwritten \
  'baseline metadata mismatch' \
  'not falling back to another release or branch' \
  "${unverifiable_dest}" \
  "${unverifiable_tmp}"

echo "PASS: ordinary update refuses an unverifiable installation without guessing a source, writing, or treating it as a first install."
