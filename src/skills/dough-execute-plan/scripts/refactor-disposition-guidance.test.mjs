import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { markdownSection } from "../../../../tests/support/markdown-section.mjs";

// Guidance proof that delivery replaces the fresh refactor pass with a recorded
// disposition only for records-only changes and already-traced repairs, and
// that every other delivery keeps the whole-product pass. Per ADR 0005
// section 2 these assertions check meaning-bearing phrases, not exact
// sentences.

const read = (path) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
// Collapsed to single spaces so line wrapping does not affect matching.
const flat = (text) => text.replace(/\s+/g, " ");

const delivery = flat(
  markdownSection(
    read("dough-execute-plan/references/wrap-up.md"),
    "## Deliver the change",
  ),
);
const discovery = flat(
  markdownSection(
    read("dough-post-change-refactor/SKILL.md"),
    "## Discover scope",
  ),
);

test("delivery classifies the change once before spawning a refactor agent", () => {
  const classify = delivery.search(/Classify the uncommitted change once/i);
  const spawn = delivery.search(/spawn a fresh agent to run/i);
  assert.ok(classify !== -1, "delivery classifies the change");
  assert.ok(spawn > classify, "classification precedes the fresh agent");
});

test("a records-only change records the `records-only` disposition", () => {
  assert.match(delivery, /Record `records-only` when it touches only plans/i);
  for (const record of [
    "seeds",
    "backlog",
    "source reviews",
    "agent records",
    "DearDough",
    "maintainer findings",
  ]) {
    assert.ok(delivery.includes(record), `records-only covers ${record}`);
  }
});

test("an already-traced repair stays within the accepted return and names it", () => {
  assert.match(delivery, /within a slice's accepted refactor return/i);
  assert.match(
    delivery,
    /adding no representation, helper, dependency or path/i,
  );
  assert.match(delivery, /already-traced disposition naming that return/i);
  assert.match(delivery, /Either replaces the agent/i);
});

test("the disposition is retained beside the slice or in the quick delivery boundary", () => {
  assert.match(delivery, /retain the disposition beside the slice/i);
  assert.match(delivery, /quick delivery boundary/i);
  assert.match(
    delivery,
    /retain its delivery boundary in the execution conversation:[^.]*refactor disposition/i,
  );
});

test("any other or uncertain change gets the fresh full pass", () => {
  assert.match(delivery, /when unsure, spawn a fresh agent/i);
});

test("a triggered pass keeps whole-product reach", () => {
  assert.match(delivery, /triggered pass keeps whole-product reach/i);
});

test("the commit check accepts a disposition in place of the marker for those cases only", () => {
  assert.match(
    delivery,
    /require `## REFACTOR COMPLETE`[^;]*; only those two dispositions replace that marker/,
  );
  assert.match(delivery, /missing marker or disposition[^.]*prevents commit/i);
});

test("the next fresh pass receives and discovers the dispositions since the last pass", () => {
  assert.match(
    delivery,
    /Supply source[^.]*the dispositions since the last pass/i,
  );
  assert.match(discovery, /dispositions recorded since the last pass/i);
  assert.match(
    discovery,
    /committed changes are part of the change under review/i,
  );
});

test("guarded delivery starts after the refactor or its disposition", () => {
  assert.match(delivery, /independent refactor or disposition below/i);
  assert.match(
    flat(read("dough-execute-plan/references/fresh-increment.md")),
    /independent refactor, or recording its disposition/i,
  );
  assert.match(
    flat(read("dough-execute-plan/references/trunk-publication.md")),
    /refactor or its disposition/i,
  );
});
