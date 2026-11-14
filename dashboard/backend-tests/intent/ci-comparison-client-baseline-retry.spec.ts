// Repeated unavailable Baseline answers preserve their query and exact counts.
import { test, expect } from "../../tests/support/pageTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { preparedComparison } from "../../tests/support/comparisonMountFacts.ts";
import { ciComparisonClient } from "../support/ciComparisonClient.ts";
import { heldResponse } from "../support/ciReadingTransport.ts";

test("two answered Baseline failures retain their query and refresh only the readable proofs", async () => {
  const facts = preparedComparison();
  const failed = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      baseline: {
        kind: "unavailable",
        explanation: `head_sha=${"a".repeat(40)}: GitHub is unreachable`,
      },
    })
    .please();
  let next: ReturnType<typeof heldResponse> | undefined;
  const client = ciComparisonClient(facts.source, (query) =>
    query.get("intent") === "ci-proof"
      ? Response.json(facts.proof(Number(query.get("run"))))
      : (next?.response ?? Response.json(failed)),
  );
  try {
    await client.comparison.select(facts.source, facts.identity);
    await client.readProofs();
    expect(client.counts()).toEqual({ comparisons: 1, proofs: 2 });
    expect(client.comparison.getSnapshot().shown).toMatchObject({
      baseline: {
        explanation: `head_sha=${"a".repeat(40)}: GitHub is unreachable`,
      },
    });
    for (const round of [1, 2]) {
      next = heldResponse();
      const read = client.comparison.checkAgain();
      expect(client.comparison.getSnapshot().reading).toBe(true);
      expect(client.counts().comparisons).toBe(round + 1);
      next.release(Response.json(failed));
      await read;
      await client.readProofs();
      expect(client.comparison.getSnapshot()).toMatchObject({
        reading: false,
        checkedAgain: round,
        shown: {
          baseline: {
            explanation: `head_sha=${"a".repeat(40)}: GitHub is unreachable`,
          },
        },
      });
    }
    expect(client.counts()).toEqual({ comparisons: 3, proofs: 6 });
    expect(
      client.requests
        .filter(({ url }) => url.includes("intent=ci-proof"))
        .every(({ url }) => !url.includes("run=1&")),
    ).toBe(true);
  } finally {
    next?.release(Response.json(failed));
    client.dispose();
  }
});
