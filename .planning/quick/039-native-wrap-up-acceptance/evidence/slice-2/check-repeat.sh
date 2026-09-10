#!/usr/bin/env bash
# Independent repeat-predecessor checks while the follow-up is still active.
# Usage: check-repeat.sh <fixture> <after-predecessor-snapshot> <transcript> <response> <log>
# shellcheck disable=SC1091,SC2034,SC2154,SC2312
set -euo pipefail

if [[ $# -ne 5 ]]; then
  echo "usage: $0 <fixture> <after-predecessor-snapshot> <transcript> <response> <log>" >&2
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
note "Independent repeat predecessor wrap-up checks for ${FIXTURE}"
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
if [[ -f ${FIXTURE}/planning/seeds/SEED-001-greeting.md ]]; then
  if grep -Eq '^## Trim names[[:space:]]*$' "${FIXTURE}/planning/seeds/SEED-001-greeting.md"; then
    bad "repeat recreated Trim names history in the seed"
  else
    ok "repeat did not recreate Trim names history"
  fi
fi

present planning/plans/remove-extra-greeting-prefix.md
no_invented_seed

if [[ -f ${FIXTURE}/planning/PRODUCT-BACKLOG.md ]]; then
  follow_count=$(grep -c 'remove-extra-greeting-prefix.md' "${FIXTURE}/planning/PRODUCT-BACKLOG.md" || true)
  if [[ ${follow_count} -eq 1 ]]; then
    ok "repeat did not duplicate the follow-up queue entry"
  else
    bad "repeat duplicated or dropped the follow-up: count=${follow_count}"
  fi
  items=()
  while IFS= read -r item; do
    items+=("${item}")
  done < <(backlog_items)
  note "queue items (${#items[@]}):"
  for item in "${items[@]}"; do
    note "  - ${item}"
  done
  if [[ ${#items[@]} -ge 1 ]] && printf '%s\n' "${items[0]}" | grep -Fq 'remove-extra-greeting-prefix.md'; then
    ok "follow-up remains first"
  else
    bad "repeat changed follow-up-first order"
  fi
  if grep -Fq 'Trim names' "${FIXTURE}/planning/PRODUCT-BACKLOG.md"; then
    bad "repeat recreated Trim names queue history"
  else
    ok "Trim names queue history still absent"
  fi
else
  bad "backlog missing"
fi

if [[ -f ${BEFORE}/hashes.txt ]]; then
  after_plan=$(shasum -a 256 "${FIXTURE}/planning/plans/remove-extra-greeting-prefix.md" | awk '{print $1}')
  before_plan=$(awk '/remove-extra-greeting-prefix.md/{print $1}' "${BEFORE}/hashes.txt")
  if [[ ${after_plan} == "${before_plan}" ]]; then
    ok "correction plan bytes unchanged by the repeat"
  else
    note "NOTE: correction plan bytes changed on repeat; inspecting for recreated predecessor links"
    if grep -Eq '\]\(\.?/?trim-names\.md|\]\(\.?/?trim-names/evidence' \
      "${FIXTURE}/planning/plans/remove-extra-greeting-prefix.md"; then
      bad "repeat restored live predecessor locators"
    fi
  fi
fi

note "summary: pass=${pass} fail=${fail}"
if [[ ${fail} -ne 0 ]]; then
  exit 1
fi
exit 0
