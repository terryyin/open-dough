#!/usr/bin/env bash
# Version records, changelog validation, and numeric compare.
# Sourced by open-dough-release.sh.

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
  local version='' extra=''

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
  } < "${file}"
  if [[ -n "${extra}" ]] || ! is_release_version "${version}"; then
    echo "Malformed installed record: ${file}" >&2
    return 2
  fi
  printf '%s\n' "${version}"
}

compare_versions() {
  local first=$1
  local second=$2
  local first_major first_minor first_patch
  local second_major second_minor second_patch

  if [[ "${first}" == "${second}" ]]; then
    echo equal
    return 0
  fi
  IFS=. read -r first_major first_minor first_patch << EOF
${first}
EOF
  IFS=. read -r second_major second_minor second_patch << EOF
${second}
EOF
  if [[ "${first_major}" -lt "${second_major}" ]]; then
    echo older
    return 0
  fi
  if [[ "${first_major}" -gt "${second_major}" ]]; then
    echo newer
    return 0
  fi
  if [[ "${first_minor}" -lt "${second_minor}" ]]; then
    echo older
    return 0
  fi
  if [[ "${first_minor}" -gt "${second_minor}" ]]; then
    echo newer
    return 0
  fi
  if [[ "${first_patch}" -lt "${second_patch}" ]]; then
    echo older
    return 0
  fi
  echo newer
}
