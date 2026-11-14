#!/usr/bin/env bash
# Forward callers of the previously released path to the relocated helper.
set -euo pipefail
repo_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
exec bash "${repo_root}/Distribution/src/install/open-dough-release.sh" "$@"
