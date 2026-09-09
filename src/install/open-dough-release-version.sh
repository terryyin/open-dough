#!/usr/bin/env bash
# Version records, changelog validation, numeric compare, and managed-payload
# baseline comparison. Sourced by open-dough-release.sh.

managed_payload_unchanged() {
  local dest=$1
  local checkout=$2
  local skill_root managed_file
  local -a files=(
    dough-update/SKILL.md
    dough-adr-awareness/SKILL.md
    dough-product-backlog/SKILL.md
    dough-story-decomposition/SKILL.md
    dough-story-decomposition/references/problem-decomposition.md
    dough-story-decomposition/references/seed-format.md
    dough-story-refinement/SKILL.md
    dough-story-refinement/references/planning.md
    dough-resplit-story/SKILL.md
    dough-slice-planning/SKILL.md
    dough-slice-plan-refinement/SKILL.md
    dough-execute-plan/SKILL.md
    dough-execute-plan/assets/claude-hooks.json
    dough-execute-plan/assets/cursor-hooks.json
    dough-execute-plan/references/ci-monitor.md
    dough-execute-plan/references/ci-notify-codex.md
    dough-execute-plan/references/ci-notify-hosts.md
    dough-execute-plan/references/delegation.md
    dough-execute-plan/references/destructive-later-outcome-check.md
    dough-execute-plan/references/disposable-research.md
    dough-execute-plan/references/execution-decisions.md
    dough-execute-plan/references/runtime-setup.md
    dough-execute-plan/references/wrap-up.md
    dough-execute-plan/scripts/ci-failures.mjs
    dough-execute-plan/scripts/ci-host-hook.mjs
    dough-execute-plan/scripts/ci-mailbox-store.mjs
    dough-execute-plan/scripts/ci-mailbox-worker-process.mjs
    dough-execute-plan/scripts/ci-mailbox.mjs
    dough-execute-plan/scripts/ci-observer-stream.mjs
    dough-execute-plan/scripts/ci-runs.mjs
    dough-execute-plan/scripts/watch-ci-execution.mjs
    dough-execute-plan/scripts/watch-ci.mjs
    dough-post-change-refactor/SKILL.md
    dough-post-change-refactor/references/refactor-checks.md
  )

  skill_root=$(dirname -- "${dest}")
  for managed_file in "${files[@]}"; do
    # A clean older release may not contain a skill added by the new release.
    # The new path must still be absent so replace-verified cannot overwrite an
    # unrelated local skill that happens to use the same name.
    if [[ ! -e "${checkout}/src/skills/${managed_file}" ]]; then
      [[ ! -e "${skill_root}/${managed_file}" ]] || return 1
      continue
    fi
    if [[ ! -f "${checkout}/src/skills/${managed_file}" ]] \
      || [[ ! -f "${skill_root}/${managed_file}" ]]; then
      return 1
    fi
    cmp -s -- "${skill_root}/${managed_file}" \
      "${checkout}/src/skills/${managed_file}" || return 1
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

read_source_record() {
  local file=$1
  local source='' extra=''

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
  } < "${file}"
  if [[ -z "${source}" || -n "${extra}" ]]; then
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
