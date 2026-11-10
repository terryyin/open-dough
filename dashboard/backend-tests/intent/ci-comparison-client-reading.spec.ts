// Actual client owners and authenticated readers, with only HTTP held/replaced.
import { test, expect } from "../../tests/support/pageTest.ts";
import { preparedComparison } from "../../tests/support/comparisonMountFacts.ts";
import { otherComparedStory } from "../../tests/support/comparisonMountSelections.ts";
import { ciComparisonClient } from "../support/ciComparisonClient.ts";
import { heldResponse } from "../support/ciReadingTransport.ts";

test("a changed selection aborts its held comparison and ignores its late answer", async () => {
  const first = preparedComparison();
  const next = otherComparedStory(first);
  const held = heldResponse();
  const client = ciComparisonClient(first.source, (query) => {
    if (query.get("intent") === "ci-proof")
      return Response.json(next.proof(Number(query.get("run"))));
    return query.get("identity") === first.identity
      ? held.response
      : Response.json(next.answer);
  });
  try {
    const oldRead = client.comparison.select(first.source, first.identity);
    expect(client.comparison.getSnapshot()).toMatchObject({
      reading: true,
      shown: undefined,
    });
    expect(client.counts()).toEqual({ comparisons: 1, proofs: 0 });
    await client.comparison.select(next.source, next.identity);
    await client.readProofs();
    expect(client.requests[0]?.signal.aborted).toBe(true);
    expect(client.view()?.answer.baseline).toMatchObject({
      revision: "d".repeat(40),
    });
    expect(client.view()?.counts).toBe("10 → 4 test cases (−6)");
    held.release(Response.json(first.answer));
    await oldRead;
    expect(client.view()?.answer.baseline).toMatchObject({
      revision: "d".repeat(40),
    });
    expect(client.view()?.answer.baseline).not.toMatchObject({
      revision: "a".repeat(40),
    });
    expect(client.view()?.counts).toBe("10 → 4 test cases (−6)");
    expect(client.counts()).toEqual({ comparisons: 2, proofs: 3 });
    expect(
      client.requests
        .filter(({ url }) => url.includes("intent=ci-comparison"))
        .map(({ url }) => url),
    ).toEqual([
      "/__authenticated-read?source=example&intent=ci-comparison&identity=SEED-A%23a",
      "/__authenticated-read?source=example&intent=ci-comparison&identity=SEED-B%23b",
    ]);
  } finally {
    held.release(Response.json(first.answer));
    client.dispose();
  }
});

test("an old endpoint proof is aborted and cannot replace a new selection after release", async () => {
  const first = preparedComparison();
  const next = otherComparedStory(first);
  const held = heldResponse();
  const client = ciComparisonClient(first.source, (query) => {
    if (query.get("intent") === "ci-comparison")
      return Response.json(
        query.get("identity") === first.identity ? first.answer : next.answer,
      );
    return Number(query.get("run")) === 1
      ? held.response
      : Response.json(next.proof(Number(query.get("run"))));
  });
  try {
    await client.comparison.select(first.source, first.identity);
    const oldRead = client.readProofs();
    expect(client.counts()).toEqual({ comparisons: 1, proofs: 3 });
    await client.comparison.select(next.source, next.identity);
    await client.readProofs();
    const oldProof = client.requests.find(({ url }) =>
      url.includes(
        `intent=ci-proof&run=1&attempt=1&revision=${"a".repeat(40)}`,
      ),
    );
    expect(oldProof?.signal.aborted).toBe(true);
    expect(client.view()?.counts).toBe("10 → 4 test cases (−6)");
    held.release(Response.json(first.proof(1)));
    await oldRead;
    expect(client.view()?.counts).toBe("10 → 4 test cases (−6)");
    expect(client.counts()).toEqual({ comparisons: 2, proofs: 6 });
  } finally {
    held.release(Response.json(first.proof(1)));
    client.dispose();
  }
});
