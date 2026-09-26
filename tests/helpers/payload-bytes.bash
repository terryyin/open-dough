#!/usr/bin/env bash
# Compare or copy the declared payload in one process.
# Callers set source_dir and managed_files.
# shellcheck disable=SC2154

# Fall back to cmp or cp when Node is unavailable.
payload_bytes_transfer() {
  local mode=$1
  local source_root=$2
  local dest_root=$3
  local helper="${source_dir}/src/install/open-dough-payload-bytes.mjs"
  local managed_file directory
  local seen=$'\n'
  local -a directories=()

  if [[ ${mode} == copy ]]; then
    for managed_file in "${managed_files[@]}"; do
      directory=${managed_file%/*}
      [[ ${seen} == *$'\n'${directory}$'\n'* ]] && continue
      seen+=${directory}$'\n'
      directories+=("${dest_root}/${directory}")
    done
    mkdir -p -- "${directories[@]}"
  fi
  if [[ -f ${helper} ]] && command -v node > /dev/null 2>&1; then
    printf '%s\n' "${managed_files[@]}" | node "${helper}" "${mode}" \
      "${source_root}" "${dest_root}"
    return
  fi
  if [[ ${mode} == copy ]]; then
    for managed_file in "${managed_files[@]}"; do
      cp -- "${source_root}/${managed_file}" "${dest_root}/${managed_file}"
    done
    return 0
  fi
  for managed_file in "${managed_files[@]}"; do
    cmp -s "${source_root}/${managed_file}" "${dest_root}/${managed_file}" || return 1
  done
}

# Every declared file under dest_root has source_root's bytes. One process
# compares them all; only a difference walks the declaration with cmp, whose
# own report names the first differing file.
assert_payload_bytes_match() {
  local source_root=$1
  local dest_root=$2
  local managed_file

  if payload_bytes_transfer match "${source_root}" "${dest_root}"; then
    return 0
  fi
  for managed_file in "${managed_files[@]}"; do
    cmp "${source_root}/${managed_file}" "${dest_root}/${managed_file}" || return 1
  done
  echo "FAIL: payload bytes differ under ${dest_root}" >&2
  return 1
}

# The tagged tree's declared skills match dest_root byte for byte.
assert_tagged_payload_matches() {
  local candidate=$1
  local tag=$2
  local dest_root=$3
  local extract status=0
  extract=$(mktemp -d)
  git -C "${candidate}" archive "${tag}" src/skills > "${extract}.tar"
  tar -x -C "${extract}" -f "${extract}.tar"
  rm -f -- "${extract}.tar"
  payload_bytes_transfer match "${extract}/src/skills" "${dest_root}" || status=$?
  rm -rf -- "${extract}"
  return "${status}"
}
