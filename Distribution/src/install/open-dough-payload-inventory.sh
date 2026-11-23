#!/usr/bin/env bash
# shellcheck disable=SC2312
# The managed payload a tagged release delivers, read as data from that tag's
# checkout. A directory-format release marks its install.sh with the exact line
#   open_dough_payload_format=directory
# and delivers every file under Distribution/src/skills/; the marker names no
# files. Any other install.sh is list-format, read by its own declaration.
# shellcheck disable=SC1091 # The selective check does not follow companion modules.
# shellcheck source=Distribution/src/install/open-dough-payload-declaration.sh
source "$(dirname -- "${BASH_SOURCE[0]}")/open-dough-payload-declaration.sh"

# Refuses a shipped skills tree holding test material or entries that cannot
# round-trip safely as payload paths, naming each offending path.
refuse_invalid_shipped_entries() {
  local skills=$1/Distribution/src/skills
  local entry relative name failed=0
  [[ -d "${skills}" && ! -L "${skills}" ]] || {
    echo "Shipped directory is missing or unsafe: ${skills}" >&2
    return 1
  }
  while IFS= read -r -d '' entry; do
    relative=${entry#"${skills}/"}
    name=${relative##*/}
    if [[ -L "${entry}" ]]; then
      printf 'Unsafe shipped entry (symlink): %q\n' "${relative}" >&2
      failed=1
    elif [[ ! -f "${entry}" && ! -d "${entry}" ]]; then
      printf 'Unsafe shipped entry (not a file or directory): %q\n' "${relative}" >&2
      failed=1
    elif [[ ! "${relative}" =~ ^[A-Za-z0-9_.-]+(/[A-Za-z0-9_.-]+)*$ || "/${relative}/" == */-* ]]; then
      printf 'Unsafe shipped entry (path name): %q\n' "${relative}" >&2
      failed=1
    elif [[ "${name}" == *.test.* || "${name}" == *.spec.* ||
      "${relative,,}" == *fixture* ]]; then
      printf 'Test material in shipped directory: %s\n' "${relative}" >&2
      failed=1
    fi
  done < <(find "${skills}" -mindepth 1 -print0)
  return "${failed}"
}

# Succeeds when the installer file marks its release as directory-format.
directory_format_installer() {
  grep -qx 'open_dough_payload_format=directory' "$1" 2> /dev/null
}

# Prints "<path>\t<blob>" for each file a directory-format tag delivers, read
# from the tag's Git tree, so a blob-filtered history needs no file contents.
read_release_tree_payload() {
  local repository=$1 tag=$2
  git -C "${repository}" ls-tree -r "${tag}" -- Distribution/src/skills | awk -F'\t' '
    { split($1, meta, " ") }
    meta[2] == "blob" && meta[1] != "120000" {
      sub(/^Distribution\/src\/skills\//, "", $2); print $2 "\t" meta[3]
    }
  '
}

# Prints the payload paths the release at checkout delivers, one per line.
# A directory-format tree with an invalid entry fails verification.
read_release_payload() {
  local checkout=$1 skills=$1/Distribution/src/skills
  if directory_format_installer "${checkout}/install.sh"; then
    refuse_invalid_shipped_entries "${checkout}" || return 1
    (cd -- "${skills}" && find . -type f) | sed 's|^[.]/||' | LC_ALL=C sort
  else
    read_managed_files_declaration "${checkout}/install.sh"
  fi
}
