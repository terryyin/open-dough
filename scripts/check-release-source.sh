#!/usr/bin/env bash
# Read-only release preflight: refuses a source checkout whose shipped
# directory holds test material or unsafe entries, naming each path.
set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
source_dir=$(cd -- "${script_dir}/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=Distribution/src/install/open-dough-install-payload.sh
source "${source_dir}/Distribution/src/install/open-dough-install-payload.sh"

if [[ $# -gt 1 ]]; then
  echo "Usage: $0 [checkout]" >&2
  exit 1
fi
checkout=${1:-${source_dir}}
refuse_invalid_shipped_entries "${checkout}"
