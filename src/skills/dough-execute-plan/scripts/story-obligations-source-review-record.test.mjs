import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import {
  fixture,
  holdings,
  obligation,
  reviewed,
  slicePlan,
  sourceReview,
} from "./story-obligations-test-fixtures.mjs";
import {
  check,
  list,
  refuses,
  refusesCommitment,
} from "./story-obligations-test-cli.mjs";

// The retained return's record form and the plan's link to it.

function unreadable(result) {
  assert.equal(result.ok, false);
  assert.ok(
    result.problems.some((item) => item.reason === "unreadable-source-review"),
    JSON.stringify(result),
  );
}

test("an unreadable or malformed return refuses instead of passing empty", (t) => {
  const { plan, writePlan, writeReview } = reviewed(t, [
    ["1", "Each row names its source", "slice two", ""],
  ]);
  refusesCommitment(check(plan), "malformed-commitment", "1");
  writeReview([]);
  unreadable(check(plan));
  writePlan(
    slicePlan("", { review: true }).replace(
      "source-review.md",
      "missing-review.md",
    ),
  );
  unreadable(check(plan));
  writeReview([["1", "Each row names its source", "slice 2", ""]]);
  writePlan(
    slicePlan("", { review: true }).replace(
      "**Source review:**",
      "**Source review:** [again](source-review.md)\n**Source review:**",
    ),
  );
  unreadable(check(plan));
});

test("each returned id has one row, one table header and one Commitments section", (t) => {
  const { plan, writeReview } = reviewed(t, [
    ["1", "Each row names its source", "slice 2", ""],
    ["1", "Each row names its source again", "slice 3", ""],
  ]);
  refusesCommitment(check(plan), "duplicate-commitment", "1");
  const review = join(dirname(plan), "source-review.md");
  writeReview([["1", "Each row names its source", "slice 2", ""]]);
  const valid = readFileSync(review, "utf8");
  writeFileSync(review, valid.replace(/^\| --- .*\n/m, ""));
  unreadable(check(plan));
  writeFileSync(
    review,
    `${valid}\n## Commitments\n\n| Id | Source commitment | Slice | Observation or obligation |\n| --- | --- | --- | --- |\n| 2 | Exit rows name it | slice 3 | |\n`,
  );
  unreadable(check(plan));
});

test("an unlinked source review beside the plan or a near-miss label is refused", (t) => {
  const { plan, writePlan } = fixture(t);
  writePlan(slicePlan(""));
  assert.deepEqual(check(plan, "--slice", "4"), { ok: true, entryCount: 0 });
  writeFileSync(
    join(dirname(plan), "source-review.md"),
    sourceReview([["1", "Unlinked", "slice 4", ""]]),
  );
  for (const args of [["--slice", "4"], ["--completion"], []])
    assert.deepEqual(check(plan, ...args), {
      ok: false,
      entryCount: 0,
      problems: [
        {
          reason: "unlinked-source-review",
          message:
            "source-review.md beside the plan is not linked by “**Source review:**”.",
        },
      ],
    });
  const listed = list(plan, "--slice", "4");
  assert.equal(listed.ok, false);
  assert.deepEqual(listed.entries, []);
  assert.deepEqual(
    listed.problems.map((item) => item.reason),
    ["unlinked-source-review"],
  );
  const linked = slicePlan("", { review: true });
  for (const label of [
    "**Source Review:** [source review](source-review.md)",
    "Source review: [source review](source-review.md)",
    "**Source review:** source-review.md",
  ]) {
    writePlan(
      linked.replace(
        "**Source review:** [source review](source-review.md)",
        label,
      ),
    );
    const result = check(plan);
    assert.equal(result.ok, false);
    assert.deepEqual(
      result.problems.map((item) => [item.reason, item.line]),
      [["unlinked-source-review", label]],
    );
  }
});

test("plans with neither a source review nor its label keep obligation-only results", (t) => {
  const { plan, writePlan } = fixture(t);
  writePlan(slicePlan(""));
  assert.deepEqual(check(plan, "--slice", "4"), { ok: true, entryCount: 0 });
  assert.deepEqual(check(plan, "--completion"), { ok: true, entryCount: 0 });
  assert.deepEqual(list(plan, "--slice", "4"), {
    ok: true,
    slice: 4,
    entries: [],
  });
  writePlan(slicePlan(obligation(holdings), { done: [1, 2, 3] }));
  const result = check(plan, "--slice", "4");
  assert.deepEqual(result, {
    ok: false,
    entryCount: 1,
    problems: [{ entry: "G1", reason: "open-obligation", slice: 4 }],
  });
  writePlan(
    slicePlan(`${obligation(holdings, "receiving slice 4")}\nCommitment: 1`),
  );
  refuses(check(plan), "unknown-commitment");
});
