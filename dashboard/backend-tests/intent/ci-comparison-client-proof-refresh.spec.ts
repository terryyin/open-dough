// All endpoint proofs refresh only with an answered comparison retry.
import { test, expect } from "../../tests/support/pageTest.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { preparedComparison } from "../../tests/support/comparisonMountFacts.ts";
import { ciComparisonClient } from "../support/ciComparisonClient.ts";
import { heldResponse } from "../support/ciReadingTransport.ts";

test("only an answered comparison retry advances the three endpoint proof reads", async () => {
  const facts = preparedComparison();
  const held = heldResponse();
  let comparisons = 0;
  let landedReads = 0;
  const client = ciComparisonClient(facts.source, (query) => {
    if (query.get("intent") === "ci-proof") {
      const run = Number(query.get("run"));
      if (run === 3) landedReads += 1;
      const answer = facts.proof(run);
      return Response.json(
        run === 3 && landedReads === 1
          ? {
              ...answer,
              proof: makeMe.aCiProof
                .unavailable("unreadable", "Endpoint proof unavailable")
                .please(),
            }
          : answer,
      );
    }
    comparisons += 1;
    if (comparisons === 2) return held.response;
    return comparisons === 3
      ? Response.json(
          { error: "Comparison temporarily unavailable" },
          { status: 503 },
        )
      : Response.json(facts.answer);
  });
  try {
    await client.comparison.select(facts.source, facts.identity);
    await client.readProofs();
    expect(client.counts()).toEqual({ comparisons: 1, proofs: 3 });
    expect(client.view()?.active.title).toBe("Baseline compared with Branch");
    expect(client.view()?.counts).toBe("2 → 3 test cases (+1)");
    const retry = client.comparison.checkAgain();
    expect(client.comparison.getSnapshot()).toMatchObject({
      reading: true,
      checkedAgain: 0,
    });
    expect(client.comparison.checkAgain()).toBeUndefined();
    expect(comparisons).toBe(2);
    held.release(Response.json(facts.answer));
    await retry;
    expect(client.comparison.getSnapshot()).toMatchObject({
      reading: false,
      checkedAgain: 1,
    });
    await client.readProofs();
    expect(client.counts()).toEqual({ comparisons: 2, proofs: 6 });
    expect(landedReads).toBe(2);
    expect(client.view()?.active.title).toBe("Baseline compared with Landed");
    expect(client.view()?.counts).toBe("2 → 4 test cases (+2)");
    await client.comparison.checkAgain();
    expect(client.comparison.getSnapshot()).toMatchObject({
      failed: "Comparison temporarily unavailable",
      reading: false,
      checkedAgain: 1,
      shown: undefined,
    });
    await client.readProofs();
    expect(client.counts()).toEqual({ comparisons: 3, proofs: 6 });
  } finally {
    held.release(Response.json(facts.answer));
    client.dispose();
  }
});
