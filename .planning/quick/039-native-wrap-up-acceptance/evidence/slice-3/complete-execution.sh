#!/usr/bin/env bash
# Author Trim names execution as complete; leave retrospective unfinished.
# Usage: complete-execution.sh <fixture>
# shellcheck disable=SC2312
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <fixture>" >&2
  exit 2
fi

FIXTURE=$(cd -- "$1" && pwd -P)
PLAN="${FIXTURE}/planning/plans/trim-names.md"
SEED="${FIXTURE}/planning/seeds/SEED-001-greeting.md"
[[ -f ${PLAN} ]]
[[ -f ${SEED} ]]

python3 - "${PLAN}" "${SEED}" << 'PY'
from pathlib import Path
import sys

plan = Path(sys.argv[1])
seed = Path(sys.argv[2])
text = plan.read_text()
if "## Retrospective" in text or "EXECUTION RETROSPECTIVE COMPLETE" in text:
    raise SystemExit("retrospective already recorded; leave it unfinished")
# Mark only the remaining planned Trim names slice done.
old = """### 2. Confirm Guest default remains when the name argument is omitted

Type: Behavior
Status: planned
Behavior: omitting the name argument still prints "Hello, Guest!".
Proof:
  command: node --test test/greet.test.mjs
  covers: no-argument default ("Hello, Guest!")
  result: pending
"""
new = """### 2. Confirm Guest default remains when the name argument is omitted

Type: Behavior
Status: done
Behavior: omitting the name argument still prints "Hello, Guest!".
Proof:
  command: node --test test/greet.test.mjs
  covers: no-argument default ("Hello, Guest!")
  result: pass
Evidence: [cli-run.txt](trim-names/evidence/cli-run.txt)
"""
if old not in text:
    raise SystemExit("planned Trim names slice 2 not found")
plan.write_text(text.replace(old, new, 1))
seed_text = seed.read_text()
seed.write_text(seed_text.replace("**Status:** in progress", "**Status:** completed", 1))
PY

(cd -- "${FIXTURE}" && node --test test/greet.test.mjs)

git -C "${FIXTURE}" add planning/plans/trim-names.md \
  planning/seeds/SEED-001-greeting.md
if [[ -n $(git -C "${FIXTURE}" diff --cached --name-only) ]]; then
  git -C "${FIXTURE}" commit --quiet -m "Mark Trim names slices done"
fi
git -C "${FIXTURE}" rev-parse HEAD
if grep -Eq 'Status: complete|EXECUTION RETROSPECTIVE COMPLETE' "${PLAN}"; then
  echo "retrospective must stay unfinished" >&2
  exit 1
fi
if grep -Eq '^Status: planned$' "${PLAN}"; then
  echo "Trim names still has a planned slice" >&2
  exit 1
fi
