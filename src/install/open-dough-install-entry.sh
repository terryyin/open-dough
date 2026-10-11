#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2034 # Source entry establishes the install caller's context.
original_pwd=$(pwd -P)
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
source "${source_dir}/src/install/open-dough-install-payload.sh"
source "${source_dir}/src/install/open-dough-install-request.sh"
