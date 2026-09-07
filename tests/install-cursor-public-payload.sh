#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2154 # The sourced fixture supplies managed_files.
set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=tests/helpers/public-payload-fixture.bash
source "${script_dir}/helpers/public-payload-fixture.bash"
bash "${script_dir}/support/assert-public-payload-install.sh" cursor \
  "${managed_files[@]}"
