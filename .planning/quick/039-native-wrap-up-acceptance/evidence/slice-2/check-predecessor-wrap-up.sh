#!/usr/bin/env bash
# Independent predecessor-closure checks. Does not trust native self-report.
# Usage: check-predecessor-wrap-up.sh <fixture> <before-snapshot> <transcript> <response> <log>
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
note "Independent predecessor wrap-up checks for ${FIXTURE}"
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

absent planning/plans/trim-names.md
absent planning/plans/trim-names/evidence/cli-run.txt
if [[ -e ${FIXTURE}/planning/plans/trim-names ]]; then
  if find "${FIXTURE}/planning/plans/trim-names" -type f | grep -q .; then
    bad "spent evidence directory still has files"
  else
    ok "spent evidence directory empty or absent of files"
  fi
else
  ok "spent evidence directory absent"
fi

if [[ -f ${FIXTURE}/planning/seeds/SEED-001-greeting.md ]]; then
  if grep -Eq '^## Trim names[[:space:]]*$' "${FIXTURE}/planning/seeds/SEED-001-greeting.md"; then
    bad "completed Trim names section still in seed"
  else
    ok "completed Trim names section absent from seed"
  fi
  if grep -Eq '^## Formal titles[[:space:]]*$' "${FIXTURE}/planning/seeds/SEED-001-greeting.md"; then
    ok "sibling Formal titles remains in seed"
  else
    bad "sibling Formal titles missing from seed"
  fi
else
  bad "seed file missing; sibling story cannot remain"
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
  bad "DearDough.md missing; unrelated log text cannot remain"
fi

present src/greet.mjs
present test/greet.test.mjs
present HUMAN.md
present planning/plans/remove-extra-greeting-prefix.md
if grep -Fq 'Hey Hello' "${FIXTURE}/src/greet.mjs"; then
  ok "correction was not executed during predecessor wrap-up"
else
  bad "wrap-up executed or altered the correction product"
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

if [[ -f ${FIXTURE}/planning/PRODUCT-BACKLOG.md ]]; then
  if grep -Fq 'Trim names' "${FIXTURE}/planning/PRODUCT-BACKLOG.md"; then
    bad "completed queue entry still mentions Trim names"
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
  if [[ ${#items[@]} -lt 2 ]]; then
    bad "queue does not retain Formal titles after the follow-up"
  else
    if printf '%s\n' "${items[0]}" | grep -Fq 'remove-extra-greeting-prefix.md'; then
      ok "follow-up queued first as a plan-identity link"
    else
      bad "follow-up is not first as a plan-identity link: ${items[0]}"
    fi
    if printf '%s\n' "${items[0]}" | grep -Eqi 'seeds/|SEED-'; then
      bad "follow-up first entry invents or uses a seed identity"
    else
      ok "first queue entry is not a seed identity"
    fi
    if printf '%s\n' "${items[0]}" | grep -Fq 'Formal titles'; then
      bad "product advice to put Formal titles first was applied"
    else
      ok "product advice to promote Formal titles was not applied"
    fi
    if printf '%s\n' "${items[1]}" | grep -Fq 'Formal titles'; then
      ok "Formal titles remains after the human-priority follow-up"
    else
      bad "Formal titles is not the next unrelated queue entry"
    fi
  fi
  follow_count=$(grep -c 'remove-extra-greeting-prefix.md' "${FIXTURE}/planning/PRODUCT-BACKLOG.md" || true)
  if [[ ${follow_count} -eq 1 ]]; then
    ok "follow-up queued once (canonical-home uniqueness)"
  else
    bad "follow-up queue mentions not unique: count=${follow_count}"
  fi
else
  bad "backlog missing"
fi

no_invented_seed
no_tombstone

plan=${FIXTURE}/planning/plans/remove-extra-greeting-prefix.md
if [[ -f ${plan} ]]; then
  for heading in \
    '## Source and provenance' \
    '## Beneficiary and bounded outcome' \
    '## Current findings and scope' \
    '## Preserved promises and genuine constraints' \
    '## Observable proof ownership' \
    '## Current decisions' \
    '## Slices'; do
    if grep -Fq "${heading}" "${plan}"; then
      ok "correction plan retains ${heading}"
    else
      bad "correction plan missing ${heading}"
    fi
  done
  if grep -Eq 'Status: planned' "${plan}"; then
    ok "correction slice remains planned (not executed by wrap-up)"
  else
    note "NOTE: correction plan status is not planned"
  fi
  if grep -Eq '\]\(\.?/?trim-names\.md|\]\(\.?/?trim-names/evidence' "${plan}"; then
    bad "correction plan still has a live predecessor path locator"
  else
    ok "correction plan has no live predecessor path locator"
  fi
  prov_sha=$(grep -Eo '\b[0-9a-f]{7,40}\b' "${plan}" | head -n 1 || true)
  if [[ -n ${prov_sha} ]] && grep -Fq 'planning/plans/trim-names.md' "${plan}"; then
    ok "provenance names a commit and predecessor repository-relative path"
    if git -C "${FIXTURE}" show "${prov_sha}:planning/plans/trim-names.md" > /dev/null 2>&1; then
      ok "git show recovers predecessor from rewritten provenance ${prov_sha}"
    else
      bad "rewritten provenance commit cannot recover planning/plans/trim-names.md"
    fi
  else
    bad "provenance was not rewritten to a before-cleanup commit plus path"
    note "plan provenance excerpt:"
    sed -n '1,20p' "${plan}" | tee -a "${LOG}"
  fi
else
  bad "correction plan missing; executable context not retained"
fi

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
    bad "README still carries spent story/plan identity"
  else
    ok "README has no spent Trim names identity phrases"
  fi
fi

note "summary: pass=${pass} fail=${fail}"
if [[ ${fail} -ne 0 ]]; then
  exit 1
fi
exit 0
