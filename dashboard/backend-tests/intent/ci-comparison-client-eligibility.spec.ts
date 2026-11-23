// Slots are selected by the real three-endpoint owner before authenticated reads.
import { test, expect } from "../../test-support/support/pageTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { ciComparisonClient } from "../support/ciComparisonClient.ts";

for (const reason of [
  "adapter CI service has no discovery access",
  "The CI adapter did not answer discovery within 2 seconds.",
]) {
  test(`unavailable discovery suppresses every endpoint proof: ${reason}`, async () => {
    const slot = makeMe.aStoryCiComparisonSlot
      .with({ kind: "unavailable" as const, explanation: reason })
      .please();
    const facts = makeMe.aComparedStory
      .withAnswer({ baseline: slot, branch: slot, landed: slot })
      .please();
    const client = ciComparisonClient(facts.source, () =>
      Response.json(facts.answer),
    );
    try {
      await client.comparison.select(facts.source, facts.identity);
      await client.readProofs();
      expect(client.counts()).toEqual({ comparisons: 1, proofs: 0 });
      expect(client.view()?.answer).toMatchObject({
        baseline: { explanation: reason },
        branch: { explanation: reason },
        landed: { explanation: reason },
      });
      expect(client.view()?.endpoints).toEqual({
        baseline: { kind: "no-build", explanation: reason },
        branch: { kind: "no-build", explanation: reason },
        landed: { kind: "no-build", explanation: reason },
      });
    } finally {
      client.dispose();
    }
  });
}

test("only the unambiguous Baseline adapter attempt is read and its invalid proof remains its own", async () => {
  const facts = makeMe.aComparedStory
    .withBaseline({
      runBranch: "main",
      adapterAttempt: { runId: "pipeline", attemptId: "1" },
    })
    .withBranch({
      runBranch: "main",
      adapterAttempt: { runId: "pipeline", attemptId: "2", ambiguous: true },
    })
    .withLanded({
      revision: "b".repeat(40),
      runBranch: "main",
      adapterAttempt: { runId: "pipeline", attemptId: "2", ambiguous: true },
    })
    .please();
  const client = ciComparisonClient(facts.source, (query) =>
    Response.json(
      query.get("intent") === "ci-comparison"
        ? facts.answer
        : makeMe.anIntentCiProofAnswer
            .with({
              runId: "pipeline",
              attemptId: "1",
              branch: "main",
              revision: "a".repeat(40),
              checkedAt: facts.answer.checkedAt,
              proof: makeMe.aCiProof
                .unavailable("invalid", "schemaVersion is not 2")
                .please(),
            })
            .please(),
    ),
  );
  try {
    await client.comparison.select(facts.source, facts.identity);
    await client.readProofs();
    expect(client.counts()).toEqual({ comparisons: 1, proofs: 1 });
    expect(client.requests[1]?.url).toBe(
      `/__authenticated-read?source=example&intent=ci-proof&run=pipeline&attempt-id=1&run-branch=main&revision=${"a".repeat(40)}`,
    );
    expect(client.view()?.endpoints).toEqual({
      baseline: {
        kind: "unavailable",
        adapter: true,
        line: "This attempt's CI proof summary is not a valid summary: schemaVersion is not 2.",
      },
      branch: {
        kind: "unavailable",
        adapter: true,
        line: "This attempt is ambiguous at its revision: another discovered attempt is also attempt 2 at bbbbbbb.",
      },
      landed: {
        kind: "unavailable",
        adapter: true,
        line: "This attempt is ambiguous at its revision: another discovered attempt is also attempt 2 at bbbbbbb.",
      },
    });
  } finally {
    client.dispose();
  }
});
