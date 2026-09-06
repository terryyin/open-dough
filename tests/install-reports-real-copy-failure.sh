#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=src/install/open-dough-platform.sh
source "${source_dir}/src/install/open-dough-platform.sh"
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
  bash "${source_dir}/install.sh" --target "${target}" --platform "${platform}"

  destination=$(destination_for "${target}" "${platform}")
  skill_root=$(dirname -- "${destination}")
  updater="${skill_root}/dough-update/SKILL.md"
  later_file="${skill_root}/dough-adr-awareness/SKILL.md"
  version_record="${skill_root}/dough-update/VERSION"
  printf '%s\n' 'earlier managed file before replacement' > "${updater}"
  printf '%s\n' 'later managed file before replacement' > "${later_file}"
  printf '%s\n' 'last-successful-version' > "${version_record}"
  version_before=$(shasum -a 256 "${version_record}")

  export OPEN_DOUGH_COPY_CALLS=0
  export OPEN_DOUGH_COPY_FAILURE_ACTIVE=1
  if output=$(bash "${source_dir}/install.sh" \
    --target "${target}" --platform "${platform}" --force 2>&1); then
    echo "FAIL: ${platform} installation reported success after a real copy failure." >&2
    exit 1
  fi
  unset OPEN_DOUGH_COPY_FAILURE_ACTIVE

  [[ "${output}" == *'Copy failed after replacement started'* ]]
  [[ "${output}" == *'Installed files may be incomplete'* ]]
  [[ "${output}" == *'last successful record was left unchanged'* ]]
  [[ "${output}" == *'explicit --force reinstall'* ]]
  [[ "${output}" != *'Installed Open Dough public guidance'* ]]
  [[ "${output}" != *'Recorded version'* ]]
  cmp "${source_dir}/src/skills/dough-update/SKILL.md" "${updater}"
  later_contents=$(cat "${later_file}")
  [[ "${later_contents}" == 'later managed file before replacement' ]]
  version_after=$(shasum -a 256 "${version_record}")
  [[ "${version_after}" == "${version_before}" ]]
done

echo 'PASS: Codex, Cursor, and Claude report a real mid-copy replacement failure without advancing the last successful version record.'
