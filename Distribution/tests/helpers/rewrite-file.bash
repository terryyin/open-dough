#!/usr/bin/env bash
# GNU sed treats `sed -i ''` as an in-place filename. Rewrite via a temp file.

rewrite_file() {
  local file=$1
  local staged
  shift
  staged=$(mktemp)
  # BSD sed has no GNU -- end-of-options token. Keep the file last.
  sed "$@" "${file}" > "${staged}"
  mv -- "${staged}" "${file}"
}
