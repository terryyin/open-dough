// Real wire validation and exact attempt identity; no selected subjects are faked.
import { test, expect } from "../../tests/support/pageTest.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { createCiComparisonProofs } from "../../src/ciComparisonProofs.ts";
import { preparedComparison } from "../../tests/support/comparisonMountFacts.ts";
import { ciReadingTransport } from "../support/ciReadingTransport.ts";

test("equal slot subjects stay independent while attempt and source-object changes refresh their actual reads", async () => {
  const facts = preparedComparison();
  const answer = makeMe.aStoryCiComparison
    .with({ ...facts.answer, branch: facts.answer.baseline })
    .please();
  const retry = makeMe.aStoryCiComparison
    .with({ ...answer, branch: { ...answer.branch, runAttempt: 2 } })
    .please();
  let correctAttempt = false;
  const transport = ciReadingTransport((query) => {
    const runId = Number(query.get("run"));
    const revision = query.get("revision") ?? "";
    const runAttempt = correctAttempt ? Number(query.get("attempt")) : 1;
    return Response.json({
      runId,
      runAttempt,
      revision,
      checkedAt: facts.answer.checkedAt,
      proof: makeMe.aCiProof
        .summaryFor({ runId, runAttempt, revision })
        .please(),
    });
  });
  const owner = createCiComparisonProofs();
  try {
    await owner.select(facts.source, answer, 0);
    expect(transport.requests).toHaveLength(3);
    expect(transport.requests[0]?.url).toBe(transport.requests[1]?.url);
    await owner.select(
      facts.source,
      makeMe.aStoryCiComparison.with({ ...answer }).please(),
      0,
    );
    expect(transport.requests).toHaveLength(3);
    const source = makeMe.aPublishedSource.with({ ...facts.source }).please();
    await owner.select(source, answer, 0);
    expect(transport.requests).toHaveLength(6);
    await owner.select(source, retry, 0);
    expect(transport.requests).toHaveLength(7);
    expect(transport.requests[6]?.url).toBe(
      `/__authenticated-read?source=example&intent=ci-proof&run=1&attempt=2&revision=${"a".repeat(40)}`,
    );
    expect(owner.proofsFor(source, retry, 0)?.branch).toMatchObject({
      kind: "unavailable",
      line: expect.stringContaining("shape this dashboard does not understand"),
    });
    correctAttempt = true;
    await owner.select(source, retry, 1);
    expect(transport.requests).toHaveLength(10);
    expect(owner.proofsFor(source, retry, 1)?.branch.kind).toBe("summary");
  } finally {
    owner.dispose();
    transport.restore();
  }
});
