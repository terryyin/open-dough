#!/usr/bin/env bash
# Independent correction-closure checks by plan identity.
# Usage: check-correction-wrap-up.sh <fixture> <before-snapshot> <transcript> <response> <log>
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
note "Independent correction wrap-up checks for ${FIXTURE}"
note "time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

if stream_complete "${TRANSCRIPT}"; then
  ok "transcript contains type=result"
else
  bad "transcript missing type=result"
fi
if cursor_skill_used "${TRANSCRIPT}"; then
  ok "installed wrap-up skill was read or used"
else
  bad "no observed read/use of installed dough-story-wrap-up skill"
fi

absent planning/plans/remove-extra-greeting-prefix.md
absent planning/plans/trim-names.md
no_invented_seed

if [[ -f ${FIXTURE}/planning/seeds/SEED-001-greeting.md ]]; then
  if grep -Eqi 'Remove extra greeting prefix' "${FIXTURE}/planning/seeds/SEED-001-greeting.md"; then
    bad "correction wrap-up invented a seed section for the correction"
  else
    ok "no seed invented for the closed correction"
  fi
  if grep -Eq '^## Formal titles[[:space:]]*$' "${FIXTURE}/planning/seeds/SEED-001-greeting.md"; then
    ok "Formal titles remains in the seed"
  else
    bad "Formal titles missing from the seed"
  fi
else
  bad "seed file missing"
fi

if [[ -f ${FIXTURE}/planning/PRODUCT-BACKLOG.md ]]; then
  if grep -Fq 'remove-extra-greeting-prefix.md' "${FIXTURE}/planning/PRODUCT-BACKLOG.md"; then
    bad "closed correction still in the queue"
  else
    ok "closed correction absent from the queue"
  fi
  if grep -Fq 'Trim names' "${FIXTURE}/planning/PRODUCT-BACKLOG.md"; then
    bad "Trim names history reappeared in the queue"
  else
    ok "Trim names still absent from the queue"
  fi
  items=()
  while IFS= read -r item; do
    items+=("${item}")
  done < <(backlog_items)
  note "queue items (${#items[@]}):"
  for item in "${items[@]}"; do
    note "  - ${item}"
  done
  if [[ ${#items[@]} -eq 1 ]] && printf '%s\n' "${items[0]}" | grep -Fq 'Formal titles'; then
    ok "Formal titles is the remaining queue entry"
  else
    bad "Formal titles is not the single remaining queue entry"
  fi
  if [[ -f ${BEFORE}/direction.txt ]] && direction_unchanged; then
    ok "near-future direction bytes unchanged"
  else
    bad "near-future direction bytes changed"
  fi
else
  bad "backlog missing"
fi

if [[ -f ${FIXTURE}/DearDough.md ]] && grep -Fq 'DD-002' "${FIXTURE}/DearDough.md"; then
  ok "unrelated DearDough text remains"
else
  bad "unrelated DearDough text missing"
fi

present src/greet.mjs
present test/greet.test.mjs
if grep -Fq 'Hey Hello' "${FIXTURE}/src/greet.mjs"; then
  bad "completed correction product lost the prefix removal"
else
  ok "completed correction product still has no extra prefix"
fi

no_tombstone
if links_resolve; then
  ok "remaining Markdown links resolve; no live link to a removed path"
else
  bad "broken remaining Markdown links"
fi

before_cleanup=$(extract_before_cleanup)
note "correction before-cleanup commit: ${before_cleanup}"
printf '%s\n' "${before_cleanup}" > "$(dirname -- "${LOG}")/before-cleanup.txt"
if git -C "${FIXTURE}" cat-file -t "${before_cleanup}" > /dev/null 2>&1; then
  if git -C "${FIXTURE}" show "${before_cleanup}:planning/plans/remove-extra-greeting-prefix.md" > /dev/null 2>&1; then
    ok "git show recovers the correction plan from ${before_cleanup}"
  else
    bad "git show cannot recover the correction plan from ${before_cleanup}"
  fi
else
  bad "correction before-cleanup revision is not a Git object: ${before_cleanup}"
fi

note "summary: pass=${pass} fail=${fail}"
if [[ ${fail} -ne 0 ]]; then
  exit 1
fi
exit 0
