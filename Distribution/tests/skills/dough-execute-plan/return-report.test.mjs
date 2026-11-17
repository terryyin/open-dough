// Guidance structure: a short verdict indexes a retained full report, and
// acceptance recovers only needed evidence. This does not prove agent compliance.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { markdownSection as section } from "../../support/markdown-section.mjs";

const skill = fileURLToPath(
  new URL("../../../src/skills/dough-execute-plan/", import.meta.url),
);
const read = (path) => readFileSync(join(skill, path), "utf8");
const report = read("references/return-report.md");
const verdict = section(
  report,
  "## Write the full report and return the verdict",
);
const detail = section(
  report,
  "## Return a targeted report with focused proof",
);
const acceptance = section(read("references/wrap-up.md"), "## Accept proof");
const prose = (text) => text.replace(/\s+/g, " ");

test("the short verdict covers each promise and points to the full report and run records", () => {
  assert.match(
    prose(verdict),
    /Before returning, write the full report in the \[evidence location\]\(proof-evidence\.md#evidence-location\)/,
  );
  assert.match(verdict, /Return a short verdict containing:/);
  assert.match(
    verdict,
    /each slice promise with its observation location and result, or its named gap/,
  );
  assert.match(verdict, /the changed paths/);
  assert.match(
    verdict,
    /the \[run records\]\(proof-evidence\.md#read-the-run-record\)/,
  );
  assert.match(verdict, /stops and consequential learnings/);
  assert.match(verdict, /the full report's path in the evidence location/);
  assert.match(
    prose(verdict),
    /every requirement in the targeted-return section below, including all proof detail and the consumer-trace record/,
  );
});

test("the full report keeps the original detailed proof and consumer trace requirements", () => {
  for (const requirement of [
    "the implemented outcome mapped to the slice promises",
    "owned changed paths and the product or behavior boundaries they change",
    "literal proof commands and concrete observation locations",
    "relevant setup and assertions or signals",
    "which tests or observations were actually selected versus the promises claimed as covered",
    "the observing assertion or signal that exercises it",
    "explicit untested / uncovered listing",
    "supplied effect terms and each affected purpose's boundary, proof type, observation or gap",
    "link the inspected setup and observing assertions",
    "support exclusions",
    "required observations still missing or explicitly untested, named as gaps",
    "for expensive proof, the retained or reconsidered decision",
    "uncovered promises, contradictions, and other evidence gaps",
    "only consequential learnings that affect acceptance or remaining work",
    "Use source paths plus named tests, symbols, assertions, or signals as locations",
    "When no setup is needed, say `none`",
    "Report uncovered behavior as incomplete implementation",
    "An equivalent layout that carries the same substantive evidence",
  ]) {
    assert.ok(prose(detail).includes(requirement), requirement);
  }
  assert.match(
    detail,
    /\[consumer-trace record\]\([^)]*executable-proof\.md#record-the-consumer-trace\)/,
  );
  for (const field of [
    "command",
    "covers",
    "boundary",
    "observations",
    "setup",
    "result",
  ]) {
    assert.match(detail, new RegExp(`\\b${field}:`));
  }
  assert.ok(detail.includes("`## REFACTOR COMPLETE` and `## PAUSED FOR CI`"));
  assert.match(detail, /return them verbatim/);
});

test("acceptance names an absent promise, report or record and reads only needed report and log parts", () => {
  assert.match(
    prose(acceptance),
    /A promise absent from the verdict, or a referenced report or run record missing from disk, is incomplete proof: return the slice naming the missing promise, report or record/,
  );
  assert.match(
    prose(acceptance),
    /Read from the report and logs only the parts the comparison below needs/,
  );
  assert.match(acceptance, /\[targeted retrieval\]\(disposable-research\.md\)/);
});

test("acceptance compares recorded checkout state and renews only edit-affected observations", () => {
  assert.match(
    prose(acceptance),
    /Compare each run record's `revision` and `uncommittedChanges` with the candidate checkout/,
  );
  assert.match(
    prose(acceptance),
    /Proof from before a later checkout edit covers the earlier state/,
  );
  assert.match(
    prose(acceptance),
    /obtain only the observation that edit affects, preserving unaffected accepted evidence/,
  );
});

test("delegation and acceptance reach the same return owner without a competing contract", () => {
  const pointer = section(
    read("references/delegation.md"),
    "## Return a targeted report with focused proof",
  );
  assert.match(pointer, /\[the return contract\]\(return-report\.md\)/);
  assert.doesNotMatch(pointer, /proof:|command:|consumer-trace record/);
  assert.match(acceptance, /\[the return contract\]\(return-report\.md\)/);
  const rows = read("SKILL.md").split("\n");
  for (const boundary of [
    "Before first implementation delegation",
    "Before accepting a return",
  ]) {
    const row = rows.find((line) => line.startsWith(`| ${boundary}`));
    assert.match(row, /\[return contract\]\(references\/return-report\.md\)/);
  }
});
