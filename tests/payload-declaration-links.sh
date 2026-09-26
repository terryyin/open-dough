#!/usr/bin/env bash
# Every relative link in a declared Markdown file must point at a declared
# file, so an installation carries each dependency its guidance links to.
# Reads install.sh's managed_files and src/skills/ only; runs no installer.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
source "${source_dir}/src/install/open-dough-release-version.sh"

# Resolves a relative link from a declared file into a declared-path form.
# Prints nothing when the link climbs above src/skills/.
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

# Checks the payload rooted at $1 (holding install.sh and src/skills/); prints
# one FAIL line per undeclared link target and returns non-zero if any.
check_declared_links() {
  local root=$1
  local declaration managed_file links link target failed=0
  local -A declared=()
  declaration=$(read_managed_files_declaration "${root}/install.sh") || return 1
  while IFS= read -r managed_file; do
    declared[${managed_file}]=1
  done <<< "${declaration}"
  while IFS= read -r managed_file; do
    [[ "${managed_file}" == *.md ]] || continue
    links=$(grep -oE '\]\([^) ]+\)' "${root}/src/skills/${managed_file}") || [[ $? -eq 1 ]] || return 1
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
mkdir -p -- "${copy}/src"
cp -R -- "${source_dir}/src/skills" "${copy}/src/skills"
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

# A forgotten declaration fails and names both files; declaring it passes.
mkdir -p -- "${copy}/src/skills/dough-update/references"
printf '%s\n' 'Scratch notes' > "${copy}/src/skills/dough-update/references/forgotten.md"
printf '\nSee [notes](references/forgotten.md#usage).\n' >> "${copy}/src/skills/${linking}"
expect_undeclared references/forgotten.md
awk '{ print } $0 == "  dough-update/SKILL.md" { print "  dough-update/references/forgotten.md" }' \
  "${copy}/install.sh" > "${copy}/declared"
mv -- "${copy}/declared" "${copy}/install.sh"
check_declared_links "${copy}"

# Every link on a line is checked, not only the last one.
printf '\n[other](references/other.md) and [notes](references/forgotten.md).\n' \
  >> "${copy}/src/skills/${linking}"
expect_undeclared references/other.md
