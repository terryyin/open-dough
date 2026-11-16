#!/usr/bin/env bash
# Cheap original-source checks exercise a real story-obligation quote through
# the installed parser. An empty listing bypasses source resolution and would
# miss an invalid story-home envelope.
#   delivery_evidence_check_source_quote SCRATCH WORKSPACE PLAN RETURNING RECEIVING < ENTRY
# ENTRY is one obligation section returned by slice RETURNING and received by
# slice RECEIVING. The plan is restored afterwards.

delivery_evidence_check_source_quote() {
  local scratch=$1 workspace=$2 plan=$3 returning=$4 receiving=$5
  cp -- "${workspace}/${plan}" "${scratch}/source-quote-plan"
  {
    printf '\n## Story obligations\n\n'
    cat
  } >> "${workspace}/${plan}"
  (
    cd -- "${workspace}" || exit
    node .claude/skills/dough-execute-plan/scripts/story-obligations.mjs list \
      --plan "${plan}" --slice "${receiving}"
    node .claude/skills/dough-execute-plan/scripts/story-obligations.mjs check \
      --plan "${plan}" --slice "${returning}"
  ) > "${scratch}/source-smoke.jsonl"
  node --input-type=module - "${scratch}/source-smoke.jsonl" "${receiving}" << 'JS'
import fs from 'node:fs';
import assert from 'node:assert/strict';
const [list, check] = fs.readFileSync(process.argv[2], 'utf8').trim().split('\n').map(JSON.parse);
assert.equal(list.ok, true);
assert.equal(list.entries.length, 1);
assert.equal(list.entries[0].disposition.slice, Number(process.argv[3]));
assert.deepEqual(check, { ok: true, entryCount: 1 });
JS
  cp -- "${scratch}/source-quote-plan" "${workspace}/${plan}"
}
