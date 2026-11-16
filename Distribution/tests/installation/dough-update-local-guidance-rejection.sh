#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Shared fixture helpers supply and consume globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck source=Distribution/tests/helpers/public-payload-fixture.bash
source "${source_dir}/Distribution/tests/helpers/public-payload-fixture.bash"
source "${source_dir}/Distribution/tests/helpers/release-fixture.bash"
source "${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-proof.sh"

platform=codex
skill_root='.agents/skills'

updater="${source_dir}/Distribution/src/skills/dough-update/SKILL.md"
unsupported='Local-guidance replacement is not supported by dough-update.'
ordinary_update='Ordinary Open Dough release updates remain available from the recorded source.'
grep -Fxq "${unsupported}" "${updater}"
grep -Fxq "${ordinary_update}" "${updater}"
if grep -Eq 'Assessment before replacement|Retain adopter context before cleanup|Switch callers and remove the redundant original' \
  "${updater}"; then
  echo 'FAIL: the updater still routes reusable local-guidance replacement.' >&2
  exit 1
fi

source "${source_dir}/Distribution/evaluation/cases/installation/dough-update-local-guidance-fixture.sh"
