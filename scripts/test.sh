#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd -- "$source_dir"

status=0
while IFS= read -r -d '' test_file; do
  printf '\nRunning %s\n' "$test_file"
  if ! bash "$test_file"; then
    printf 'FAIL: %s\n' "$test_file" >&2
    status=1
  fi
done < <(find tests -type f -name '*.sh' -print0)

exit "$status"
