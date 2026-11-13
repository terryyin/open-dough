import assert from "node:assert/strict";
import { test } from "node:test";
import { parseIntentCiHistoryRead } from "../../dashboard/server/intentCiHistoryRead.ts";

// The glance capability (`history=glance`) is negotiated like the gap-reason
// one: a selected Done or scoped read names it at most once, with its only
// value; the project read keeps its full history and cannot ask for it.

test("a selected or scoped read may name the glance capability once; the project read keeps its full history", () => {
  const selected = {
    intent: "ci-history",
    revision: "b".repeat(40),
    through: "2026-11-02T00:00:00Z",
  };
  assert.deepEqual(
    parseIntentCiHistoryRead(
      new URLSearchParams({ ...selected, scope: "tests", history: "glance" }),
    ),
    {
      kind: "intent-ci-history",
      history: "glance",
      scope: "tests",
      revision: selected.revision,
      through: selected.through,
    },
  );
  assert.deepEqual(
    parseIntentCiHistoryRead(
      new URLSearchParams({
        ...selected,
        "gap-reasons": "timing-basis",
        history: "glance",
      }),
    ),
    {
      kind: "intent-ci-history",
      gapReasons: "timing-basis",
      history: "glance",
      revision: selected.revision,
      through: selected.through,
    },
  );
  for (const query of [
    new URLSearchParams({ ...selected, history: "full" }),
    new URLSearchParams({ ...selected, history: "" }),
    new URLSearchParams(
      `${new URLSearchParams(selected)}&history=glance&history=glance`,
    ),
    new URLSearchParams({ intent: "ci-history", history: "glance" }),
  ])
    assert.equal(parseIntentCiHistoryRead(query).kind, "refused");
});
