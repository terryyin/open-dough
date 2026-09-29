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
