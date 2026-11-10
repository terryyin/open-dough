import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { historyEntries } from "../../dashboard/server/landedCiHistoryEntries.ts";
import { wallTimeReferenceOf } from "../../dashboard/server/ciWallTimeReference.ts";
import { landedCiHistorySchema } from "../../dashboard/src/landedCiHistory.ts";

test("the browser history boundary refuses malformed evidence, selected and span dates before rendering", () => {
  const builder = makeMe.aLandedCiHistory;
  const order = [];
  for (const n of [1, 2, 3, 4, 5, 6]) {
    const revision = n.toString(16).padStart(40, "0");
    const startedAt = `2026-11-0${n}T10:00:00Z`;
    order.push(revision);
    builder
      .measuredLanding({
        receipt: String(n),
        revision,
        receivedAt: startedAt,
        runId: n,
        startedAt,
        completedAt: new Date(Date.parse(startedAt) + 100000).toISOString(),
      })
      .proofFor(
        `run/${n}/1`,
        makeMe.aCiProof
          .forRun({ revision, runId: n })
          .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
          .please(),
      );
  }
  const history = builder.inTrunkOrder(order).please();
  const answer = {
    entries: historyEntries(history),
    reference: wallTimeReferenceOf(history),
  };
  assert.equal(landedCiHistorySchema.safeParse(answer).success, true);
  const reference = answer.reference;
  assert.ok(reference);
  const corruptions = [
    {
      path: ["reference", "evidence", 0, "date"],
      reference: {
        ...reference,
        evidence: reference.evidence.map((sample, index) =>
          index === 0 ? { ...sample, date: "not-a-date" } : sample,
        ),
      },
    },
    {
      path: ["reference", "selected", "date"],
      reference: {
        ...reference,
        selected: { ...reference.selected, date: "not-a-date" },
      },
    },
    {
      path: ["reference", "from"],
      reference: { ...reference, from: "not-a-date" },
    },
    {
      path: ["reference", "to"],
      reference: { ...reference, to: "not-a-date" },
    },
  ];
  for (const { path, reference: invalidReference } of corruptions) {
    // Exact malformed response bytes are the input under test, outside MakeMe.
    const invalid = { ...answer, reference: invalidReference };
    const parsed = landedCiHistorySchema.safeParse(invalid);
    assert.equal(parsed.success, false);
    assert.deepEqual(parsed.error.issues[0].path, path);
  }
});
