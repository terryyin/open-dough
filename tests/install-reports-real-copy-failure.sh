#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=src/install/open-dough-platform.sh
source "${source_dir}/src/install/open-dough-platform.sh"
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/incomplete-install-report.bash
source "${source_dir}/tests/helpers/incomplete-install-report.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

OPEN_DOUGH_REAL_CP=$(command -v cp)
export OPEN_DOUGH_REAL_CP

cp() {
  if [[ "${OPEN_DOUGH_COPY_FAILURE_ACTIVE:-0}" -ne 1 ]]; then
    "${OPEN_DOUGH_REAL_CP}" "$@"
    return
  fi
  OPEN_DOUGH_COPY_CALLS=$((OPEN_DOUGH_COPY_CALLS + 1))
  if [[ ${OPEN_DOUGH_COPY_CALLS} -eq 2 ]]; then
    return 42
  fi
  "${OPEN_DOUGH_REAL_CP}" "$@"
}
export -f cp

for platform in codex cursor claude; do
  target="${temporary_dir}/${platform} target"
  mkdir -p -- "${target}"
  bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" \
    --platform "${platform}"

  destination=$(destination_for "${target}" "${platform}")
  skill_root=$(dirname -- "${destination}")
  updater="${skill_root}/dough-update/SKILL.md"
  later_file="${skill_root}/dough-adr-awareness/SKILL.md"
  printf '%s\n' 'earlier managed file before replacement' > "${updater}"
  printf '%s\n' 'later managed file before replacement' > "${later_file}"
  printf '%s\n' 'last-successful-source' > "${destination}/SOURCE"
  printf '%s\n' 'last-successful-version' > "${destination}/VERSION"

  export OPEN_DOUGH_COPY_CALLS=0
  export OPEN_DOUGH_COPY_FAILURE_ACTIVE=1
  if output=$(bash "${source_dir}/install.sh" \
    --target "${target}" --source "${source_dir}" --platform "${platform}" --force 2>&1); then
    echo "FAIL: ${platform} installation reported success after a real copy failure." >&2
    exit 1
  fi
  unset OPEN_DOUGH_COPY_FAILURE_ACTIVE

  assert_direct_incomplete_install_report "${output}" \
    'Copy failed after replacement started.'
  cmp "${source_dir}/src/skills/dough-update/SKILL.md" "${updater}"
  later_contents=$(cat "${later_file}")
  [[ "${later_contents}" == 'later managed file before replacement' ]]
  assert_preserved_install_records "${destination}" \
    'last-successful-source' 'last-successful-version'
done

for platform in codex cursor claude; do
  target="${temporary_dir}/${platform} record-fail target"
  mkdir -p -- "${target}"
  bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" \
    --platform "${platform}"

  destination=$(destination_for "${target}" "${platform}")
  version_record="${destination}/VERSION"
  printf '%s\n' 'last-successful-source' > "${destination}/SOURCE"
  printf '%s\n' 'last-successful-version' > "${version_record}"

  if output=$(OPEN_DOUGH_INSTALL_FAULT=record bash "${source_dir}/install.sh" \
    --target "${target}" --source "${source_dir}" --platform "${platform}" --force 2>&1); then
    echo "FAIL: ${platform} installation reported success after a record-write fault." >&2
    exit 1
  fi
  assert_direct_incomplete_install_report "${output}" \
    'Failed to write installation records after replacement started.'
  assert_preserved_install_records "${destination}" \
    'last-successful-source' 'last-successful-version'

  chmod a-w "${version_record}"
  if output=$(bash "${source_dir}/install.sh" \
    --target "${target}" --source "${source_dir}" --platform "${platform}" --force 2>&1); then
    echo "FAIL: ${platform} installation reported success after a real VERSION write failure." >&2
    chmod u+w "${version_record}"
    exit 1
  fi
  chmod u+w "${version_record}"
  assert_direct_incomplete_install_report "${output}" \
    'Failed to write installation records after replacement started.'
  assert_preserved_install_records "${destination}" \
    'last-successful-source' 'last-successful-version'
done

for platform in codex cursor claude; do
  target="${temporary_dir}/${platform} fresh-record-fail target"
  mkdir -p -- "${target}"
  destination=$(destination_for "${target}" "${platform}")
  mkdir -p -- "${destination}"
  version_record="${destination}/VERSION"
  source_record="${destination}/SOURCE"
  printf '%s\n' 'unwritable-version' > "${version_record}"
  chmod a-w "${version_record}"
  [[ ! -e "${source_record}" ]]

  if output=$(bash "${source_dir}/install.sh" \
    --target "${target}" --source "${source_dir}" --platform "${platform}" --force 2>&1); then
    echo "FAIL: ${platform} fresh installation reported success after a real VERSION write failure." >&2
    chmod u+w "${version_record}"
    exit 1
  fi
  chmod u+w "${version_record}"
  assert_direct_incomplete_install_report "${output}" \
    'Failed to write installation records after replacement started.'
  [[ ! -e "${source_record}" ]]
  version_contents=$(cat "${version_record}")
  [[ "${version_contents}" == 'unwritable-version' ]]
done

echo 'PASS: Codex, Cursor, and Claude report a real mid-copy replacement failure and real record-write failures without certifying or advancing SOURCE/VERSION.'
