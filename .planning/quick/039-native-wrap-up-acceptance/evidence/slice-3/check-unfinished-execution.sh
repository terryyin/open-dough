#!/usr/bin/env bash
# Independent unfinished-execution refusal checks.
# Usage: check-unfinished-execution.sh <fixture> <before-snapshot> <transcript> <response> <log>
# shellcheck disable=SC1091,SC2034,SC2154,SC2312
set -euo pipefail

if [[ $# -ne 5 ]]; then
  echo "usage: $0 <fixture> <before-snapshot> <transcript> <response> <log>" >&2
  exit 2
fi

FIXTURE=$(cd -- "$1" && pwd -P)
BEFORE=$(cd -- "$2" && pwd -P)
TRANSCRIPT=$3
RESPONSE=$4
LOG=$5
EVIDENCE_DIR=$(cd -- "$(dirname -- "$0")" && pwd)
# shellcheck source=check-common.sh
source "${EVIDENCE_DIR}/check-common.sh"

: > "${LOG}"
note "Independent unfinished-execution wrap-up checks for ${FIXTURE}"
note "time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

if stream_complete "${TRANSCRIPT}"; then
  ok "transcript contains type=result"
else
  bad "transcript missing type=result"
fi
if claude_skill_used "${TRANSCRIPT}"; then
  ok "installed wrap-up skill was read or used"
else
  bad "no observed read/use of installed dough-story-wrap-up skill"
fi

no_wrap_up_complete_marker
report_mentions 'unfinished|still planned|planned slice|execution.*(not|incomplete|unfinished)|slice.*(planned|unfinished)|not complete' \
  'missing execution completion'

present planning/plans/trim-names.md
present planning/plans/trim-names/evidence/cli-run.txt
present planning/plans/formal-titles.md
present planning/seeds/SEED-001-greeting.md
present src/greet.mjs
if grep -Eq '^Status: planned$' "${FIXTURE}/planning/plans/trim-names.md"; then
  ok "Trim names still has a planned slice"
else
  bad "planned Trim names slice is gone"
fi
if grep -Eq '^## Trim names[[:space:]]*$' "${FIXTURE}/planning/seeds/SEED-001-greeting.md"; then
  ok "Trim names section remains in seed"
else
  bad "Trim names section deleted during unfinished execution"
fi
if grep -Fq 'Trim names' "${FIXTURE}/planning/PRODUCT-BACKLOG.md"; then
  ok "Trim names queue entry remains"
else
  bad "Trim names queue entry deleted during unfinished execution"
fi
if grep -Fq 'DD-001' "${FIXTURE}/DearDough.md"; then
  ok "Trim names DearDough occurrence remains"
else
  bad "Trim names DearDough occurrence deleted during unfinished execution"
fi

protected_bytes_identical
no_invented_seed
no_tombstone

note "summary: pass=${pass} fail=${fail}"
if [[ ${fail} -ne 0 ]]; then
  exit 1
fi
exit 0
