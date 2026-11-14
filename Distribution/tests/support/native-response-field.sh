#!/usr/bin/env bash
# The `response` field of a native observation: a host's response text, each
# line indented, so no line of the response reads as another observation
# field. Assessors judge the text itself, and a response-text counterexample
# changes only this field.

# Prints the `response` field for response file $1.
native_response_field_write() {
  printf 'response:\n'
  awk '{ print "  " $0 }' "$1" 2> /dev/null || true
}

# Prints the response text recorded in observations $1.
native_response_field_read() {
  awk '/^response:$/ { r = 1; next } r && /^  / { print substr($0, 3); next } { r = 0 }' "$1"
}

# A bounded quiet-response predicate shared by completion assessors. These
# acknowledgments are assessor examples, not required native wording. Callers
# still own operational proof and any attention judgment for their workflow.
native_response_is_minimal() {
  local details
  details=$(sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' \
    -e '/^$/d' <<< "$1")
  [[ -z ${details} ]] || {
    [[ ${details} != *$'\n'* ]] \
      && grep -Eiq '^(done|finished|complete)[.!]?$' <<< "${details}"
  }
}
