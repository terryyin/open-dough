#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2154 # The sourced fixture supplies managed_files.
set -euo pipefail

test_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=Distribution/tests/helpers/public-payload-fixture.bash
source "${test_dir}/helpers/public-payload-fixture.bash"
# Cursor shares the Codex root. One install writes both native roots.
bash "${test_dir}/support/assert-public-payload-install.sh" cursor \
  "${managed_files[@]}"
