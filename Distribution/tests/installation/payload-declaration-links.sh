#!/usr/bin/env bash
# Every relative link in a payload Markdown file must point at a payload file,
# so an installation carries each dependency its guidance links to. Reads the
# payload inventory of Distribution/src/skills/ only; runs no installer.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck disable=SC1091
source "${source_dir}/Distribution/src/install/open-dough-payload-inventory.sh"

# Resolves a relative link from a declared file into a declared-path form.
# Prints nothing when the link climbs above Distribution/src/skills/.
resolve_link() {
  local linking_file=$1 link=$2
  local part
  local -a resolved=()
  local -a parts
  IFS=/ read -ra parts <<< "${linking_file%/*}/${link}"
  for part in "${parts[@]}"; do
    case "${part}" in
      '' | .) ;;
      ..)
        ((${#resolved[@]} > 0)) || return 0
        unset 'resolved[-1]'
        ;;
      *) resolved+=("${part}") ;;
    esac
  done
  local IFS=/
  printf '%s\n' "${resolved[*]}"
}

# Checks the payload rooted at $1 (holding install.sh and Distribution/src/skills/); prints
# one FAIL line per undeclared link target and returns non-zero if any.
check_declared_links() {
  local root=$1
  local declaration managed_file links link target failed=0
  local -A declared=()
  declaration=$(read_release_payload "${root}") || return 1
  while IFS= read -r managed_file; do
    declared[${managed_file}]=1
  done <<< "${declaration}"
  while IFS= read -r managed_file; do
    [[ "${managed_file}" == *.md ]] || continue
    links=$(grep -oE '\]\([^) ]+\)' "${root}/Distribution/src/skills/${managed_file}") || [[ $? -eq 1 ]] || return 1
    while IFS= read -r link; do
      link=${link#](}
      link=${link%)}
      link=${link%%#*}
      [[ -n "${link}" ]] || continue
      [[ "${link}" =~ ^[A-Za-z][A-Za-z0-9+.-]*: ]] && continue
      target=$(resolve_link "${managed_file}" "${link}")
      if [[ -z "${target}" || -z "${declared[${target}]:-}" ]]; then
        printf 'FAIL: declared %s links to undeclared %s\n' "${managed_file}" "${link}" >&2
        failed=1
      fi
    done <<< "${links}"
  done <<< "${declaration}"
  return "${failed}"
}

check_declared_links "${source_dir}"

# A copy whose installer would fail if run proves the check never runs it.
copy=$(mktemp -d)
trap 'rm -rf -- "${copy}"' EXIT
# The legacy reader still reads historical list-era declarations as data:
# compare it with Bash executing only a grouped declaration's data forms.
mkdir -p -- "${copy}/src/install"
fragment="${copy}/src/install/open-dough-execution-payload.sh"
{
  printf '%s\n' 'managed_files=(' '  dough-update/SKILL.md' ')'
  # shellcheck disable=SC2016 # Write the historical installer's literal source line.
  printf '%s\n' 'source "$(dirname -- "${BASH_SOURCE[0]}")/src/install/open-dough-execution-payload.sh"'
} > "${copy}/historical-install.sh"
printf '%s\n' 'managed_files+=(' '  dough-example/SKILL.md' ')' > "${fragment}"
# shellcheck disable=SC2016 # Write literal Bash for the isolated declaration-only comparison.
native_paths=$(bash -c 'source "$1"; printf "%s\n" "${managed_files[@]}"' declaration "${copy}/historical-install.sh")
declared_paths=$(read_managed_files_declaration "${copy}/historical-install.sh")
native_declared=$(/bin/bash -c 'source "$1"; read_managed_files_declaration "$2"' \
  payload-declaration "${source_dir}/Distribution/src/install/open-dough-payload-declaration.sh" "${copy}/historical-install.sh")
[[ "${native_paths}" == $'dough-update/SKILL.md\ndough-example/SKILL.md' ]]
[[ "${native_declared}" == "${native_paths}" ]]
[[ "${declared_paths}" == "${native_paths}" ]]
printf '%s\n' 'managed_files=(' '  dough-update/SKILL.md dough-example/SKILL.md' ')' \
  > "${copy}/grouped-install.sh"
grouped_paths=$(read_managed_files_declaration "${copy}/grouped-install.sh")
[[ "${grouped_paths}" == "${native_paths}" ]]
# Missing or incomplete composition never becomes a successful partial list.
mv -- "${fragment}" "${copy}/fragment"
if read_managed_files_declaration "${copy}/historical-install.sh" > /dev/null 2>&1; then
  echo 'FAIL: a missing declaration fragment was accepted.' >&2
  exit 1
fi
printf '%s\n' 'managed_files+=(' '  dough-example/SKILL.md' > "${fragment}"
if read_managed_files_declaration "${copy}/historical-install.sh" > /dev/null 2>&1; then
  echo 'FAIL: an incomplete declaration fragment was accepted.' >&2
  exit 1
fi
printf '%s\n' 'managed_files+=(' '  dough-example/SKILL.md' ')' \
  "touch '${copy}/fragment-ran'" > "${fragment}"
if read_managed_files_declaration "${copy}/historical-install.sh" > /dev/null 2>&1; then
  echo 'FAIL: a fragment containing a command was accepted.' >&2
  exit 1
fi
[[ ! -e "${copy}/fragment-ran" ]]
mkdir -p -- "${copy}/Distribution/src"
cp -R -- "${source_dir}/Distribution/src/skills" "${copy}/Distribution/src/skills"
{
  printf '%s\n' '#!/usr/bin/env bash' "echo 'FAIL: installer ran.' >&2; exit 1"
  cat -- "${source_dir}/install.sh"
} > "${copy}/install.sh"

linking=dough-update/SKILL.md
expect_undeclared() {
  local expected_target=$1 output
  # shellcheck disable=SC2310 # The check's failure is the expected outcome.
  if output=$(check_declared_links "${copy}" 2>&1); then
    echo 'FAIL: an undeclared link target was accepted.' >&2
    exit 1
  fi
  if [[ "${output}" != *"FAIL: declared ${linking} links to undeclared ${expected_target}"* ]]; then
    printf 'FAIL: missing naming of %s -> %s in:\n%s\n' "${linking}" "${expected_target}" "${output}" >&2
    exit 1
  fi
}

# A link to a file missing from the shipped directory fails and names both
# files; shipping the file passes.
printf '\nSee [notes](references/forgotten.md#usage).\n' >> "${copy}/Distribution/src/skills/${linking}"
expect_undeclared references/forgotten.md
mkdir -p -- "${copy}/Distribution/src/skills/dough-update/references"
printf '%s\n' 'Scratch notes' > "${copy}/Distribution/src/skills/dough-update/references/forgotten.md"
check_declared_links "${copy}"

# Every link on a line is checked, not only the last one.
printf '\n[other](references/other.md) and [notes](references/forgotten.md).\n' \
  >> "${copy}/Distribution/src/skills/${linking}"
expect_undeclared references/other.md
