#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Shared fixture helpers supply and consume globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
source "${source_dir}/Distribution/evaluation/cases/product-backlog/product-backlog-native-guard.sh"
source "${source_dir}/Distribution/evaluation/cases/product-backlog/product-backlog-native-guard-cursor.sh"
source "${source_dir}/Distribution/tests/support/product-backlog-native-checks.sh"

guard_run_deterministic "${source_dir}"
