#!/usr/bin/env bash
# Independent unfinished-retrospective refusal checks.
# Usage: check-unfinished-retrospective.sh <fixture> <before-snapshot> <transcript> <response> <log>
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
note "Independent unfinished-retrospective wrap-up checks for ${FIXTURE}"
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
report_mentions 'retrospective|review.*(unfinished|not|missing|incomplete)|unfinished.*(review|retrospective)' \
  'missing retrospective completion'

present planning/plans/trim-names.md
present planning/plans/trim-names/evidence/cli-run.txt
present planning/plans/formal-titles.md
present planning/seeds/SEED-001-greeting.md
if grep -Eq '^Status: planned$' "${FIXTURE}/planning/plans/trim-names.md"; then
  bad "Trim names still has a planned slice; execution should already be complete"
else
  ok "Trim names slices remain done"
fi
if grep -Eq 'Status: complete|EXECUTION RETROSPECTIVE COMPLETE' \
  "${FIXTURE}/planning/plans/trim-names.md"; then
  bad "retrospective completion was invented or recorded during refusal"
else
  ok "retrospective remains unfinished"
fi
if grep -Eq '^## Trim names[[:space:]]*$' "${FIXTURE}/planning/seeds/SEED-001-greeting.md"; then
  ok "Trim names section remains in seed"
else
  bad "Trim names section deleted during unfinished retrospective"
fi
if grep -Fq 'Trim names' "${FIXTURE}/planning/PRODUCT-BACKLOG.md"; then
  ok "Trim names queue entry remains"
else
  bad "Trim names queue entry deleted during unfinished retrospective"
fi

protected_bytes_identical
no_invented_seed
no_tombstone

note "summary: pass=${pass} fail=${fail}"
if [[ ${fail} -ne 0 ]]; then
  exit 1
fi
exit 0
