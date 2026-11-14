#!/usr/bin/env bash
# Shared assertion that selected delivery/updated-use invoked ordinary no-URL
# dough-update. Sourced by host-specific updated-use proof helpers.
# shellcheck disable=SC2016 # Literal invocation marker.

assert_selected_update_omits_source_url() {
  local log=$1
  local host=${2-}
  local fail_prefix='FAIL:'

  if [[ -n ${host} ]]; then
    fail_prefix="FAIL: ${host}"
  fi
  if grep -Eq '\$dough-update[[:space:]]+(file://|https?://)' "${log}"; then
    echo "${fail_prefix} selected update prompt still supplied a source URL." >&2
    cat "${log}" >&2
    return 1
  fi
  if ! grep -Fq '$dough-update for an ordinary newer-release update' "${log}"; then
    echo "${fail_prefix} selected update prompt did not invoke dough-update without a source URL." >&2
    cat "${log}" >&2
    return 1
  fi
}
