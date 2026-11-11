#!/usr/bin/env bash
# Read declarations as data, including historical inline installers. Never
# source an installer or its fragment while inspecting a release.
read_payload_array() {
  awk '
    /^managed_files(\+)?=\(/ { in_payload = 1; next }
    in_payload && /^\)/ { closed = 1; in_payload = 0; next }
    in_payload {
      for (i = 1; i <= NF; i++) {
        if ($i !~ /^[a-zA-Z0-9_.\/-]+$/) invalid = 1
        print $i
      }
    }
    END { exit !(closed && !in_payload && !invalid) }
  ' "$1"
}

read_managed_files_declaration() {
  local install_script=$1
  local declared fragment
  if ! declared=$(read_payload_array "${install_script}"); then
    echo "Cannot read managed payload declaration: ${install_script}" >&2
    return 1
  fi
  if grep -Fq '/src/install/open-dough-execution-payload.sh"' "${install_script}"; then
    fragment="$(dirname -- "${install_script}")/src/install/open-dough-execution-payload.sh"
    if ! fragment=$(read_payload_array "${fragment}"); then
      echo "Cannot read execution payload declaration: ${install_script}" >&2
      return 1
    fi
    declared="${declared}"$'\n'"${fragment}"
  fi
  if [[ $'\n'${declared}$'\n' != *$'\n'dough-update/SKILL.md$'\n'* ]]; then
    echo "Cannot read managed payload declaration: ${install_script}" >&2
    return 1
  fi
  printf '%s\n' "${declared}"
}
