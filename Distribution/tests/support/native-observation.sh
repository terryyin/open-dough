#!/usr/bin/env bash
# Shared readers for observations.txt: one field value, harness detection.

# Value word after `KEY:` in FILE (every matching line, awk's $2).
native_observation_field() {
  awk -v key="$2" '$0 ~ "^" key ":" {print $2}' "$1"
}

# Prints true when any FILE matches extended regex PATTERN (case-insensitive),
# else false.
native_harness_inspected() {
  local pattern=$1
  shift
  grep -Eiq "${pattern}" "$@" && echo true || echo false
}
