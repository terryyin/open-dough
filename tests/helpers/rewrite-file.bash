#!/usr/bin/env bash
# GNU sed treats `sed -i ''` as an in-place filename. Rewrite via a temp file.

rewrite_file() {
  local file=$1
  local staged
  shift
  staged=$(mktemp)
  sed "$@" -- "${file}" > "${staged}"
  mv -- "${staged}" "${file}"
}
