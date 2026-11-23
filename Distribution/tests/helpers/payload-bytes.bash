#!/usr/bin/env bash
# Compare the managed payload or set up a verified copy in one process.
# Callers set source_dir and managed_files.
# shellcheck disable=SC2154

# shellcheck source=Distribution/src/install/open-dough-platform.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/src/install/open-dough-platform.sh"

# Create the destination directories and verify the copied fixture payload.
copy_managed_payload() {
  local source_root=$1
  local dest_root=$2
  local managed_file directory
  local seen=$'\n'
  local -a directories=()

  for managed_file in "${managed_files[@]}"; do
    directory=${managed_file%/*}
    [[ ${seen} == *$'\n'${directory}$'\n'* ]] && continue
    seen+=${directory}$'\n'
    directories+=("${dest_root}/${directory}")
  done
  mkdir -p -- "${directories[@]}"
  payload_bytes_run copy-then-match "${source_root}" "${dest_root}" "${managed_files[@]}"
}

match_managed_payload() {
  payload_bytes_run match "$1" "$2" "${managed_files[@]}"
}

# Every managed file under dest_root has source_root's bytes. One process
# compares them all; only a difference walks the files with cmp, whose
# own report names the first differing file.
assert_payload_bytes_match() {
  local source_root=$1
  local dest_root=$2
  local managed_file

  if match_managed_payload "${source_root}" "${dest_root}"; then
    return 0
  fi
  for managed_file in "${managed_files[@]}"; do
    cmp "${source_root}/${managed_file}" "${dest_root}/${managed_file}" || return 1
  done
  echo "FAIL: payload bytes differ under ${dest_root}" >&2
  return 1
}

# The tagged tree's managed files match dest_root byte for byte.
assert_tagged_payload_matches() {
  local candidate=$1
  local tag=$2
  local dest_root=$3
  local extract status=0
  extract=$(mktemp -d)
  git -C "${candidate}" archive "${tag}" Distribution/src/skills > "${extract}.tar"
  tar -x -C "${extract}" -f "${extract}.tar"
  rm -f -- "${extract}.tar"
  match_managed_payload "${extract}/Distribution/src/skills" "${dest_root}" || status=$?
  rm -rf -- "${extract}"
  return "${status}"
}
