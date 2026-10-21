import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { readFeedbackReview } from "../../dashboard/src/feedbackReview.ts";

const block = (payload) =>
  ["```json dough-feedback-review", JSON.stringify(payload), "```"].join("\n");

const due = {
  schemaVersion: 1,
  reviewed: "2026-10-21",
  reviewAfter: "2026-10-25",
};

test("the published watch list carries its review and next due date", () => {
  const text = readFileSync(
    new URL("../../docs/maintainer/near-term-watch-list.md", import.meta.url),
    "utf8",
  );
  const review = readFeedbackReview(text);
  assert.equal(review.kind, "scheduled", review.reason);
  // Each review rewrites the dates, so assert the writer's rule, not a day:
  // the next review is due within seven calendar days of the last one.
  const days =
    (Date.parse(review.reviewAfter) - Date.parse(review.reviewed)) / 864e5;
  assert.ok(days > 0 && days <= 7, JSON.stringify(review));
});

test("a block after other text is read wherever it sits", () => {
  const text = `# Near-term watch list\n\nReviewed 2026-10-21.\n\n${block(due)}\n\n## ODF-1\n`;
  assert.deepEqual(readFeedbackReview(text), {
    kind: "scheduled",
    reviewed: "2026-10-21",
    reviewAfter: "2026-10-25",
  });
});

test("a watch list without a block has no due date", () => {
  assert.deepEqual(
    readFeedbackReview("# Near-term watch list\n\n```json\n{}\n```\n"),
    { kind: "absent" },
  );
});

test("an untrustworthy block is invalid with its reason", () => {
  const cases = [
    [`${block(due)}\n\n${block(due)}`, /2 blocks/],
    [block({ ...due, reviewAfter: "2026-02-30" }), /reviewAfter .* not a date/],
    [block({ ...due, reviewed: "2026-1-21" }), /reviewed .* not a date/],
    [block({ ...due, schemaVersion: 2 }), /schemaVersion 2/],
    [block({ ...due, reviewAfter: "2026-10-20" }), /before reviewed/],
    [
      '```json dough-feedback-review\n{"schemaVersion":1,\n```',
      /not valid JSON/,
    ],
    ["```json dough-feedback-review\n[]\n```", /not one JSON object/],
    ["```json dough-feedback-review\n{}\n", /not closed/],
  ];
  for (const [text, reason] of cases) {
    const review = readFeedbackReview(text);
    assert.equal(review.kind, "invalid", text);
    assert.match(review.reason, reason);
  }
});
