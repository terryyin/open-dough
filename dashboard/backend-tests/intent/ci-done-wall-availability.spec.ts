// Exact unavailable endpoints are explained by the authenticated local reader.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { keepLandedCiHistory } from "../../tests/support/landedCiHistory.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
test.use({ serverMode: "boundary" });

test("an exact unavailable Done endpoint explains retention, absence and unknown local order without using the current endpoint", async ({
  dashboard,
  github,
}) => {
  const rev = (n: number) => n.toString(16).padStart(40, "0");
  const read = async (endpoint: number) => {
    const query = new URLSearchParams({
      source: "open-dough",
      intent: "ci-history",
      revision: rev(endpoint),
      through: "2026-11-05T10:00:00Z",
    });
    const response = await rawRequest({
      url: `${dashboard.origin}/__authenticated-read?${query}`,
      headers: { Origin: dashboard.origin },
    });
    expect(response.status).toBe(200);
    return JSON.parse(response.body) as {
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
  const before = github.calls.length;
  keepLandedCiHistory(dashboard.home, builder.please());
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
  keepLandedCiHistory(dashboard.home, onlyLater);
  expect(await read(0)).toMatchObject({
    selectedRevision: rev(0),
    availability: "outside-retention",
    reference: { endpoint: rev(0), sampleCount: 0 },
  });
  expect(github.calls).toHaveLength(before);
});
