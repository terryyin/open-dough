import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { markdownSection } from "../../../../tests/support/markdown-section.mjs";

// Guidance proof that the consumer-trace record is the required trace evidence
// at delegation, acceptance and refactoring. Per ADR 0005 section 2 these
// assertions check meaning-bearing phrases, not exact sentences.

const read = (path) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
// Collapsed to single spaces so line wrapping does not affect matching.
const flat = (text) => text.replace(/\s+/g, " ");

const record = /consumer-trace record/i;
const script = /consumer-trace\.mjs/;
const disposition =
  /`run`, `reused`, or `excluded: <reason the effect does not reach its boundary>`/;

const tracePart = flat(
  markdownSection(
    read("dough-story-refinement/references/executable-proof.md"),
    "## Record the consumer trace",
  ),
);
const delegation = flat(read("dough-execute-plan/references/delegation.md"));
const acceptance = flat(
  markdownSection(
    read("dough-execute-plan/references/wrap-up.md"),
    "## Accept proof",
  ),
);
const refactorReturn = flat(
  markdownSection(
    read("dough-post-change-refactor/SKILL.md"),
    "## Return control",
  ),
);

test("the shared trace names the record as its evidence and the script as its producer", () => {
  assert.match(
    tracePart,
    /consumer-trace record is the evidence of the trace/i,
  );
  assert.match(
    tracePart,
    /node '<installed-execute-plan>\/scripts\/consumer-trace\.mjs' --checkout '<checkout>' --base <revision>/,
  );
  assert.match(tracePart, /whole checkout/i);
  assert.match(tracePart, disposition);
  // Effect terms the diff cannot carry are the agent's to supply.
  assert.match(tracePart, /retired behavior and altered preconditions/i);
});

test("the shared trace follows a located step, page object, helper or stand-in to its users (G1)", () => {
  assert.match(
    tracePart,
    /lists a step definition, page object, helper, or stand-in, add its step phrases or exported names[^.]*as `--term` and rerun until the journeys and callers using it are listed/i,
  );
});

test("a too-broad derived term is resupplied when it names the changed contract (G2)", () => {
  assert.match(
    tracePart,
    /derived term marked too broad lists no consumers; when it names the changed contract, resupply it as `--term`/i,
  );
});

test("delegation names the installed script and requires the record in the return", () => {
  assert.match(
    delegation,
    /trace the changed effect into its consumers with the installed \[consumer-trace script\]/i,
  );
  assert.match(
    delegation,
    /node '<installed-execute-plan>\/scripts\/consumer-trace\.mjs' --checkout '<checkout>' --base <revision>/,
  );
  const returnContract = flat(
    markdownSection(
      read("dough-execute-plan/references/delegation.md"),
      "## Return a targeted report with focused proof",
    ),
  );
  assert.match(returnContract, /rendered output, or shared text/i);
  assert.match(returnContract, record);
  assert.match(
    returnContract,
    /executable-proof\.md#record-the-consumer-trace/,
  );
  assert.match(
    returnContract,
    /supplied effect terms and every listed consumer's disposition/i,
  );
});

test("acceptance returns a slice without the record and refuses undispositioned consumers", () => {
  assert.match(acceptance, record);
  assert.match(acceptance, /executable-proof\.md#record-the-consumer-trace/);
  assert.match(
    acceptance,
    /rendered output, or shared text, return a slice without its \[consumer-trace record\]\([^)]*\) for the trace/i,
  );
  assert.match(
    acceptance,
    /Do not accept a record with a listed consumer lacking a disposition, or with an exclusion the effect reaches/i,
  );
  assert.match(acceptance, /compare the record's terms with the diff/i);
  assert.match(
    acceptance,
    /Do not accept or publish until proof for the record's unexcluded consumers[^.]*ran or was reused/i,
  );
});

test("the post-change-refactor return carries the same record for its edits", () => {
  assert.match(refactorReturn, record);
  assert.match(refactorReturn, script);
  assert.match(refactorReturn, /for your refactor edits/i);
  assert.match(refactorReturn, /each listed consumer's disposition/i);
});
