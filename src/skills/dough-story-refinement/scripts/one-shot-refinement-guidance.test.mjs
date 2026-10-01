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

test("selected default checkout refinement keeps that checkout's content and lands through Dough Land", () => {
  const direct = section(reference, "## Refine in the default checkout");
  assert.match(direct, /`--default-main`/);
  assert.match(direct, /actual\s+path and current branch/);
  assert.match(direct, /nothing is\s+reset, refreshed, created, or published/);
  assert.match(direct, /need no clean checkout or confirmation/);
  assert.match(direct, /all checkout content is committed together/);
  const land = section(reference, "## Land or discard on request");
  assert.match(land, /Dough Land[\s\S]+keeps the checkout in place/);
});

test("selected automatic landing lands the refinement as a keep after an ownership recheck, leaving the story queued", () => {
  const review = section(reference, "## Stop for review");
  assert.match(review, /Unless automatic landing was selected/);
  const auto = section(reference, "## Land automatically when selected");
  assert.match(auto, /`--auto-land\s+--push-authorized`/);
  assert.match(auto, /`landing: "auto-land"`/);
  assert.match(auto, /never selects automatic landing/);
  assert.match(auto, /no decision you need from the\s+developer remains open/);
  assert.match(auto, /ownership recheck included/);
  assert.match(
    auto,
    /neither Takes nor completes it, and starts no CI observer/,
  );
  assert.match(auto, /`ownership-changed`[\s\S]+Push nothing more/);
  const land = section(reference, "## Land or discard on request");
  assert.match(land, /preparation-assignment\.mjs recheck/);
  assert.match(land, /retry after a rejected push/);
  assert.match(land, /`ownership-changed`[\s\S]+push nothing/);
  assert.match(land, /from the same commit/);
});
