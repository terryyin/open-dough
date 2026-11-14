// The record format's documented examples, run through the obligations reader
// and CLI, so the documented form stays one the tools accept.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { readStoryObligations } from "./story-obligations.mjs";
import {
  fixture,
  holdings,
  obligation,
  reviewed,
  slicePlan,
} from "./story-obligations-test-fixtures.mjs";
import {
  check,
  list,
  refuses,
  refusesCommitment,
} from "./story-obligations-test-cli.mjs";

const reference = (name) =>
  readFileSync(new URL(`../references/${name}`, import.meta.url), "utf8");
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

test("the documented Commitments table allocates a lifecycle owner that checks list unobserved", (t) => {
  const table = /```markdown\n(## Commitments[\s\S]*?)\n```/.exec(
    obligations,
  )?.[1];
  assert.ok(table, "the source review has an executable Commitments example");
  const { plan, writePlan } = reviewed(t, []);
  const done = [1, 2, 3, 4, 5, 6];
  const g2 = obligation(holdings, "receiving slice 8", "G2");
  writePlan(
    slicePlan(g2, { done, indices: [1, 2, 3, 4, 5, 6, 7, 8], review: true }),
  );
  const writeTable = (source) =>
    writeFileSync(
      join(dirname(plan), "source-review.md"),
      `# Source review\n\n${source}\n`,
    );
  writeTable(table);
  // Slice 7 is about to finish: its own row needs an observation, the
  // target CI row does not and is listed as pending lifecycle.
  const result = check(plan, "--slice", "7");
  refusesCommitment(result, "unobserved-commitment", "7", { slice: 7 });
  assert.equal(result.problems.length, 1, JSON.stringify(result));
  assert.deepEqual(result.pendingLifecycle, [
    { id: "8", text: "Final target CI is settled", owner: "target CI" },
  ]);
  writeTable(
    table.replace(
      "| target CI | |",
      "| target CI | observed: branch CI run 42 |",
    ),
  );
  refusesCommitment(
    check(plan, "--slice", "6"),
    "observed-lifecycle-commitment",
    "8",
    { owner: "target CI" },
  );
});
