// One-shot refinement guidance: an explicit selection starts without an
// assignment or publication authority, records truthful preparation facts,
// commits the result in its workspace, and stops for review; an established
// preparation keeps its assignment.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { markdownSection as section } from "../../../../tests/support/markdown-section.mjs";

const skill = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(skill, path), "utf8");
const reference = read("references/one-shot-refinement.md");

test("refinement routes an explicit one-shot selection to its own start", () => {
  assert.match(
    read("SKILL.md"),
    /explicitly selects\s+one-shot \(`--one-shot`\)[\s\S]+\(references\/one-shot-refinement\.md\) instead of the\s+announcement step/,
  );
  assert.match(
    read("references/preparation-assignment.md"),
    /\[one-shot refinement\]\(one-shot-refinement\.md\) announce nothing/,
  );
  assert.match(reference, /never infer it from apparent smallness/);
  assert.match(
    reference,
    /established preparation[\s\S]+even when it also\s+names one-shot/,
  );
});

test("the one-shot start publishes nothing and needs no publication authority", () => {
  const start = section(reference, "## Start without an assignment");
  assert.match(start, /preparation-assignment\.mjs start --one-shot/);
  assert.doesNotMatch(start, /--push-authorized/);
  assert.match(start, /publishes nothing/);
  assert.match(start, /`not-ready` assessment does not stop the start/);
  assert.match(
    start,
    /`source-refused`[\s\S]+leave the story\s+to that holder/,
  );
});

test("the refined result records truthful facts, is committed, and waits for review", () => {
  const record = section(reference, "## Refine, record, and commit");
  assert.match(record, /record-preparation\.md/);
  assert.match(record, /refined alone is not ready/);
  assert.match(record, /plain `git commit` in the\s+workspace/);
  const review = section(reference, "## Stop for review");
  assert.match(review, /nothing is pushed or retired/);
  assert.match(review, /neither Taken nor completed/);
  assert.match(review, /no Preparing assignment/);
  const land = section(reference, "## Land or discard on request");
  assert.match(land, /explicit keep/);
  assert.match(land, /no assignment release to stage/);
});
