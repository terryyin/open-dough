#!/usr/bin/env bash
# Independent successful-closure checks for Trim names with Formal titles follow-up.
# Usage: check-closure.sh <fixture> <before-snapshot> <transcript> <response> <log>
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
note "Independent Trim names closure checks for ${FIXTURE}"
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

if [[ -f ${RESPONSE} ]] && grep -Fq '## STORY WRAP-UP COMPLETE' "${RESPONSE}"; then
  ok "wrap-up-complete marker present"
else
  note "NOTE: wrap-up-complete marker not in response; judging filesystem independently"
fi

absent planning/plans/trim-names.md
absent planning/plans/trim-names/evidence/cli-run.txt
present planning/plans/formal-titles.md
present planning/seeds/SEED-001-greeting.md
present src/greet.mjs
present test/greet.test.mjs

if [[ -f ${FIXTURE}/planning/seeds/SEED-001-greeting.md ]]; then
  if grep -Eq '^## Trim names[[:space:]]*$' "${FIXTURE}/planning/seeds/SEED-001-greeting.md"; then
    bad "completed Trim names section still in seed"
  else
    ok "completed Trim names section absent from seed"
  fi
  if grep -Eq '^## Formal titles[[:space:]]*$' "${FIXTURE}/planning/seeds/SEED-001-greeting.md"; then
    ok "Formal titles remains in seed"
  else
    bad "Formal titles missing from seed"
  fi
  if grep -Fq '**Active plan:** [Formal titles](../plans/formal-titles.md)' \
    "${FIXTURE}/planning/seeds/SEED-001-greeting.md"; then
    ok "Formal titles plan link remains the canonical home"
  else
    bad "Formal titles plan link missing from seed"
  fi
else
  bad "seed file missing"
fi

if [[ -f ${FIXTURE}/DearDough.md ]]; then
  if grep -Fq 'DD-001' "${FIXTURE}/DearDough.md" || grep -Fq 'Trim names plan' "${FIXTURE}/DearDough.md"; then
    bad "spent DearDough occurrence still present"
  else
    ok "spent DearDough occurrence absent"
  fi
  if grep -Fq 'DD-002' "${FIXTURE}/DearDough.md" && grep -Fq 'native Node' "${FIXTURE}/DearDough.md"; then
    ok "unrelated DearDough text remains"
  else
    bad "unrelated DearDough text missing"
  fi
else
  bad "DearDough.md missing"
fi

if [[ -f ${FIXTURE}/planning/PRODUCT-BACKLOG.md ]]; then
  if grep -Fq 'Trim names' "${FIXTURE}/planning/PRODUCT-BACKLOG.md"; then
    bad "completed Trim names queue entry still present"
  else
    ok "completed Trim names queue entry absent"
  fi
  items=()
  while IFS= read -r item; do
    items+=("${item}")
  done < <(backlog_items)
  note "queue items (${#items[@]}):"
  for item in "${items[@]}"; do
    note "  - ${item}"
  done
  if [[ ${#items[@]} -eq 1 ]]; then
    ok "queue has one remaining entry"
  else
    bad "queue does not have exactly one remaining entry: count=${#items[@]}"
  fi
  if [[ ${#items[@]} -ge 1 ]] && printf '%s\n' "${items[0]}" | grep -Fq 'Formal titles'; then
    ok "remaining queue entry is Formal titles"
  else
    bad "remaining queue entry is not Formal titles"
  fi
  if [[ ${#items[@]} -ge 1 ]] && printf '%s\n' "${items[0]}" | grep -Fq 'formal-titles.md'; then
    bad "Formal titles was duplicated as a plan-identity queue entry"
  else
    ok "queue does not add a duplicate Formal titles plan entry"
  fi
  if [[ ${#items[@]} -ge 1 ]] && printf '%s\n' "${items[0]}" | grep -Fq 'SEED-001-greeting.md'; then
    ok "Formal titles remains a story-home queue entry"
  else
    bad "Formal titles queue entry is not a story-home link"
  fi
  follow_count=$(grep -c 'Formal titles' "${FIXTURE}/planning/PRODUCT-BACKLOG.md" || true)
  if [[ ${follow_count} -eq 1 ]]; then
    ok "Formal titles queued once"
  else
    bad "Formal titles queue mentions not unique: count=${follow_count}"
  fi
else
  bad "backlog missing"
fi

if [[ -f ${FIXTURE}/planning/PRODUCT-BACKLOG.md && -f ${BEFORE}/direction.txt ]]; then
  if direction_unchanged; then
    ok "near-future direction bytes unchanged"
  else
    bad "near-future direction bytes changed"
  fi
else
  bad "cannot compare direction bytes"
fi

no_invented_seed
no_tombstone

if links_resolve; then
  ok "remaining Markdown links resolve; no live link to a removed path"
else
  bad "broken remaining Markdown links"
fi

before_cleanup=$(extract_before_cleanup)
note "before-cleanup commit: ${before_cleanup}"
printf '%s\n' "${before_cleanup}" > "$(dirname -- "${LOG}")/before-cleanup.txt"
if git -C "${FIXTURE}" cat-file -t "${before_cleanup}" > /dev/null 2>&1; then
  if git -C "${FIXTURE}" show "${before_cleanup}:planning/plans/trim-names.md" > /dev/null 2>&1; then
    ok "git show recovers planning/plans/trim-names.md from ${before_cleanup}"
  else
    bad "git show cannot recover planning/plans/trim-names.md from ${before_cleanup}"
  fi
  if git -C "${FIXTURE}" show "${before_cleanup}:planning/plans/trim-names/evidence/cli-run.txt" > /dev/null 2>&1; then
    ok "git show recovers spent evidence from ${before_cleanup}"
  else
    bad "git show cannot recover spent evidence from ${before_cleanup}"
  fi
else
  bad "before-cleanup revision is not a Git object: ${before_cleanup}"
fi

if [[ -f ${FIXTURE}/README.md ]]; then
  if grep -Ei 'trim names|SEED-001|trim-names\.md' "${FIXTURE}/README.md"; then
    bad "README still carries spent Trim names identity"
  else
    ok "README has no spent Trim names identity phrases"
  fi
fi

note "summary: pass=${pass} fail=${fail}"
if [[ ${fail} -ne 0 ]]; then
  exit 1
fi
exit 0
