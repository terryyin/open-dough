#!/usr/bin/env bash
# Interim routine catalog-check entry; comparison implementation is maintained separately.
set -euo pipefail
wrapper_dir=$(dirname -- "${BASH_SOURCE[0]}")
wrapper_dir=$(cd -- "${wrapper_dir}" && pwd)
exec bash "${wrapper_dir}/../../evaluation/src/native-comparison.sh" "$@"
