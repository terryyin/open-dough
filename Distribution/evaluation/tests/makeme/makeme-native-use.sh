#!/usr/bin/env bash
# Credential-free automated checks; explicit native options use the case entry.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329
set -Eeuo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
if (($#)); then
  exec bash "${source_dir}/Distribution/evaluation/cases/makeme/makeme-native-use.sh" "$@"
fi
log=$(mktemp)
trap 'rm -f "${log}"' EXIT
if node --test "${source_dir}/Distribution/evaluation/tests/makeme/makeme-native-harness.test.mjs" \
  "${source_dir}/Distribution/evaluation/tests/makeme/makeme-native-refactor-harness.test.mjs" > "${log}" 2>&1; then
  exit 0
fi
cat -- "${log}" >&2
exit 1
