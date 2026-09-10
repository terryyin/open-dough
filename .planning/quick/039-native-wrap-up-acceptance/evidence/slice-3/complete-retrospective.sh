#!/usr/bin/env bash
# Record a completed empty retrospective; keep Formal titles as the existing
# feature-story follow-up. Not a native wrap-up.
# Usage: complete-retrospective.sh <fixture>
# shellcheck disable=SC2312
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <fixture>" >&2
  exit 2
fi

FIXTURE=$(cd -- "$1" && pwd -P)
PLAN="${FIXTURE}/planning/plans/trim-names.md"
SEED="${FIXTURE}/planning/seeds/SEED-001-greeting.md"
FOLLOW="${FIXTURE}/planning/plans/formal-titles.md"
[[ -f ${PLAN} ]]
[[ -f ${SEED} ]]
[[ -f ${FOLLOW} ]]

python3 - "${PLAN}" << 'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()
if "## Retrospective" in text:
    raise SystemExit("retrospective already present")
text += """

## Retrospective

Status: complete
Result:

The review finished with nothing to act on. Formal titles remains the
existing feature-story follow-up; its plan is already linked from that
story. No product-review advice, no seedless correction, and no additional
human input.

## EXECUTION RETROSPECTIVE COMPLETE
"""
path.write_text(text)
PY

if ! grep -Fq '**Active plan:** [Formal titles](../plans/formal-titles.md)' "${SEED}"; then
  echo "Formal titles plan link missing from seed" >&2
  exit 1
fi

git -C "${FIXTURE}" add planning/plans/trim-names.md
if [[ -n $(git -C "${FIXTURE}" diff --cached --name-only) ]]; then
  git -C "${FIXTURE}" commit --quiet -m "Record Trim names empty retrospective"
fi
git -C "${FIXTURE}" rev-parse HEAD
