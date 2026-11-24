#!/usr/bin/env bash
# Leftovers: installed files at paths some release up to the new one delivered
# and the new release does not. Release tags at the recorded source supply each
# release's payload and blob ids, so no installed record is kept.
# Sourced by open-dough-release.sh after platform, version, and resolve modules.
# Predicate functions are used in if/! conditions by design.
# shellcheck disable=SC2310,SC2312

# Print vMAJOR.MINOR.PATCH for each release tag at url up to and including
# version, once each.
release_tags_up_to() {
  local url=$1 version=$2
  local listing tag_version seen=$'\n'

  listing=$(list_release_tags "${url}") || return 1
  while IFS=$'\t' read -r tag_version _; do
    [[ -n "${tag_version}" ]] || continue
    [[ ${seen} != *$'\n'"${tag_version}"$'\n'* ]] || continue
    [[ $(compare_versions "${tag_version}" "${version}") != newer ]] || continue
    seen="${seen}${tag_version}"$'\n'
    printf 'v%s\n' "${tag_version}"
  done << EOF
${listing}
EOF
}

# Fetch the blob ids read from stdin into history in one request. If it fails,
# later reads still fetch lazily.
fetch_history_blobs() {
  git -C "$1" -c fetch.negotiationAlgorithm=noop fetch --quiet --no-tags \
    --no-write-fetch-head --recurse-submodules=no --filter=blob:none \
    --stdin origin > /dev/null 2>&1 || true
}

# A list-format release's data fragments, sourced by its install.sh.
list_declaration_fragment_pattern='^(Distribution/)?src/install/[a-z0-9-]+-payload[.]sh$'

# Print the blob ids of the installer files under the given tags' trees whose
# path matches pattern.
tagged_installer_blobs() {
  local history=$1 pattern=$2 tag
  shift 2
  for tag in "$@"; do
    git -C "${history}" ls-tree -r "${tag}" -- install.sh src/install Distribution/src/install \
      | awk -F'\t' -v pattern="${pattern}" '$2 ~ pattern { split($1, meta, " "); print meta[3] }'
  done
}

# Fetch the trees of every release tag up to version into history, without
# file contents, and record "<path>\t<blob>" in history.declared for each path
# a tag delivered: from its tree for a directory-format tag, else from its
# list declaration. A tag whose declaration cannot be read contributes nothing.
# Fetch noise (for example a local source ignoring the blob filter) stays out
# of the update output.
prepare_release_history() {
  local url=$1 history=$2 version=$3
  local listing tag declaration_root path declaration_available
  local -a tags=() refspecs=() list_tags=()

  listing=$(release_tags_up_to "${url}" "${version}") || return 1
  while IFS= read -r tag; do
    [[ -n "${tag}" ]] || continue
    tags+=("${tag}")
    refspecs+=("refs/tags/${tag}:refs/tags/${tag}")
  done << EOF
${listing}
EOF
  if ((${#refspecs[@]} == 0)); then
    echo "No release history up to ${version} in ${url}" >&2
    return 1
  fi
  if ! git init --quiet -- "${history}" 2> /dev/null \
    || ! git -C "${history}" remote add origin "$(git_url "${url}")" \
    || ! git -C "${history}" fetch --quiet --no-tags --filter=blob:none \
      --depth 1 origin "${refspecs[@]}" 2> /dev/null; then
    echo "Failed to fetch release history from ${url}" >&2
    return 1
  fi
  # Each tag's installer names its format; only list-format tags need their
  # data fragments.
  tagged_installer_blobs "${history}" '^install[.]sh$' "${tags[@]}" | fetch_history_blobs "${history}"

  : > "${history}.declared"
  for tag in "${tags[@]}"; do
    declaration_root="${history}.declarations/${tag}"
    mkdir -p -- "${declaration_root}"
    git -C "${history}" show "${tag}:install.sh" > "${declaration_root}/install.sh" 2> /dev/null || continue
    if directory_format_installer "${declaration_root}/install.sh"; then
      read_release_tree_payload "${history}" "${tag}" >> "${history}.declared"
    else
      list_tags+=("${tag}")
    fi
  done
  ((${#list_tags[@]} > 0)) || return 0
  tagged_installer_blobs "${history}" "${list_declaration_fragment_pattern}" "${list_tags[@]}" \
    | fetch_history_blobs "${history}"

  for tag in "${list_tags[@]}"; do
    declaration_root="${history}.declarations/${tag}"
    declaration_available=1
    while IFS= read -r path; do
      mkdir -p -- "${declaration_root}/${path%/*}"
      if ! git -C "${history}" show "${tag}:${path}" > "${declaration_root}/${path}" 2> /dev/null; then
        declaration_available=0
        break
      fi
    done < <(git -C "${history}" ls-tree -r --name-only "${tag}" -- src/install Distribution/src/install \
      | awk -v pattern="${list_declaration_fragment_pattern}" '$0 ~ pattern')
    ((declaration_available)) || continue
    read_managed_files_declaration "${declaration_root}/install.sh" > "${history}.paths" 2> /dev/null || continue
    git -C "${history}" ls-tree -r "${tag}" -- src/skills Distribution/src/skills | awk -F'\t' '
      NR == FNR { declared[$0] = 1; next }
      { sub(/^(Distribution\/)?src\/skills\//, "", $2) }
      ($2 in declared) { split($1, meta, " "); print $2 "\t" meta[3] }
    ' "${history}.paths" - >> "${history}.declared"
  done
}

# Print "unedited\t<path>" or "edited\t<path>" for each leftover present under
# root: delivered by a release in history, not delivered by the incoming
# release at checkout. Unedited means the file's blob equals one a delivering
# release held there.
release_leftovers() {
  local history=$1 checkout=$2 root=$3
  local path blob

  read_release_payload "${checkout}" > "${history}.current" || return 1
  awk -F'\t' '
    NR == FNR { current[$0] = 1; next }
    !($1 in current) && !seen[$1]++ { print $1 }
  ' "${history}.current" "${history}.declared" > "${history}.dropped"
  while IFS= read -r path; do
    [[ -f "${root}/${path}" && ! -L "${root}/${path}" ]] || continue
    blob=$(git -C "${history}" hash-object -- "${root}/${path}")
    if grep -Fxq -- "${path}"$'\t'"${blob}" "${history}.declared"; then
      printf 'unedited\t%s\n' "${path}"
    else
      printf 'edited\t%s\n' "${path}"
    fi
  done < "${history}.dropped"
}

# Remove each leftover listed in leftovers from root (only unedited ones unless
# statuses is "all"), then every directory that removal left empty below root.
# Print the removed paths.
remove_listed_leftovers() {
  local root=$1 leftovers=$2 statuses=$3
  local status path directory

  while IFS=$'\t' read -r status path; do
    [[ "${status}" == unedited || "${statuses}" == all ]] || continue
    rm -f -- "${root}/${path}"
    printf '%s\n' "${path}"
    directory=${path%/*}
    while [[ "${directory}" != "${path}" && -n "${directory}" ]]; do
      rmdir -- "${root}/${directory}" 2> /dev/null || break
      [[ "${directory}" == */* ]] || break
      directory=${directory%/*}
    done
  done < "${leftovers}"
}

# Record each installed root's leftovers under work_root before any write.
find_release_leftovers() {
  local target=$1 url=$2 work_root=$3 checkout=$4 version=$5
  local history="${work_root}/history" current_platform current_dest

  prepare_release_history "${url}" "${history}" "${version}" || return 1
  while IFS=$'\t' read -r current_platform current_dest; do
    [[ -d "${current_dest}" ]] || continue
    release_leftovers "${history}" "${checkout}" "$(dirname -- "${current_dest}")" \
      > "${work_root}/leftovers-${current_platform}" || return 1
  done < <(all_destinations_for "${target}")
}

# Explicit force is the recovery path, so an unavailable release history does
# not block it; the install proceeds and no leftovers are removed.
find_release_leftovers_for_force() {
  local url=$2 work_root=$3

  if ! find_release_leftovers "$@"; then
    rm -f -- "${work_root}/leftovers-"*
    echo "Release history from ${url} is unavailable; files earlier releases declared were not checked or removed." >&2
  fi
}

# Ordinary update refuses before writes when a recorded leftover is edited.
edited_leftovers_absent() {
  local target=$1 work_root=$2 version=$3
  local current_platform current_dest edited found=0

  while IFS=$'\t' read -r current_platform current_dest; do
    [[ -s "${work_root}/leftovers-${current_platform}" ]] || continue
    edited=$(awk -F'\t' '$1 == "edited" { print "  " $2 }' "${work_root}/leftovers-${current_platform}")
    [[ -z "${edited}" ]] && continue
    printf '%s: edited files at paths %s no longer delivers in %s:\n%s\n' \
      "${current_platform}" "${version}" "$(dirname -- "${current_dest}")" "${edited}" >&2
    found=1
  done < <(all_destinations_for "${target}")
  [[ "${found}" -eq 0 ]] && return 0
  echo "Ordinary update refuses without writes. Use --force to explicitly reinstall and remove them." >&2
  return 1
}

# After a successful install, remove the recorded leftovers (unedited ones, or
# all with statuses "all") and list them per root.
remove_found_leftovers() {
  local target=$1 work_root=$2 version=$3 statuses=${4:-unedited}
  local current_platform current_dest root removed

  while IFS=$'\t' read -r current_platform current_dest; do
    [[ -s "${work_root}/leftovers-${current_platform}" ]] || continue
    root=$(dirname -- "${current_dest}")
    removed=$(remove_listed_leftovers "${root}" "${work_root}/leftovers-${current_platform}" "${statuses}")
    [[ -n "${removed}" ]] || continue
    printf '%s: removed files %s no longer delivers from %s:\n' "${current_platform}" "${version}" "${root}"
    printf '%s\n' "${removed}" | sed 's/^/  /'
  done < <(all_destinations_for "${target}")
}
