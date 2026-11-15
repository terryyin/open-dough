#!/usr/bin/env bash
# Shared readers for observations.txt and other `key: value` records: one
# field's first word or whole value, harness detection.

# Value word after `KEY:` in FILE (every matching line, awk's $2).
native_observation_field() {
  awk -v key="$2" '$0 ~ "^" key ":" {print $2}' "$1"
}

# Whole value after `KEY: ` on FILE's first line that starts with it.
native_observation_value() {
  awk -v prefix="$2: " 'index($0, prefix) == 1 { print substr($0, length(prefix) + 1); exit }' "$1"
}

# Prints true when any FILE matches extended regex PATTERN (case-insensitive),
# else false.
native_harness_inspected() {
  local pattern=$1
  shift
  grep -Eiq "${pattern}" "$@" && echo true || echo false
}
