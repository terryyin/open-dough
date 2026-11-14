#!/usr/bin/env bash
# The supplier is complete before the ordinary execution starts. This schedule
# changes availability only; the consumer still owns its partial integration.
# shellcheck disable=SC1091,SC2034 # Sourced shared fixture and runner globals.
case_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "${case_dir}/../../support/native-comparison-supplier.sh"
case_events=''
case_empty_events=''
case_materialize() {
  local root=$1 setup
  supplier_case_materialize "$@" || return
  setup=$(mktemp -d "${root}/setup.XXXXXX")
  case_apply_event "${root}" nonqualifying "${setup}" \
    && case_apply_event "${root}" qualifying "${setup}" || return
  supplier_case_record_basis "${root}"
  supplier_case_execution_state "${root}/workspace" completed
  rm -rf -- "${setup}"
}
