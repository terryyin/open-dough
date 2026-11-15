#!/usr/bin/env bash
# Shared installed Codex-use fixture and tagged-payload preflight.
# shellcheck disable=SC2034,SC2154 # Caller supplies helpers and consumes paths.

temporary_dir=$(mktemp -d)
output_file=''
transcript=''
finish() {
  local status=$?
  if ((status != 0)); then
    [[ ! -f ${output_file} ]] || cat "${output_file}" >&2
    [[ ! -f ${transcript} ]] || cat "${transcript}" >&2
  fi
  rm -rf -- "${temporary_dir}"
  exit "${status}"
}
trap finish EXIT
candidate="${temporary_dir}/exact tagged source"
target="${temporary_dir}/installed ADR-awareness target"
build_current_tagged_release_fixture "${candidate}"
prepare_installed_adr_awareness_codex_target "${target}" "${candidate}"
version=$(cat "${source_dir}/VERSION")
tag="v${version}"
installed_version=$(cat "${target}/.agents/skills/dough-update/VERSION")
assert_tagged_adr_awareness_payload \
  "${candidate}" "${tag}" "${target}" "${installed_version}" "${version}"
