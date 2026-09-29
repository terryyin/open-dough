#!/usr/bin/env bash
# Evidence-identity lines for the modules a native journey's commands run.
# Sourced by identity writers that also source native-result-identity.sh.
# shellcheck disable=SC2154 # source_dir comes from the sourcing check.

native_import_closure_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)

# One input-hash line per module in the relative-import closure of the given
# repository-relative modules: each module and every module it imports.
native_import_closure_input_hash_lines() {
  local closure
  local -a modules
  closure=$(node "${native_import_closure_dir}/native-import-closure.mjs" \
    "${source_dir}" "$@") || return
  mapfile -t modules <<< "${closure}"
  native_result_input_hash_lines "${modules[@]}"
}
