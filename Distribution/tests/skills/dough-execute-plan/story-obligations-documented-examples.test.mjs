// The record format's documented examples, run through the obligations reader
// and CLI, so the documented form stays one the tools accept.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readStoryObligations } from "../../../src/skills/dough-execute-plan/scripts/story-obligations.mjs";
import { fixture, slicePlan } from "./story-obligations-test-fixtures.mjs";
import { check, list, refuses } from "./story-obligations-test-cli.mjs";

const reference = (name) =>
  readFileSync(
    new URL(
      `../../../src/skills/dough-execute-plan/references/${name}`,
      import.meta.url,
    ),
    "utf8",
  );
const obligations = reference("story-obligations.md");
const example = /```markdown\n([\s\S]*?)\n```/.exec(obligations)?.[1];
assert.ok(example, "the record format has an executable Markdown example");
const entries = example.replace(/^## Story obligations\s*/, "");
const documentedStory = {
  story: "Each result names its source, so the owner can inspect its basis.",
  clause: "Each result names its source",
  reported: "The results panel renders results without their source.",
  reportedSlice: 4,
};

test("the documented obligation is read, listed, and blocks commit until proved", (t) => {
  const { plan, writePlan } = fixture(t, documentedStory);
  writePlan(slicePlan(entries));
  const parsed = readStoryObligations(readFileSync(plan, "utf8"));
  assert.deepEqual(parsed.problems, []);
  assert.deepEqual(parsed.entries, [
    {
      id: "G1",
      title: "Results panel omits the source",
      reportedSlice: 4,
      reported: documentedStory.reported,
      storyClause: documentedStory.clause,
      disposition: { type: "return", open: true },
    },
  ]);
  assert.deepEqual(list(plan, "--slice", "4").entries, parsed.entries);
  refuses(check(plan, "--slice", "4"), "open-obligation");
  refuses(check(plan, "--completion"), "open-obligation");
  writePlan(
    slicePlan(
      entries.replace(
        "Disposition: return",
        "Disposition: proved by slice 4: result-source.test.mjs",
      ),
      { done: [4] },
    ),
  );
  assert.equal(check(plan, "--slice", "4").ok, true);
  assert.equal(check(plan, "--completion").ok, true);
});
