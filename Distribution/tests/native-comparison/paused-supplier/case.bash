#!/usr/bin/env bash
# The forced-turn schedule of the paused-supplier case; shared fixture and
# observation keep the same project and proof as the ordinary unblocked case.
# shellcheck disable=SC1091,SC2034 # Sourced shared fixture and runner globals.
case_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source "${case_dir}/../../support/native-comparison-supplier.sh"
case_events='unchanged nonqualifying qualifying'
case_empty_events='unchanged nonqualifying'
case_materialize() { supplier_case_materialize "$@"; }
