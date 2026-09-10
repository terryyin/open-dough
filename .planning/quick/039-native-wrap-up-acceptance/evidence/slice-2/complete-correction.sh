#!/usr/bin/env bash
# Author the seedless correction as completed in the fixture. Not a native wrap-up.
# Usage: complete-correction.sh <fixture>
# shellcheck disable=SC2312
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <fixture>" >&2
  exit 2
fi

FIXTURE=$(cd -- "$1" && pwd -P)
PLAN="${FIXTURE}/planning/plans/remove-extra-greeting-prefix.md"
[[ -f ${PLAN} ]]

cat > "${FIXTURE}/src/greet.mjs" << 'EOF'
const name = (process.argv[2] ?? "Guest").trim();
console.log(`Hello, ${name}!`);
EOF

cat > "${FIXTURE}/test/greet.test.mjs" << 'EOF'
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
test("default greeting", () => {
  assert.equal(execFileSync(process.execPath, ["src/greet.mjs"], {encoding:"utf8"}), "Hello, Guest!\n");
});
test("trims surrounding whitespace from name", () => {
  assert.equal(execFileSync(process.execPath, ["src/greet.mjs", "  Ada  "], {encoding:"utf8"}), "Hello, Ada!\n");
});
test("preserves internal spaces in name", () => {
  assert.equal(execFileSync(process.execPath, ["src/greet.mjs", "Ada Lovelace"], {encoding:"utf8"}), "Hello, Ada Lovelace!\n");
});
EOF

python3 - "${PLAN}" << 'PY'
from pathlib import Path
import sys
path = Path(sys.argv[1])
text = path.read_text()
text = text.replace("Status: planned", "Status: done", 1)
text = text.replace("result: pending", "result: pass", 1)
if "## Retrospective" not in text:
    text += """

## Retrospective

Status: complete

The review finished with nothing to act on. No further follow-up plan
and no additional product advice.

## EXECUTION RETROSPECTIVE COMPLETE
"""
path.write_text(text)
PY

mkdir -p -- "${FIXTURE}/planning/plans/remove-extra-greeting-prefix/evidence"
printf '%s\n' 'node --test test/greet.test.mjs' \
  '# pass: prefix absent, trim, internal spaces, Guest default' \
  > "${FIXTURE}/planning/plans/remove-extra-greeting-prefix/evidence/cli-run.txt"

(cd -- "${FIXTURE}" && node --test test/greet.test.mjs)

git -C "${FIXTURE}" add src/greet.mjs test/greet.test.mjs \
  planning/plans/remove-extra-greeting-prefix.md \
  planning/plans/remove-extra-greeting-prefix/evidence/cli-run.txt
if [[ -n $(git -C "${FIXTURE}" diff --cached --name-only) ]]; then
  git -C "${FIXTURE}" commit --quiet -m "Complete extra greeting prefix correction"
fi
git -C "${FIXTURE}" rev-parse HEAD
