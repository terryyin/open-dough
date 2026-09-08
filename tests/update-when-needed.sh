#!/usr/bin/env bash
# The focused all-tool scenario includes old-record upgrade and missing sibling
# restoration, which supersedes the retired single-root update assumptions.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
exec bash "${source_dir}/tests/install-all-tools.sh"
