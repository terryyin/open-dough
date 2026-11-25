// Exact unavailable endpoints are explained by the authenticated local reader.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  parseIntentCiHistoryRead,
  performIntentCiHistoryRead,
} from "../../server/intentCiHistoryRead.ts";
import { keepLandedCiHistory } from "../../test-support/support/landedCiHistory.ts";

const source = makeMe.aPublishedSource.openDough.please();
let home = "";

type DoneAvailabilityAnswer = {
  selectedRevision: string;
  availability: string;
  reference: {
    endpoint: string;
    averageMs?: number;
    sampleCount: number;
    difference?: unknown;
    evidence: { status: string; reason?: string }[];
  };
};

afterEach(() => {
  if (home !== "") rmSync(home, { recursive: true, force: true });
  home = "";
});

test("an exact unavailable Done endpoint explains retention, absence and unknown local order without using the current endpoint", async () => {
  home = mkdtempSync(path.join(tmpdir(), "ci-done-wall-availability-"));
  const rev = (n: number) => n.toString(16).padStart(40, "0");
  const read = async (endpoint: number) => {
    const query = new URLSearchParams({
      source: "open-dough",
      intent: "ci-history",
      revision: rev(endpoint),
      through: "2026-11-05T10:00:00Z",
    });
    const named = parseIntentCiHistoryRead(query);
    expect(named).toMatchObject({ kind: "intent-ci-history" });
    if (named?.kind !== "intent-ci-history")
      throw new Error("expected intent-ci-history read");
    const outcome = await performIntentCiHistoryRead(source, named, { home });
    expect(outcome).toMatchObject({ kind: "answered" });
    if (outcome.kind !== "answered")
      throw new Error("expected answered history");
    return outcome.answer as unknown as DoneAvailabilityAnswer;
  };
  const builder = makeMe.aLandedCiHistory.inTrunkOrder(
    [1, 2, 3, 4, 5, 6, 7].map(rev),
  );
  for (const n of [1, 2, 3, 4, 5, 7]) {
    builder.measuredLanding({
      receipt: String(n),
      revision: rev(n),
      receivedAt: "2026-11-05T10:00:00Z",
      runId: n,
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:01:40Z",
    });
    builder.proofFor(
      `run/${n}/1`,
      makeMe.aCiProof
        .forRun({ revision: rev(n), runId: n })
        .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
        .please(),
    );
  }
  await keepLandedCiHistory(home, builder.please());
  expect(await read(6)).toMatchObject({
    selectedRevision: rev(6),
    availability: "uncollected",
    reference: { endpoint: rev(6), sampleCount: 5, averageMs: 100000 },
  });
  const unknown = await read(8);
  expect(unknown).toMatchObject({
    selectedRevision: rev(8),
    availability: "order-unavailable",
    reference: { endpoint: rev(8), sampleCount: 0 },
  });
  expect(unknown.reference.averageMs).toBeUndefined();
  expect(
    unknown.reference.evidence.every(
      ({ reason }) =>
        reason === "Landing endpoint order unavailable from local Git evidence",
    ),
  ).toBe(true);
  const outside = await read(0);
  // Zero is a real pinned commit id here, but absent from the retained order.
  expect(outside.availability).toBe("order-unavailable");
  const onlyLater = makeMe.aLandedCiHistory
    .inTrunkOrder([0, 1].map(rev))
    .measuredLanding({
      receipt: "later",
      revision: rev(1),
      receivedAt: "2026-11-05T10:00:00Z",
      runId: 1,
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:01:40Z",
    })
    .please();
  await keepLandedCiHistory(home, onlyLater);
  expect(await read(0)).toMatchObject({
    selectedRevision: rev(0),
    availability: "outside-retention",
    reference: { endpoint: rev(0), sampleCount: 0 },
  });
});
