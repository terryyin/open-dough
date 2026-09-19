#!/usr/bin/env bash
# Release validation, record comparison, and managed-payload baseline checks.
report_managed_payload_mismatch() {
  local skill_root=$1 managed_file=$2
  printf 'Managed payload mismatch: %s %s\n' "${skill_root}" "${managed_file}" >&2
}
# Read-only extraction of an install.sh's inline managed_files=(...)
# declaration. Refuse an unavailable/unrecognized declaration instead of
# treating every source file as unmanaged. Historical installers use this
# literal array, so this must keep working against an older checkout's
# install.sh, not only this repository's current one.
read_managed_files_declaration() {
  local install_script=$1
  local declared
  if ! declared=$(awk '
    /^managed_files=\(/ { in_payload = 1; next }
    in_payload && /^\)/ { closed = 1; in_payload = 0 }
    in_payload && $1 == "dough-update/SKILL.md" { core = 1 }
    in_payload { print $1 }
    END { exit !(closed && core) }
  ' "${install_script}"); then
    echo "Cannot read managed payload declaration: ${install_script}" >&2
    return 1
  fi
  printf '%s\n' "${declared}"
}
# Read-only dest vs tagged checkout. dest is the dough-update destination;
# skill_root is its native root. No fetches or writes. Callers with a tagged
# tree pass it as checkout; ordinary update fetches first.
managed_payload_unchanged() {
  local dest=$1
  local checkout=$2
  local skill_root managed_file historical_files
  local self_root current_declaration
  local -a files=()

  # This file's own repository always ships install.sh's managed_files
  # declaration alongside it in the same commit, so the current side of the
  # comparison is read from that sibling rather than duplicated here by hand.
  self_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
  if ! current_declaration=$(read_managed_files_declaration "${self_root}/install.sh"); then
    return 1
  fi
  while IFS= read -r managed_file; do
    files+=("${managed_file}")
  done <<< "${current_declaration}"

  if ! historical_files=$(read_managed_files_declaration "${checkout}/install.sh"); then
    return 1
  fi
  skill_root=$(dirname -- "${dest}")
  for managed_file in "${files[@]}"; do
    # Source presence does not imply delivery: an older release may have
    # omitted an existing reference from its installer declaration. New paths
    # must still be absent so replacement cannot overwrite unrelated files.
    if [[ ! -e "${checkout}/src/skills/${managed_file}" ]] \
      || [[ $'\n'${historical_files}$'\n' != *$'\n'"${managed_file}"$'\n'* ]]; then
      if [[ -e "${skill_root}/${managed_file}" ]]; then
        report_managed_payload_mismatch "${skill_root}" "${managed_file}"
        return 1
      fi
      continue
    fi
    if [[ ! -f "${checkout}/src/skills/${managed_file}" ]] \
      || [[ ! -f "${skill_root}/${managed_file}" ]]; then
      report_managed_payload_mismatch "${skill_root}" "${managed_file}"
      return 1
    fi
    if ! cmp -s -- "${skill_root}/${managed_file}" \
      "${checkout}/src/skills/${managed_file}"; then
      report_managed_payload_mismatch "${skill_root}" "${managed_file}"
      return 1
    fi
  done
}
read_version_file() {
  local file=$1
  local version='' extra=''
  if [[ ! -f "${file}" ]]; then
    echo "Missing version file: ${file}" >&2
    return 1
  fi
  {
    IFS= read -r version || true
    IFS= read -r extra || true
  } < "${file}"
  if [[ -n "${extra}" ]]; then
    echo "Malformed version file: ${file}" >&2
    return 1
  fi
  if ! is_release_version "${version}"; then
    echo "Malformed version: ${version}" >&2
    return 1
  fi
  printf '%s\n' "${version}"
}
changelog_has_dated_entry() {
  local checkout=$1
  local version=$2
  local changelog="${checkout}/CHANGELOG.md"
  if [[ ! -f "${changelog}" ]]; then
    echo "Missing changelog: ${changelog}" >&2
    return 1
  fi
  if ! grep -Eq "^## ${version} - [0-9]{4}-[0-9]{2}-[0-9]{2}$" "${changelog}"; then
    echo "Missing dated changelog entry for ${version}" >&2
    return 1
  fi
}
validate_checkout() {
  local checkout=$1
  local version
  version=$(read_version_file "${checkout}/VERSION")
  changelog_has_dated_entry "${checkout}" "${version}"
  printf '%s\n' "${version}"
}
read_record() {
  local file=$1
  local version='' extra='' remainder=''
  if [[ ! -e "${file}" ]]; then
    return 0
  fi
  if [[ ! -f "${file}" ]]; then
    echo "Malformed installed record: ${file}" >&2
    return 2
  fi
  {
    IFS= read -r version || true
    IFS= read -r extra || true
    remainder=$(cat)
  } < "${file}"
  if [[ -n "${extra}" || -n "${remainder}" ]] || ! is_release_version "${version}"; then
    echo "Malformed installed record: ${file}" >&2
    return 2
  fi
  printf '%s\n' "${version}"
}
read_source_record() {
  local file=$1
  local source='' extra='' remainder=''
  if [[ ! -e "${file}" ]]; then
    echo "Missing installed source record: ${file}" >&2
    return 1
  fi
  if [[ ! -f "${file}" ]]; then
    echo "Malformed installed source record: ${file}" >&2
    return 2
  fi
  {
    IFS= read -r source || true
    IFS= read -r extra || true
    remainder=$(cat)
  } < "${file}"
  if [[ -z "${source}" || -n "${extra}" || -n "${remainder}" ]]; then
    echo "Malformed installed source record: ${file}" >&2
    return 2
  fi
  printf '%s\n' "${source}"
}
strip_leading_zeros() {
  local digits=$1
  while [[ ${#digits} -gt 1 && ${digits} == 0* ]]; do
    digits=${digits#0}
  done
  printf '%s\n' "${digits}"
}
compare_numeric_strings() {
  local first=$1
  local second=$2
  local sorted first_sort
  first=$(strip_leading_zeros "${first}")
  second=$(strip_leading_zeros "${second}")
  if [[ ${#first} -lt ${#second} ]]; then
    printf '%s\n' older
    return 0
  fi
  if [[ ${#first} -gt ${#second} ]]; then
    printf '%s\n' newer
    return 0
  fi
  if [[ "${first}" == "${second}" ]]; then
    printf '%s\n' equal
    return 0
  fi
  sorted=$(printf '%s\n%s\n' "${first}" "${second}" | LC_ALL=C sort)
  first_sort=${sorted%%$'\n'*}
  if [[ "${first_sort}" == "${first}" ]]; then
    printf '%s\n' older
    return 0
  fi
  printf '%s\n' newer
}
compare_versions() {
  local first=$1
  local second=$2
  local first_major first_minor first_patch
  local second_major second_minor second_patch
  local relation
  if [[ "${first}" == "${second}" ]]; then
    printf '%s\n' equal
    return 0
  fi
  IFS=. read -r first_major first_minor first_patch << EOF
${first}
EOF
  IFS=. read -r second_major second_minor second_patch << EOF
${second}
EOF
  relation=$(compare_numeric_strings "${first_major}" "${second_major}")
  if [[ "${relation}" != equal ]]; then
    printf '%s\n' "${relation}"
    return 0
  fi
  relation=$(compare_numeric_strings "${first_minor}" "${second_minor}")
  if [[ "${relation}" != equal ]]; then
    printf '%s\n' "${relation}"
    return 0
  fi
  compare_numeric_strings "${first_patch}" "${second_patch}"
}
