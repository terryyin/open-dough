#!/usr/bin/env bash
# shellcheck disable=SC2154 # Sourced fixture defines managed_files.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/public-payload-fixture.bash"

skill="${source_dir}/src/skills/dough-update/SKILL.md"
guide="${source_dir}/docs/installation-and-updates.md"

for managed_file in "${managed_files[@]}"; do
  grep -Fq -- "\`${managed_file}\`" "${guide}"
done

grep -Fq 'every client payload source they declare' "${skill}"
grep -Fq 'release-declared client payload paths' "${skill}"
grep -Fq 'payload skills may be added between releases' "${skill}"
grep -Fq 'payload declared by that recorded release' "${skill}"
grep -Fq 'Payload paths newly added by the release must be absent' "${skill}"
grep -Fq 'all installed payload paths' "${skill}"

if grep -Eq '(two|both) (declared client payload|managed files|installed payload)' \
  "${skill}" "${guide}"; then
  echo 'FAIL: client-payload guidance contains a stale fixed-cardinality boundary.' >&2
  exit 1
fi

echo 'PASS: updater guidance names the complete payload and does not narrow it with a stale file count.'
