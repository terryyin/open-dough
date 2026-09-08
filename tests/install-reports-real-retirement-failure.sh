#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=src/install/open-dough-platform.sh
source "${source_dir}/src/install/open-dough-platform.sh"
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/public-payload-fixture.bash
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/release-fixture.bash
source "${source_dir}/tests/helpers/release-fixture.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

OPEN_DOUGH_REAL_RM=$(command -v rm)
export OPEN_DOUGH_REAL_RM

rm() {
  if [[ "${OPEN_DOUGH_RETIRE_FAILURE_ACTIVE:-0}" -eq 1 ]] && (($# == 2)); then
    if [[ "$1" == -- && "$2" == "${OPEN_DOUGH_RETIRE_FAILURE_PATH}" ]]; then
      return 42
    fi
  fi
  "${OPEN_DOUGH_REAL_RM}" "$@"
}
export -f rm

for platform in codex cursor claude; do
  target="${temporary_dir}/${platform} target"
  mkdir -p -- "${target}"
  target=$(cd -- "${target}" && pwd -P)

  for relative_root in .agents/skills .cursor/skills .claude/skills; do
    platform_root="${target}/${relative_root}"
    mkdir -p -- \
      "${platform_root}/dough-update" \
      "${platform_root}/dough-adr-awareness"
    printf '%s\n' "Keep ${relative_root} updater." > \
      "${platform_root}/dough-update/SKILL.md"
    printf '%s\n' "Keep ${relative_root} ADR skill." > \
      "${platform_root}/dough-adr-awareness/SKILL.md"
    printf '%s\n' "Keep ${relative_root} recognition." > \
      "${platform_root}/dough-adr-awareness/RECOGNITION.md"
    printf '%s\n' "${relative_root}-last-successful-version" > \
      "${platform_root}/dough-update/VERSION"
  done

  destination=$(destination_for "${target}" "${platform}")
  selected_root=$(dirname -- "${destination}")
  retired_path="${selected_root}/dough-adr-awareness/RECOGNITION.md"
  mkdir -p -- "${selected_root}/unrelated-guidance"
  printf '%s\n' 'Keep selected unrelated guidance.' > \
    "${selected_root}/unrelated-guidance/SKILL.md"
  printf '%s\n' 'Keep selected updater sidecar.' > \
    "${selected_root}/dough-update/LOCAL.md"
  printf '%s\n' 'Keep this project file.' > "${target}/keep.txt"

  selected_relative_root=${selected_root#"${target}/"}
  before_selected_unrelated=$(snapshot_path_state \
    "${selected_root}/unrelated-guidance")
  before_selected_sidecar=$(shasum -a 256 \
    "${selected_root}/dough-update/LOCAL.md")
  before_other_platforms=$(
    for relative_root in .agents/skills .cursor/skills .claude/skills; do
      if [[ "${relative_root}" != "${selected_relative_root}" ]]; then
        snapshot_path_state "${target}/${relative_root}"
      fi
    done
  )
  before_project=$(shasum -a 256 "${target}/keep.txt")
  before_version=$(shasum -a 256 "${destination}/VERSION")
  recognition_contents=$(cat "${retired_path}")

  export OPEN_DOUGH_RETIRE_FAILURE_PATH="${retired_path}"
  export OPEN_DOUGH_RETIRE_FAILURE_ACTIVE=1
  if output=$(bash "${source_dir}/install.sh" \
    --target "${target}" --source "${source_dir}" --platform "${platform}" --force 2>&1); then
    echo "FAIL: ${platform} installation reported success after recognition retirement failed." >&2
    exit 1
  fi
  unset OPEN_DOUGH_RETIRE_FAILURE_ACTIVE OPEN_DOUGH_RETIRE_FAILURE_PATH

  [[ "${output}" == *'Retirement failed after replacement started.'* ]]
  [[ "${output}" == *'Installed files may be incomplete.'* ]]
  [[ "${output}" == *'last successful record was left unchanged.'* ]]
  [[ "${output}" == *'explicit --force reinstall.'* ]]
  [[ "${output}" != *'Installed Open Dough public guidance'* ]]
  [[ "${output}" != *'Recorded version'* ]]

  cmp "${source_dir}/src/skills/dough-update/SKILL.md" \
    "${selected_root}/dough-update/SKILL.md"
  cmp "${source_dir}/src/skills/dough-adr-awareness/SKILL.md" \
    "${selected_root}/dough-adr-awareness/SKILL.md"
  after_recognition=$(cat "${retired_path}")
  after_version=$(shasum -a 256 "${destination}/VERSION")
  [[ "${after_recognition}" == "${recognition_contents}" ]]
  [[ "${after_version}" == "${before_version}" ]]

  after_selected_unrelated=$(snapshot_path_state \
    "${selected_root}/unrelated-guidance")
  after_selected_sidecar=$(shasum -a 256 \
    "${selected_root}/dough-update/LOCAL.md")
  after_other_platforms=$(
    for relative_root in .agents/skills .cursor/skills .claude/skills; do
      if [[ "${relative_root}" != "${selected_relative_root}" ]]; then
        snapshot_path_state "${target}/${relative_root}"
      fi
    done
  )
  after_project=$(shasum -a 256 "${target}/keep.txt")
  [[ "${after_selected_unrelated}" == "${before_selected_unrelated}" ]]
  [[ "${after_selected_sidecar}" == "${before_selected_sidecar}" ]]
  [[ "${after_other_platforms}" == "${before_other_platforms}" ]]
  [[ "${after_project}" == "${before_project}" ]]
done

echo 'PASS: Codex, Cursor, and Claude report a real recognition unlink failure as a partial replacement, preserve the last successful version and all unrelated or other-platform content, and record no false success.'
