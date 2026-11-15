#!/usr/bin/env bash
# Automated entry; explicit native acceptance is maintained in Distribution/evaluation/.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
exec bash "${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-context.sh" "$@"
