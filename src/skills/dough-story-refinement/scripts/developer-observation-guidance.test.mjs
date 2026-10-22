import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { markdownSection } from "../../../../tests/support/markdown-section.mjs";

// Guidance proof that a developer-operated observation is requested only for an
// open question, and that acceptance reuses a retained native baseline whose
// question is answered. Per ADR 0005 section 2 these assertions check
// meaning-bearing phrases, not exact sentences.

const read = (path) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
// Collapsed to single spaces so line wrapping does not affect matching.
const flat = (text) => text.replace(/\s+/g, " ");

const heading = "## Plan and reuse developer-operated observation";

const section = () =>
  flat(
    markdownSection(
      read("dough-story-refinement/references/executable-proof.md"),
      heading,
    ),
  );

test("a developer round is requested only for a question still held open", () => {
  assert.match(
    section(),
    /request a developer round only for a question the plan or acceptance still holds open/i,
  );
});

test("baseline correspondence is the live-action decision's rule, cited not restated", () => {
  assert.match(
    section(),
    /\(\.\.\/\.\.\/dough-execute-plan\/references\/execution-decisions\.md#require-current-regression-proof-before-a-live-action\)/,
  );
  assert.match(section(), /retained native baseline/i);
  assert.match(section(), /renders unchanged/i);
});

test("the changed detail is proved at the emitted source and both are named in acceptance", () => {
  assert.match(
    section(),
    /changed detail[^.]*regression at the emitted source/i,
  );
  assert.match(
    section(),
    /acceptance record names the reused baseline and that regression/i,
  );
  assert.match(section(), /no developer round/i);
});

test("a change to what the path consults or does reopens only that path's question", () => {
  assert.match(section(), /what the observed path consults or does/i);
  assert.match(section(), /reopens only that path's question/i);
  assert.match(section(), /one fresh observation bounded to it/i);
  assert.match(section(), /baseline stays reused for what it still covers/i);
});

test("a promise the baseline never observed stays the same unproved promise", () => {
  assert.match(
    section(),
    /never observed stays reported as the same unproved promise, not a reason to replay/i,
  );
});

test("retained baselines use the plan's existing retained-proof fields", () => {
  assert.match(section(), /\(planning\.md#write-an-executable-plan\)/);
  assert.match(section(), /retained-proof fields/i);
  assert.match(section(), /revision and settings it observed under/i);
  assert.match(section(), /no other evidence format/i);
});

test("acceptance sends a return with developer-operated proof to the section", () => {
  const acceptance = flat(
    markdownSection(
      read("dough-execute-plan/references/wrap-up.md"),
      "## Accept proof",
    ),
  );
  assert.match(
    acceptance,
    /proof includes a developer-operated observation[^.]*\(\.\.\/\.\.\/dough-story-refinement\/references\/executable-proof\.md#plan-and-reuse-developer-operated-observation\)/i,
  );
});
