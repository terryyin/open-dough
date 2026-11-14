#!/usr/bin/env bash
# The catalog of versioned comparison cases (tests/native-comparison/<case>/):
# each case's selection traits, the `- trait: value` items of its case.md
# Selection section (workflow, hosts, prerequisites, decisions and proof,
# duration), for a maintainer choosing a case.
#
#   native_comparison_catalog SOURCE_DIR [TRAIT=TEXT]...
#     Prints each case whose every named trait contains TEXT (ignoring case):
#     its name, then one indented `trait: value` line per trait, with trait
#     names in lowercase kebab case (decisions-and-proof). Fails when no case
#     matches.

# One `trait: value` line per Selection item of case.md file $1.
native_comparison_catalog_traits() {
  awk '
    /^## / { inside = ($0 == "## Selection"); next }
    !inside { next }
    /^- [^:]+: / {
      if (line != "") print line
      key = substr($0, 3, index($0, ":") - 3); gsub(/ /, "-", key)
      line = tolower(key) ": " substr($0, index($0, ":") + 2)
      next
    }
    /^  +[^ ]/ && line != "" { sub(/^ +/, ""); line = line " " $0; next }
    { if (line != "") print line; line = "" }
    END { if (line != "") print line }
  ' "$1"
}

native_comparison_catalog() {
  local source_dir=$1 case_md name traits filter value text line found=1
  shift
  for case_md in "${source_dir}"/tests/native-comparison/*/case.md; do
    name=$(basename -- "$(dirname -- "${case_md}")")
    traits=$(native_comparison_catalog_traits "${case_md}")
    for filter in "$@"; do
      value=$(grep -i "^${filter%%=*}: " <<< "${traits}") || continue 2
      text=${filter#*=} value=${value#*: }
      [[ ${value,,} == *"${text,,}"* ]] || continue 2
    done
    printf '%s\n' "${name}"
    while IFS= read -r line; do
      printf '  %s\n' "${line}"
    done <<< "${traits}"
    found=0
  done
  return "${found}"
}
