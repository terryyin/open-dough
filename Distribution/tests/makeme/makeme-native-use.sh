#!/usr/bin/env bash
# Interim routine-check entry; native implementation lives with its case family.
set -euo pipefail
wrapper_dir=$(dirname -- "${BASH_SOURCE[0]}")
wrapper_dir=$(cd -- "${wrapper_dir}" && pwd)
exec bash "${wrapper_dir}/../../evaluation/cases/makeme/makeme-native-use.sh" "$@"
