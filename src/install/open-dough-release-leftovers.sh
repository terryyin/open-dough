#!/usr/bin/env bash
# Leftovers: installed files at paths some release up to the new one declared
# and the new release does not. Release tags at the recorded source supply each
# release's declaration and blob ids, so no installed record is kept.
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

# Fetch the trees of every release tag up to version into history, without
# file contents, and record "<path>\t<blob>" in history.declared for each path
# a tag declared. A tag whose declaration cannot be read contributes nothing.
# Fetch noise (for example a local source ignoring the blob filter) stays out
# of the update output.
prepare_release_history() {
  local url=$1 history=$2 version=$3
  local tags tag install_blobs
  local -a refspecs=()

  tags=$(release_tags_up_to "${url}" "${version}") || return 1
  while IFS= read -r tag; do
    [[ -n "${tag}" ]] && refspecs+=("refs/tags/${tag}:refs/tags/${tag}")
  done << EOF
${tags}
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
  # One request for every release's install.sh; reading each lazily costs a
  # round trip per release. If it fails, reads below still fetch lazily.
  install_blobs=$(printf '%s\n' "${tags}" | while IFS= read -r tag; do
    git -C "${history}" rev-parse --verify --quiet "${tag}:install.sh" || true
  done)
  printf '%s\n' "${install_blobs}" | git -C "${history}" \
    -c fetch.negotiationAlgorithm=noop fetch --quiet --no-tags \
    --no-write-fetch-head --recurse-submodules=no --filter=blob:none \
    --stdin origin > /dev/null 2>&1 || true

  : > "${history}.declared"
  while IFS= read -r tag; do
    [[ -n "${tag}" ]] || continue
    if ! git -C "${history}" show "${tag}:install.sh" > "${history}.install" 2> /dev/null \
      || ! read_managed_files_declaration "${history}.install" > "${history}.paths" 2> /dev/null; then
      continue
    fi
    git -C "${history}" ls-tree -r "${tag}" -- src/skills | awk -F'\t' '
      NR == FNR { declared["src/skills/" $0] = 1; next }
      ($2 in declared) { split($1, meta, " "); print substr($2, 12) "\t" meta[3] }
    ' "${history}.paths" - >> "${history}.declared"
  done << EOF
${tags}
EOF
}

# Print "unedited\t<path>" or "edited\t<path>" for each leftover present under
# root: declared by a release in history, not declared by new_install.
# Unedited means the file's blob equals one a declaring release held there.
release_leftovers() {
  local history=$1 new_install=$2 root=$3
  local path blob

  read_managed_files_declaration "${new_install}" > "${history}.current" || return 1
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
    release_leftovers "${history}" "${checkout}/install.sh" "$(dirname -- "${current_dest}")" \
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
    printf '%s: edited files at paths %s no longer declares in %s:\n%s\n' \
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
    printf '%s: removed files %s no longer declares from %s:\n' "${current_platform}" "${version}" "${root}"
    printf '%s\n' "${removed}" | sed 's/^/  /'
  done < <(all_destinations_for "${target}")
}
