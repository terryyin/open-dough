// Asked and answered rounds use actual public readers and counted HTTP requests.
import { test, expect } from "../../tests/support/pageTest.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { preparedComparison } from "../../tests/support/comparisonMountFacts.ts";
import { ciComparisonClient } from "../support/ciComparisonClient.ts";
import { heldResponse } from "../support/ciReadingTransport.ts";

test("a held HTTP-failed comparison retries without counting its failure as an answered round", async () => {
  const facts = preparedComparison();
  const initial = heldResponse();
  const retry = heldResponse();
  let comparisons = 0;
  const client = ciComparisonClient(facts.source, (query) => {
    if (query.get("intent") === "ci-proof")
      return Response.json(facts.proof(Number(query.get("run"))));
    comparisons += 1;
    return comparisons === 1 ? initial.response : retry.response;
  });
  try {
    const read = client.comparison.select(facts.source, facts.identity);
    expect(client.comparison.getSnapshot()).toMatchObject({
      reading: true,
      checkedAgain: 0,
    });
    initial.release(
      Response.json(
        { error: "Comparison temporarily unavailable" },
        { status: 503 },
      ),
    );
    await read;
    expect(client.comparison.getSnapshot()).toMatchObject({
      reading: false,
      failed: "Comparison temporarily unavailable",
      checkedAgain: 0,
    });
    const again = client.comparison.checkAgain();
    expect(client.comparison.getSnapshot().reading).toBe(true);
    expect(client.counts()).toEqual({ comparisons: 2, proofs: 0 });
    retry.release(Response.json(facts.answer));
    await again;
    await client.readProofs();
    expect(client.comparison.getSnapshot()).toMatchObject({
      reading: false,
      failed: undefined,
      checkedAgain: 1,
    });
    expect(client.view()?.active.title).toBe("Baseline compared with Landed");
    expect(client.view()?.answer).toMatchObject({
      baseline: { revision: "a".repeat(40) },
      branch: { revision: "b".repeat(40) },
      landed: { revision: "c".repeat(40) },
    });
    expect(client.counts()).toEqual({ comparisons: 2, proofs: 3 });
  } finally {
    initial.release(Response.json(facts.answer));
    retry.release(Response.json(facts.answer));
    client.dispose();
  }
});

test("an answered unavailable comparison is replaced and advances the successful retry round", async () => {
  const facts = preparedComparison();
  const unavailable = makeMe.aStoryCiComparison
    .with({
      kind: "unavailable",
      identity: facts.identity,
      checkedAt: facts.answer.checkedAt,
      explanation: "Published execution history is incomplete",
    })
    .please();
  let comparisons = 0;
  const client = ciComparisonClient(facts.source, (query) => {
    if (query.get("intent") === "ci-proof")
      return Response.json(facts.proof(Number(query.get("run"))));
    comparisons += 1;
    return Response.json(comparisons === 1 ? unavailable : facts.answer);
  });
  try {
    await client.comparison.select(facts.source, facts.identity);
    await client.readProofs();
    expect(client.comparison.getSnapshot()).toMatchObject({
      shown: {
        kind: "unavailable",
        explanation: "Published execution history is incomplete",
      },
      reading: false,
      checkedAgain: 0,
    });
    expect(client.counts()).toEqual({ comparisons: 1, proofs: 0 });
    await client.comparison.checkAgain();
    await client.readProofs();
    expect(client.comparison.getSnapshot()).toMatchObject({
      shown: { kind: "comparison" },
      failed: undefined,
      reading: false,
      checkedAgain: 1,
    });
    expect(client.view()?.active.title).toBe("Baseline compared with Landed");
    expect(client.counts()).toEqual({ comparisons: 2, proofs: 3 });
  } finally {
    client.dispose();
  }
});
